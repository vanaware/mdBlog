# 📚 mdBlog documentation

Welcome to the documentation portal and technical guides of **mdBlog** (`@vanaware/mdblog`).

---

## 📑 Document index

1. **[Complete guide, installation and JSR publication](publish-jsr-rules.md)**
   - What mdBlog is, prerequisites and installation through JSR.
   - Folder structure, Service Worker and PWA configuration.
   - Deno quality standards, JSDoc and CI/CD automation.

2. **[TypeScript API reference](api-reference.md)**
   - Full signatures of every component (`App`, `Navbar`, `Sidebar`, `Content`...).
   - Transpilation pipeline (`parseMarkdown`, `mdastToWire`, `processMarkdown`, `loadDoc`).
   - I/O abstractions (`createBrowserIO`, `createMemoryIO`) and the Service Worker interceptor.
   - Reactive signal primitives and Wire Format types.

3. **[Syntax and Dynamic Islands guide](syntax-and-islands.md)**
   - CommonMark syntax and the GFM extensions (tables, checklists, strikethrough).
   - YAML frontmatter metadata and recursive navigation.
   - Creating and embedding Dynamic Islands (HTML+ES) with no bundle.

4. **[Wire Format architecture](wire-format.md)**
   - Specification of the framework-agnostic intermediate JSON format (AST -> Wire).
   - Canonical node mapping table and full XSS immunity.

5. **[Navigation flows and lifecycle](flows.md)**
   - First paint with the HTML shell and the embedded payload (`<script id="__md_wire">`).
   - SPA navigation with content negotiation (`Accept: application/json`).
   - Unified cache strategies (`CacheStorage` + `IndexedDB`).

6. **[Islands architecture](islands.md)**
   - Why HTML+ES (`htm/preact`) instead of TSX or MDX.
   - The `data-island` / `data-props` contract and the selective hydration pass.
   - Fallback behavior for islands that are declared but not registered.

7. **[Hands-on guide and feature demo](guide.md)**
   - The pipeline walked through on a live document (frontmatter, sub-pages, islands).
   - Comparison table against the conventional server-rendered generators.

---

## 🧭 Architecture diagram

```
                     ┌───────────────────────────────┐
                     │      Markdown (.md docs)      │
                     └──────────────┬────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
    [ Service Worker Fetch ]                    [ Client Local Fallback ]
               │                                         │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │    Pipeline Core (mdast -> Wire)     │
                └───────────────────┬──────────────────┘
                                    │
                           JSON Wire Format
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │   from-wire.ts (Preact Registry)     │
                └───────────────────┬──────────────────┘
                                    │
                     Static initial VNodes
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │  hydrateIslands() [data-island]      │
                └──────────────────────────────────────┘
```
