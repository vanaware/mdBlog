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
