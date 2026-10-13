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
