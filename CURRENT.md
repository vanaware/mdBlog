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
Those numbers were taken again after the shell fix below, under the release the
app is built for: unchanged.

**One document, and no load that hangs in silence.** A reported blank page that
never finished loading traced back to two documents claiming to be the entry.
The Service Worker answered navigations with `defaultShell()`, a hand-written
copy of the head that had drifted: it loaded BeerCSS 5.0.3 against the pinned
3.7.12, signed itself "AiStudio Docs", and carried none of the safeguards
`public/index.html` has — no theme restore, no stale-cache recovery. With the
bundle unavailable it rendered an empty `#app` and waited forever. Navigations
now read the application's own `index.html` (`injectWireShell` splices the
`#__md_wire` payload into `<head>` and follows the document's title), so there
is one head to keep correct; `defaultShell` remains only for the case where the
file cannot be read at all, and is now on the same release. Three ways out of a
stalled load were added beside it: a mount deadline in the shell (12s with an
empty `#app` says so and offers "Reload" / "Discard the cached copy"), a
15-second budget per document request in `router.ts` (a request that never
answers now ends in the existing error card instead of an endless bar), and
`shellPath` on `SWPluginOptions` for whoever ships another entry document. The
worker itself was the other half of the trap: `sw.js` is copied verbatim from
`public/`, so its bytes never change and the browser never re-installs it —
every rebuild left the previous worker in charge of the shell and of its own
engine. The registration is now versioned (`sw.js?version=<build stamp>`, the
stamp travelling URL-encoded because it contains `#`) and the worker names its
cache after that same stamp, so a deploy replaces the worker exactly once and
clears what the superseded build left behind. `.github/workflows/pages.yml`
dropped `noversion` for that reason: with a frozen stamp no visitor would ever
be updated. Tests: `tests/shell_test.ts` (payload placement, template preserved,
no duplicated payload, escaping, and a guard that the fallback document stays on
the release `index.html` uses) and `tests/router_test.ts` (the budget); the
`mdblog-pwa-v2` literal assertion in `app_test.ts` became an assertion that the
cache name follows the build.

**The same build under a subfolder.** A console error reported from the published
site — `[sw-adapter] Error processing /mdBlog/articles/index.md: document not
found` — was the worker asking for its own folder twice. The browser hands the
worker the request it already resolved (`./articles/index.md` arrives as
`/mdBlog/articles/index.md`), and `readText` treats a leading slash as "relative
to the application", prefixing it with `.` — which at the root of a domain is
harmless and under a deployment folder is a path that cannot exist. Every
article was missed this way; the page still appeared because `mdFetch` falls back
to running the pipeline in the tab, so the cost was a failed request and a second
parse per navigation, invisible except in the console. `toBaseRelativePath`
(`plugin/detect.ts`) now reduces the request to what it is below the worker's own
directory before the document is read, which is the spelling the page uses and
keeps a cache key from depending on where the site is published. Verified against
a real subfolder: a copy of `dist/` served at `http://127.0.0.1:8099/mdBlog/`,
worker in control, navigations and JSON requests answered with
`X-Rendered-By: SW-Wire-Format` and an empty console — while the path the old
code produced (`/mdBlog/mdBlog/articles/index.md`) still 404s there, which is the
proof of the mechanism rather than of the fix. Tests: `tests/sw_adapter_test.ts`.

The console line about autofocus is the same kind of noise and is gone: the
search dialog declared `autofocus` on an input that only exists once the dialog
is open, which Chrome blocks ("a document already has a focused element") while
the component already places the caret itself in an effect. The attribute is no
longer rendered.

## ⏭️ Next candidates

- `deno task esbuild noversion`, the build every local round and the test suite
  runs, keeps the stamp frozen — so in development the worker is still not
  replaced by a rebuild and a stale engine has to be dropped by hand (DevTools,
  or the shell's own "Discard the cached copy"). A stamp that moves with the
  content of the bundle would close that gap without touching releases.
- Old bookmarks pointing at the previous Portuguese file names 404; a legacy alias
  map (or a case-insensitive lookup against the discovered article tree) would keep
  them working.
