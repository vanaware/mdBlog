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
