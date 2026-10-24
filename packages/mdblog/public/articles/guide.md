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
