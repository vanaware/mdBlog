# 🔄 Navigation flows and lifecycle

This document details how the system behaves in each usage scenario: the first
load in the browser, internal SPA navigation, offline operation, and the fallback
in environments where the Service Worker is not active.

---

## 1. Flow 1: direct navigation / first paint (F5 or typing a URL)

Happens when the user opens a path directly in the browser (e.g.
`https://site.com/docs/guide` with the `Accept: text/html` header).

```
[ User types a URL / Presses F5 ]
                  │
                  ▼
         [ Service Worker ] ── (Intercepts the FetchEvent with Accept: text/html)
                  │
                  ├── Queries Cache Storage ('md-wire-v1')
                  │     └── Valid cache hit? If so, uses the cached WireDoc.
                  │
                  ├── Cache miss or expired:
                  │     ├── Internal fetch: '/docs/guide.md?_md_raw=1'
                  │     ├── Parse Markdown -> mdast AST -> WireDoc
                  │     └── Stores the WireDoc in Cache Storage
                  │
                  ▼
         [ the shell ] ── Answers the navigation with a complete HTML document
                  │
                  ├── Reads ./index.html next to the worker (revalidated, so the
                  │    head is always the one the application was shipped with)
                  ├── Falls back to defaultShell(doc) when it cannot be read
                  ├── Injects <script id="__md_wire" type="application/json">
                  └── Rewrites <title> after the document being rendered
                  │
                  ▼
        [ HTTP 200 response ] ── Hands the HTML back to the browser
                  │
                  ▼
         [ bundle.js runs ]
                  │
                  ├── The Content component consumes and removes #__md_wire from the DOM
                  ├── wireToVNode() materializes the Preact VNodes instantly
                  └── hydrateIslands() hydrates the nodes carrying [data-island]
```

### Advantages of this flow:
- **Zero layout shift:** the text content and the blocks already arrive in the first HTML document.
- **Fast:** no extra AJAX/Fetch data requests during the initial load.
- **SEO & accessibility:** search crawlers receive the structured node tree.
- **One document, one head:** the payload is injected into the `index.html` the
  application ships, so a served first paint carries the same stylesheets, the
  same theme restore and the same mount deadline as a plain visit — there is no
  second copy of the head to keep in step, which is how a shell ends up loading
  another framework release and hanging on a blank page.

---

## 2. Flow 2: SPA navigation (moving between pages)

Happens when the user clicks an internal link or the hash route changes (`#/docs/other`).

```
[ User clicks a link / Hash changes ]
                  │
                  ▼
        [ Router / Signals ] ── Updates 'currentPath.value'
                  │
                  ▼
       [ mdFetch('/docs/other') ] ── Sends the request with Accept: application/json
                  │
                  ▼
         [ Service Worker ] ── Intercepts and processes
                  │
                  ├── Content negotiation: recognizes 'Accept: application/json'
                  ├── Queries or processes the WireDoc
                  └── Returns the JSON Response with the metadata headers (x-title, x-source, etc.)
                  │
                  ▼
        [ Content component ] ── Receives the JSON object
                  │
                  ├── wireToVNode(doc.wire, registry)
                  ├── Preact reconciles the DOM without reloading the page
                  └── hydrateIslands() hydrates only the newly created islands
```

---

## 3. Flow 3: fallback without a Service Worker (pure client-side)

Happens when:
- The browser does not support Service Workers.
- The Service Worker is still installing and has not taken control of the page yet.
- The user unchecked or unregistered the Service Worker in the developer tools.

```
[ mdFetch(url) is called by the Content component ]
                  │
                  ▼
     [ detect.ts: isSWControlling() ] ── Returns false!
                  │
                  ▼
       [ createLocalFetcher() ] ── Activates the client-side pipeline
                  │
                  ├── The client IO reads the .md file directly through window.fetch
                  ├── The client-side parser produces mdast -> WireDoc
                  ├── Stores it in the shared 'md-wire-v1' Cache Storage
                  └── Returns the JSON Response
                  │
                  ▼
         [ Identical rendering ] ── The user notices no difference!
```

---

## 4. Shared cache strategy (`md-wire-v1`)

The Service Worker and the client adapter share **the same `cacheName`** in the
browser's Cache Storage.

### Cache rules:
1. **Cache key:** the key is the resolved canonical path of the Markdown file (e.g. `/docs/guide.md`).
2. **TTL (time-to-live):** configured in seconds (default: `60s`).
   - When reading from the cache, the pipeline checks whether:
     $$\text{Date.now()} - \text{doc.renderedAt} < \text{cacheTTL} \times 1000$$
   - On an expired entry, the `.md` file is fetched again with the `Cache-Control: no-cache` header.
3. **Invalidation and cleanup:** in the Service Worker `activate` event, every cache whose name starts with the `md-wire-` prefix but differs from the active `cacheName` is dropped automatically.

---

## 5. Security measures in the Service Worker

### 5.1 Preventing infinite recursion
When the Service Worker must fetch the `.md` file for processing, the `fetch` issued inside the worker could be intercepted by the worker itself, producing an infinite loop.
- **Solution:** every internal request for the raw `.md` carries the `?_md_raw=1` search parameter. The `fetchHandler` sees that parameter and skips interception right away (`return`).

### 5.2 Streaming and media filtering
Requests carrying the `Range` header (common in audio, video or streaming) are ignored by the plugin, so improper binary traffic is never intercepted.
