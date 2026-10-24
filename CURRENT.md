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

**Simplification round — no feature, smaller code.** A whole-codebase review
confirmed the documentation is entirely in English (guides, READMEs, articles,
JSDoc, comments); the last two Portuguese remnants — the `sub-artigo-*.md`
sample paths in `docs/syntax-and-islands.md` — became `sub-article-*.md`, and
the bilingual keyword table in `inferArticleIcon` stays on purpose: it is runtime
data that lets a Portuguese article tree get the same icons, not documentation.
The engine itself shed its duplications: `state.ts` now fetches every document
through one `fetchArticleText()` and builds every `ArticleItem` — the root
`index.md` included — through one `buildArticleItem()`; `router.ts` routes
through `utils.normalizePath` instead of re-implementing it; the dead
single-element candidate loop of `io.readText` is a straight line; the icon
inference reads a keyword table instead of eight if-branches; the Service Worker
adapter types its `event` with a documented structural `SWFetchEvent` (now part
of the published surface) instead of `any`; the breadcrumb walk uses one path→article Map
instead of rescanning the list per hop; and a failed island import is now
evicted from the import memo so a later navigation can retry it. The client-side
cache bucket follows the build stamp (`mdblog-pwa-${APP_VERSION || "dev"}`) the
same way `sw.js` names its own, so page and worker share one versioned bucket
and a release orphans the old one — the frozen `mdblog-pwa-v1` name no cleanup
ever owned is gone. The hand-written `Signal` interface in `mod.ts` stays — an
attempt to alias the native `@preact/signals` type fails JSR's `private-type-ref`
doc lint, and the comment there now records why. Tests: `router_test.ts` (naming mirroring) and the new
`hydrate_islands_test.ts` (import eviction and retry); the suite runs 19 files,
80 steps, all green.

**Pure-BeerCSS round — copied reference audited, four real gaps closed.**
`docs/beercss.md` (copied from another project as the styling reference) was
verified rule by rule against the actual `beercss@3.7.12` stylesheet and the
official repo: its golden rules hold (the app writes no custom CSS, ripples and
`:focus-visible` rings come from the framework, the `.overlay.active` +
`dialog.active` pattern is the correct 3.7.x scrim — there is no `.modal` class
in this release), but three of its claims are wrong for 3.7.12 and the file now
says so: `medium-margin`/`medium-padding` do not exist (only `medium-space`
does), the dialog `modal` helper is a later major, and the icon fonts are
already bundled in `beer.min.css`. The audit found four gaps worth code:
`beer.min.css` declares its Material Symbols `@font-face` with
`font-display: block`, so both shells (public `index.html` and `defaultShell`)
now `<link rel="preload" as="font" crossorigin>` the woff2 instead of leaving
every glyph invisible behind the stylesheet round trip; `ThemeToggle` seeded its
state from `body.classList.contains("dark")`, which never fires in `auto` mode —
`initialThemeIsDark()` now falls back to the `prefers-color-scheme` query the
auto mode mirrors; the hardcoded `#6750a4` `theme-color` meta follows the
painted background through `syncThemeColor()` (boot script in the shipped shell,
`applyTheme` otherwise); and the Sidebar close button gave up `tiny` to return
above the 48px M3 tap target. Tests: new `theme_toggle_test.ts` (7 steps, using
the native Deno `localStorage` because its global accessor ignores
reassignment) and a shell preload lockstep assertion; the suite runs 21 files,
88 steps, all green.

**Refresh hang — every wait now has a deadline.** Refreshing
`http://localhost:3000/#/` in a real browser kept spinning forever. The server
answered every route in milliseconds, and a fresh browser reloaded cleanly — the
signature of the old trap: `resolveDocPath("/")` treats the root as an article,
so the refresh IS a worker navigation, and a worker holding the pre-watchdog
bundle (kept alive because `noversion` freezes the stamped URL it registered
under) can hand `respondWith` a promise that never settles and never fails —
the shell's 12s mount deadline cannot help because the navigation HTML itself
never arrives. Two layers of watchdog plus one replacement path: the published
adapter (`plugin/adapters/sw.ts`) races the whole handling chain against
`handlerTimeoutMs` (default 8000), answering a 504 — an HTML "Still loading"
page for navigations, JSON for API reads — and clearing the timer the moment
the chain settles; `sw.js` gives its generic network-first fetch a
`NETWORK_DEADLINE_MS = 6000` race so a stalled fetch falls into the existing
cache-and-shell fallback instead of hanging the event; and the registration in
`register-sw.ts` sets `updateViaCache: "none"`, so under a frozen version URL
the update check still reaches the network and a byte-changed worker is
actually re-downloaded and adopted via `skipWaiting`. Worst case is now a 504
that invites a reload, never an eternal spinner. Tests: a "Bounded answers"
describe in `sw_adapter_test.ts` (html deadline, json deadline, and a fast
answer proving the timer is cleared); the suite runs 22 files, 91 steps, all
green.

## ⏭️ Next candidates

- `deno task esbuild noversion`, the build every local round and the test suite
  runs, keeps the stamp frozen — so in development the registered worker URL
  never changes across rebuilds. `updateViaCache: "none"` makes the browser
  revalidate the script so a byte-changed worker is replaced, and both the
  adapter and `sw.js` now answer within a deadline even while an old wedged
  worker is still in charge, but a content-hash stamp (owned by
  `@vanaware/buildit`'s `versionPaths`) would also make the URL itself move and
  let a brand-new tab skip the stale worker entirely.
- Old bookmarks pointing at the previous Portuguese file names 404; a legacy alias
  map (or a case-insensitive lookup against the discovered article tree) would keep
  them working.
- The root `README.md` is not formatted (`deno fmt --check` flags the nested code
  fence around line 148) and `docs/` is excluded from `deno fmt` targets —
  deciding whether the guides should be format-covered is an open choice.
