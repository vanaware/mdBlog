# ✍️ Syntax and Dynamic Islands Guide for mdBlog

This guide details the whole syntax supported by **mdBlog**, covering the
**CommonMark** specification, the **GitHub Flavored Markdown (GFM)** extensions,
the **Frontmatter** options and the **Dynamic Islands (HTML+ES)** architecture.

---

## 1. Base Markdown syntax (CommonMark)

mdBlog supports every standard CommonMark markup:

### Headings
```markdown
# Heading 1 (becomes the document title when it is the first one)
## Heading 2 (generates an automatic anchor and a direct link)
### Heading 3
#### Heading 4
```

### Text formatting
```markdown
*Italic text* or _italic_
**Bold text** or __bold__
`inline code`
```

### Links and images
```markdown
[Internal link to an article](guide.md)
[External link](https://deno.com)
![Image alternative text](./icon.svg "Image title")
```

### Lists and quotes
```markdown
- Bulleted list
  - Indented sub-item
- Another item

1. Numbered list
2. Second item

> Quote block styled with a BeerCSS border
```

### Code blocks
```markdown
```typescript
function hello(name: string): string {
  return `Hello, ${name}!`;
}
```
```
Code blocks include a native copy-to-clipboard button (`clipboard`) with visual
feedback.

---

## 2. GFM extensions (GitHub Flavored Markdown)

The parser integrates the full set of GFM extensions:

### Tables
```markdown
| Feature | Supported? | Notes |
|:---|:---:|---:|
| Tables | ✅ Yes | Configurable alignment |
| Checklists | ✅ Yes | Disabled checkboxes |
| Strikethrough | ✅ Yes | `~~struck-through text~~` |
```

### Task lists
```markdown
- [x] Task completed with a checked checkbox
- [ ] Pending task
```

### Strikethrough
```markdown
~~This text was removed or corrected~~
```

---

## 3. YAML frontmatter

At the beginning of any `.md` file you can include YAML metadata delimited by
`---`:

```yaml
---
title: "Custom Page Title"
author: "Vanaware"
date: "2026-10-10"
icon: "auto_stories"       # Material Symbols icon name
badge: "New"               # Visual chip shown on the cards
tags:
  - "tutorial"
  - "deno"
pages:                     # Recursive navigation to sub-pages
  - path: "sub-article-1.md"
    title: "Part 1"
    icon: "filter_1"
  - path: "sub-article-2.md"
    title: "Part 2"
    icon: "filter_2"
---
```

### Supported properties

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Article title (replaces the first `# H1` when defined) |
| `author` | `string` | Author name shown in the metadata |
| `date` | `string` | Publication or revision date |
| `icon` | `string` | Google Material Symbols icon name |
| `badge` | `string` | Highlight label/visual chip |
| `tags` | `string[]` | List of keywords for search |
| `pages` | `Array` | Recursive list of child sub-pages |

---

## 4. Dynamic Islands (HTML+ES — Zero Bundle)

Dynamic islands let you embed reactive interactive components without
recompiling the library.

### Where do the files live?
Exclusively in the `public/islands/` folder.

### How do I write an island?
Write a standard ES JavaScript module using `htm/preact` imported from
`../mdblog.js`:

```javascript
// public/islands/DemoCounter.js
import { html, useSignal } from "../mdblog.js";

export function DemoCounter({ start = 0, step = 1, label = "Counter" }) {
  const count = useSignal(Number(start));

  return html`
    <article class="border round padding surface-container margin">
      <div class="row wrap">
        <div class="max wrap">
          <h6 class="no-margin bold small wrap">${label}</h6>
          <span class="small-text secondary-text wrap">Native dynamic island</span>
        </div>
        <div class="row">
          <button class="circle small surface-variant" onClick=${() => count.value -= Number(step)}>
            <i>remove</i>
          </button>
          <span class="chip primary bold">${count.value}</span>
          <button class="circle small primary" onClick=${() => count.value += Number(step)}>
            <i>add</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default DemoCounter;
```

### How do I insert the island into Markdown?

#### Option A: Directive syntax (recommended)
```markdown
::DemoCounter.js{start: 20, step: 5, label: "My Counter"}
```

#### Option B: Code block syntax
```markdown
```island:DemoCounter.js
{
  "start": 50,
  "step": 10,
  "label": "Block Counter"
}
```
```

### Island execution cycle
1. The transformer (`to-wire.ts`) emits a `WireIsland` node:
   ```json
   { "t": "i", "n": "DemoCounter.js", "p": { "start": 20, "step": 5 } }
   ```
2. The Preact renderer creates a marker static HTML element:
   ```html
   <div data-island="DemoCounter.js" data-props='{"start":20,"step":5}'></div>
   ```
3. The `hydrateIslands()` routine performs the native
   `import("./islands/DemoCounter.js")` in the browser and hydrates the
   component on demand!
