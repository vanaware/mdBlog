> **AI INSTRUCTION:** 
> The text below contains the main SOURCE CODE files of the example application (example).
> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).
> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.

---

# Exported Context from Project mdBlog [v0.2.3#mvmwaqyg] - Mode: EXAMPLE

Automatically generated at: 2026-10-24T21:39:28.496Z

---

## File: `packages/mdblog/public/articles/development-plan.md`

`````md
---
title: "⚙️ mdBlog architecture and features"
icon: "settings"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "architecture"
  - "features"
  - "islands"
description: "Complete guide to the essential features of mdBlog: frontmatter, sub-pages, islands and PWA."
location: "#/articles/development-plan.md"
pages:
  - "migration-html-es.md"
---

# ⚙️ mdBlog architecture and features

This document details how **mdBlog** works technically, showing how **frontmatter
metadata**, **recursive sub-pages**, **reactive islands** and **offline storage**
operate together in the browser.

---

## 📑 Metadata through frontmatter

Frontmatter in mdBlog is read by a built-in YAML parser and supports scalars,
lists, dates and presentation metadata.

### Full field structure

```yaml
---
title: "Main Article Title"
icon: "article"              # Material Symbols icon shown in the navigation
date: "2026-10-10"           # Publication or revision date
author: "Author Name"        # Shown in the article header
description: "Short summary" # Used as description and meta tag
tags:
  - "tutorial"
  - "frontend"
pages:
  - "subpage-example.md"      # Sub-pages belonging to this article
---
```

When an article loads, this metadata feeds the interface components:

- **Navbar & Sidebar:** show the title and its matching icon.
- **Reader header (`Content`):** render the title, publication date and author in harmony with the BeerCSS design.
- **Breadcrumbs:** show the hierarchical path up to the current page.

---

## 🌳 Sub-pages and hierarchical navigation

mdBlog uses a **dynamic discovery** model in which the site structure is built by
belonging:

1. **Home page (`index.md`):** the documentation entry point; it lists the main sections or pages in its frontmatter.
2. **Child pages:** every listed page may declare its own articles in the `pages:` property.
3. **Recursive sub-pages:** nesting can reach several levels of depth. The router discovers the nodes dynamically as it navigates or indexes the articles.
4. **Sidebar navigation:** sub-pages get a clean visual indent in the side menu and are listed at the end of the parent article as quick-navigation cards.

---

## 🏝 Interactive islands

An island is a Preact component isolated inside the static Markdown document: it
receives props and keeps its own reactive state.

### Example 1: directive syntax

```markdown
::Counter.js{start: 10, step: 2, label: "Quick Counter"}
```

### Example 2: code block syntax

````markdown
```island:Counter.js
{
  "start": 50,
  "step": 10,
  "label": "Batched Counter"
}
```
````

### How an island is hydrated:

1. The transformer turns the Markdown declaration into a `{ t: "i", n: "Counter.js", p: { ... } }` node.
2. Preact renders a `<div data-island="Counter.js" data-props="..."></div>` container.
3. The `hydrateIslands()` routine loads the `./islands/Counter.js` module natively in the browser and mounts the component into the target element.

---

## 🛡️ Security and offline execution

- **No raw HTML injection:** HTML tags typed in the Markdown are discarded to protect the user from XSS vulnerabilities.
- **Service Worker and CacheStorage:** `sw.js` intercepts the `.md` read requests, turns Markdown into AST in the background and stores the responses in the `md-wire-v1` cache.
- **IndexedDB:** the client uses `idb-keyval` for durable storage in the browser, so reading works completely even with no network connection.

---

## 📖 Sub-pages

- **[⚡ Developing in HTML+ES](./migration-html-es.md)**: How to write islands and components with no prior compilation, using ES modules and `htm/preact`.

`````

---

## File: `packages/mdblog/public/articles/flows.md`

```md
---
title: "🔄 Flows and lifecycle"
icon: "sync"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "pwa"
  - "service-worker"
  - "cache"
  - "spa"
description: "Lifecycle, shell first paint and client-side SPA navigation in mdBlog."
location: "#/articles/flows.md"
---

# 🔄 Navigation flows and lifecycle

This document details how mdBlog behaves at each moment of execution: the first
load in the browser, internal SPA navigation, offline operation and the resilient
fallback.

---

## ⚡ Flow 1: direct navigation and first paint

Happens when the user opens a URL directly in the browser or reloads the page (F5):

1. **Service Worker interception:** the Service Worker picks up the request carrying `Accept: text/html`.
2. **CacheStorage lookup:** it checks whether the document already lives in `md-wire-v1`. On a valid cache hit it reuses the existing AST.
3. **Background transformation:** with no cache, or an expired one, it fetches the raw `.md`, builds the Wire Format tree and caches it.
4. **Complete HTML shell:** the Service Worker answers with an HTML that carries BeerCSS and the Wire tree embedded in `<script id="__md_wire">`.
5. **Immediate rendering:** the client bundle consumes the inline tag, mounts the Preact VNodes instantly and triggers island hydration with no extra network requests.

---

## 🚀 Flow 2: SPA navigation (moving between articles)

Happens when the user clicks an internal link or the hash route changes:

1. **Router trigger:** the click updates the reactive signal `currentPath.value`.
2. **Data request:** the reader sends a request asking for `Accept: application/json`.
3. **Optimized response:** the Service Worker (or the local fallback) delivers only the destination article's `WireDoc` JSON tree.
4. **DOM reconciliation:** Preact updates the reader smoothly, with no screen flicker and no full page reload.
5. **Hydration of the new islands:** only the freshly created `[data-island]` elements are activated.

---

## 🛡️ Flow 3: fallback without a Service Worker (pure client-side)

Happens in restricted environments, private browsing, or before the Service Worker activates:

1. **Automatic detection:** `isSWControlling()` finds that no Service Worker is in control.
2. **Local pipeline activation:** the client-side adapter runs the very same parsing pipeline directly on the browser thread.
3. **Cache persistence:** the processed tree is written to CacheStorage and IndexedDB for later use.
4. **Identical experience:** for the end user navigation works transparently, with no visual degradation.

---

## 💾 Cache and offline storage strategy

- **CacheStorage (`md-wire-v1`):** stores the processed documents with a configurable TTL (60 seconds by default).
- **IndexedDB (`idb-keyval`):** keeps articles durably even when the temporary cache data is evicted.
- **Loop prevention:** internal requests for `.md` files carry control parameters so the Service Worker never re-intercepts its own fetches.

```

---

## File: `packages/mdblog/public/articles/guide.md`

````md
---
title: "🧪 Hands-on Guide & Reactive Islands"
icon: "science"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "guide"
  - "islands"
  - "signals"
description: "Hands-on guide with a live demo of reactive HTML+ES islands, sub-pages and frontmatter."
location: "#/articles/guide.md"
pages:
  - "islands.md"
---

# 🧪 Hands-on Guide and Feature Demo

Welcome to the live demonstration of the **mdBlog** architecture!

This document is read by the Markdown parser, turned into serializable JSON nodes
(_Wire Format AST_) and materialized by Preact in the browser with a responsive
BeerCSS layout.

---

## ⚡ Interactive island demo (the HTML+ES solution)

Below is a reactive island built with **HTML+ES (`htm/preact` + ES Modules)**,
running directly in the browser with no prior compilation:

::Counter.js{start: 10, step: 1, label: "Reactive Interactive Counter"}

### Second island with a code block

You can also instantiate islands by declaring parameters as structured JSON
inside code blocks:

```island:Counter.js
{
  "start": 100,
  "step": 5,
  "label": "Batched Counter (+5)"
}
```

Each island instance manages its own reactive state through `@preact/signals`.
Clicking the buttons of one island does not interfere with the values of the
other islands on the same page.

---

## 🧭 Frontmatter and sub-page configuration

Every document in mdBlog starts with a YAML metadata block:

```yaml
---
title: "Article Title"
icon: "science"             # Material Symbols icon
date: "2026-10-10"
author: "Docs Team"
pages:
  - "islands.md"    # Sub-pages reachable from here
---
```

By declaring `pages:`, mdBlog builds the breadcrumb trail at the top
automatically and offers quick navigation links to the sub-pages at the end of
the reading.

---

## 📊 Formatted tables (GFM)

The Wire Format converts Markdown tables into Preact components with a responsive
BeerCSS layout:

| Feature         | Traditional (Docsify)      | Wire Format (mdBlog)                    |
| --------------- | -------------------------- | --------------------------------------- |
| HTML injection  | `dangerouslySetInnerHTML`  | Pure, typed Preact VNodes               |
| SW interception | Not native                 | Turns `.md` into AST in the background  |
| Interactivity   | Loose scripts in the DOM   | Preact Islands with `@preact/signals`   |
| XSS protection  | Complex without sanitizers | Immune by AST architecture              |
| Offline support | Basic                      | CacheStorage + IndexedDB (`idb-keyval`) |

---

## 💻 Code blocks with a copy button

You can easily copy a snippet by clicking the button in the top right corner:

```typescript
import { mdFetch, } from "./src/plugin/adapters/client.ts";
import { createBrowserIO, } from "./src/plugin/core/io.ts";

const io = createBrowserIO();
const doc = await mdFetch("./articles/guide.md", io,);

console.log("Document title:", doc.title,);
console.log("Wire Format nodes:", doc.wire.c?.length,);
```

---

## 📖 Sub-pages of this section

- **[🏝️ Advanced Islands Guide](./islands.md)**: Technical detail of the hydration algorithm and the island lifecycle.

````

---

## File: `packages/mdblog/public/articles/index.md`

````md
---
title: "mdBlog - Blog & Static Documentation"
description: "Modern static documentation engine built on Deno, Preact Signals, BeerCSS and HTML+ES Islands."
date: "2026-10-09"
author: "SyntaxMesh Team"
location: "#/articles/index.md"
tags:
  - "Deno"
  - "PWA"
  - "Preact"
  - "BeerCSS"
  - "Islands"
pages:
  - "overview.md"
  - "guide.md"
  - "development-plan.md"
---

# 📖 mdBlog — Home Page

Welcome to **mdBlog**, a modern static blog and documentation generator built with
**Deno, Preact Signals, BeerCSS and a Wire Format AST**.

This main page is loaded from the **`index.md`** file. The menu and breadcrumb
structure is assembled automatically from the file list declared in the `pages:`
frontmatter, while titles, icons, dates and tags are extracted dynamically from
each individual article.

---

## ⚡ Reactive Demo (Interactive Island)

Below is a Preact island hydrated dynamically through an HTML+ES module:

::Counter.js{start: 42, step: 1, label: "Interactive Counter on the Home Page"}

### Second Island Instance Through a Code Block

You can also instantiate islands by providing structured JSON data:

```island:Counter.js
{
  "start": 100,
  "step": 5,
  "label": "Batched Counter (+5)"
}
```

---

## 🚀 Featured Articles

Browse the guides and technical documentation available:

- **[📚 mdBlog Overview](./overview.md)**: Learn about the motivation, the data pipeline and the security principles.
- **[🧪 Hands-on Guide & Island Demo](./guide.md)**: See interactive components (_islands_) running in real time.
- **[⚙️ Architecture & Features](./development-plan.md)**: Understand how the frontmatter, recursive sub-pages and the PWA work.
- **[⚡ Developing in HTML+ES (.js)](./migration-html-es.md)**: Learn to create new islands in native `.js` files with no build step.
- **[📐 Wire Format AST Specification](./wire-format.md)**: A serializable JSON contract that is immune to XSS.
- **[🏝️ Islands Guide](./islands.md)**: Manual on-demand client-side selective hydration.
- **[🔄 Navigation Flows and PWA Cache](./flows.md)**: Service Worker and IndexedDB (`idb-keyval`) strategies.

---

## 🌳 Hierarchical Structure and Sub-pages

mdBlog supports **nested recursive sub-pages** discovered straight from the
frontmatter:

1. **Root page (`index.md`)**: declares the main sections in the `pages:` list.
2. **Main pages**: each page (e.g. `overview.md`) may carry its own `pages:` list of sub-pages (e.g. `wire-format.md`).
3. **Sub-sub-pages**: a sub-page can also declare `pages:` (e.g. `wire-schema.md`), allowing several levels of depth.
4. **Sidebar and drawer navigation**: sub-pages show up cleanly indented in the side menu, and the breadcrumb trail at the top follows them.

---

## 🛠 How to Publish New Articles or Sub-pages

1. Add a new `.md` file to the `public/articles/` folder (e.g. `public/articles/my-article.md`) with its own frontmatter block (`title`, `icon`, `date`, `tags`, etc.).
2. Add the file name to the `pages:` list of the parent page where you want it to appear.
3. The browser discovers the hierarchy at runtime and updates the Navbar, Sidebar and breadcrumbs automatically, with no recompilation.

````

---

## File: `packages/mdblog/public/articles/islands.md`

`````md
---
title: "🏝️ Islands guide"
icon: "widgets"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "islands"
  - "preact"
  - "signals"
  - "hydration"
description: "Complete guide to the interactive island architecture of mdBlog with HTML+ES and Preact Signals."
location: "#/articles/islands.md"
---

# 🏝 Islands in mdBlog

The **Islands** model (Interactivity Islands) in mdBlog lets you place reactive,
dynamic components inside essentially static Markdown documents without
overloading the page with unnecessary JavaScript.

---

## 🎯 Core principles

1. **Selective and idempotent hydration:**
   Only the elements marked with `[data-island]` are hydrated. Everything else (headings, paragraphs, lists) stays purely static.

2. **Zero prior compilation:**
   Islands live as plain `.js` files in `public/islands/` and are loaded on demand by the browser through the native asynchronous `import()`.

3. **A framework-agnostic, safe Wire Format:**
   In the AST an island is only safe JSON metadata: `{ t: "i", n: "Counter.js", p: { start: 10 } }`. No closure or function ever travels through the pipeline.

4. **State isolation:**
   Each island instance works autonomously with its own `@preact/signals`.

---

## 💻 Syntaxes supported in Markdown

### 1. Directive syntax

Ideal for simple components and literal values on a single line:

```markdown
::Counter.js{start: 25, step: 5, label: "My Counter"}
```

### 2. Code block syntax

Ideal for objects with several properties or structured JSON data:

````markdown
```island:Counter.js
{
  "start": 50,
  "step": 10,
  "label": "Batched Counter"
}
```
````

---

## 🔬 How the hydration cycle works

1. **Markers generated in the DOM:**
   When `wireToVNode()` handles an island node (`t: "i"`), it emits a container with data attributes:
   ```html
   <div data-island="Counter.js" data-props='{"start": 10, "step": 1}'></div>
   ```

2. **Sweep by `hydrateIslands()`:**
   After the reader renders, `hydrateIslands()` finds every `[data-island]` element not initialized yet.

3. **Dynamic import:**
   The browser imports the `./islands/Counter.js` module on demand and mounts the Preact component straight into the container, with the props deserialized from `data-props`.

4. **In-memory cache:**
   Once loaded, the component is kept in the in-memory island cache (`dynamicIslandsCache`), so future navigations mount it instantly.

`````

---

## File: `packages/mdblog/public/articles/migration-html-es.md`

`````md
---
title: "⚡ Developing in HTML+ES (.js)"
icon: "code"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "htm/preact"
  - "zero-bundle"
  - "es-modules"
  - "islands"
description: "Hands-on development guide with HTML+ES (.js), Preact Signals and native browser islands."
location: "#/articles/migration-html-es.md"
---

# ⚡ Developing in HTML+ES (.js)

The **HTML+ES** pattern combines the power of **`htm/preact`** with standard
JavaScript modules (**ES Modules** in **`.js`** files). It lets you create
interface components and dynamic islands that run directly in a modern browser
with no compilation step and no runtime transpiler.

---

## 🎯 Why HTML+ES?

1. **Standard, valid JavaScript:**
   It uses native _tagged template literals_ (`html\`<article>...\`\``). No JSX compiler and no Babel required.

2. **The canonical `.js` extension:**
   `.js` files are imported natively by the browser through `<script type="module">` or `import()`.

3. **Lightweight reactivity:**
   It uses `@preact/signals` for pinpoint, high-performance reactivity that updates only the DOM nodes it needs.

4. **Zero prior compilation for new islands:**
   Create a `.js` file in the `public/islands/` folder and call it from the Markdown. The browser loads it on demand.

---

## 🛠 How to create a new island in 3 steps

### Step 1: create the file in `public/islands/`

Create a new JavaScript file, for instance `public/islands/TimerWidget.js`:

```javascript
import {
  html as _html,
  signal as _signal,
  useSignal as _useSignal,
} from "../mdblog.js";

const html = _html || globalThis.mdBlog?.html;
const signal = _signal || globalThis.mdBlog?.signal;
const useSignal = _useSignal || globalThis.mdBlog?.useSignal;

export function TimerWidget({ initialSeconds = 0, label = "Stopwatch", },) {
  const seconds = typeof useSignal === "function"
    ? useSignal(Number(initialSeconds,),)
    : signal(Number(initialSeconds,),);

  return html`
    <article class="border round padding surface-container-low margin">
      <div class="row wrap">
        <div class="max wrap">
          <h6 class="no-margin bold small wrap">${label}</h6>
          <p class="small-text secondary-text no-margin wrap">
            Time: ${seconds.value}s
          </p>
        </div>
        <div class="row">
          <button
            class="circle small primary"
            onClick=${() => seconds.value++}
            aria-label="Increase the time"
          >
            <i>add</i>
          </button>
          <button
            class="circle small transparent"
            onClick=${() => (seconds.value = Number(initialSeconds,))}
            aria-label="Reset the time"
          >
            <i>restart_alt</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default TimerWidget;
```

### Step 2: use it in the Markdown

You can call your island with the directive syntax:

```markdown
::TimerWidget.js{initialSeconds: 0, label: "Test Timer"}
```

Or with the typed code block:

````markdown
```island:TimerWidget.js
{
  "initialSeconds": 60,
  "label": "Countdown"
}
```
````

### Step 3: automatic rendering

mdBlog detects the island in the document, reserves its slot in the Wire Format
and hydrates it in isolation, without affecting the rest of the static page.

`````

---

## File: `packages/mdblog/public/articles/overview.md`

`````md
---
title: "📚 mdBlog Overview"
icon: "article"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "overview"
  - "architecture"
  - "islands"
description: "Overview and usage guide of mdBlog with Preact Signals, BeerCSS and Islands."
location: "#/articles/overview.md"
pages:
  - "wire-format.md"
  - "flows.md"
---

# 📚 mdBlog Overview

**mdBlog** is a modern static documentation and blog engine inspired by the
simplicity of Docsify, but rebuilt around a high-performance architecture with
strict security and support for interactive components.

Unlike traditional generators that rely on unsafe HTML injection
(`dangerouslySetInnerHTML`), mdBlog turns Markdown files into a JSON-serializable
tree of nodes called the **Wire Format AST**. Preact materializes that tree in the
browser as native elements and components that are safe against XSS attacks.

---

## ✨ Key Features

1. **Dynamic discovery through frontmatter:**
   There are no static indexes or build-time route files. The navigation structure, breadcrumbs and menus are assembled by reading the `pages:` declarations in each article's YAML metadata.

2. **Reactive HTML+ES islands (zero compilation):**
   Add interactive components to your Markdown as plain `.js` files in `public/islands/`. They run straight in the browser using `htm/preact` and `@preact/signals`, with no runtime compiler or transpiler.

3. **XSS-immune Wire Format architecture:**
   Markdown is never converted into raw HTML strings. All content is structured into typed, sanitized nodes rendered by Preact.

4. **Offline PWA operation with a Service Worker:**
   The Service Worker intercepts `.md` article reads, processes the Wire Format in the background and keeps cached copies (`CacheStorage` and IndexedDB through `idb-keyval`).

5. **Material Design 3 interface with BeerCSS:**
   Fluid layout, balanced typography, light/dark theme support and responsive navigation on mobile and desktop.

---

## 🧭 Organizing articles and sub-pages

To build a hierarchical documentation structure, use the `pages:` field in the
parent article's frontmatter.

### Frontmatter configuration example

```yaml
---
title: "My Main Article"
icon: "book"
date: "2026-10-10"
author: "Engineering Team"
tags:
  - "docs"
  - "tutorial"
pages:
  - "subpage-1.md"
  - "subpage-2.md"
---
```

Each sub-page listed in `pages:` may in turn carry its own frontmatter and
declare its own sub-pages, intuitively producing documentation trees with
several levels of depth.

---

## ⚡ How to use interactive islands

mdBlog supports two expressive ways of including interactive islands in Markdown:

### 1. Directive syntax

Handy for compact islands and inline parameters:

```markdown
::Counter.js{start: 10, step: 2, label: "My Counter"}
```

### 2. Code block syntax

Ideal when the island receives batched configuration or structured JSON objects:

````markdown
```island:Counter.js
{
  "start": 100,
  "step": 5,
  "label": "Batched Counter"
}
```
````

---

## 📖 Sub-pages of this section

- **[📐 Wire Format architecture](./wire-format.md)**: Formal specification of the intermediate JSON contract and the AST node typing.
- **[🔄 Flows and lifecycle](./flows.md)**: Detailed loading cycle, Service Worker, SPA navigation and offline fallback.

`````

---

## File: `packages/mdblog/public/articles/wire-format.md`

````md
---
title: "⚙️ Wire AST Spec"
icon: "schema"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "wire-format"
  - "ast"
  - "json"
description: "Formal specification of the framework-agnostic intermediate JSON format (Wire Format)."
location: "#/articles/wire-format.md"
pages:
  - "wire-schema.md"
---

# 📐 Wire Format architecture

The **Wire Format** is the intermediate representation (IR) between the Markdown
parser and the interface renderer, keeping the mdBlog pipeline decoupled, secure
and fast.

---

## 🎯 Why use a Wire Format?

In conventional documentation generators the standard flow turns Markdown into
HTML strings and injects them into the DOM through `innerHTML`:

- **XSS vulnerability:** it demands complex sanitizers (such as DOMPurify) to try to block injected scripts.
- **Lost reactivity:** HTML strings cannot connect to reactive components without loose scripts in the DOM.
- **Redundancy:** raw HTML duplicates attributes, classes and unnecessary markup.

In mdBlog the flow is fully structured:

1. **Markdown** is parsed by the `mdast` library with its GFM extensions.
2. The resulting AST is turned into **pure Wire Format JSON**.
3. The client converts the Wire nodes straight into **typed Preact VNodes**.

Since no raw HTML is ever produced or accepted, the application is immune to XSS
attacks by architecture.

---

## 🧩 Formal node typing (TypeScript)

```typescript
export type Wire =
  | string
  | number
  | boolean
  | null
  | Wire[]
  | WireElement // Intrinsic HTML elements (strong, em, hr...)
  | WireComponent // Block components (Heading, CodeBlock, Table...)
  | WireIsland // Reactive islands ([data-island])
  | WireFragment; // Grouping fragments

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
```

---

## 🛡️ Sanitized properties (prop sanitization)

Every node property in the Wire Format goes through a sanitizing function that:

- Drops functions and references to non-serializable objects.
- Guarantees full JSON compliance.
- Lets the tree be stored safely in the Service Worker `CacheStorage` or in the browser's IndexedDB.

---

## 📖 Sub-pages

- **[📐 AST schema & node reference](./wire-schema.md)**: Specific detail on the hierarchy and the specification of each node type.

````

---

## File: `packages/mdblog/public/articles/wire-schema.md`

````md
---
title: "📐 AST schema & nodes"
icon: "account_tree"
date: "2026-10-06"
badge: "Level 3"
author: "SyntaxMesh Team"
tags:
  - "schema"
  - "ast"
  - "json-spec"
description: "Detail and formal contract of the Wire Format AST nodes (elements, components and islands)."
location: "#/articles/wire-schema.md"
---

# 📐 Detailed AST schema specification (level 3)

This is a **sub-sub-page** demonstrating the multilevel recursive sub-page support
of mdBlog:

> **index.md** (level 0 - Home) ➔ **overview.md** (level 1) ➔ **wire-format.md** (level 2) ➔ **wire-schema.md** (level 3)

---

## 🧩 The AST node contract

Every node in the Wire Format tree is strictly typed and serializable to JSON:

```typescript
export type WireNode =
  | WireElement
  | WireIsland
  | WireText;

export interface WireElement {
  type: "element";
  tag: string;
  props?: Record<string, any>;
  children?: WireNode[];
}

export interface WireIsland {
  type: "island";
  name: string;
  props?: Record<string, any>;
}

export interface WireText {
  type: "text";
  value: string;
}
```

---

## ⚡ Security principles and XSS immunity

1. **No raw HTML**: Markdown strings are never injected through `dangerouslySetInnerHTML`.
2. **Typed tokens**: the parser builds AST nodes without interpreting arbitrary browser tags.
3. **Clean serialization**: the resulting object can be saved in IndexedDB (`idb-keyval`) or handed over safely by the Service Worker.

````

---

## File: `packages/mdblog/public/icon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100"
  height="100">
  <rect width="100" height="100" rx="22" fill="#1e293b" />
  <circle cx="50" cy="50" r="34" fill="#0f172a" stroke="#38bdf8"
    stroke-width="4" />
  <path d="M35 50 Q50 30 65 50 T95 50" fill="none" stroke="#22d3ee"
    stroke-width="4" stroke-linecap="round" />
  <circle cx="50" cy="50" r="12" fill="#38bdf8" />
  <text x="50" y="86" font-size="11" font-family="system-ui, sans-serif"
    font-weight="bold" fill="#94a3b8" text-anchor="middle">DENO</text>
</svg>

```

---

## File: `packages/mdblog/public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>mdBlog</title>
    <meta name="description" content="Browser Blog engine from markdown" />
    <meta property="og:title" content="mdBlog" />
    <meta property="og:description"
      content="Browser Blog engine from markdown" />
    <meta name="theme-color" content="#6750a4" />

    <!-- Web App Manifest -->
    <link rel="manifest" href="./manifest.json" />

    <!-- Favicon SVG Inline -->
    <link rel="icon"
      href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔒</text></svg>" />

    <!-- Auto-recovery from stale Service Worker caches -->
    <script>
    (function () {
      // Unregisters every service worker, deletes every cache and reloads. The
      // sessionStorage flag keeps a permanently broken asset from looping the
      // page: the second load then reports the failure through the deadline set
      // next to the mount point below instead of reloading again.
      window.__mdbRecoverFromStaleCache = function () {
        sessionStorage.setItem("sw_recovered", "1",);
        var reload = function () {
          window.location.reload();
        };
        if (!("serviceWorker" in navigator)) return reload();
        navigator.serviceWorker.getRegistrations().then(function (regs,) {
          return Promise.all(regs.map(function (r,) {
            return r.unregister();
          },),);
        },).then(function () {
          if (!("caches" in window)) return reload();
          return caches.keys().then(function (keys,) {
            return Promise.all(keys.map(function (k,) {
              return caches.delete(k,);
            },),).then(reload,);
          },);
        },).catch(reload,);
      };

      window.addEventListener("error", function (e,) {
        if (
          e.target && (e.target.tagName === "SCRIPT" || e.target.tagName === "LINK")
        ) {
          var src = e.target.src || e.target.href;
          if (src && !sessionStorage.getItem("sw_recovered",)) {
            window.__mdbRecoverFromStaleCache();
          }
        }
      }, true,);
    })();
    </script>

    <!-- BeerCSS and Material Symbols -->
    <link
      href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css"
      rel="stylesheet" />
    <!-- The icon font ships inside beer.min.css as @font-face with
         font-display: block: every <i> glyph stays invisible until the
         stylesheet is parsed and the woff2 fetch has finished. Preloading it
         starts that fetch in parallel with the stylesheet instead of behind
         it. -->
    <link rel="preload"
      href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/material-symbols-outlined.woff2"
      as="font" type="font/woff2" crossorigin />
    <script type="module"
      src="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.js"></script>
    <script type="module"
      src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"></script>
  </head>
  <body class="auto">
    <!-- Restores the saved theme before the first paint (avoids a theme flash) -->
    <script>
    try {
      var savedTheme = localStorage.getItem("mdblog-theme",);
      if (savedTheme === "dark" || savedTheme === "light") {
        document.body.classList.remove("auto", "light", "dark",);
        document.body.classList.add(savedTheme,);
      }
      // The shipped theme-color is the brand purple of the light palette; the
      // chrome and splash should carry the background actually painted, so the
      // restored mode is mirrored into the meta before the first paint.
      var bootBg = getComputedStyle(document.body,).backgroundColor;
      var bootMeta = document.querySelector("meta[name=theme-color]",);
      if (bootBg && bootBg !== "transparent" && bootMeta) {
        bootMeta.setAttribute("content", bootBg,);
      }
    } catch (e) {}
    </script>

    <!-- mdBlog application mount point -->
    <div id="app"></div>

    <!-- Bundled mdBlog library (automatically includes the default components when there is no app.js) -->
    <script type="module" src="./mdblog.js"></script>

    <!-- A request that never answers leaves an empty #app behind: the bundle is
         fetched under the service worker, and a worker whose caches were deleted
         underneath an open tab neither resolves nor fails. Without this, the
         reader watches a page that appears to load forever; after the deadline
         the shell says what it is waiting for and offers the two ways out. -->
    <script>
    window.setTimeout(function () {
      var app = document.getElementById("app",);
      if (!app || app.childElementCount > 0) return;

      var main = document.createElement("main",);
      main.className = "responsive max padding";

      var notice = document.createElement("article",);
      notice.className = "round padding margin";

      var title = document.createElement("h6",);
      title.className = "bold no-margin";
      title.textContent = "mdBlog did not finish loading";

      var text = document.createElement("p",);
      text.className = "small-text secondary-text";
      text.textContent =
        "The page is still waiting for its own script. The copy the browser keeps usually no longer matches the site: discarding it reloads from the network.";

      var actions = document.createElement("div",);
      actions.className = "row";

      var reload = document.createElement("button",);
      reload.className = "primary small";
      reload.textContent = "Reload the page";
      reload.onclick = function () {
        window.location.reload();
      };

      var discard = document.createElement("button",);
      discard.className = "tertiary small";
      discard.textContent = "Discard the cached copy";
      discard.onclick = function () {
        window.__mdbRecoverFromStaleCache();
      };

      actions.appendChild(reload,);
      actions.appendChild(discard,);
      notice.appendChild(title,);
      notice.appendChild(text,);
      notice.appendChild(actions,);
      main.appendChild(notice,);
      app.appendChild(main,);
    }, 12000,);
    </script>
  </body>
</html>

```

---

## File: `packages/mdblog/public/islands/Counter.js`

```js
// Counter island in pure HTML+ES form (runs directly in the browser)
// Uses the utilities exported by the mdBlog bundle (no external CDN requests)
import {
  html as _html,
  signal as _signal,
  useSignal as _useSignal,
} from "../mdblog.js";

const html = _html ||
  (typeof globalThis !== "undefined" ? globalThis.mdBlog?.html : null);
const signal = _signal ||
  (typeof globalThis !== "undefined" ? globalThis.mdBlog?.signal : null);
const useSignal = _useSignal ||
  (typeof globalThis !== "undefined" ? globalThis.mdBlog?.useSignal : null);

export function Counter(
  { start = 0, step = 1, label = "Interactive Counter", },
) {
  const count = typeof useSignal === "function"
    ? useSignal(Number(start,),)
    : signal(Number(start,),);

  return html`
    <article class="border round padding surface-container-low margin">
      <!-- .row already centers its children and a .max child is the spacer that
          pushes the actions to the end: justify-between and gap-* are not part of
          the BeerCSS vocabulary. -->
      <div class="row wrap">
        <div class="max wrap">
          <h6 class="no-margin bold small wrap">${label}</h6>
          <p class="small-text secondary-text no-margin wrap">
            HTML+ES island (native run with Preact Signals from the bundle)
          </p>
        </div>
        <div class="row">
          <button
            class="circle small surface-variant"
            onClick=${() => (count.value -= Number(step,))}
            aria-label="Decrease"
          >
            <i>remove</i>
          </button>
          <span class="chip primary bold center-align">
            ${count.value}
          </span>
          <button
            class="circle small primary"
            onClick=${() => (count.value += Number(step,))}
            aria-label="Increase"
          >
            <i>add</i>
          </button>
          <button
            class="circle small transparent"
            onClick=${() => (count.value = Number(start,))}
            title="Reset"
            aria-label="Reset"
          >
            <i>refresh</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default Counter;

```

---

## File: `packages/mdblog/public/islands/DemoWidget.js`

```js
// Pure interactive HTML+ES island (runs directly in the browser, no compilation or bundling)
// Uses the utilities exported by the mdBlog bundle (no external CDN requests)
import {
  html as _html,
  signal as _signal,
  useSignal as _useSignal,
} from "../mdblog.js";

const html = _html ||
  (typeof globalThis !== "undefined" ? globalThis.mdBlog?.html : null);
const signal = _signal ||
  (typeof globalThis !== "undefined" ? globalThis.mdBlog?.signal : null);
const useSignal = _useSignal ||
  (typeof globalThis !== "undefined" ? globalThis.mdBlog?.useSignal : null);

export function DemoWidget({ title = "Dynamic HTML+ES Island", step = 1, },) {
  const count = typeof useSignal === "function" ? useSignal(0,) : signal(0,);

  return html`
    <article class="border round padding surface-container bottom-margin">
      <div class="row wrap">
        <div class="max wrap">
          <h6 class="no-margin bold small wrap">${title}</h6>
          <p class="small-text secondary-text no-margin wrap">
            Native ES module using Preact Signals from the mdBlog bundle
          </p>
        </div>
        <div class="row">
          <button
            class="circle small surface-variant"
            onClick=${() => (count.value -= Number(step,))}
            aria-label="Decrease"
          >
            <i>remove</i>
          </button>
          <span class="chip primary bold center-align">${count.value}</span>
          <button
            class="circle small primary"
            onClick=${() => (count.value += Number(step,))}
            aria-label="Increase"
          >
            <i>add</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default DemoWidget;

```

---

## File: `packages/mdblog/public/sw.js`

```js
/// <reference lib="webworker" />

/**
 * =========================================================================
 * sw.js - mdBlog default Service Worker
 * =========================================================================
 *
 * This file shows how the Service Worker uses the packaged library
 * (./mdblog.js) to provide:
 *
 * 1. 📦 Static asset cache (offline PWA):
 *    Stores index.html, the BeerCSS stylesheet and the library bundle.
 *
 * 2. ⚡ Smart documentation interception:
 *    Picks up article requests (/articles/*.md) and turns the raw Markdown
 *    into a Wire Format AST right in the background.
 *
 * 3. 🛡️ Network-first resilience:
 *    Looks for updates on the network and falls back to the local cache when offline.
 */

import mdTranspiler from "./mdblog.js";

// The build stamp is part of the name on purpose. A worker is replaced by URL
// (see registerServiceWorker), and every replacement re-runs the install below;
// naming the cache after the build it was filled by means the superseded build's
// entries are deleted by the activate step instead of piling up, and the shell
// stops being whatever the first visit happened to cache.
const CACHE_NAME = `mdblog-pwa-${mdTranspiler.version || "dev"}`;

// A request that neither resolves nor fails — the signature of a worker whose
// caches were deleted underneath an open tab — would otherwise spin the tab
// past the shell's own mount deadline, because the deadline script only runs
// once the navigation itself arrives. The network therefore has to answer
// within this window for the deadline to exist at all.
const NETWORK_DEADLINE_MS = 6000;

// List of assets essential to offline operation
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./mdblog.js",
  "./islands/Counter.js",
  "./islands/DemoWidget.js",
];

// In-memory and Service Worker cache I/O layer
const io = mdTranspiler.createBrowserIO({
  cacheName: "md-wire-v1",
  useIndexedDB: false,
},);

// Starts the article request interceptor using the packaged library
const handleDocFetch = mdTranspiler.createSWFetchHandler(io, {
  basePath: "./articles",
  cacheTTLSeconds: 60,
  bundlePath: "./mdblog.js",
},);

// Install: pre-loads the assets into the cache
self.addEventListener("install", (event,) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME,)
      .then((cache,) => cache.addAll(STATIC_ASSETS,))
      .then(() => self.skipWaiting()),
  );
},);

// Activation: clears outdated cache versions
self.addEventListener("activate", (event,) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys,) =>
        Promise.all(
          keys.map((key,) => {
            if (key !== CACHE_NAME && !key.startsWith("md-wire-",)) {
              return caches.delete(key,);
            }
          },),
        )
      )
      .then(() => self.clients.claim()),
  );
},);

// Request interception
self.addEventListener("fetch", (event,) => {
  if (event.request.method !== "GET") return;

  // 1. Try to intercept the article route with the mdBlog library
  if (handleDocFetch(event,)) {
    return;
  }

  // 2. Network-first with cache fallback for static assets and navigation
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await Promise.race([
          fetch(event.request,),
          new Promise((resolve,) =>
            setTimeout(() => resolve(null,), NETWORK_DEADLINE_MS,)
          ),
        ],);
        if (!networkResponse) throw new Error("network deadline passed",);
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME,);
          cache.put(event.request, networkResponse.clone(),).catch(() => {},);
        }
        return networkResponse;
      } catch (_err) {
        // Offline fallback from the local cache
        const cached = await caches.match(event.request,);
        if (cached) return cached;

        // For browser navigations, serve the index.html stored in the cache
        if (event.request.mode === "navigate") {
          const fallback = (await caches.match("./index.html",)) ||
            (await caches.match("./",));
          if (fallback) return fallback;
        }

        return new Response("Offline", { status: 503, },);
      }
    })(),
  );
},);

```

---

## File: `packages/mdblog/public/version.js`

```js
// Automatically generated file during build

/**
 * Current library/application version.
 * @type {string}
 */
export const APP_VERSION = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "";

```

---

