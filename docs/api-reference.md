# 📚 API Reference — `@vanaware/mdblog`

Complete API reference for all components, pipeline functions, reactive state primitives, and types exported by the `@vanaware/mdblog` package.

---

## 🏗️ Components

### `App(): unknown`
Main application layout component assembling the `Navbar`, `Sidebar`, and `Content` components into a unified responsive shell.

```ts
import { App } from "@vanaware/mdblog";
import { render, html } from "htm/preact";

render(html`<${App} />`, document.getElementById("app")!);
```

### `Navbar(): unknown`
Top navigation bar containing the application title, online/offline status indicator, search box trigger, and theme toggle button.

### `Sidebar(): unknown`
Responsive left navigation drawer displaying the hierarchical article tree discovered from `index.md`. Supports smooth scroll, compact density, and mobile overlay dismissal.

### `Content(): unknown`
Main document reader component. Renders breadcrumbs, article metadata, the materialised Wire AST body, sub-page links, and footer. Automatically schedules selective island hydration upon article changes.

### `ThemeToggle(): unknown`
Toggles between BeerCSS light and dark themes on `document.body`.

### `SearchBox(props?: SearchBoxProps): unknown`
Interactive search bar and modal dialog with live search against pre-indexed article content cached in IndexedDB.

- **Props:**
  - `placeholder?: string` — Placeholder text for the search input (default: `"Buscar artigos..."`).

---

## ⚡ Pipeline & Markdown Parser

### `parseMarkdown(markdown: string): MdastRoot`
Parses raw Markdown string into an `mdast` Root AST. Fully supports both **CommonMark** and **GitHub Flavored Markdown (GFM)** (tables, task checklists, strikethrough, autolinks).

```ts
import { parseMarkdown } from "@vanaware/mdblog";
const root = parseMarkdown("# Title\n\n| A | B |\n|---|---|");
```

### `mdastToWire(root: MdastRoot): { wire: WireFragment; title: string }`
Transforms an `mdast` Root AST into an XSS-safe, JSON-serializable `WireFragment` tree. Extracts the first top-level `# Heading` as document title. Discards raw HTML tags.

```ts
import { parseMarkdown, mdastToWire } from "@vanaware/mdblog";
const ast = parseMarkdown("# Documentation\n\nContent paragraph");
const { wire, title } = mdastToWire(ast);
```

### `processMarkdown(markdown: string, url: string): WireDoc`
High-level transformation pipeline. Parses YAML frontmatter, runs markdown parsing, converts AST to Wire format, and produces a complete `WireDoc` instance with epoch timestamp.

```ts
import { processMarkdown } from "@vanaware/mdblog";
const doc = processMarkdown(markdownString, "/articles/intro.md");
console.log(doc.title, doc.wire, doc.frontmatter);
```

### `loadDoc(url: string, io: IO, config?: DocConfig): Promise<WireDoc>`
Loads a document using the provided `IO` abstraction. Implements TTL cache lookup before reading and parsing raw text.

```ts
import { loadDoc, createBrowserIO } from "@vanaware/mdblog";
const io = createBrowserIO();
const doc = await loadDoc("/articles/guide.md", io, { cacheTTLSeconds: 60 });
```

### `defaultShell(doc: WireDoc, bundlePath?: string): string`
Generates a complete HTML document shell for initial server or Service Worker responses. Injects BeerCSS styles and embeds the pre-rendered `WireDoc` in an inline `<script id="__md_wire">` tag for zero-latency first paint.

---

## 💾 I/O & Service Worker Adapters

### `createBrowserIO(options?: CacheIOOptions): IO`
Creates an `IO` instance backed by browser `CacheStorage` and IndexedDB (`idb-keyval`).

- **Options:**
  - `cacheName?: string` (default: `"md-wire-v1"`)
  - `useIndexedDB?: boolean` (default: `true`)

### `createMemoryIO(initialFiles?: Record<string, string>): IO`
Creates an in-memory `IO` implementation for testing, headless runners, and Node/Deno scripts.

### `createSWFetchHandler(io: IO, options?: SWPluginOptions): (event: FetchEvent) => boolean`
Creates a fetch event interceptor for use in a Service Worker (`sw.js`). Intercepts requests for `.md` files and responds with either JSON (`WireDoc`) or pre-rendered HTML shells based on `Accept` headers.

### `createLocalFetcher(io: IO, options?: DocConfig): (url: string) => Promise<WireDoc>`
Creates an in-browser fetcher that executes the parsing pipeline locally as a transparent fallback when the Service Worker is inactive.

### `mdFetch(url: string, io: IO, options?: DocConfig): Promise<WireDoc>`
Unified client fetcher. Tries requesting the Service Worker with `Accept: application/json` first; automatically falls back to local in-browser pipeline execution if the Service Worker is unreachable.

---

## 🏝️ Islands & Virtual DOM Rendering

### `wireToVNode(wire: Wire, options?: WireToVNodeOptions): unknown`
Transforms a `Wire` AST node or tree into Preact VNodes without ever using `dangerouslySetInnerHTML`. Maps `WireComponent` nodes to registered components in `defaultRegistry`.

### `hydrateIslands(opts?: HydrateOptions): Promise<number>`
Scans the DOM for `[data-island]` markers and dynamically hydrates them using native `import()` from `./islands/${name}.js`. Idempotent and resilient to missing island modules.

### `dynamicIslandsCache: Record<string, unknown>`
In-memory cache of dynamically imported island component modules.

---

## 🔄 Router & Navigation

### `initRouter(): void`
Initializes hash-based SPA routing (`#/path.md`). Automatically checks for pre-rendered inline `__md_wire` payloads on first paint and triggers article discovery.

### `navigateTo(path: string): Promise<void>`
Navigates to a target article path (e.g. `"intro.md"` or `"#/articles/intro.md"`), loads the parsed Wire document, updates the document title, and schedules island hydration.

### `registerServiceWorker(): Promise<void>`
Registers the Service Worker with dynamically resolved relative base URLs for compatibility with subfolder deployments (e.g., GitHub Pages).

---

## ⚛️ Reactive State & Signals

### `html(strings: TemplateStringsArray, ...values: unknown[]): unknown`
Tagged template literal (`htm/preact`) for writing JSX-like templates natively without a build tool.

### `signal<T>(initialValue: T): Signal<T>`
Creates a reactive state signal container holding a mutable value.

### `useSignal<T>(initialValue: T): Signal<T>`
Preact hook for creating a component-scoped signal.

### `computed<T>(compute: () => T): Readonly<Signal<T>>`
Creates a read-only signal derived from other signals.

### `effect(callback: () => void | (() => void)): () => void`
Subscribes to signals and executes side effects upon mutation.

### `batch<T>(callback: () => T): T`
Batches multiple signal mutations into a single subscriber notification cycle.

### `state`
Namespace exposing global signals:
- `articles: Signal<ArticleItem[]>` — Flattened list of all discovered articles.
- `articleTree: Signal<ArticleItem[]>` — Hierarchical article tree.
- `currentPath: Signal<string>` — Active document route.
- `currentDoc: Signal<WireDoc | null>` — Current loaded WireDoc document.
- `isLoading: Signal<boolean>` — Loading state indicator.
- `errorMessage: Signal<string | null>` — Current error message.
- `isOffline: Signal<boolean>` — Browser network connection status.
- `isSWActive: Signal<boolean>` — Service Worker controller status.
- `sidebarOpen: Signal<boolean>` — Mobile drawer visibility.
- `viewMode: Signal<ViewMode>` — View mode (`"preview"`, `"ast"`, `"raw"`).

---

## 📐 Data Types

```ts
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

export interface WireElement {
  t: "e";
  n: string;
  p?: Record<string, unknown>;
  c?: Wire[];
}

export interface WireComponent {
  t: "c";
  n: string;
  p?: Record<string, unknown>;
  c?: Wire[];
}

export interface WireIsland {
  t: "i";
  n: string;
  p?: Record<string, unknown>;
  c?: Wire[];
}

export interface WireFragment {
  t: "f";
  c?: Wire[];
}

export interface WireDoc {
  wire: WireFragment;
  title: string;
  raw: string;
  url: string;
  renderedAt: number;
  frontmatter?: Record<string, any>;
}
```
