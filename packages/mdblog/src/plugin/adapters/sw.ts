import type { DocConfig, IO, } from "../types.ts";
import { resolveDocPath, toBaseRelativePath, } from "../detect.ts";
import { loadDoc, } from "../core/pipeline.ts";
import { defaultShell, injectWireShell, } from "../core/shell.ts";

/**
 * @description Configuration options for the Service Worker fetch adapter.
 */
export interface SWPluginOptions extends DocConfig {
  /**
   * @description Path to the bundled client script for HTML shell responses.
   * @default "./mdblog.js"
   */
  bundlePath?: string;

  /**
   * @description Path to the application document the first-paint payload is
   * injected into. Served documents get their own head — stylesheets, theme
   * recovery, the mount deadline — instead of a copy written here, which is how
   * a shell ends up loading a different framework release than the app.
   * When it cannot be read, the static fallback document is used instead.
   * @default "./index.html"
   */
  shellPath?: string;

  /**
   * @description Maximum time the handler may take to answer an intercepted
   * request. A promise that never settles keeps the browser spinning the tab
   * forever — the signature of a fetch that neither resolves nor fails, most
   * often a worker whose caches were deleted underneath an open tab. When the
   * deadline passes the request is answered with a 504 that ends the wait and
   * invites a reload, so no wedged dependency can hold a navigation open.
   * @default 8000
   */
  handlerTimeoutMs?: number;
}

/**
 * Reads the document the application ships, so a navigation can be answered
 * with it. Revalidated on every request: a shell served from a cache the reader
 * cannot see is the one thing a first paint must never be.
 */
async function readShellTemplate(
  shellPath: string,
  base: string,
): Promise<string | null> {
  const templateUrl = new URL(shellPath, base,).href;

  const usable = (html: string,): html is string =>
    html.includes("<head",) || html.includes("<body",);

  try {
    const response = await fetch(templateUrl, { cache: "no-cache", },);
    if (!response.ok) return null;
    const html = await response.text();
    return usable(html,) ? html : null;
  } catch {
    // Offline, or a host that does not serve the file. The copy the worker
    // already holds is still the application's own document; anything else would
    // have to be the fallback written above.
    if (typeof caches === "undefined") return null;
    try {
      const cached = await caches.match(templateUrl,);
      if (!cached) return null;
      const html = await cached.text();
      return usable(html,) ? html : null;
    } catch {
      return null;
    }
  }
}

/**
 * @description The minimal shape of the `fetch` event this handler consumes.
 * Declared structurally instead of using the DOM `FetchEvent` type, so the
 * module keeps checking outside a Service Worker context (tests, Deno).
 */
export interface SWFetchEvent {
  /** @description The intercepted request. */
  request: Request;
  /** @description Promise settled with the response to serve. */
  respondWith(response: Response | Promise<Response>,): void;
}

/**
 * Ends the wait when the handling chain never settles: the same race the
 * published shell uses against a never-answering worker, moved to the side of
 * the worker itself, so a wedged fetch or a hanging cache read answers with a
 * deadline response instead of an eternally spinning tab. The timer is cleared
 * as soon as the chain settles, so a fast answer leaves no deadline burning
 * seconds behind it.
 */
function raceWithinDeadline(
  chain: Promise<Response>,
  deadlineMs: number,
  pathname: string,
  wantsHtml: boolean,
): Promise<Response> {
  const deadlineResponse = (): Response => {
    console.warn(
      `[sw-adapter] No answer for ${pathname} within ${deadlineMs}ms; ending the wait`,
    );
    if (wantsHtml) {
      return new Response(
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
          "<title>Loading timed out</title></head><body><h6>Still loading</h6>" +
          "<p>The site did not finish answering in time. Reloading usually fixes it.</p>" +
          "</body></html>",
        {
          status: 504,
          headers: { "Content-Type": "text/html; charset=utf-8", },
        },
      );
    }
    return new Response(
      JSON.stringify({
        error: "The document handler did not answer in time",
        url: pathname,
      },),
      {
        status: 504,
        headers: { "Content-Type": "application/json", },
      },
    );
  };

  return new Promise<Response>((resolve,) => {
    const timer = setTimeout(() => resolve(deadlineResponse(),), deadlineMs,);
    chain.then(
      (response,) => {
        clearTimeout(timer,);
        resolve(response,);
      },
      (error,) => {
        clearTimeout(timer,);
        console.error(`[sw-adapter] Error processing ${pathname}:`, error,);
        resolve(deadlineResponse(),);
      },
    );
  },);
}

/**
 * @description Creates a fetch event handler for the Service Worker.
 * Intercepts documentation markdown routes and returns WireDoc JSON or HTML shells.
 * @param io - IO abstraction instance to fetch and cache documents.
 * @param options - Routing and caching options.
 * @returns Event interceptor function returning boolean if request was handled.
 * @example
 * ```ts
 * import { createSWFetchHandler } from "./sw.ts";
 * import { createBrowserIO } from "../core/io.ts";
 * const io = createBrowserIO();
 * const handler = createSWFetchHandler(io, { basePath: "./articles" });
 * ```
 */
export function createSWFetchHandler(
  io: IO,
  options: SWPluginOptions = {},
): (event: SWFetchEvent,) => boolean {
  const basePath = options.basePath ?? "./articles";
  const bundlePath = options.bundlePath ?? "./mdblog.js";
  const shellPath = options.shellPath ?? "./index.html";
  const handlerDeadline = options.handlerTimeoutMs ?? 8000;
  // Everything the site serves lives next to the worker, so its directory is the
  // application's base. A request arrives already resolved by the browser
  // (`/mdBlog/articles/index.md`), and that origin-rooted form is not what the
  // reader asks the network for — see toBaseRelativePath.
  const baseDir = (() => {
    const href = (typeof self !== "undefined" && self?.location?.href)
      ? self.location.href
      : undefined;
    return href ? new URL("./", href,).pathname : "/";
  })();
  // The document belongs next to the worker, not next to the request: an article
  // navigation asks for `../index.html` when resolved against its own path, and
  // a deep link would then be answered with the fallback shell.
  const shellBase = (typeof self !== "undefined" && self?.location?.href) ?
    self.location.href :
    undefined;

  return function handleFetch(event: SWFetchEvent,): boolean {
    const request = event.request;

    // 1. Only intercept GET requests
    if (request.method !== "GET") {
      return false;
    }

    const url = new URL(request.url,);

    // 2. Anti-recursion: pass through raw markdown fetches
    if (url.searchParams.has("_md_raw",)) {
      return false;
    }

    // 3. Skip range requests (media, audio, video)
    if (request.headers.has("Range",)) {
      return false;
    }

    // 4. Check if request targets documentation
    const { docPath, isDoc, } = resolveDocPath(url.pathname, basePath,);
    if (!isDoc) {
      return false;
    }

    // The path of the document below the application's own directory: the same
    // spelling a page fetches it with, which is what the reader resolves.
    const assetPath = toBaseRelativePath(docPath, baseDir,);

    // 5. Intercept and handle. The chain is raced against a deadline: a
    // respondWith whose promise never settles is exactly the spinning tab the
    // published shell's own mount deadline complains about.
    const wantsHtml = (request.headers.get("Accept",) ?? "").includes(
      "text/html",
    );
    event.respondWith(
      raceWithinDeadline(
        (async () => {
          try {
            const doc = await loadDoc(assetPath, io, options,);

            const accept = request.headers.get("Accept",) ?? "";

            // Content negotiation:
            // If browser navigation (text/html): return HTML shell with embedded wire
            if (accept.includes("text/html",)) {
              const template = await readShellTemplate(
                shellPath,
                shellBase ?? url.href,
              );
              const html = template
                ? injectWireShell(template, doc,)
                : defaultShell(doc, bundlePath,);
              return new Response(html, {
                status: 200,
                headers: {
                  "Content-Type": "text/html; charset=utf-8",
                  "X-Rendered-By": "SW-Wire-Format",
                  "X-Doc-Title": encodeURIComponent(doc.title,),
                },
              },);
            }

            // If SPA request (application/json): return pure WireDoc JSON
            return new Response(JSON.stringify(doc,), {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "X-Rendered-By": "SW-Wire-Format",
                "X-Doc-Title": encodeURIComponent(doc.title,),
              },
            },);
          } catch (err) {
            console.error(
              `[sw-adapter] Error processing ${url.pathname}:`,
              err,
            );
            return new Response(
              JSON.stringify({
                error: err instanceof Error ? err.message : String(err,),
                url: url.pathname,
              },),
              {
                status: 404,
                headers: { "Content-Type": "application/json", },
              },
            );
          }
        })(),
        handlerDeadline,
        url.pathname,
        wantsHtml,
      ),
    );

    return true;
  };
}
