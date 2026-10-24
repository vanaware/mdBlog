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
