import type { DocConfig, IO, } from "../types.ts";
import { resolveDocPath, } from "../detect.ts";
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
): (event: any,) => boolean {
  const basePath = options.basePath ?? "./articles";
  const bundlePath = options.bundlePath ?? "./mdblog.js";
  const shellPath = options.shellPath ?? "./index.html";
  // The document belongs next to the worker, not next to the request: an article
  // navigation asks for `../index.html` when resolved against its own path, and
  // a deep link would then be answered with the fallback shell.
  const shellBase = (typeof self !== "undefined" && self?.location?.href) ?
    self.location.href :
    undefined;

  return function handleFetch(event: any,): boolean {
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

    // 5. Intercept and handle
    event.respondWith(
      (async () => {
        try {
          const doc = await loadDoc(docPath, io, options,);

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
          console.error(`[sw-adapter] Error processing ${url.pathname}:`, err,);
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
    );

    return true;
  };
}
