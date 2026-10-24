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
