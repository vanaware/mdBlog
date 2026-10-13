/**
 * Wire Format types and serialization utilities.
 * Pure TypeScript definitions, 100% JSON-serializable.
 */

/**
 * @description Root mdast Abstract Syntax Tree node produced by markdown parsing.
 */
export interface MdastRoot {
  /** @description Node type discriminator ("root"). */
  type: string;
  /** @description List of child AST nodes. */
  children: unknown[];
  /** @description Optional position metadata or custom node properties. */
  [key: string]: unknown;
}

/**
 * @description Union type of all valid nodes and primitives in the Wire Format AST tree.
 */
export type Wire =
  | string
  | number
  | boolean
  | null
  | Wire[]
  | WireElement
  | WireComponent
  | WireIsland
  | WireFragment;

/**
 * @description Intrinsic HTML element representation (e.g. strong, em, del, br, hr).
 */
export interface WireElement {
  /** @description Discriminator tag for intrinsic HTML elements. */
  t: "e";
  /** @description Tag name ("strong", "em", "del", "br", "hr"). */
  n: string;
  /** @description Safe attributes dictionary. */
  p?: Record<string, unknown>;
  /** @description Nested child wire nodes. */
  c?: Wire[];
}

/**
 * @description Named static component resolved by client component registry (e.g. Heading, Paragraph, CodeBlock).
 */
export interface WireComponent {
  /** @description Discriminator tag for components. */
  t: "c";
  /** @description Component name registered in defaultRegistry. */
  n: string;
  /** @description Serializable component props. */
  p?: Record<string, unknown>;
  /** @description Nested child wire nodes. */
  c?: Wire[];
}

/**
 * @description Interactive Island hydrated on demand on the client via HTML+ES modules.
 */
export interface WireIsland {
  /** @description Discriminator tag for islands. */
  t: "i";
  /** @description Island filename or component name (e.g. "Counter.js"). */
  n: string;
  /** @description Serialized props passed to the island component. */
  p?: Record<string, unknown>;
  /** @description Fallback child wire nodes rendered before hydration. */
  c?: Wire[];
}

/**
 * @description Fragment grouping children without creating a wrapper container in the DOM.
 */
export interface WireFragment {
  /** @description Discriminator tag for fragments. */
  t: "f";
  /** @description Nested child wire nodes. */
  c?: Wire[];
}

/**
 * @description Complete document representation returned by the wire pipeline.
 */
export interface WireDoc {
  /** @description Root WireFragment containing all child elements and components. */
  wire: WireFragment;
  /** @description Extracted document title (from frontmatter or first heading). */
  title: string;
  /** @description Original raw markdown string content. */
  raw: string;
  /** @description Resolved URL or path of the document. */
  url: string;
  /** @description Epoch timestamp in milliseconds when the document was parsed. */
  renderedAt: number;
  /** @description Parsed YAML frontmatter key-value pairs. */
  frontmatter?: Record<string, any>;
}

/**
 * @description Sanitizes props to guarantee 100% JSON serializability.
 * Strips circular references, functions, and symbols.
 * @param p - Raw props dictionary to sanitize.
 * @returns Clean, JSON-serializable properties object.
 * @example
 * ```ts
 * import { sanitizeProps } from "./wire.ts";
 * const safe = sanitizeProps({ count: 10, fn: () => {} });
 * // safe is { count: 10 }
 * ```
 */
export function sanitizeProps(
  p?: Record<string, unknown>,
): Record<string, unknown> {
  if (!p || typeof p !== "object") return {};
  try {
    return JSON.parse(JSON.stringify(p,),);
  } catch {
    return {};
  }
}

/**
 * @description Counts total nodes in a Wire tree.
 * @param wire - Root or branch Wire node to inspect.
 * @returns Total count of nodes in the subtree.
 * @example
 * ```ts
 * import { countWireNodes } from "./wire.ts";
 * const total = countWireNodes({ t: "f", c: ["hello", "world"] });
 * ```
 */
export function countWireNodes(wire: Wire,): number {
  if (!wire || typeof wire !== "object") return 1;
  if (Array.isArray(wire,)) {
    let sum = 1;
    for (const item of wire) {
      sum += countWireNodes(item,);
    }
    return sum;
  }
  let count = 1;
  if ("c" in wire && Array.isArray(wire.c,)) {
    for (const child of wire.c) {
      count += countWireNodes(child,);
    }
  }
  return count;
}

/**
 * @description Counts interactive islands in a Wire tree.
 * @param wire - Root or branch Wire node to inspect.
 * @returns Total count of island nodes (`t: "i"`).
 * @example
 * ```ts
 * import { countWireIslands } from "./wire.ts";
 * const islands = countWireIslands({ t: "i", n: "Counter.js", p: {} });
 * ```
 */
export function countWireIslands(wire: Wire,): number {
  if (!wire || typeof wire !== "object") return 0;
  if (Array.isArray(wire,)) {
    let sum = 0;
    for (const item of wire) {
      sum += countWireIslands(item,);
    }
    return sum;
  }
  let count = wire.t === "i" ? 1 : 0;
  if ("c" in wire && Array.isArray(wire.c,)) {
    for (const child of wire.c) {
      count += countWireIslands(child,);
    }
  }
  return count;
}
