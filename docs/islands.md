# 🏝 Islands architecture guide (the HTML+ES solution)

Inspired by the architectural model of **Fresh** (Deno) and built exclusively on
the **HTML+ES solution (Hyperscript Tagged Markup through `htm/preact` + standard
ES Modules)**, the Islands system lets interactive, reactive components live
inside static documentation while keeping the principles of **zero prior
compilation by the bundle**, **zero unnecessary JavaScript** and **100% native
execution in the browser from start to finish**.

---

## 1. Why HTML+ES and not TSX or MDX?

Three approaches were rigorously evaluated as the project evolved:

| Approach | Verdict | Technical justification |
|---|---|---|
| **TSX (compiled)** | Replaced | It requires a prior bundling step (`Deno.bundle`/esbuild) for every new island, which stops the user from creating or hot-adding islands straight in the browser. |
| **MDX in the browser** | Discarded | It requires loading the full `@mdx-js` compiler (~3MB to 5MB) at runtime on the client and using unsafe `new Function` / `eval`, which breaks CSP and hurts mobile. |
| **JSX without a build** | Discarded | Browsers throw `SyntaxError: Unexpected token '<'`. It would require a heavy transpiler (Babel/Sucrase, ~800KB) on the client. |
| **HTML+ES (`htm/preact`)** | **EXCLUSIVELY ADOPTED** | The official Preact pattern. It uses native ES6 *tagged template literals* (`html\`...\``). It weighs only **~600 bytes**, runs natively in any browser with no build, supports asynchronous on-demand `import()` and respects CSP. |

---

## 2. Core principles

1. **Only islands are hydrated:** the rest of the documentation (headings, paragraphs, tables, quotes) is materialized as purely static HTML nodes. Preact does not spend cycles reconciling what never changes.
2. **Zero bundle for new islands:** islands can be written as plain `.js` files in `public/islands/` and loaded asynchronously by the browser through `import("./islands/Name.js")`.
3. **No closures in the Wire:** the Wire Format is pure JSON. An island is only a node `{ t: "i", n: "Name", p: { props }, c: [ staticChildren ] }`.
4. **Service Worker isolation:** the Service Worker **never** imports Preact or UI components. It only handles the literal island names (`manifest.ts`).
5. **Failure resilience:** if an island can be neither resolved nor downloaded, the pre-rendered static fallback content stays visible and functional, with no blank screen and no exceptions.

---

## 3. Separation of concerns: manifest vs registry

To keep the Service Worker from inflating with UI and DOM dependencies:

```
                  ┌──────────────────────────────────────────────┐
                  │    src/render/islands/manifest.ts            │
                  │    export const islandNames = [...] as const;│
                  └──────────────────────┬───────────────────────┘
                                         │
                  ┌──────────────────────┴───────────────────────┐
                  ▼                                              ▼
   [ Service Worker / Core ]                         [ Client browser (HTML+ES) ]
   - Reads names only (strings)                     - Loads pre-registered islands
   - Tags nodes with t: "i"                         - Or runs a dynamic import() (.js)
   - ZERO Preact dependencies                      - Hydrates selectively through the DOM
```

---

## 4. How selective hydration works (`hydrateIslands`)

### 4.1 Emitting the HTML markers
While `wireToVNode()` runs, nodes with `t: "i"` produce container elements carrying data attributes:

```html
<!-- When the island is registered or has a fallback: -->
<div data-island="Counter" data-props='{"start": 10}'>
  <!-- Static children rendered initially -->
</div>
```

### 4.2 The hydration algorithm with dynamic support
`hydrateIslands(registry, opts)` scans the DOM looking for `[data-island]` elements. When an island is absent from the pre-loaded registry, it tries to import it on demand as an ES module (`./islands/${name}.js`):

```ts
export function hydrateIslands(registry: Record<string, ComponentType<any>>, opts: HydrateOptions = {}): number {
  const root = opts.root ?? document.body;
  const nodes = root.querySelectorAll<HTMLElement>("[data-island]");
  let hydrated = 0;

  for (const el of nodes) {
    if (el.dataset.islandHydrated === "true") continue;
    const name = el.dataset.island;
    if (!name) continue;

    const Comp = registry[name];
    if (!Comp) {
      // Native browser dynamic import for a standalone HTML+ES island:
      import(`./islands/${name}.js`)
        .then((mod) => {
          const dynamicComp = mod[name] || mod.default;
          if (dynamicComp) {
            registry[name] = dynamicComp;
            const props = JSON.parse(el.dataset.props || "{}");
            el.dataset.islandHydrated = "true";
            hydrate(h(dynamicComp, props), el);
          }
        })
        .catch(() => {
          el.dataset.islandMissing = "true";
        });
      continue;
    }

    let props = {};
    try {
      props = JSON.parse(el.dataset.props || "{}");
    } catch {}

    el.dataset.islandHydrated = "true";
    try {
      hydrate(h(Comp, props), el);
      hydrated++;
    } catch (e) {
      console.error(`[islands] Failed to hydrate ${name}:`, e);
    }
  }

  return hydrated;
}
```

---

## 5. How to create a new island in HTML+ES format

With the HTML+ES solution you can create a new island without rebuilding the project!

### Example: `public/islands/MyWidget.js`

```javascript
import { html } from "htm/preact";
import { signal } from "@preact/signals";

export function MyWidget({ title = "My Dynamic Widget" }) {
  const active = signal(false);

  return html`
    <article class="border round padding surface-container bottom-margin">
      <div class="row wrap">
        <h6 class="max wrap bold no-margin">${title}</h6>
        <button
          class="chip ${active.value ? 'primary' : 'surface-variant'}"
          onClick=${() => (active.value = !active.value)}
        >
          ${active.value ? "On" : "Off"}
        </button>
      </div>
    </article>
  `;
}

export default MyWidget;
```

### Using it in Markdown
Just reference the island in any `.md` file:

```markdown
::MyWidget{title: "Demo Without a Rebuild"}
```

Or in a code block:

````markdown
```island:MyWidget
{
  "title": "Block Demo"
}
```
````

Opening the document in the browser makes the client detect the island, import
`public/islands/MyWidget.js` natively over the network/cache and turn the
reactivity on instantly!
