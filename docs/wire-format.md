# 📐 Wire Format architecture

The **Wire Format** is the heart of this solution's data layer. It works as a
lingua franca (Intermediate Representation - IR) between the Markdown parser and
the interface renderer, guaranteeing decoupling, security and speed.

---

## 1. What is the Wire Format?

In traditional documentation systems (such as stock Docsify or classic SSR
generators) the usual flow is:
$$\text{Markdown} \longrightarrow \text{HTML String} \longrightarrow \text{dangerouslySetInnerHTML}$$

That flow has serious problems:
1. **Security risk (XSS):** it demands complex sanitizers (such as DOMPurify) to keep malicious scripts injected through Markdown out.
2. **Lost interactivity:** HTML strings have no hooks for reactive components without brute hydration.
3. **High transmission cost:** raw HTML duplicates tags, classes and redundant wrappers.

With the **Wire Format** model:
$$\text{Markdown} \longrightarrow \text{mdast (AST)} \longrightarrow \text{Wire Format (pure JSON)} \longrightarrow \text{Preact VNodes}$$

The Wire Format is **100% JSON-serializable**. It never contains functions,
closures, cyclic references or DOM nodes.

---

## 2. Formal type definition (TypeScript)

```ts
/**
 * Unified typing of any node or value inside the Wire Format.
 */
export type Wire =
  | string
  | number
  | boolean
  | null
  | Wire[]
  | WireElement      // Intrinsic HTML element
  | WireComponent    // Static component resolved on the client
  | WireIsland       // Interactive island hydrated selectively
  | WireFragment;    // Grouping node with no visual element in the DOM

/**
 * Intrinsic HTML element: <strong>, <em>, <del>, <br>, <hr>...
 */
export interface WireElement {
  t: "e";                       // "e" for element
  n: string;                    // HTML tag name ("strong", "em", "hr", etc.)
  p?: Record<string, unknown>;  // Safe HTML properties and attributes
  c?: Wire[];                   // Recursive children
}

/**
 * Named component: resolved on the client through the component registry.
 */
export interface WireComponent {
  t: "c";                       // "c" for component
  n: string;                    // Canonical name ("Heading", "Paragraph", "CodeBlock"...)
  p?: Record<string, unknown>;  // Serializable props
  c?: Wire[];                   // Recursive children
}

/**
 * Interactive island (Mode B): hydrated on demand by Preact on the client.
 */
export interface WireIsland {
  t: "i";                       // "i" for island
  n: string;                    // Registered island name ("Counter", "SearchBox"...)
  p?: Record<string, unknown>;  // Pure props (they go through JSON.parse(JSON.stringify()))
  c?: Wire[];                   // Pre-rendered static fallback structure
}

/**
 * Fragment: groups several child nodes without injecting a wrapper into the DOM.
 */
export interface WireFragment {
  t: "f";                       // "f" for fragment
  c?: Wire[];                   // List of child nodes
}

/**
 * Complete document returned by the pipeline (for caching or as a network response).
 */
export interface WireDoc {
  wire: WireFragment;           // Document tree
  title: string;                // Title taken from the first h1, or the fallback
  raw: string;                  // Original Markdown content (for debug/cache key)
  url: string;                  // Resolved path of the file (.md)
  renderedAt: number;           // Date.now() timestamp used for cache expiration
}
```

---

## 3. Canonical mapping table: mdast $\to$ Wire

The transformer in `src/plugin/core/to-wire.ts` applies the mapping below:

| Node type in `mdast` | Node type in `Wire` | Name (`n`) | Properties (`p`) | Child handling (`c`) |
|---|---|---|---|---|
| `root` | `WireFragment` (`t:"f"`) | — | — | Maps every child of the root |
| `heading` (level $n$) | `WireComponent` (`t:"c"`) | `"Heading"` | `{ depth: n }` | Maps the text and inner formatting |
| `paragraph` | `WireComponent` (`t:"c"`) | `"Paragraph"` | `{}` | Maps the inline content |
| `blockquote` | `WireComponent` (`t:"c"`) | `"Blockquote"` | `{}` | Maps the inner blocks |
| `list` | `WireComponent` (`t:"c"`) | `"List"` | `{ ordered: boolean, start?: number }` | Maps the list items |
| `listItem` | `WireComponent` (`t:"c"`) | `"ListItem"` | `{ checked?: boolean }` | Maps the items (with GFM checkbox support) |
| `code` (fenced block with syntax) | `WireComponent` (`t:"c"`) | `"CodeBlock"` | `{ lang?: string, value: string }` | No children (the content goes into `value`) |
| `inlineCode` | `WireComponent` (`t:"c"`) | `"InlineCode"` | `{ value: string }` | No children |
| `link` | `WireComponent` (`t:"c"`) | `"Link"` | `{ href: string, title?: string }` | Maps the link text |
| `image` | `WireComponent` (`t:"c"`) | `"Image"` | `{ src: string, alt?: string, title?: string }` | No children |
| `strong` | `WireElement` (`t:"e"`) | `"strong"` | `{}` | Maps the bold children |
| `emphasis` | `WireElement` (`t:"e"`) | `"em"` | `{}` | Maps the italic children |
| `delete` (GFM strikethrough)| `WireElement` (`t:"e"`) | `"del"` | `{}` | Maps the struck-through children |
| `break` | `WireElement` (`t:"e"`) | `"br"` | `{}` | No children |
| `thematicBreak` | `WireElement` (`t:"e"`) | `"hr"` | `{}` | No children |
| `table` (GFM) | `WireComponent` (`t:"c"`) | `"Table"` | `{ align?: string[] }` | Maps the table header and body |
| `tableRow` (GFM) | `WireComponent` (`t:"c"`) | `"TableRow"` | `{}` | Maps the row cells |
| `tableCell` (GFM) | `WireComponent` (`t:"c"`) | `"TableCell"` | `{ align?: string }` | Maps the cell text |
| `text` | `string` | — | — | The primitive string itself |
| `html` | `null` | — | — | **Dropped immediately for safety** |
| Unknown node | `WireComponent` (`t:"c"`) | `"Unknown"` | `{ nodeType: string }` | Emits a non-destructive warning |

A `depth` is a level in the document, not a font size. The `Heading` component
of `src/render/registry.ts` maps the six levels onto the four tags a page can
carry — 1 → `h4`, 2 → `h5`, 3 → `h6`, 4 to 6 → `h6.small` — because an `h1` and
an `h2` belong to the page title and to nothing inside an article, and it adds
the `.small` variant of the tag itself below the wide breakpoint. BeerCSS sizes
an `h4` at 2rem, which wraps a two-word section title over three lines on a
phone, while `h4.small` is 1.5rem: the whole scale steps down together, so the
distance between a document title and its sub-sections stays the same shape at
every width.

---

## 4. Dynamic island differentiation (`WireIsland`)

When the `to-wire.ts` generator meets a component whose name is in the declared
island set (`islands.has(name)`):
- The node is tagged as `{ t: "i", n: name, p: sanitizedProps, c: children }`.
- That instructs the renderer to emit HTML nodes carrying hydration attributes:
  ```html
  <div data-island="Counter" data-props='{"start":5}'>
    <!-- Pre-rendered static fallback content -->
    <div class="md-island md-counter">
      <span>Counter: 5</span>
      <button>+</button>
      <button>−</button>
    </div>
  </div>
  ```

---

## 5. Serialization guarantee: `sanitizeProps`

To stop any accidental injection of functions or unsafe structures, every
property assigned to a Wire Format node goes through this deterministic function:

```ts
export function sanitizeProps(p: Record<string, unknown>): Record<string, unknown> {
  try {
    return JSON.parse(JSON.stringify(p));
  } catch {
    return {};
  }
}
```

This guarantees that a `WireDoc` can be stored straight in Cache Storage through
`new Response(JSON.stringify(doc))`, or embedded safely inside a
`<script id="__md_wire">` tag with no parsing failures.
