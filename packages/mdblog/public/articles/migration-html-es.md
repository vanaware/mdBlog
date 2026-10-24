---
title: "⚡ Developing in HTML+ES (.js)"
icon: "code"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "htm/preact"
  - "zero-bundle"
  - "es-modules"
  - "islands"
description: "Hands-on development guide with HTML+ES (.js), Preact Signals and native browser islands."
location: "#/articles/migration-html-es.md"
---

# ⚡ Developing in HTML+ES (.js)

The **HTML+ES** pattern combines the power of **`htm/preact`** with standard
JavaScript modules (**ES Modules** in **`.js`** files). It lets you create
interface components and dynamic islands that run directly in a modern browser
with no compilation step and no runtime transpiler.

---

## 🎯 Why HTML+ES?

1. **Standard, valid JavaScript:**
   It uses native _tagged template literals_ (`html\`<article>...\`\``). No JSX compiler and no Babel required.

2. **The canonical `.js` extension:**
   `.js` files are imported natively by the browser through `<script type="module">` or `import()`.

3. **Lightweight reactivity:**
   It uses `@preact/signals` for pinpoint, high-performance reactivity that updates only the DOM nodes it needs.

4. **Zero prior compilation for new islands:**
   Create a `.js` file in the `public/islands/` folder and call it from the Markdown. The browser loads it on demand.

---

## 🛠 How to create a new island in 3 steps

### Step 1: create the file in `public/islands/`

Create a new JavaScript file, for instance `public/islands/TimerWidget.js`:

```javascript
import {
  html as _html,
  signal as _signal,
  useSignal as _useSignal,
} from "../mdblog.js";

const html = _html || globalThis.mdBlog?.html;
const signal = _signal || globalThis.mdBlog?.signal;
const useSignal = _useSignal || globalThis.mdBlog?.useSignal;

export function TimerWidget({ initialSeconds = 0, label = "Stopwatch", },) {
  const seconds = typeof useSignal === "function"
    ? useSignal(Number(initialSeconds,),)
    : signal(Number(initialSeconds,),);

  return html`
    <article class="border round padding surface-container-low margin">
      <div class="row wrap">
        <div class="max wrap">
          <h6 class="no-margin bold small wrap">${label}</h6>
          <p class="small-text secondary-text no-margin wrap">
            Time: ${seconds.value}s
          </p>
        </div>
        <div class="row">
          <button
            class="circle small primary"
            onClick=${() => seconds.value++}
            aria-label="Increase the time"
          >
            <i>add</i>
          </button>
          <button
            class="circle small transparent"
            onClick=${() => (seconds.value = Number(initialSeconds,))}
            aria-label="Reset the time"
          >
            <i>restart_alt</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default TimerWidget;
```

### Step 2: use it in the Markdown

You can call your island with the directive syntax:

```markdown
::TimerWidget.js{initialSeconds: 0, label: "Test Timer"}
```

Or with the typed code block:

````markdown
```island:TimerWidget.js
{
  "initialSeconds": 60,
  "label": "Countdown"
}
```
````

### Step 3: automatic rendering

mdBlog detects the island in the document, reserves its slot in the Wire Format
and hydrates it in isolation, without affecting the rest of the static page.
