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
title: "Documentação do Projeto"
author: "Vanaware"
date: "2026-10-10"
pages:
  - path: "README.md"
    title: "Visão Geral"
    icon: "article"
  - path: "guia.md"
    title: "Guia Prático"
    icon: "science"
  - path: "advanced.md"
    title: "Avançado"
    icon: "tune"
---

# Bem-vindo ao mdBlog

Este é o documento inicial. O menu lateral é gerado automaticamente a partir da lista acima!
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
      <div class="row items-center justify-between">
        <h6>Contador: ${count.value}</h6>
        <div class="row gap">
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
