import { fromMarkdown, } from "mdast-util-from-markdown";
import { gfmFromMarkdown, } from "mdast-util-gfm";
import { gfm, } from "micromark-extension-gfm";
import type { MdastRoot, } from "../wire.ts";

/**
 * @description Parses a raw Markdown string into an mdast Root AST.
 * Fully supports CommonMark + GitHub Flavored Markdown (GFM)
 * (tables, task lists, strikethrough, autolinks).
 * @param markdown - Raw markdown string to parse into mdast tree.
 * @returns mdast Root AST representing the parsed document.
 * @example
 * ```ts
 * import { parseMarkdown } from "./parse.ts";
 * const root = parseMarkdown("# Hello World\n\n- [x] Done");
 * ```
 */
export function parseMarkdown(markdown: string,): MdastRoot {
  return fromMarkdown(markdown, {
    extensions: [gfm(),],
    mdastExtensions: [gfmFromMarkdown(),],
  },) as unknown as MdastRoot;
}
