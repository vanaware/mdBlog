import {
  articles,
  currentDoc,
  currentPath,
  errorMessage,
  isLoading,
  loadArticles,
  parseTimeMs,
  viewMode,
} from "./state.ts";
import { mdFetch, } from "./plugin/adapters/client.ts";
import { createBrowserIO, } from "./plugin/core/io.ts";
import { hydrateIslands, } from "./render/hydrate-islands.ts";

const io = createBrowserIO({
  cacheName: "mdblog-pwa-v1",
  useIndexedDB: true,
},);

const config = {
  basePath: "./articles",
  cacheTTLSeconds: 60,
};

/**
 * Sequence token of the latest navigation. Every navigation takes a new number
 * and only the one still holding the token may commit state, so a slow response
 * for an old route can no longer land on top of a newer one.
 */
let navigationSeq = 0;

/**
 * The hash this module wrote itself. Normalizing a route into the address bar
 * fires a `hashchange` that would re-enter the handler for the route already
 * being loaded; remembering the value lets the listener recognise and drop its
 * own echo, while a genuine link click or a back/forward step never matches it.
 */
let selfTriggeredHash: string | null = null;

/**
 * @description Navigates to a target article markdown route, loading Wire AST and hydrating dynamic islands.
 * @param path - Relative or hash route (e.g. "#/articles/intro.md" or "intro.md").
 * @returns Resolves when document is loaded and state is updated.
 * @example
 * ```ts
 * import { navigateTo } from "./router.ts";
 * await navigateTo("overview.md");
 * ```
 */
export async function navigateTo(path: string,): Promise<void> {
  let clean = (path || "").replace(/^#\/?/, "",).replace(/^\.?\//, "",);
  clean = clean.replace(/^articles\//, "",).replace(/^docs\//, "",);
  if (!clean || clean === "/" || clean === "index" || clean === "index.md") {
    clean = "index.md";
  }
  if (!clean.endsWith(".md",)) {
    clean = `${clean}.md`;
  }

  const hashRoute = clean === "index.md" ? "#/" : `#/${clean}`;
  const fetchPath = `./articles/${clean}`;

  if (typeof globalThis !== "undefined" && globalThis.location) {
    if (globalThis.location.hash !== hashRoute) {
      selfTriggeredHash = hashRoute;
      globalThis.location.hash = hashRoute;
    }
  }

  const seq = ++navigationSeq;
  currentPath.value = hashRoute;
  viewMode.value = "preview";
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const t0 = performance.now();
    const doc = await mdFetch(fetchPath, io, config,);
    if (seq !== navigationSeq) return; // superseded by a newer navigation

    const t1 = performance.now();
    parseTimeMs.value = Math.max(0.1, Number((t1 - t0).toFixed(1,),),);

    currentDoc.value = doc;
    document.title = `${doc.title} - mdBlog`;

    // Schedule selective island hydration
    setTimeout(() => {
      hydrateIslands();
    }, 50,);
  } catch (err) {
    if (seq !== navigationSeq) return;
    console.error(`[router] Error loading ${fetchPath}:`, err,);
    errorMessage.value = err instanceof Error ? err.message : String(err,);
  } finally {
    // Only the winning navigation owns the loading flag: a superseded request
    // must not clear it while a newer one is still in flight.
    if (seq === navigationSeq) isLoading.value = false;
  }
}

/**
 * @description Initializes hash-based routing, listens to hash changes, and handles pre-rendered wire payloads.
 * @example
 * ```ts
 * import { initRouter } from "./router.ts";
 * initRouter();
 * ```
 */
export function initRouter(): void {
  if (typeof window === "undefined") return;

  // Loads the blog's article list dynamically
  loadArticles().then(() => {
    // When no route was requested, go to the first article
    const hash = globalThis.location.hash;
    if (!hash && articles.value.length > 0 && articles.value[0]) {
      navigateTo(articles.value[0].path,);
    }
  },).catch(() => {},);

  function handleRoute() {
    const hash = globalThis.location.hash;

    if (selfTriggeredHash !== null) {
      const echo = selfTriggeredHash;
      selfTriggeredHash = null;
      // This event is the echo of our own normalization: the route is already
      // being loaded, so re-navigating would fetch and render it twice.
      if (hash === echo) return;
    }

    if (hash) {
      navigateTo(hash,);
    } else {
      navigateTo("index.md",);
    }
  }

  globalThis.addEventListener("hashchange", handleRoute,);

  // Check if first paint has pre-rendered wire in DOM
  const preRenderedScript = document.getElementById("__md_wire",);
  if (preRenderedScript && preRenderedScript.textContent) {
    try {
      const doc = JSON.parse(preRenderedScript.textContent,);
      currentDoc.value = doc;
      // The shell always stamps a url, but a hand written or truncated payload
      // may not: fall back to the home route instead of a filename, so the
      // sidebar highlights something that actually exists.
      currentPath.value = doc.url || "#/";
      document.title = `${doc.title} - mdBlog`;
      preRenderedScript.remove();
      setTimeout(() => {
        hydrateIslands();
      }, 50,);
      return;
    } catch (err) {
      console.warn("[router] Failed to parse inline __md_wire script:", err,);
    }
  }

  // Otherwise, perform initial fetch
  handleRoute();
}
