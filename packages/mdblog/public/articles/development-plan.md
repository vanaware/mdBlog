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
