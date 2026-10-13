import type { IO, } from "../types.ts";
import { del, get, set, } from "idb-keyval";

/**
 * @description Options for browser CacheStorage and IndexedDB IO configuration.
 */
export interface CacheIOOptions {
  /**
   * @description Name of CacheStorage cache bucket.
   * @default "md-wire-v1"
   */
  cacheName?: string;

  /**
   * @description Whether to enable IndexedDB persistence via idb-keyval.
   * @default true
   */
  useIndexedDB?: boolean;
}

/**
 * @description Creates an IO implementation backed by browser Cache Storage and IndexedDB (idb-keyval).
 * @param options - Cache bucket name and IndexedDB configuration options.
 * @returns IO instance implementing readText, cacheGet, cachePut, and cacheDelete.
 * @example
 * ```ts
 * import { createBrowserIO } from "./io.ts";
 * const io = createBrowserIO({ cacheName: "docs-v1", useIndexedDB: true });
 * ```
 */
export function createBrowserIO(options: CacheIOOptions = {},): IO {
  const cacheName = options.cacheName ?? "md-wire-v1";
  const useIdb = options.useIndexedDB !== false &&
    typeof indexedDB !== "undefined";

  return {
    async readText(url: string,): Promise<string> {
      const cleanPath = url.replace(/[?#].*$/, "",);

      // 1. Candidate paths to try (/articles/)
      const candidatePaths = [cleanPath,];

      for (const candidate of candidatePaths) {
        try {
          let target = candidate;
          if (target.startsWith("/",) && typeof globalThis !== "undefined") {
            target = `.${target}`;
          }
          const separator = target.includes("?",) ? "&" : "?";
          const fetchUrl = `${target}${separator}_md_raw=1`;

          let response: Response;
          try {
            response = await fetch(fetchUrl,);
          } catch {
            const fallback = `${candidate}${
              candidate.includes("?",) ? "&" : "?"
            }_md_raw=1`;
            response = await fetch(fallback,);
          }

          if (response.ok) {
            const text = await response.text();
            if (useIdb) {
              set(`raw:${cleanPath}`, text,).catch(() => {},);
            }
            return text;
          }
        } catch {
          // Continue to next candidate
        }
      }

      // 2. Check IndexedDB cached raw text if offline
      if (useIdb) {
        try {
          const cached = await get<string>(`raw:${cleanPath}`,);
          if (cached) return cached;
        } catch {
          // ignore
        }
      }

      throw new Error(`Failed to load markdown: document not found (${url})`,);
    },

    async cacheGet(key: string,): Promise<string | null> {
      // 1. First check IndexedDB via idb-keyval if available
      if (useIdb) {
        try {
          const val = await get<string>(key,);
          if (val) return val;
        } catch {
          // Fallback to Cache Storage
        }
      }

      // 2. Check Cache Storage
      if (typeof caches !== "undefined") {
        try {
          const cache = await caches.open(cacheName,);
          const req = new Request(
            `https://md-wire.local/${encodeURIComponent(key,)}`,
          );
          const match = await cache.match(req,);
          if (match) {
            return await match.text();
          }
        } catch {
          // Ignore cache storage errors
        }
      }

      return null;
    },

    async cachePut(key: string, val: string,): Promise<void> {
      // 1. Store in IndexedDB via idb-keyval
      if (useIdb) {
        try {
          await set(key, val,);
        } catch {
          // Non-fatal
        }
      }

      // 2. Store in Cache Storage
      if (typeof caches !== "undefined") {
        try {
          const cache = await caches.open(cacheName,);
          const req = new Request(
            `https://md-wire.local/${encodeURIComponent(key,)}`,
          );
          const res = new Response(val, {
            headers: { "Content-Type": "application/json", },
          },);
          await cache.put(req, res,);
        } catch {
          // Non-fatal
        }
      }
    },

    async cacheDelete(key: string,): Promise<void> {
      if (useIdb) {
        try {
          await del(key,);
        } catch {
          // Non-fatal
        }
      }
      if (typeof caches !== "undefined") {
        try {
          const cache = await caches.open(cacheName,);
          const req = new Request(
            `https://md-wire.local/${encodeURIComponent(key,)}`,
          );
          await cache.delete(req,);
        } catch {
          // Non-fatal
        }
      }
    },
  };
}

/**
 * @description Creates an in-memory IO implementation for testing or headless execution.
 * @param initialFiles - Map of initial relative file paths to their string contents.
 * @returns IO instance with in-memory files and cache maps.
 * @example
 * ```ts
 * import { createMemoryIO } from "./io.ts";
 * const io = createMemoryIO({ "/articles/index.md": "# Welcome" });
 * const text = await io.readText("/articles/index.md");
 * ```
 */
export function createMemoryIO(initialFiles: Record<string, string> = {},): IO {
  const files = new Map<string, string>(Object.entries(initialFiles,),);
  const cache = new Map<string, string>();

  return {
    async readText(url: string,): Promise<string> {
      const cleanUrl = url.replace(/[?#].*$/, "",);
      const content = files.get(cleanUrl,) ?? files.get(url,);
      if (content !== undefined) {
        return content;
      }
      throw new Error(`File not found: ${url}`,);
    },

    async cacheGet(key: string,): Promise<string | null> {
      return cache.get(key,) ?? null;
    },

    async cachePut(key: string, val: string,): Promise<void> {
      cache.set(key, val,);
    },

    async cacheDelete(key: string,): Promise<void> {
      cache.delete(key,);
    },
  };
}
