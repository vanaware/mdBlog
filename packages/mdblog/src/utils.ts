import type { ArticleItem, } from "./state.ts";
import type { Wire, WireComponent, } from "./plugin/wire.ts";

/**
 * @description Normalizes any article route variant (hash, relative, docs/ or articles/ prefixed) into a plain markdown filename.
 * @param p - Raw route or path string (e.g. "#/articles/intro.md", "./docs/intro.md").
 * @returns Plain markdown filename (e.g. "intro.md"), defaulting to "index.md".
 * @example
 * ```ts
 * import { normalizePath } from "./utils.ts";
 * normalizePath("#/articles/intro.md"); // "intro.md"
 * normalizePath(""); // "index.md"
 * ```
 */
export function normalizePath(p?: string | null,): string {
  let s = (p || "")
    .replace(/^#\/?/, "",)
    .replace(/^\.?\//, "",)
    .replace(/^articles\//, "",)
    .replace(/^docs\//, "",);
  if (!s || s === "/" || s === "index") s = "index.md";
  return s;
}

/**
 * @description Builds the canonical hash route href for an article path.
 * @param path - Article path in any accepted variant.
 * @returns Hash route ("#/" for the home page, "#/name.md" otherwise).
 * @example
 * ```ts
 * import { articleHrefFromPath } from "./utils.ts";
 * articleHrefFromPath("./articles/index.md"); // "#/"
 * articleHrefFromPath("./articles/intro.md"); // "#/intro.md"
 * ```
 */
export function articleHrefFromPath(path?: string | null,): string {
  const normalized = normalizePath(path,);
  return normalized === "index.md" ? "#/" : `#/${normalized}`;
}

/**
 * @description Single heading entry extracted from a Wire AST tree for table of contents rendering.
 */
export interface TocHeading {
  /** @description Anchor id slug generated during wire conversion. */
  id: string;
  /** @description Plain text content of the heading. */
  text: string;
  /** @description Heading depth (2 = h2, 3 = h3, ...). */
  depth: number;
}

/**
 * @description Adjacent articles relative to the current one in reading order.
 */
export interface AdjacentArticles {
  /** @description Previous article in the flattened tree, or null at the start. */
  prev: ArticleItem | null;
  /** @description Next article in the flattened tree, or null at the end. */
  next: ArticleItem | null;
}

function extractText(node: Wire,): string {
  if (typeof node === "string") return node;
  if (typeof node === "number" || typeof node === "boolean") {
    return String(node,);
  }
  if (!node || typeof node !== "object") return "";
  if (Array.isArray(node,)) return node.map(extractText,).join("",);
  const children = (node as WireComponent).c;
  return Array.isArray(children,) ? children.map(extractText,).join("",) : "";
}

/**
 * @description Extracts table of contents entries (headings h2..h3 with anchor ids) from a Wire AST tree.
 * @param wire - Root or branch Wire node to inspect.
 * @param maxDepth - Maximum heading depth to include (defaults to 3).
 * @returns Ordered list of toc headings found in document order.
 * @example
 * ```ts
 * import { extractTocHeadings } from "./utils.ts";
 * const toc = extractTocHeadings({ t: "f", c: [{ t: "c", n: "Heading", p: { depth: 2, id: "intro" }, c: ["Intro"] }] });
 * ```
 */
export function extractTocHeadings(wire: Wire, maxDepth = 3,): TocHeading[] {
  const headings: TocHeading[] = [];
  const walk = (node: Wire,): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node,)) {
      for (const child of node) walk(child,);
      return;
    }
    const component = node as WireComponent;
    if (component.t === "c" && component.n === "Heading") {
      const depth = Number(component.p?.depth ?? 1,);
      const id = typeof component.p?.id === "string" ? component.p.id : "";
      if (id && depth >= 2 && depth <= maxDepth) {
        headings.push({
          id,
          text: extractText(component.c ?? [],),
          depth,
        },);
      }
    }
    if (Array.isArray(component.c,)) {
      for (const child of component.c) walk(child,);
    }
  };
  walk(wire,);
  return headings;
}

/**
 * @description Estimates article reading time in whole minutes based on word count (frontmatter excluded).
 * @param rawMarkdown - Raw markdown source of the document.
 * @param wordsPerMinute - Average reading speed (defaults to 200 wpm).
 * @returns Estimated reading time in minutes (minimum 1).
 * @example
 * ```ts
 * import { estimateReadingTimeMinutes } from "./utils.ts";
 * estimateReadingTimeMinutes("word ".repeat(400)); // 2
 * ```
 */
export function estimateReadingTimeMinutes(
  rawMarkdown: string,
  wordsPerMinute = 200,
): number {
  if (!rawMarkdown) return 1;
  const body = rawMarkdown.replace(/^---[\s\S]*?---/, " ",);
  const words = body.split(/\s+/,).filter((word,) => word.length > 0).length;
  return Math.max(1, Math.round(words / Math.max(1, wordsPerMinute,),),);
}

/**
 * @description Finds the previous and next articles relative to a given path following the flattened tree reading order.
 * @param list - Flattened articles list (pre-order) from state.
 * @param current - Current article route or path in any accepted variant.
 * @returns Object with prev/next ArticleItem references (null when at boundaries or not found).
 * @example
 * ```ts
 * import { findAdjacentArticles } from "./utils.ts";
 * const { prev, next } = findAdjacentArticles(articles.value, "#/intro.md");
 * ```
 */
export function findAdjacentArticles(
  list: ArticleItem[],
  current: string,
): AdjacentArticles {
  const index = list.findIndex(
    (item,) => normalizePath(item.path,) === normalizePath(current,),
  );
  if (index < 0) return { prev: null, next: null, };
  return {
    prev: index > 0 ? (list[index - 1] ?? null) : null,
    next: index < list.length - 1 ? (list[index + 1] ?? null) : null,
  };
}

/** @description Height budget of the table of contents rail, in the units BeerCSS understands. */
export interface TocRailHeight {
  /** @description BeerCSS fixed-height class to clamp the rail box with. */
  heightClass: string;
  /** @description Pixel height that class sets, i.e. the budget cut-off entries are measured against. */
  maxHeightPx: number;
}

/** @description One rail height tier: the BeerCSS class, the pixels it sets, and the screen height from which it still leaves room for the article header above the rail. */
export interface TocRailHeightTier extends TocRailHeight {
  /** @description Minimum viewport height (CSS pixels) this tier needs. */
  minViewportPx: number;
}

/**
 * @description The three height utilities BeerCSS ships, from the tallest down, exported so that the viewport watchers can build one media query per threshold instead of repeating the pixel numbers. There is no viewport-relative height class and no custom CSS is allowed, so the rail can only be clamped to one of these.
 */
export const TOC_RAIL_HEIGHT_TIERS: TocRailHeightTier[] = [
  { heightClass: "large-height", maxHeightPx: 576, minViewportPx: 720, },
  { heightClass: "medium-height", maxHeightPx: 384, minViewportPx: 480, },
  { heightClass: "small-height", maxHeightPx: 192, minViewportPx: 0, },
];

/**
 * @description Picks the height the table of contents rail is clamped to from the available screen height, so scrolling depends on the viewport instead of on the number of entries.
 * @param viewportHeightPx - Viewport height in CSS pixels (`window.innerHeight`).
 * @returns The tallest BeerCSS height class that fits the screen, together with its pixel value.
 * @example
 * ```ts
 * import { tocRailHeight } from "./utils.ts";
 * tocRailHeight(900); // { heightClass: "large-height", maxHeightPx: 576 }
 * tocRailHeight(400); // { heightClass: "small-height", maxHeightPx: 192 }
 * ```
 */
export function tocRailHeight(viewportHeightPx: number,): TocRailHeight {
  const tier = TOC_RAIL_HEIGHT_TIERS.find(
    (candidate,) => viewportHeightPx >= candidate.minViewportPx,
  );
  return tier
    ? { heightClass: tier.heightClass, maxHeightPx: tier.maxHeightPx, }
    : { heightClass: "small-height", maxHeightPx: 192, };
}
