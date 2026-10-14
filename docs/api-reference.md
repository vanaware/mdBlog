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

### `ThemeToggle(props?: ThemeToggleProps): unknown`
Toggles between BeerCSS light and dark themes on `document.body`.

- **Props:**
  - `class?: string` — Extra classes added to the button, so the bar holding it can space it.

### `SearchBox(props?: SearchBoxProps): unknown`
Interactive search bar and modal dialog with live search against pre-indexed article content cached in IndexedDB.

- **Props:**
  - `placeholder?: string` — Placeholder text for the search input (default: `"Search articles..."`).
  - `class?: string` — Extra classes added to the trigger element, so the bar holding it can space it.

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

This is the fallback document. A navigation served by the packaged worker reads the application's own `index.html` and injects the payload into it with `injectWireShell`, so the first paint carries the head the build shipped; `defaultShell` answers only when that document cannot be read (offline, or a host that does not serve it). Keep the two on the same BeerCSS release.

### `injectWireShell(html: string, doc: WireDoc): string`
Splices the pre-rendered payload into an existing HTML document: the `<script id="__md_wire" type="application/json">` goes last in `<head>`, a payload already present is replaced rather than duplicated, and the `<title>` follows the document. Everything else in the template is left exactly as it was.

```ts
import { injectWireShell, processMarkdown } from "@vanaware/mdblog";
const doc = processMarkdown("# Welcome", "/articles/welcome.md");
const html = injectWireShell(await Deno.readTextFile("./index.html"), doc);
```

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

- **Options** (on top of `DocConfig`):
  - `bundlePath?: string` (default: `"./mdblog.js"`) — the client script the shell loads.
  - `shellPath?: string` (default: `"./index.html"`) — the document the first-paint payload is injected into, resolved next to the worker. Point it at another entry document when the app ships one; when it cannot be read, `defaultShell` answers instead.

The browser hands the worker the request it already resolved, so a page asking for `./articles/index.md` arrives as `/mdBlog/articles/index.md`. Before the document is read, that path is reduced to what it is below the worker's own directory (`articles/index.md`, through `toBaseRelativePath`) — the spelling the client itself uses, and the only one a reader resolving against the application directory can serve. Without the reduction a site published under a subfolder asks for the folder twice and misses every document, while the same build served at the root of a domain shows nothing wrong at all. It also keeps the cache key of a document independent of where the site is published.

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

A request that never answers is not allowed to hold the page: the document is waited for up to `NAVIGATION_TIMEOUT_MS` (15s), after which the failure is reported the same way a failed one is — the reader gets the card that explains it and the way back to the start page, instead of a bar that will never finish.

### `registerServiceWorker(): Promise<void>`
Registers the offline Service Worker, deriving the scope from the current location so a subfolder deployment (GitHub Pages) works unchanged.

The build stamp travels in the script URL — `sw.js?version=v0.1.8#…` — because a worker is only replaced when its URL or its bytes change, and `sw.js` is copied verbatim from `public/`. Without the stamp, a deploy that rebuilds the bundle alone would leave the previous worker answering every visit with the shell and the engine of a build that no longer exists. `packages/mdblog/public/sw.js` names its cache after the same stamp, so the superseded build's entries are dropped when the new one activates.

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
