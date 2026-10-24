> **AI INSTRUCTION:** 
> The text below contains the project DOCUMENTATION and architectural guidelines.
> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).
> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.

---

# Exported Context from Project mdBlog - Mode: DOCS

Automatically generated at: 2026-10-24T21:39:28.507Z

---

## File: `.tool-versions`

```tool-versions
deno 2.9.8
```

---

## File: `LICENSE`

```license
MIT License

Copyright (c) 2026 Vanaware

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

---

## File: `README.md`

````md
# mdBlog 📖⚡

> Modern, zero-build, offline-first Browser Blog & Documentation Engine powered by Deno, Service Worker, Wire Format AST, Preact Signals, and BeerCSS (Material Design 3).

[![JSR](https://jsr.io/badges/@vanaware/mdblog)](https://jsr.io/@vanaware/mdblog)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deno 2.x](https://img.shields.io/badge/Deno-2.x-000000?logo=deno&logoColor=white)](https://deno.com)

---

## 🌟 Highlights

- **⚡ Offline-First PWA:** Intercepts documentation requests (`/articles/*.md`) in a Service Worker, parsing Markdown directly in background and serving instantly from cache.
- **🛡️ Secure Wire Format AST:** Converts Markdown (CommonMark + GFM) into a pure, JSON-serializable Intermediate Representation (`WireDoc`). Zero raw HTML output, zero `dangerouslySetInnerHTML`, and complete immunity to XSS injection.
- **🏝️ Zero-Bundle Dynamic Islands:** Interactive components written in pure **HTML+ES** (`htm/preact`) loaded dynamically on demand directly by the browser (`import("./islands/Component.js")`). Zero compilation step required for new widgets.
- **🎨 Pure BeerCSS UI:** Elegant Material Design 3 interface styled with BeerCSS semantic classes. Automatic dark/light theme toggle, mobile drawer sidebar, and responsive layout.
- **🔍 Frontmatter & Full-Text Search:** Automatically discovers pages, sub-pages, and breadcrumbs from YAML frontmatter in `index.md`, indexing contents in IndexedDB for instant client-side search.
- **🦕 100% Pure Deno:** No Node.js runtime, no `node_modules` pollution, and zero heavy bundler toolchains for authoring. Published to [JSR as `@vanaware/mdblog`](https://jsr.io/@vanaware/mdblog).

---

## 🚀 Quick Start

### 1. Requirements

- [Deno 2.x](https://deno.land/) installed.

### 2. Clone and Run Locally

```bash
# Clone the repository
git clone https://github.com/vanaware/mdBlog.git
cd mdBlog

# Start the local development server (port 3000)
deno task dev
```

Open your browser at `http://localhost:3000`.

### 3. Build & Distribution

```bash
# Bundle packages/mdblog into packages/server/build/dist and packages/mdblog/dist
deno task esbuild

# Run test suite
deno task test

# Run documentation linter (JSR compliance)
deno task --cwd packages/mdblog lint:doc
```

---

## 📁 Repository Structure

```
├── packages/
│   ├── mdblog/                   # Core blog engine & JSR package (@vanaware/mdblog)
│   │   ├── public/               # Static PWA assets & demo content
│   │   │   ├── articles/         # Markdown documentation articles
│   │   │   │   └── index.md      # Root article with frontmatter navigation tree
│   │   │   ├── islands/          # Interactive HTML+ES island components
│   │   │   │   ├── Counter.js    # Interactive counter island demo
│   │   │   │   └── DemoWidget.js # Dynamic widget island demo
│   │   │   ├── index.html        # Single-page application entry point
│   │   │   ├── manifest.json     # PWA Web App Manifest
│   │   │   └── sw.js             # Service Worker interceptor
│   │   ├── src/                  # Library source code
│   │   │   ├── components/       # BeerCSS UI components (Navbar, Sidebar, Content...)
│   │   │   ├── plugin/           # Markdown parsing & Wire AST pipeline
│   │   │   ├── render/           # Preact VNode materialization & island hydrator
│   │   │   ├── router.ts         # Hash-based SPA router
│   │   │   ├── state.ts          # Centralized Preact Signals store
│   │   │   └── mod.ts            # Public entrypoint for JSR and browser bundle
│   │   └── tests/                # BDD test suites (@std/testing/bdd)
│   └── server/                   # Native Deno file server (port 3000)
├── docs/                         # Architecture, API references, and guides
│   ├── README.md                 # Documentation index and reading order
│   ├── guide.md                  # Hands-on guide with a live island demo
│   ├── api-reference.md          # Comprehensive TypeScript API reference
│   ├── syntax-and-islands.md     # Markdown, GFM, and Islands syntax guide
│   ├── wire-format.md            # Wire Format JSON AST specification
│   ├── flows.md                  # Service Worker lifecycle and cache strategy
│   ├── islands.md                # Selective hydration and island lifecycle
│   └── publish-jsr-rules.md      # Installation, configuration, and JSR guide
└── deno.jsonc                    # Deno workspace & tasks configuration
```

---

## ✍️ Writing Articles

Place your markdown files in `public/articles/`. Define navigation and hierarchy in the YAML frontmatter of `public/articles/index.md`:

```markdown
---
title: "My Documentation"
pages:
  - path: "getting-started.md"
    title: "Getting Started"
    icon: "rocket_launch"
  - path: "advanced.md"
    title: "Advanced Guides"
    icon: "tune"
---

# Welcome to mdBlog

Start writing standard CommonMark or GitHub Flavored Markdown (GFM).
```

### Embedding Interactive Islands

Use either code blocks or directive syntax:

```markdown
<!-- Directive syntax -->
::Counter.js{start: 5, step: 2}

<!-- Code block syntax -->
```island:Counter.js
{ "start": 10, "step": 5 }
```
```

Islands live in `public/islands/` and run natively in the browser without bundling!

---

## 🧪 Testing and Verification

Run the full automated test suite and type checks:

```bash
# Run tests with permissions
deno task test

# Run documentation linting
deno task --cwd packages/mdblog lint:doc

# Check code formatting
deno fmt --check
```

---

## 📄 License

MIT © [Vanaware](https://github.com/vanaware)

````

---

## File: `docs/README.md`

````md
# 📚 mdBlog documentation

Welcome to the documentation portal and technical guides of **mdBlog** (`@vanaware/mdblog`).

---

## 📑 Document index

1. **[Complete guide, installation and JSR publication](publish-jsr-rules.md)**
   - What mdBlog is, prerequisites and installation through JSR.
   - Folder structure, Service Worker and PWA configuration.
   - Deno quality standards, JSDoc and CI/CD automation.

2. **[TypeScript API reference](api-reference.md)**
   - Full signatures of every component (`App`, `Navbar`, `Sidebar`, `Content`...).
   - Transpilation pipeline (`parseMarkdown`, `mdastToWire`, `processMarkdown`, `loadDoc`).
   - I/O abstractions (`createBrowserIO`, `createMemoryIO`) and the Service Worker interceptor.
   - Reactive signal primitives and Wire Format types.

3. **[Syntax and Dynamic Islands guide](syntax-and-islands.md)**
   - CommonMark syntax and the GFM extensions (tables, checklists, strikethrough).
   - YAML frontmatter metadata and recursive navigation.
   - Creating and embedding Dynamic Islands (HTML+ES) with no bundle.

4. **[Wire Format architecture](wire-format.md)**
   - Specification of the framework-agnostic intermediate JSON format (AST -> Wire).
   - Canonical node mapping table and full XSS immunity.

5. **[Navigation flows and lifecycle](flows.md)**
   - First paint with the HTML shell and the embedded payload (`<script id="__md_wire">`).
   - SPA navigation with content negotiation (`Accept: application/json`).
   - Unified cache strategies (`CacheStorage` + `IndexedDB`).

6. **[Islands architecture](islands.md)**
   - Why HTML+ES (`htm/preact`) instead of TSX or MDX.
   - The `data-island` / `data-props` contract and the selective hydration pass.
   - Fallback behavior for islands that are declared but not registered.

7. **[Hands-on guide and feature demo](guide.md)**
   - The pipeline walked through on a live document (frontmatter, sub-pages, islands).
   - Comparison table against the conventional server-rendered generators.

---

## 🧭 Architecture diagram

```
                     ┌───────────────────────────────┐
                     │      Markdown (.md docs)      │
                     └──────────────┬────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
    [ Service Worker Fetch ]                    [ Client Local Fallback ]
               │                                         │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │    Pipeline Core (mdast -> Wire)     │
                └───────────────────┬──────────────────┘
                                    │
                           JSON Wire Format
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │   from-wire.ts (Preact Registry)     │
                └───────────────────┬──────────────────┘
                                    │
                     Static initial VNodes
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │  hydrateIslands() [data-island]      │
                └──────────────────────────────────────┘
```

````

---

## File: `docs/api-reference.md`

````md
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

````

---

## File: `docs/beercss.md`

````md
# BeerCSS — practical guide & reference

> Rewritten reference for **BeerCSS** (a utility-first CSS kit for Material Design 3).
> This file has two jobs: teach a **human newcomer** how BeerCSS actually works, and
> give an **AI/code-assistant** the mental model, the gotchas, and the class inventory
> needed to style pages in *pure BeerCSS* quickly and correctly — instead of falling
> back to custom CSS.
>
> Version note: BeerCSS `3.x` (linklist pins `3.7.12`). The official site is
> <https://www.beercss.com>. Class/variable names below are taken from the official
> docs; when a behaviour was confirmed empirically (not documented) it is marked
> **(verified)**.

---

## 1. The mental model (read this first)

BeerCSS is **not** a component framework and **not** a Tailwind clone. Four ideas
explain ~90% of it:

1. **Components are driven by semantic HTML tags, not by wrapper classes.** Many
   elements are styled just by being the right tag: `<button class="button">`,
   `<nav>`, `<header>`, `<footer>`, `<dialog>`, `<table>`, `<article>` (the card
   surface — see §7), `<label>` around an input. You mostly add a base class to a
   real tag, then add *modifier* classes.
2. **Helpers are small, single-purpose classes** (`round`, `elevate2`, `center-align`,
   `large`, `primary`) that you stack on any element. The official tip is literally:
   *"Try to use helpers first, before any custom CSS."*
3. **All color, elevation, radius and type scale come from CSS custom properties
   (design tokens).** You almost never type a hex value; you reference a role
   (`--primary`, `--surface-container`, `--on-surface-variant`) and BeerCSS maps it
   for **light** and **dark** automatically.
4. **JS is optional and only adds behavior.** `beer.min.css` does *all* layout,
   color and typography (works with JavaScript disabled). `beer.min.js` only wires
   interactive widgets (tabs, dropdown menus, dialogs, side-nav toggle, waves,
   date/time pickers). Pure static pages need **no JS** from BeerCSS.

Total footprint is tiny — ~100 CSS classes. When you feel the urge to write a
`<style>` block, first check whether a helper or a token already does it.

### Icons
Icons are **Google Material Symbols ligatures**: a `<i>` whose *text* is the icon's
ligature name renders as that glyph, using the `--font-icon` font.

```html
<i>home</i>          <!-- Material Symbol "home" -->
<i class="small">search</i>
```

`<i>` is a plain icon slot. **Never add `class="icon"`** — `.icon` is a *reserved*
BeerCSS layout class (fixed size box) and using it to style a glyph breaks the
grid/row math **(verified)**. Brand logos are not Material ligatures; ship inline
SVG with `fill="currentColor"` for those.

---

## 2. Pure BeerCSS vs other techniques

Knowing what BeerCSS is *not* prevents the instinct to reach for patterns that do
not apply. Agility cheat-sheet:

| Technique | How it differs from BeerCSS | What to do in BeerCSS instead |
| --- | --- | --- |
| **Bootstrap** (opinionated `.card`/`.btn` components) | BeerCSS components are tag+modifier driven, far fewer classes, no JS plugin ecosystem. | Use the semantic tag + a base class + modifiers. |
| **Tailwind** (atomic utilities, `bg-blue-600`) | BeerCSS has **no literal color/spacing scale** in markup; it uses **semantic roles** + tokens, so classes are fewer but less granular. | Say `primary`/`surface`, not `bg-[#4f46e5]`. Use `--size` and helpers (`small`, `large`, `padding`) instead of arbitrary values. |
| **CSS Modules / styled-components** | BeerCSS is global-by-design; there is no scoping layer. | Prefix your own helper classes with a namespace (e.g. `linklist`) and rely on BeerCSS classes for everything else. |
| **Custom CSS / design systems** | Most things you'd hand-write (elevations, containers, theme switching) already exist as tokens/helpers. | Override a token in `:root`/`body.dark` rather than re-declaring component CSS. |
| **Material Web Components** (custom elements, `@material/web`) | BeerCSS is CSS+classes only; no shadow DOM, no `<md-button>`. | Plain tags; add `beer.min.js` for interactions. |

**Golden rules for a coding agent working in pure BeerCSS:**

- Prefer a BeerCSS **class** over a new CSS rule; prefer a **token** over a literal value.
- Never hardcode colors — always a role class or `var(--*)`, so light/dark keep working.
- Structure = real HTML tags; presentation = modifiers stacked on them.
- Static content must render correctly with **JS off**; add `beer.min.js` only where an interaction is needed.
- When a size/space/width does not take effect, **inspect COMPUTED styles** — a BeerCSS
  base class often overrides your HTML attributes or universal selectors (see §5).

---

## 3. Setup

### CDN (recommended for static sites)

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- CSS only = fully styled, no-JS-capable page -->
  <link href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css" rel="stylesheet" />
  <!-- Optional: JS for interactive widgets + Material Symbols font -->
  <script type="module" src="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.js"></script>
  <!-- Optional: runtime theme swapping (dynamic colors) -->
  <script type="module" src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"></script>
  <!-- Optional: a custom UI font + the icon font, otherwise BeerCSS uses system fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@400;500;700&display=swap" rel="stylesheet" />
</head>
<body class="light"><!-- or dark --> … </body>
```

Use `material-dynamic-colors` **only** if you change the theme at runtime; a static
site can pick brand colors by overriding tokens in CSS (§4). npm: `npm i beercss`
(`beer.min.css` / `beer.min.js` under `dist/cdn`).

---

## 4. Theming & configuration (the highest-value section)

### 4.1 Light / dark are two token palettes on `<body>`

BeerCSS ships two complete palettes selected by a body class:

```css
:root, body.light { /* light role values */ }
body.dark          { /* dark role values */ }
```

So the mode is literally `document.body.classList` = `light` | `dark`. There is **no
`prefers-color-scheme` in BeerCSS** — "follow the OS" is not built in **(verified)**.

**Auto without a flash, no dependency** — a one-line blocking script right after
`<body>` reads the OS preference before first paint, then (optionally) keep it live:

```html
<body class="">
  <script>
    if (matchMedia("(prefers-color-scheme: dark)").matches)
      document.body.classList.add("dark");
  </script>
  <!-- runtime sync (optional) -->
  <script>
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      document.body.classList.toggle("dark", mq.matches);
      document.body.classList.remove("light");
    });
  </script>
```

(When JS is off, force a mode statically with `<body class="dark">` at build time.)

### 4.2 The tokens you actually override

Colors are **role tokens** (Material 3). The important pairs are a *fill* and its
*on-* foreground (text/icon drawn on that fill):

| Role | Meaning |
| --- | --- |
| `--primary`, `--on-primary`, `--primary-container`, `--on-primary-container` | brand color + legible ink + tonal container |
| `--secondary`, `--tertiary`, `--error` (+ their `-on-*` / `-container` variants) | secondary/tertiary palettes, error color |
| `--background`, `--on-background` | page canvas |
| `--surface`, `--on-surface`, `--surface-variant`, `--on-surface-variant` | component surfaces + text |
| `--surface-dim`, `--surface-bright`, `--surface-container`, `--surface-container-low(-est)`, `--surface-container-high(-est)` | the tonal elevation ramp (cards, wells) |
| `--outline`, `--outline-variant` | borders/dividers |
| `--inverse-surface`, `--inverse-on-surface`, `--inverse-primary` | inverted context |
| `--shadow`, `--scrim`, `--overlay`, `--active` | shadow color, modal scrim, hover/press tint |

Non-color config tokens (change these in `:root`):

| Token | Effect |
| --- | --- |
| `--size` | the base unit — **scales almost every component** (button height, spacing, fonts). One knob to make the whole UI denser/roomier. |
| `--font` | UI font family stack. |
| `--font-icon` | icon font: `"Material Symbols Outlined"` (default) / `"…Rounded"` / `"…Sharp"` / `none`. |
| `--elevate1/2/3` | box-shadow values for `elevate*`. |
| `--speed1/2/3/4` | animation durations. |

### 4.3 Changing the brand color statically (no runtime JS)

Only override the roles you care about; keep everything else. Set the light block on
`:root, body.light` and the dark block on `body.dark` (dark usually needs a *lighter*
primary for contrast):

```css
:root, body.light {
  --primary: #4f46e5;            /* indigo-600 */
  --on-primary: #ffffff;         /* legible ink on the fill */
  --primary-container: #e0e7ff;
  --on-primary-container: #1e1b4b;
}
body.dark {
  --primary: #a5b4fc;            /* lighter tint for dark mode */
  --on-primary: #1e1b4b;
  --primary-container: #3730a3;
  --on-primary-container: #e0e7ff;
}
```

`--on-*` must contrast with its fill. Do it by hand in static CSS, or compute it at
build/runtime (WCAG relative-luminance → pick black/white ink). A tonal
`--*-container` is roughly the primary blended ~15% toward white.

### 4.4 Runtime theming (dynamic colors) — optional

With `material-dynamic-colors` loaded, `ui()` can derive a full theme from any seed
(color/image/file) and flip mode:

```js
let theme = await ui("theme", "#ffd700"); // returns { dark: "--primary:…;…", light: "--primary:…;…" } and applies it
ui("mode", "dark");                        // or "light"
```

Only reach for this when the user picks a theme live; otherwise static overrides
(§4.3) are simpler and work without JS.

### 4.5 Fonts

```css
@import "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
:root {
  --font: "Roboto Flex";
  --font-icon: "Material Symbols Outlined"; /* or Rounded / Sharp / none */
}
```

**Icon fonts are bundled (verified in 3.7.12).** `beer.min.css` itself declares
`@font-face` for *Material Symbols Outlined / Rounded / Sharp*, pointing at the
`.woff2` files shipped next to it on the CDN — no Google Fonts link is needed
for `<i>` glyphs. The faces use `font-display: block`, so on a cold cache every
glyph is **invisible** until the font lands *after* the stylesheet is parsed.
Fix it the standard way, not with CSS: preload the face you use in the `<head>`:

```html
<link rel="preload" crossorigin
  href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/material-symbols-outlined.woff2"
  as="font" type="font/woff2" />
```

---

## 5. Gotchas that bite everyone (all **verified** building linklist)

These are the traps that waste the most time. When something "won't size/space", it
is almost always one of these:

1. **`.button` is `inline` and `box-sizing: content-box`.** A `width:100%` button is
   therefore **48px wider than its cell** (`padding: 0 24px` is added to content-box)
   and overlaps neighbors. Fixes:
   - idiomatic full-width: add **`.responsive`** — *"a button that automatically
     adjusts to the width of its container"* — `<a class="button responsive">`.
   - if you set `width:100%` yourself, also set **`box-sizing: border-box`** on the
     same (specific, class-scoped) selector; a global `*{box-sizing:border-box}` **loses**
     to the `.button` class rule.
2. **`.circle` / `.round` / `.square` fix a size** (`.circle` = `3rem`, i.e. 48px) as
   well as the radius. This **beats HTML `width`/`height` attributes**, so an avatar
   "stuck small" is a `.circle` not respecting your attrs. To enlarge, override
   `width`/`height` in a class-scoped CSS rule (keep `.circle` for the round shape).
3. **Semantic landmarks come pre-styled.** BeerCSS paints `header`, `footer`, `nav`,
   `section` with a surface background, `display:flex`, and **`white-space:nowrap`**.
   If you use them as plain page structure, **reset** them:
   ```css
   .linklist header, .linklist nav, .linklist footer, .linklist section {
     background: transparent; display: block; min-block-size: 0;
     padding: 0; margin: 0; white-space: normal;
   }
   ```
4. **`.icon` is reserved** (a fixed-size layout box). Use a bare `<i>` for glyphs;
   never style icons with `class="icon"`.
5. **`.grid` gutters come from the `---gap` custom property, which feeds BOTH
   `gap` and the 12-column track `calc()`.** The `*-space` helpers (`no-space` /
   `small-space` / `medium-space` / `large-space`) work by setting `---gap`. If you
   override only `gap`, the tracks stay sized for the old `---gap` and *every child
   shrinks* by ~11×(old−new) — e.g. a `gap:.75rem` override leaves buttons ~44px
   narrower than full-width siblings **(verified)**. Do it right: add a `*-space`
   class, **or** set `---gap` directly (`grid { ---gap: .75rem }`). Children size by
   **12-column spans** (`s*`,`m*`,`l*`), so a *consistent* gap never overflows.
6. **`.row` never wraps** (`white-space:nowrap`). Put only short controls in a `.row`
   (center with `center-align`, a `.row` helper — *not* `.center`, which is an
   absolute-position helper). For many items that must reflow, use `.grid`.
7. **Headings are big by default.** `h1`–`h3` are *Display*, `h4`–`h6` are *Headline*
   (page-level sizes). For a compact block, retune `font-size`/`font-weight` in a
   scoped rule, or use the text helpers `small-text` / `medium-text` / `large-text`.
8. **No container/max-width utility.** BeerCSS has `.responsive`/`.max` but no
   `.container`; center + cap a column yourself (e.g. `max-width:36rem;margin-inline:auto`).

> **Debug method that ends all these:** open DevTools, read the **Computed** tab for
> `box-sizing`, `width`, `display`, `white-space`, `gap`. A BeerCSS base class is
> almost always the thing overriding you — beat it with a more specific selector,
> don't fight it globally.

---

## 6. Layout system

- **Grid** — `<div class="grid">` with children spanning 12 columns per breakpoint:
  `s1..s12` (small/phone), `m1..m12` (medium/tablet+), `l1..l12` (large/desktop).
  Example one/two columns responsively: `<li class="s12 m6">`. (There is no CSS-grid
  `span N` class — the number *is* the column count.)
- **Row** — `<div class="row">` = a nowrap flex line; align with `left-align` /
  `center-align` / `right-align` / `top-align` / `middle-align` / `bottom-align`.
- **Breakpoint visibility** — `s`, `m`, `l` (and `small-device`/`medium-device`/
  `large-device`) show/apply an element only in that band; used on nav drawers.
- **Responsive element** — `.responsive` makes an element (button, image, video,
  `<main>`) fill its container width.
- **Positioning** — `absolute` or `fixed` + edges/side: `left right top bottom
  center middle front back`. `max` = grow to available space.
- **Sizing helpers** — `tiny small medium large extra` (component scale),
  `max small-width medium-width large-width small-height medium-height large-height`,
  `wrap` / `no-wrap`.

---

## 7. Component reference (tag + base class + modifiers)

Modifiers listed are the common ones; full helper set in §8.

- **Button / FAB** — `<button class="button">…</button>`. Modifiers: `small medium
  large extra`, `border`, `round`/`circle`/`square`, `fill`/`extend`/`none`,
  `responsive` (full-width), `horizontal`/`vertical`, `left`/`right`/`top`/`bottom`.
  FAB: `<a class="circle">` icon button; container-less links use `<a class="button">`.
- **Card** — write `<article>…</article>`. **Heads-up: 3.7.12 has no `.card`
  class** — the surface (`padding: 1rem`, `background: --surface-container-low`,
  `box-shadow: var(--elevate1)`, `border-radius: .75rem`) is a **plain `article`
  ELEMENT style**, so the effect comes from the tag, not any class; `class="card"`
  is decorative only. Sizes via helpers (`small/medium/large`), `no-padding`,
  `round`/`no-round`, `elevate*`; add these classes to the `<article>`.
- **Badge / Chip** — `<span class="badge">` / `<span class="chip">` with `left/right/
  top/bottom`, shape (`circle`/`square`/`round`), `border`, `small/medium/large`,
  `horizontal/vertical` (chip).
- **Field (input/textarea/select)** — a `.field` wrapper + a real control:
  ```html
  <div class="field label border">
    <input placeholder=" " id="name" /><label for="name">Name</label>
  </div>
  ```
  Modifiers: `border`/`fill`/`round`, `small/medium/large/extra`, `prefix`/`suffix`,
  `textarea`, `label`. The `label` + empty `placeholder=" "` trick animates the label.
- **Nav / drawer / bottom-nav** — `<nav>` with `left`/`right`/`top`/`bottom`,
  `drawer` (slide-in), breakpoint `s`/`m`/`l`, `border`, alignment helpers.
  Bottom app bar: `<nav class="bottom s">`.
- **Menu / dropdown** — `<menu class="max">` with `<li>` items; toggle by adding the
  `active` class (JS helper `ui("anchor")`/`ui("dropdown")` for smart positioning).
- **Dialog / modal** — `<dialog>` + `active` to open; placement
  `left/right/top/bottom`, sizes `small/medium/large`, `max`, `round`, `border`.
  **3.7.12 has no `.modal` class (verified)** — that and native `::backdrop` /
  popover handling arrive in later majors. The scrim in 3.7.x is a sibling
  `<div class="overlay active">` you show and hide yourself (`overlay` alone is
  the hidden fixed backdrop; `active` reveals it).
- **Tabs** — `<div class="tabs"><a>…</a></div>` + `horizontal`/`vertical`, `min`/`max`,
  alignment; JS switches the `active` tab.
- **Table** — `<table>` + `stripes`/`border`, spacing `no-space`/`small-space`…,
  `min`/`fixed`, alignments.
- **Progress / loader** — `<progress>` (linear) or `class="circle"` (indeterminate
  ring), sizes `small/medium/large`.
- **Snackbar / tooltip** — `<div class="snackbar">` and `<div class="tooltip">` (or a
  `data=` tooltip), toggled with `active` and positioned `top`/`bottom`/`left`/`right`.
- **Selection controls** — `<label><input type="radio|checkbox|switch"> …</label>` —
  the `<label>` carries `radio`/`checkbox`/`switch` to render the MD3 control. Slider:
  `<input type="range">`.
- **Media** — `<img class="circle|round|responsive">`, `<video>` same modifiers;
  `<div class="responsive">` crop area.
- **Expansion** — native `<details><summary>` styled automatically.

---

## 8. Helper index (the class inventory)

Stack these on any element. Names are exact BeerCSS classes.

- **Alignments** `left-align right-align center-align top-align bottom-align middle-align`
- **Blurs** `blur small-blur medium-blur large-blur light dark`
- **Directions** `horizontal vertical`
- **Dividers** `divider small-divider medium-divider large-divider`
- **Elevates** `elevate small-elevate medium-elevate large-elevate no-elevate`
- **Forms** (shape/variant) `border no-border circle square none fill extend drawer
  round no-round small-round medium-round large-round left-round right-round top-round
  bottom-round`
- **Margins** `margin no-margin auto-margin tiny-margin small-margin
  large-margin left-margin right-margin top-margin bottom-margin horizontal-margin
  vertical-margin` **(verified: `medium-margin` does NOT exist in 3.7.12 — the
  size ladder is tiny .25rem / small .5rem / bare 1rem / large 1.5rem)**
- **Opacities** `opacity no-opacity small-opacity medium-opacity large-opacity`
- **Paddings** `padding no-padding auto-padding tiny-padding small-padding
  large-padding left-padding right-padding top-padding bottom-padding
  horizontal-padding vertical-padding` **(verified: `medium-padding` likewise
  does NOT exist in 3.7.12; `medium-space` does)**
- **Positions** `left right center top bottom middle front back`
- **Responsive** `responsive small-device medium-device large-device s m l`
- **Scrolls** `scroll no-scroll`
- **Shadows** `shadow left-shadow right-shadow top-shadow bottom-shadow`
- **Sizes** `tiny small medium large extra wrap no-wrap max small-width medium-width
  large-width small-height medium-height large-height`
- **Spaces** `space no-space small-space medium-space large-space` *(these set the
  `---gap` var that drives both the `.grid` gap and its track calc — see §5.5)*
- **Theme (color/role classes)** `light dark primary primary-text primary-border
  primary-container secondary… tertiary… error… background surface surface-variant
  inverse-surface inverse-primary black black-text white white-text transparent
  transparent-text` *(apply a role as text vs fill via the `-text`/`-border` suffix)*
- **Typography** `italic bold underline overline upper lower capitalize link
  small-text medium-text large-text` (+ `h1`…`h6` for heading sizes)
- **Triggers** `active` (opens menus/dialogs/snackbars/tooltips)
- **Waves** `wave no-wave light dark` (ripple; needs JS)

### Named color palette (helper classes)
Beyond the semantic roles, BeerCSS ships a fixed palette you can use as fill /
`-text` / `-border`. Names follow the pattern:

```
<color>1 … <color>10 | <color> | <color>-border | <color>-text
```

for `amber blue blue-grey brown cyan deep-orange deep-purple green grey indigo
light-blue light-green lime orange pink purple red teal yellow`.
Prefer the **semantic role** classes/vars (they theme with light/dark); use named
palette colors only for genuinely fixed hues.

---

## 9. Full design-token list

Colors (roles): `--primary --on-primary --primary-container --on-primary-container`
`--secondary --on-secondary --secondary-container --on-secondary-container`
`--tertiary --on-tertiary --tertiary-container --on-tertiary-container`
`--error --on-error --error-container --on-error-container`
`--background --on-background --surface --on-surface --surface-variant
--on-surface-variant --surface-dim --surface-bright --surface-container
--surface-container-low --surface-container-lowest --surface-container-high
--surface-container-highest --outline --outline-variant --inverse-surface
--inverse-on-surface --inverse-primary`
Effects/misc: `--shadow --scrim --overlay --active`
Config: `--size --font --font-icon --elevate1 --elevate2 --elevate3 --speed1 --speed2
--speed3 --speed4`

Override the *config* and *color* tokens in `:root, body.light` / `body.dark` (§4).

---

## 10. AI quick-decision cheatsheet ("I want X → use Y")

- full-width button → `class="button responsive"` (or `width:100%` **and** scoped
  `box-sizing:border-box`)
- round avatar / icon button → `.circle` + override `width/height` in CSS if you need
  it bigger than 48px
- card / elevated panel → `<article class="elevate2 round">` (**an `article`
  element**, not a `.card` class — see §7 Card)
- responsive N-up columns → `<div class="grid">` + `s12 m6 l3` children; tune
  gutters with a `*-space` class or by setting `---gap` (**never** `gap` alone)
- horizontal toolbar of short controls → `<div class="row center-align">`
- primary/secondary button color → rely on the theme tokens; add `border` for
  outline style
- dark mode → set `body.dark` (OS-sync script if you want `auto`)
- brand color only, static → override `--primary` + `--on-primary` (+ containers) in
  `:root, body.light` and `body.dark`
- everything denser/roomier → change `--size`
- icons → `<i>ligature_name</i>`; set `--font-icon` style
- text emphasis sizes → `small-text` / `medium-text` / `large-text` (don't rely on
  `h1..h6` for small UI labels)
- interactive widget (tabs/menu/dialog/drawer) → add `beer.min.js`; toggle `active`,
  or call `ui("dropdown")` / `ui("anchor")`
- **stuck styling** → read DevTools **Computed**; a base BeerCSS class is overriding
  your attribute/global rule; fix with a more specific selector, colors only via tokens.

---

*Official site & playground: <https://www.beercss.com>. Package: `beercss` on npm.*

````

---

## File: `docs/flows.md`

````md
# 🔄 Navigation flows and lifecycle

This document details how the system behaves in each usage scenario: the first
load in the browser, internal SPA navigation, offline operation, and the fallback
in environments where the Service Worker is not active.

---

## 1. Flow 1: direct navigation / first paint (F5 or typing a URL)

Happens when the user opens a path directly in the browser (e.g.
`https://site.com/docs/guide` with the `Accept: text/html` header).

```
[ User types a URL / Presses F5 ]
                  │
                  ▼
         [ Service Worker ] ── (Intercepts the FetchEvent with Accept: text/html)
                  │
                  ├── Queries Cache Storage ('md-wire-v1')
                  │     └── Valid cache hit? If so, uses the cached WireDoc.
                  │
                  ├── Cache miss or expired:
                  │     ├── The request path is reduced to what it is below the
                  │     │    application directory (/mdBlog/articles/index.md
                  │     │    becomes articles/index.md, the spelling the page uses)
                  │     ├── Internal fetch: 'articles/index.md?_md_raw=1'
                  │     ├── Parse Markdown -> mdast AST -> WireDoc
                  │     └── Stores the WireDoc in Cache Storage
                  │
                  ▼
         [ the shell ] ── Answers the navigation with a complete HTML document
                  │
                  ├── Reads ./index.html next to the worker (revalidated, so the
                  │    head is always the one the application was shipped with)
                  ├── Falls back to defaultShell(doc) when it cannot be read
                  ├── Injects <script id="__md_wire" type="application/json">
                  └── Rewrites <title> after the document being rendered
                  │
                  ▼
        [ HTTP 200 response ] ── Hands the HTML back to the browser
                  │
                  ▼
         [ bundle.js runs ]
                  │
                  ├── The Content component consumes and removes #__md_wire from the DOM
                  ├── wireToVNode() materializes the Preact VNodes instantly
                  └── hydrateIslands() hydrates the nodes carrying [data-island]
```

### Advantages of this flow:
- **Zero layout shift:** the text content and the blocks already arrive in the first HTML document.
- **Fast:** no extra AJAX/Fetch data requests during the initial load.
- **SEO & accessibility:** search crawlers receive the structured node tree.
- **One document, one head:** the payload is injected into the `index.html` the
  application ships, so a served first paint carries the same stylesheets, the
  same theme restore and the same mount deadline as a plain visit — there is no
  second copy of the head to keep in step, which is how a shell ends up loading
  another framework release and hanging on a blank page.
- **Publishable anywhere:** the worker reads the request path relative to its own
  directory rather than to the server root, so the same build works at the root
  of a domain and under a subfolder (GitHub Pages). A path kept as the browser
  sent it would be joined to the folder twice, and every document would 404 — a
  failure that only appears once the site is published, never in local
  development.

---

## 2. Flow 2: SPA navigation (moving between pages)

Happens when the user clicks an internal link or the hash route changes (`#/docs/other`).

```
[ User clicks a link / Hash changes ]
                  │
                  ▼
        [ Router / Signals ] ── Updates 'currentPath.value'
                  │
                  ▼
       [ mdFetch('/docs/other') ] ── Sends the request with Accept: application/json
                  │
                  ▼
         [ Service Worker ] ── Intercepts and processes
                  │
                  ├── Content negotiation: recognizes 'Accept: application/json'
                  ├── Queries or processes the WireDoc
                  └── Returns the JSON Response with the metadata headers (x-title, x-source, etc.)
                  │
                  ▼
        [ Content component ] ── Receives the JSON object
                  │
                  ├── wireToVNode(doc.wire, registry)
                  ├── Preact reconciles the DOM without reloading the page
                  └── hydrateIslands() hydrates only the newly created islands
```

---

## 3. Flow 3: fallback without a Service Worker (pure client-side)

Happens when:
- The browser does not support Service Workers.
- The Service Worker is still installing and has not taken control of the page yet.
- The user unchecked or unregistered the Service Worker in the developer tools.

```
[ mdFetch(url) is called by the Content component ]
                  │
                  ▼
     [ detect.ts: isSWControlling() ] ── Returns false!
                  │
                  ▼
       [ createLocalFetcher() ] ── Activates the client-side pipeline
                  │
                  ├── The client IO reads the .md file directly through window.fetch
                  ├── The client-side parser produces mdast -> WireDoc
                  ├── Stores it in the shared 'md-wire-v1' Cache Storage
                  └── Returns the JSON Response
                  │
                  ▼
         [ Identical rendering ] ── The user notices no difference!
```

---

## 4. Shared cache strategy (`md-wire-v1`)

The Service Worker and the client adapter share **the same `cacheName`** in the
browser's Cache Storage.

### Cache rules:
1. **Cache key:** the key is the resolved canonical path of the Markdown file (e.g. `/docs/guide.md`).
2. **TTL (time-to-live):** configured in seconds (default: `60s`).
   - When reading from the cache, the pipeline checks whether:
     $$\text{Date.now()} - \text{doc.renderedAt} < \text{cacheTTL} \times 1000$$
   - On an expired entry, the `.md` file is fetched again with the `Cache-Control: no-cache` header.
3. **Invalidation and cleanup:** in the Service Worker `activate` event, every cache whose name starts with the `md-wire-` prefix but differs from the active `cacheName` is dropped automatically.

---

## 5. Security measures in the Service Worker

### 5.1 Preventing infinite recursion
When the Service Worker must fetch the `.md` file for processing, the `fetch` issued inside the worker could be intercepted by the worker itself, producing an infinite loop.
- **Solution:** every internal request for the raw `.md` carries the `?_md_raw=1` search parameter. The `fetchHandler` sees that parameter and skips interception right away (`return`).

### 5.2 Streaming and media filtering
Requests carrying the `Range` header (common in audio, video or streaming) are ignored by the plugin, so improper binary traffic is never intercepted.

````

---

## File: `docs/guide.md`

````md
# 🧪 Hands-on guide and feature demo

Welcome to the live demonstration of the **Docsify-style architecture with a
Service Worker and the Wire Format**!

This document is read by the Markdown parser, turned into serializable JSON nodes
(*Wire Format*) and materialized by Preact in the browser without ever using
`dangerouslySetInnerHTML`.

---

## ⚡ Interactive island demo (the HTML+ES solution)

Below is a reactive island built with **HTML+ES (`htm/preact` + ES Modules)**,
running directly in the browser with no prior compilation by the bundle:

::Counter{start: 10, step: 1, label: "Reactive Interactive Counter"}

### Second island (different configuration)

You can instantiate several islands with independent props isolated through
`@preact/signals`:

```island:Counter
{
  "start": 100,
  "step": 5,
  "label": "Batched Counter (+5)"
}
```

---

## 🧩 On-demand dynamic islands (zero build)

Thanks to the **HTML+ES** pattern, a new island can be created as a plain `.js`
file (e.g. `public/islands/DemoWidget.js`) and loaded on demand through the
browser's native `import()`, with no need to rerun `build.ts`:

```markdown
::DemoWidget{title: "My Dynamic Island", step: 2}
```

---

## 📊 Formatted tables (GFM)

The Wire Format turns Markdown tables into Preact components with a responsive
BeerCSS layout:

| Feature | Traditional (Docsify) | Wire Format (this project) |
|---|---|---|
| HTML injection | `dangerouslySetInnerHTML` | Pure Preact VNodes |
| SW interception | Not native | Turns `.md` into AST in the worker |
| Interactivity | Requires loose scripts in the DOM | Preact Islands with `@preact/signals` |
| XSS risk | High without DOMPurify | Impossible by architecture |
| Offline support | Basic | Cache Storage + IndexedDB (`idb-keyval`) |

---

## ✅ Task lists (GFM task lists)

- [x] Architecture specification and contracts in `CURRENT.md`
- [x] `mdast` parser with the GFM extensions enabled
- [x] AST to Wire Format JSON transformer
- [x] Selective hydration of islands (`[data-island]`)
- [x] Adapters for the Service Worker and the client-side fallback
- [ ] New custom islands developed by the community

---

## 💻 Code blocks with a copy button

You can easily copy the snippets by clicking the button in the top right corner:

```ts
import { mdFetch } from "./src/plugin/adapters/client.ts";
import { createBrowserIO } from "./src/plugin/core/io.ts";

const io = createBrowserIO();
const doc = await mdFetch("/docs/README.md", io);

console.log("Document title:", doc.title);
console.log("Wire Format nodes:", doc.wire.c?.length);
```

---

## 💬 Quotes and notes

> **Architectural note:** the Wire Format is 100% serializable. No closure, function or DOM node ever travels between the Service Worker and the client. That guarantees immunity to structured-clone bugs (`DataCloneError`).

To explore more details of the project, browse the sections in the side menu or read the [Wire Format architecture](./wire-format.md).

````

---

## File: `docs/islands.md`

`````md
# 🏝 Islands architecture guide (the HTML+ES solution)

Inspired by the architectural model of **Fresh** (Deno) and built exclusively on
the **HTML+ES solution (Hyperscript Tagged Markup through `htm/preact` + standard
ES Modules)**, the Islands system lets interactive, reactive components live
inside static documentation while keeping the principles of **zero prior
compilation by the bundle**, **zero unnecessary JavaScript** and **100% native
execution in the browser from start to finish**.

---

## 1. Why HTML+ES and not TSX or MDX?

Three approaches were rigorously evaluated as the project evolved:

| Approach | Verdict | Technical justification |
|---|---|---|
| **TSX (compiled)** | Replaced | It requires a prior bundling step (`Deno.bundle`/esbuild) for every new island, which stops the user from creating or hot-adding islands straight in the browser. |
| **MDX in the browser** | Discarded | It requires loading the full `@mdx-js` compiler (~3MB to 5MB) at runtime on the client and using unsafe `new Function` / `eval`, which breaks CSP and hurts mobile. |
| **JSX without a build** | Discarded | Browsers throw `SyntaxError: Unexpected token '<'`. It would require a heavy transpiler (Babel/Sucrase, ~800KB) on the client. |
| **HTML+ES (`htm/preact`)** | **EXCLUSIVELY ADOPTED** | The official Preact pattern. It uses native ES6 *tagged template literals* (`html\`...\``). It weighs only **~600 bytes**, runs natively in any browser with no build, supports asynchronous on-demand `import()` and respects CSP. |

---

## 2. Core principles

1. **Only islands are hydrated:** the rest of the documentation (headings, paragraphs, tables, quotes) is materialized as purely static HTML nodes. Preact does not spend cycles reconciling what never changes.
2. **Zero bundle for new islands:** islands can be written as plain `.js` files in `public/islands/` and loaded asynchronously by the browser through `import("./islands/Name.js")`.
3. **No closures in the Wire:** the Wire Format is pure JSON. An island is only a node `{ t: "i", n: "Name", p: { props }, c: [ staticChildren ] }`.
4. **Service Worker isolation:** the Service Worker **never** imports Preact or UI components. It only handles the literal island names (`manifest.ts`).
5. **Failure resilience:** if an island can be neither resolved nor downloaded, the pre-rendered static fallback content stays visible and functional, with no blank screen and no exceptions.

---

## 3. Separation of concerns: manifest vs registry

To keep the Service Worker from inflating with UI and DOM dependencies:

```
                  ┌──────────────────────────────────────────────┐
                  │    src/render/islands/manifest.ts            │
                  │    export const islandNames = [...] as const;│
                  └──────────────────────┬───────────────────────┘
                                         │
                  ┌──────────────────────┴───────────────────────┐
                  ▼                                              ▼
   [ Service Worker / Core ]                         [ Client browser (HTML+ES) ]
   - Reads names only (strings)                     - Loads pre-registered islands
   - Tags nodes with t: "i"                         - Or runs a dynamic import() (.js)
   - ZERO Preact dependencies                      - Hydrates selectively through the DOM
```

---

## 4. How selective hydration works (`hydrateIslands`)

### 4.1 Emitting the HTML markers
While `wireToVNode()` runs, nodes with `t: "i"` produce container elements carrying data attributes:

```html
<!-- When the island is registered or has a fallback: -->
<div data-island="Counter" data-props='{"start": 10}'>
  <!-- Static children rendered initially -->
</div>
```

### 4.2 The hydration algorithm with dynamic support
`hydrateIslands(registry, opts)` scans the DOM looking for `[data-island]` elements. When an island is absent from the pre-loaded registry, it tries to import it on demand as an ES module (`./islands/${name}.js`):

```ts
export function hydrateIslands(registry: Record<string, ComponentType<any>>, opts: HydrateOptions = {}): number {
  const root = opts.root ?? document.body;
  const nodes = root.querySelectorAll<HTMLElement>("[data-island]");
  let hydrated = 0;

  for (const el of nodes) {
    if (el.dataset.islandHydrated === "true") continue;
    const name = el.dataset.island;
    if (!name) continue;

    const Comp = registry[name];
    if (!Comp) {
      // Native browser dynamic import for a standalone HTML+ES island:
      import(`./islands/${name}.js`)
        .then((mod) => {
          const dynamicComp = mod[name] || mod.default;
          if (dynamicComp) {
            registry[name] = dynamicComp;
            const props = JSON.parse(el.dataset.props || "{}");
            el.dataset.islandHydrated = "true";
            hydrate(h(dynamicComp, props), el);
          }
        })
        .catch(() => {
          el.dataset.islandMissing = "true";
        });
      continue;
    }

    let props = {};
    try {
      props = JSON.parse(el.dataset.props || "{}");
    } catch {}

    el.dataset.islandHydrated = "true";
    try {
      hydrate(h(Comp, props), el);
      hydrated++;
    } catch (e) {
      console.error(`[islands] Failed to hydrate ${name}:`, e);
    }
  }

  return hydrated;
}
```

---

## 5. How to create a new island in HTML+ES format

With the HTML+ES solution you can create a new island without rebuilding the project!

### Example: `public/islands/MyWidget.js`

```javascript
import { html } from "htm/preact";
import { signal } from "@preact/signals";

export function MyWidget({ title = "My Dynamic Widget" }) {
  const active = signal(false);

  return html`
    <article class="border round padding surface-container bottom-margin">
      <div class="row wrap">
        <h6 class="max wrap bold no-margin">${title}</h6>
        <button
          class="chip ${active.value ? 'primary' : 'surface-variant'}"
          onClick=${() => (active.value = !active.value)}
        >
          ${active.value ? "On" : "Off"}
        </button>
      </div>
    </article>
  `;
}

export default MyWidget;
```

### Using it in Markdown
Just reference the island in any `.md` file:

```markdown
::MyWidget{title: "Demo Without a Rebuild"}
```

Or in a code block:

````markdown
```island:MyWidget
{
  "title": "Block Demo"
}
```
````

Opening the document in the browser makes the client detect the island, import
`public/islands/MyWidget.js` natively over the network/cache and turn the
reactivity on instantly!

`````

---

## File: `docs/publish-jsr-rules.md`

````md
# 📘 mdBlog: Complete Guide, Installation & JSR Publishing

> A comprehensive and practical guide for setting up, configuring, using, and publishing **mdBlog** (`@vanaware/mdblog`).

---

## 1. What is mdBlog?

**mdBlog** is a modern documentation and blog engine designed around three core principles:
1. **Offline-First via Service Worker:** Intercepts documentation markdown files, transpires them in background, and caches AST representations in CacheStorage and IndexedDB.
2. **Wire Format Intermediate Representation (IR):** Markdown is transformed into an XSS-safe JSON tree (`WireDoc`) instead of raw HTML strings. The client materializes these nodes using Preact virtual DOM without ever resorting to `dangerouslySetInnerHTML`.
3. **Zero-Bundle Dynamic Islands:** Interactive widgets are written in plain ES Modules using `htm/preact` (HTML+ES) and loaded on demand by the browser (`import("./islands/MyWidget.js")`). No build or compile step is required to add or edit widgets.

---

## 2. Installation & Setup

### Option A: Install via JSR in a Deno Project

Add `@vanaware/mdblog` to your workspace:

```bash
deno add jsr:@vanaware/mdblog
```

Or when developing with npm / pnpm:

```bash
npx jsr add @vanaware/mdblog
```

### Option B: Clone & Run Standalone PWA

To run the complete pre-configured blog PWA locally:

```bash
git clone https://github.com/vanaware/mdBlog.git
cd mdBlog

# Start the dev server on port 3000
deno task dev
```

Visit `http://localhost:3000` in your browser.

---

## 3. How to Use mdBlog

### A. Folder Structure

A typical mdBlog deployment contains:

```
public/
├── index.html          # SPA bootstrap and mount point (<div id="app"></div>)
├── manifest.json       # Progressive Web App manifest
├── sw.js               # Service Worker caching and fetch handler
├── mdblog.js           # Bundled mdBlog runtime library
├── articles/           # Markdown articles
│   ├── index.md        # Root page declaring navigation in frontmatter
│   ├── getting-started.md
│   └── guides.md
└── islands/            # Dynamic HTML+ES interactive components
    ├── Counter.js
    └── MyWidget.js
```

### B. Organizing Articles & Frontmatter Navigation

Articles are discovered dynamically in the browser starting from `public/articles/index.md`. Use YAML frontmatter to define titles, icons, dates, and recursive navigation sub-pages:

```markdown
---
title: "Project Documentation"
author: "Vanaware"
date: "2026-10-10"
pages:
  - path: "README.md"
    title: "Overview"
    icon: "article"
  - path: "guide.md"
    title: "Hands-on Guide"
    icon: "science"
  - path: "advanced.md"
    title: "Advanced"
    icon: "tune"
---

# Welcome to mdBlog

This is the initial document. The side menu is generated automatically from the list above!
```

Child pages can also declare their own nested `pages:` in frontmatter, enabling arbitrarily deep hierarchical tree navigation without any build-time index files.

### C. Creating Interactive Dynamic Islands

Islands run natively in the browser without any bundler. Place a JavaScript file in `public/islands/`:

```javascript
// public/islands/LiveCounter.js
import { html, useSignal } from "../mdblog.js";

export function LiveCounter({ start = 0, step = 1 }) {
  const count = useSignal(Number(start));

  return html`
    <article class="border round padding surface-container margin">
      <div class="row wrap">
        <h6 class="max wrap">Counter: ${count.value}</h6>
        <div class="row">
          <button class="circle small" onClick=${() => count.value -= Number(step)}>
            <i>remove</i>
          </button>
          <button class="circle small primary" onClick=${() => count.value += Number(step)}>
            <i>add</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default LiveCounter;
```

Embed the island anywhere in Markdown:

```markdown
<!-- Directive Syntax -->
::LiveCounter.js{start: 10, step: 2}

<!-- Code Block Syntax -->
```island:LiveCounter.js
{ "start": 100, "step": 10 }
```
```

---

## 4. Programmatic API Usage

You can also use `@vanaware/mdblog` as a headless library in workers or client scripts:

```typescript
import {
  parseMarkdown,
  mdastToWire,
  processMarkdown,
  wireToVNode,
  createBrowserIO,
  loadDoc,
} from "@vanaware/mdblog";

// 1. Convert Markdown to Wire AST JSON
const doc = processMarkdown("# Hello World\n\nContent", "/articles/hello.md");

// 2. Fetch and cache with TTL
const io = createBrowserIO({ cacheName: "docs-v1" });
const cachedDoc = await loadDoc("/articles/hello.md", io, { cacheTTLSeconds: 300 });

// 3. Render directly with Preact
const vnodes = wireToVNode(cachedDoc.wire);
```

---

## 5. JSR Publishing Standards & Rules

Before publishing `@vanaware/mdblog` to JSR, the codebase must pass all automated quality gates.

### Rule 1: Zero Node.js Dependencies
- The code must be pure Deno.
- Use only `jsr:` and `npm:` specifiers resolved natively by Deno.
- Never use local `node_modules` or Node.js runtime globals (`process`, `Buffer`).

### Rule 2: Complete JSDoc Documentation
Every public exported symbol in `src/mod.ts` must have a valid JSDoc comment in English:
- `@description`: Purpose of the symbol.
- `@param`: Parameter name and purpose.
- `@returns`: Return value explanation.
- `@example`: Clear, runnable usage snippet.

### Rule 3: Automated Doc Linter (`deno doc --lint`)
Before release, verify zero documentation warnings:

```bash
deno task --cwd packages/mdblog lint:doc
```

This ensures fast-type compliance and prevents undocumented or private type reference leaks.

### Rule 4: Automated CI/CD Workflow
Publication is automated via `.github/workflows/jsr-publish.yml` upon pushing a git tag (`v*.*.*`):
1. Runs full test suite: `deno task test`.
2. Verifies formatting and linting: `deno fmt --check` and `deno lint`.
3. Checks documentation: `deno task --cwd packages/mdblog lint:doc`.
4. Sanitizes package version: `deno task sanitize-version ./packages/mdblog/deno.jsonc`.
5. Publishes to JSR: `deno publish`.

---

## 6. Pre-Publish Checklist

Before pushing or tagging a release:

- [x] All unit tests pass: `deno task test`
- [x] Document linter passes with zero warnings: `deno task --cwd packages/mdblog lint:doc`
- [x] Bundle compiles with zero errors: `deno task esbuild noversion`
- [x] README files updated (`/README.md` and `/packages/mdblog/README.md`)
- [x] SemVer version bumped in `deno.jsonc` and `packages/mdblog/deno.jsonc`

````

---

## File: `docs/syntax-and-islands.md`

````md
# ✍️ Syntax and Dynamic Islands Guide for mdBlog

This guide details the whole syntax supported by **mdBlog**, covering the
**CommonMark** specification, the **GitHub Flavored Markdown (GFM)** extensions,
the **Frontmatter** options and the **Dynamic Islands (HTML+ES)** architecture.

---

## 1. Base Markdown syntax (CommonMark)

mdBlog supports every standard CommonMark markup:

### Headings
```markdown
# Heading 1 (becomes the document title when it is the first one)
## Heading 2 (generates an automatic anchor and a direct link)
### Heading 3
#### Heading 4
```

### Text formatting
```markdown
*Italic text* or _italic_
**Bold text** or __bold__
`inline code`
```

### Links and images
```markdown
[Internal link to an article](guide.md)
[External link](https://deno.com)
![Image alternative text](./icon.svg "Image title")
```

### Lists and quotes
```markdown
- Bulleted list
  - Indented sub-item
- Another item

1. Numbered list
2. Second item

> Quote block styled with a BeerCSS border
```

### Code blocks
```markdown
```typescript
function hello(name: string): string {
  return `Hello, ${name}!`;
}
```
```
Code blocks include a native copy-to-clipboard button (`clipboard`) with visual
feedback.

---

## 2. GFM extensions (GitHub Flavored Markdown)

The parser integrates the full set of GFM extensions:

### Tables
```markdown
| Feature | Supported? | Notes |
|:---|:---:|---:|
| Tables | ✅ Yes | Configurable alignment |
| Checklists | ✅ Yes | Disabled checkboxes |
| Strikethrough | ✅ Yes | `~~struck-through text~~` |
```

### Task lists
```markdown
- [x] Task completed with a checked checkbox
- [ ] Pending task
```

### Strikethrough
```markdown
~~This text was removed or corrected~~
```

---

## 3. YAML frontmatter

At the beginning of any `.md` file you can include YAML metadata delimited by
`---`:

```yaml
---
title: "Custom Page Title"
author: "Vanaware"
date: "2026-10-10"
icon: "auto_stories"       # Material Symbols icon name
badge: "New"               # Visual chip shown on the cards
tags:
  - "tutorial"
  - "deno"
pages:                     # Recursive navigation to sub-pages
  - path: "sub-article-1.md"
    title: "Part 1"
    icon: "filter_1"
  - path: "sub-article-2.md"
    title: "Part 2"
    icon: "filter_2"
---
```

### Supported properties

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Article title (replaces the first `# H1` when defined) |
| `author` | `string` | Author name shown in the metadata |
| `date` | `string` | Publication or revision date |
| `icon` | `string` | Google Material Symbols icon name |
| `badge` | `string` | Highlight label/visual chip |
| `tags` | `string[]` | List of keywords for search |
| `pages` | `Array` | Recursive list of child sub-pages |

---

## 4. Dynamic Islands (HTML+ES — Zero Bundle)

Dynamic islands let you embed reactive interactive components without
recompiling the library.

### Where do the files live?
Exclusively in the `public/islands/` folder.

### How do I write an island?
Write a standard ES JavaScript module using `htm/preact` imported from
`../mdblog.js`:

```javascript
// public/islands/DemoCounter.js
import { html, useSignal } from "../mdblog.js";

export function DemoCounter({ start = 0, step = 1, label = "Counter" }) {
  const count = useSignal(Number(start));

  return html`
    <article class="border round padding surface-container margin">
      <div class="row wrap">
        <div class="max wrap">
          <h6 class="no-margin bold small wrap">${label}</h6>
          <span class="small-text secondary-text wrap">Native dynamic island</span>
        </div>
        <div class="row">
          <button class="circle small surface-variant" onClick=${() => count.value -= Number(step)}>
            <i>remove</i>
          </button>
          <span class="chip primary bold">${count.value}</span>
          <button class="circle small primary" onClick=${() => count.value += Number(step)}>
            <i>add</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default DemoCounter;
```

### How do I insert the island into Markdown?

#### Option A: Directive syntax (recommended)
```markdown
::DemoCounter.js{start: 20, step: 5, label: "My Counter"}
```

#### Option B: Code block syntax
```markdown
```island:DemoCounter.js
{
  "start": 50,
  "step": 10,
  "label": "Block Counter"
}
```
```

### Island execution cycle
1. The transformer (`to-wire.ts`) emits a `WireIsland` node:
   ```json
   { "t": "i", "n": "DemoCounter.js", "p": { "start": 20, "step": 5 } }
   ```
2. The Preact renderer creates a marker static HTML element:
   ```html
   <div data-island="DemoCounter.js" data-props='{"start":20,"step":5}'></div>
   ```
3. The `hydrateIslands()` routine performs the native
   `import("./islands/DemoCounter.js")` in the browser and hydrates the
   component on demand!

````

---

## File: `docs/wire-format.md`

````md
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

````

---

