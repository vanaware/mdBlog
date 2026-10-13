---
title: "🔄 Flows and lifecycle"
icon: "sync"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "pwa"
  - "service-worker"
  - "cache"
  - "spa"
description: "Lifecycle, shell first paint and client-side SPA navigation in mdBlog."
location: "#/articles/flows.md"
---

# 🔄 Navigation flows and lifecycle

This document details how mdBlog behaves at each moment of execution: the first
load in the browser, internal SPA navigation, offline operation and the resilient
fallback.

---

## ⚡ Flow 1: direct navigation and first paint

Happens when the user opens a URL directly in the browser or reloads the page (F5):

1. **Service Worker interception:** the Service Worker picks up the request carrying `Accept: text/html`.
2. **CacheStorage lookup:** it checks whether the document already lives in `md-wire-v1`. On a valid cache hit it reuses the existing AST.
3. **Background transformation:** with no cache, or an expired one, it fetches the raw `.md`, builds the Wire Format tree and caches it.
4. **Complete HTML shell:** the Service Worker answers with an HTML that carries BeerCSS and the Wire tree embedded in `<script id="__md_wire">`.
5. **Immediate rendering:** the client bundle consumes the inline tag, mounts the Preact VNodes instantly and triggers island hydration with no extra network requests.

---

## 🚀 Flow 2: SPA navigation (moving between articles)

Happens when the user clicks an internal link or the hash route changes:

1. **Router trigger:** the click updates the reactive signal `currentPath.value`.
2. **Data request:** the reader sends a request asking for `Accept: application/json`.
3. **Optimized response:** the Service Worker (or the local fallback) delivers only the destination article's `WireDoc` JSON tree.
4. **DOM reconciliation:** Preact updates the reader smoothly, with no screen flicker and no full page reload.
5. **Hydration of the new islands:** only the freshly created `[data-island]` elements are activated.

---

## 🛡️ Flow 3: fallback without a Service Worker (pure client-side)

Happens in restricted environments, private browsing, or before the Service Worker activates:

1. **Automatic detection:** `isSWControlling()` finds that no Service Worker is in control.
2. **Local pipeline activation:** the client-side adapter runs the very same parsing pipeline directly on the browser thread.
3. **Cache persistence:** the processed tree is written to CacheStorage and IndexedDB for later use.
4. **Identical experience:** for the end user navigation works transparently, with no visual degradation.

---

## 💾 Cache and offline storage strategy

- **CacheStorage (`md-wire-v1`):** stores the processed documents with a configurable TTL (60 seconds by default).
- **IndexedDB (`idb-keyval`):** keeps articles durably even when the temporary cache data is evicted.
- **Loop prevention:** internal requests for `.md` files carry control parameters so the Service Worker never re-intercepts its own fetches.
