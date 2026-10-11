import type { DocConfig, IO } from "../types.ts";
import type { WireDoc } from "../wire.ts";
import { parseMarkdown } from "./parse.ts";
import { mdastToWire } from "./to-wire.ts";
import { parseFrontmatter } from "./frontmatter.ts";

/**
 * @description Pure transformation pipeline: parses markdown and returns a complete WireDoc AST.
 * Extracts frontmatter and heading title, returning a fully serializable WireDoc.
 * @param markdown - Raw markdown string to process.
 * @param url - Relative or absolute path identifier of the document.
 * @returns Complete WireDoc object with wire AST, title, raw text, and timestamp.
 * @example
 * ```ts
 * import { processMarkdown } from "./pipeline.ts";
 * const doc = processMarkdown("# My Post\n\nContent", "/articles/post.md");
 * ```
 */
export function processMarkdown(
  markdown: string,
  url: string,
): WireDoc {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const root = parseMarkdown(body);
  const { wire, title: astTitle } = mdastToWire(root);

  // Use frontmatter.title if defined, fallback to AST heading title
  const finalTitle =
    (typeof frontmatter.title === "string" && frontmatter.title.trim())
      ? frontmatter.title.trim()
      : astTitle;

  return {
    wire,
    title: finalTitle,
    raw: markdown,
    url,
    renderedAt: Date.now(),
    frontmatter,
  };
}

/**
 * @description Orchestrates document loading with TTL caching and IO abstraction.
 * Tries cache first, then reads raw text via IO and parses to WireDoc.
 * @param url - Document path or URL to load.
 * @param io - IO abstraction instance providing readText and cache operations.
 * @param config - Optional configuration for cache TTL and options.
 * @returns Resolves to the loaded and parsed WireDoc.
 * @example
 * ```ts
 * import { loadDoc } from "./pipeline.ts";
 * import { createMemoryIO } from "./io.ts";
 * const io = createMemoryIO({ "/doc.md": "# Title" });
 * const doc = await loadDoc("/doc.md", io);
 * ```
 */
export async function loadDoc(
  url: string,
  io: IO,
  config: DocConfig = {},
): Promise<WireDoc> {

  const ttlMs = (config.cacheTTLSeconds ?? 60) * 1000;
  const cacheKey = `wire:${url}`;

  // 1. Try cache
  try {
    const cachedJson = await io.cacheGet(cacheKey);
    if (cachedJson) {
      const cachedDoc: WireDoc = JSON.parse(cachedJson);
      const isFresh = Date.now() - cachedDoc.renderedAt < ttlMs;
      if (isFresh) {
        return cachedDoc;
      }
    }
  } catch (err) {
    console.warn(`[pipeline] Cache lookup warning for ${url}:`, err);
  }

  // 2. Fetch raw markdown
  const markdown = await io.readText(url);

  // 3. Process into WireDoc
  const doc = processMarkdown(markdown, url);

  // 4. Update cache
  try {
    await io.cachePut(cacheKey, JSON.stringify(doc));
  } catch (err) {
    console.warn(`[pipeline] Cache write warning for ${url}:`, err);
  }

  return doc;
}
