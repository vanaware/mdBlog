# @vanaware/mdblog

> Browser Blog and Documentation Engine from Markdown using Service Worker, Wire Format AST, and Preact Islands.

[![JSR](https://jsr.io/badges/@vanaware/mdblog)](https://jsr.io/@vanaware/mdblog)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

`@vanaware/mdblog` is an offline-capable, zero-build Markdown blog and documentation library. It parses CommonMark + GFM directly into a secure, JSON-serializable **Wire Format AST**, which is rendered into virtual DOM components with interactive **HTML+ES Islands**.

---

## 📦 Installation

Add `@vanaware/mdblog` to your Deno project via JSR:

```bash
deno add jsr:@vanaware/mdblog
```

Or with npm/yarn/pnpm:

```bash
npx jsr add @vanaware/mdblog
```

---

## 🚀 Usage

### 1. Programmatic Markdown to Wire AST

Parse Markdown strings and generate lightweight, XSS-safe Wire Format JSON trees:

```typescript
import {
  parseMarkdown,
  mdastToWire,
  processMarkdown,
} from "@vanaware/mdblog";

const markdown = `---
title: "Release Notes"
author: "Vanaware"
---
# Version 1.0

- [x] Service Worker offline cache
- [x] GFM tables and checklists
- [ ] Next features

::Counter.js{start: 10}
`;

// 1. High-level single call (extracts frontmatter + AST)
const doc = processMarkdown(markdown, "/articles/release-notes.md");
console.log(doc.title); // "Release Notes"
console.log(doc.wire);  // JSON-serializable WireFragment

// 2. Low-level modular pipeline
const mdast = parseMarkdown(markdown);
const { wire, title } = mdastToWire(mdast);
```

### 2. Service Worker Interceptor (PWA)

In your Service Worker (`sw.js`), intercept markdown routes and respond with Wire AST JSON or pre-rendered HTML shells:

```typescript
/// <reference lib="webworker" />
import mdTranspiler, { createBrowserIO, createSWFetchHandler } from "@vanaware/mdblog";

const io = createBrowserIO({
  cacheName: "my-docs-cache-v1",
  useIndexedDB: true,
});

const handleDocFetch = createSWFetchHandler(io, {
  basePath: "./articles",
  cacheTTLSeconds: 60,
  bundlePath: "./mdblog.js",
});

self.addEventListener("fetch", (event: FetchEvent) => {
  // Automatically serves .md files as WireDoc JSON or HTML shell
  if (handleDocFetch(event)) {
    return;
  }
});
```

### 3. Rendering Wire AST to Preact VNodes

```typescript
import { wireToVNode, hydrateIslands } from "@vanaware/mdblog";
import { render } from "preact";

// Materialize Wire AST without dangerouslySetInnerHTML
const vnodes = wireToVNode(doc.wire);
render(vnodes, document.getElementById("content")!);

// Selectively hydrate any dynamic islands rendered on page
await hydrateIslands();
```

---

## 🏝️ Dynamic Islands (Zero Bundle)

Create interactive widgets in `public/islands/MyWidget.js` using pure HTML+ES:

```javascript
// public/islands/MyWidget.js
import { html, signal, useSignal } from "../mdblog.js";

export function MyWidget({ start = 0 }) {
  const count = useSignal(Number(start));

  return html`
    <button class="chip primary" onClick=${() => count.value++}>
      Clicks: ${count.value}
    </button>
  `;
}

export default MyWidget;
```

Embed it anywhere in Markdown:

```markdown
::MyWidget.js{start: 42}
```

---

## 🧩 Public API Summary

- **Components:** `App`, `Navbar`, `Sidebar`, `Content`, `ThemeToggle`, `SearchBox`
- **Pipeline:** `parseMarkdown`, `mdastToWire`, `processMarkdown`, `loadDoc`, `defaultShell`
- **I/O & Adapters:** `createBrowserIO`, `createMemoryIO`, `createSWFetchHandler`, `createLocalFetcher`, `mdFetch`
- **Islands & Rendering:** `wireToVNode`, `hydrateIslands`, `defaultRegistry`, `dynamicIslandsCache`
- **Reactive State:** `html`, `signal`, `useSignal`, `computed`, `effect`, `batch`, `state`
- **Utilities:** `slugify`, `isSWControlling`, `resolveDocPath`, `countWireNodes`, `countWireIslands`, `sanitizeProps`

See [docs/API_REFERENCE.md](../../docs/API_REFERENCE.md) for full signatures and options.

---

## 📄 License

MIT © [Vanaware](https://github.com/vanaware)
