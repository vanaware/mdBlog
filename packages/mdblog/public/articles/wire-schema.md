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
