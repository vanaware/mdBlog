import type { DocConfig, IO } from "../types.ts";
import type { WireDoc } from "../wire.ts";
import { isSWControlling, resolveDocPath } from "../detect.ts";
import { loadDoc } from "../core/pipeline.ts";

/**
 * @description Creates a local client-side fetcher that executes the pipeline in-browser
 * when the Service Worker is not active or when offline.
 * @param io - IO abstraction instance.
 * @param options - DocConfig options.
 * @returns Function that takes a URL/path and returns a parsed WireDoc.
 * @example
 * ```ts
 * import { createLocalFetcher } from "./client.ts";
 * import { createBrowserIO } from "../core/io.ts";
 * const io = createBrowserIO();
 * const fetcher = createLocalFetcher(io);
 * const doc = await fetcher("/articles/intro.md");
 * ```
 */
export function createLocalFetcher(
  io: IO,
  options: DocConfig = {},
): (urlOrPath: string) => Promise<WireDoc> {
  const basePath = options.basePath ?? "./articles";

  return async function localFetch(urlOrPath: string): Promise<WireDoc> {
    const { docPath } = resolveDocPath(urlOrPath, basePath);
    return await loadDoc(docPath, io, options);
  };
}

/**
 * @description Unified client fetcher with transparent Service Worker & local pipeline fallback support.
 * @param urlOrPath - Path to the markdown document.
 * @param io - IO abstraction instance.
 * @param options - DocConfig options.
 * @returns Parsed WireDoc instance.
 * @example
 * ```ts
 * import { mdFetch } from "./client.ts";
 * import { createBrowserIO } from "../core/io.ts";
 * const io = createBrowserIO();
 * const doc = await mdFetch("./articles/index.md", io);
 * ```
 */
export async function mdFetch(
  urlOrPath: string,
  io: IO,
  options: DocConfig = {},
): Promise<WireDoc> {

  const { docPath } = resolveDocPath(
    urlOrPath,
    options.basePath ?? "./articles",
  );

  // 1. If SW is controlling the page, try fetching with Accept: application/json
  if (isSWControlling()) {
    try {
      const response = await fetch(docPath, {
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const doc: WireDoc = await response.json();
          return doc;
        }
      }
    } catch (err) {
      console.warn(
        `[client-adapter] SW fetch failed, falling back to local:`,
        err,
      );
    }
  }

  // 2. Fallback: process directly via local client pipeline
  const localFetcher = createLocalFetcher(io, options);
  return await localFetcher(docPath);
}
