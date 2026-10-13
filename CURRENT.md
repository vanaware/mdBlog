# 🎯 Full prompt — Docsify-style documentation generator with Service Worker + Wire Format

> Self-contained reference specification for the static documentation generator
> built on a Service Worker and the Wire Format.

---

## 🧭 Context and goal

Static documentation generator inspired by Docsify with a modern architecture:

- Dev runtime: **Deno 2.x**
- Bundler: `jsr:@vanaware/buildit/esbuild` for browser usage
- UI: **Preact + htm + Signals + BeerCSS**
- Core architecture: a **Service Worker** intercepts documentation page requests, reads the matching Markdown, converts it into an mdast AST, and hands the client a **"wire format"** — a serializable JSON tree describing _which component_ to render at each node, with no HTML and no `dangerouslySetInnerHTML`.
- The client materializes that tree into Preact VNodes through a component registry.
- **Critical requirement:** the whole pipeline runs both in the Service Worker and in the client (transparent fallback).

---

## 🛠 Mandatory stack

| Item            | Package / version                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Dev runtime     | Deno 2.x                                                                                            |
| Bundler         | `jsr:@vanaware/buildit/esbuild`                                                                     |
| Import map      | `deno.json`                                                                                         |
| UI              | `preact@^10.24`, `htm@^3.1` (via `htm/preact`), `@preact/signals@^2`                                |
| CSS             | BeerCSS via CDN (`beercss@3`)                                                                       |
| Markdown parser | `mdast-util-from-markdown@^2`, `mdast-util-gfm@^3`, `micromark-extension-gfm@^3`, `@types/mdast@^4` |
| Dev server      | `jsr:@std/http/file-server`                                                                         |

---

## 🏝 Islands model (the HTML+ES solution - zero bundle)

- Exclusive adoption of **HTML+ES** (`htm/preact` + standard ES Modules) for island components
- Zero prior compilation by the bundle: native execution in the browser from start to finish
- On-demand dynamic loading through the browser's `import()`
- Lean name declaration for the SW (`manifest.ts`) while keeping UI isolation
- `WireIsland` (`t: "i"`) nodes
- Static initial rendering with the `data-island` and `data-props` attributes
- Selective hydration through `hydrateIslands()` with `preact.hydrate()`
- Graceful fallback for unregistered islands (no blank screen)

---

## 📌 Actual status (last completed round)

**State layer — signals are the single state mechanism.**
`state.ts` owns every writable signal, action and `computed`; the IndexedDB search
index restore (`restoreSearchIndexFromCache()`), the `Ctrl/Cmd+K` and `Escape`
shortcuts and the panel mutex live there, not in a component. `tocModalOpen` is now
a `computed` over the `tocPanelRequest` signal (a route string), so widening the
viewport or navigating away closes the modal without any effect writing state.
`preact/hooks` is imported by `SearchBox.ts`, `Content.ts` and `mod.ts` only, and
the remaining `useEffect` calls do post-commit DOM work (dialog focus, rail
measurement, island hydration); the hooks stay in the public surface because user
islands may prefer them.

**Narrow-screen layout — the root cause was vocabulary, not media queries.**
The components used utility names BeerCSS 3.7.12 does not implement
(`items-center`, `justify-between`, `gap-small`, `border-bottom`, `column`,
`surface-variant-text`, `medium-padding`, `margin-bottom`, ...). A name shaped like
`margin-*`/`padding-*` still matches the framework's `[class*=margin]` attribute
rule, so such an element silently receives the default 1rem on every side. The
vocabulary now in use: `.row` (already centered, 1rem gap) + `<div class="max">`
as the spacer, `.vertical` for columns, `.no-space`/`.medium-space`/`.large-space`
for row gaps, `hr`-style `.medium-divider` for separators, `.elevate` for depth and
directional `top-margin small-margin` pairs for tighter rhythm. Verified live at
375x667: brand icon left of the title, 16px of padding on the article card, >= 16px
between blocks, 8px between sub-page cards, no horizontal overflow.

**Guard test.** `tests/beer_classes_test.ts` fails the build when a component, a
renderer or a demo island uses a class outside the BeerCSS vocabulary, or when one
element carries two margin (or padding) size classes.

**Article slugs.** `public/articles/*.md` and the `docs/` guides are lowercase
English slugs (`overview`, `guide`, `wire-format`, `wire-schema`, `flows`,
`islands`, `development-plan`, `migration-html-es`; in `docs/`: `api-reference`,
`syntax-and-islands`, `wire-format`, `flows`, `islands`, `guide`), with the
frontmatter `location:`/`pages:`, every cross link, the root README tree and the
`docs/README.md` index following. `tests/docs_test.ts` pins the convention and
checks that every relative `.md` link of those two folders points at a file that
exists.

**Type scale and the end of the bar.** BeerCSS sizes headings for a wide page
(`h4` is 2rem), so `Heading` in `render/registry.ts` now takes the `.small`
variant of its own level below the wide breakpoint and the document title in
`Content.ts` follows the same rule: on a phone the ladder reads 28 / 24 / 20 /
16px instead of 36 / 32 / 28 / 24 over a 16px card title. Card and island titles
that were `small-text` (12px, smaller than the 14px body) are bold at body size,
and the search dialog and error titles join the same scale. In the navbar the
status chip, the search and the theme toggle are one group: the row is
`no-space` and the last two items carry `left-margin small-margin`, the 8px
BeerCSS itself gives a button. The chip drops its word and its padding on the
narrow branch and the brand link drops its 0.75rem of inline padding, which is
what brings the theme toggle back on screen — measured live: 2px of slack at
320px, 16px at 360 and 375, 16px on the desktop bar, whose layout is unchanged.

## ⏭️ Next candidates

- Old bookmarks pointing at the previous Portuguese file names 404; a legacy alias
  map (or a case-insensitive lookup against the discovered article tree) would keep
  them working.
