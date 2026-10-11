import type { DocConfig, IO } from "../types.ts";
import { resolveDocPath } from "../detect.ts";
import { loadDoc } from "../core/pipeline.ts";
import { defaultShell } from "../core/shell.ts";

/**
 * @description Configuration options for the Service Worker fetch adapter.
 */
export interface SWPluginOptions extends DocConfig {
  /**
   * @description Path to the bundled client script for HTML shell responses.
   * @default "./mdblog.js"
   */
  bundlePath?: string;
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
): (event: any) => boolean {

  const basePath = options.basePath ?? "./articles";
  const bundlePath = options.bundlePath ?? "./mdblog.js";

  return function handleFetch(event: any): boolean {
    const request = event.request;

    // 1. Only intercept GET requests
    if (request.method !== "GET") {
      return false;
    }

    const url = new URL(request.url);

    // 2. Anti-recursion: pass through raw markdown fetches
    if (url.searchParams.has("_md_raw")) {
      return false;
    }

    // 3. Skip range requests (media, audio, video)
    if (request.headers.has("Range")) {
      return false;
    }

    // 4. Check if request targets documentation
    const { docPath, isDoc } = resolveDocPath(url.pathname, basePath);
    if (!isDoc) {
      return false;
    }

    // 5. Intercept and handle
    event.respondWith(
      (async () => {
        try {
          const doc = await loadDoc(docPath, io, options);

          const accept = request.headers.get("Accept") ?? "";

          // Content negotiation:
          // If browser navigation (text/html): return HTML shell with embedded wire
          if (accept.includes("text/html")) {
            const html = defaultShell(doc, bundlePath);
            return new Response(html, {
              status: 200,
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "X-Rendered-By": "SW-Wire-Format",
                "X-Doc-Title": encodeURIComponent(doc.title),
              },
            });
          }

          // If SPA request (application/json): return pure WireDoc JSON
          return new Response(JSON.stringify(doc), {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "X-Rendered-By": "SW-Wire-Format",
              "X-Doc-Title": encodeURIComponent(doc.title),
            },
          });
        } catch (err) {
          console.error(`[sw-adapter] Error processing ${url.pathname}:`, err);
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : String(err),
              url: url.pathname,
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      })(),
    );

    return true;
  };
}
