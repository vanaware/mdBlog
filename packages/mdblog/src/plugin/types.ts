import type { WireDoc, WireFragment } from "./wire.ts";

/**
 * @description Pure I/O abstraction interface for document loading and caching.
 * All side effects (network, cache storage, IndexedDB) are injected through this interface,
 * keeping the core pipeline deterministic and environment-agnostic.
 */
export interface IO {
  /**
   * @description Reads plain text content from a specified URL or path.
   * @param url - Relative or absolute path to the target markdown resource.
   * @returns Resolves to the raw text content of the resource.
   */
  readText(url: string): Promise<string>;

  /**
   * @description Retrieves a cached JSON string by key.
   * @param key - Unique cache key identifier.
   * @returns Resolves to the cached string payload, or null if not found.
   */
  cacheGet(key: string): Promise<string | null>;

  /**
   * @description Persists a string payload into the cache.
   * @param key - Unique cache key identifier.
   * @param val - Serialized JSON string payload to persist.
   * @returns Resolves when write operation finishes.
   */
  cachePut(key: string, val: string): Promise<void>;

  /**
   * @description Optional method to remove a cached item by key.
   * @param key - Unique cache key identifier to evict.
   * @returns Resolves when eviction completes.
   */
  cacheDelete?(key: string): Promise<void>;
}

/**
 * @description Configuration options for markdown document resolution and caching.
 */
export interface DocConfig {
  /**
   * @description Base filesystem/URL directory path containing markdown articles.
   * @default "./articles"
   */
  basePath?: string;

  /**
   * @description Cache Time-To-Live in seconds for parsed WireDoc AST instances.
   * @default 60
   */
  cacheTTLSeconds?: number;

  /**
   * @description Set of registered island names allowed for dynamic execution.
   */
  islands?: Set<string>;

  /**
   * @description Name of the CacheStorage bucket used for offline storage.
   * @default "md-wire-v1"
   */
  cacheName?: string;
}

export type { WireDoc, WireFragment };
