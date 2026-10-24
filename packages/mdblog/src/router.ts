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
import { normalizePath, } from "./utils.ts";
import { APP_VERSION, } from "./version.ts";

/**
 * @description Cache bucket the client reads and writes its wire documents into.
 *
 * It follows the build stamp on purpose, mirroring the naming of the Service
 * Worker itself (`mdblog-pwa-${version}` in `sw.js`): when page and worker come
 * from the same build they share one bucket, and a new release orphans the old
 * name, which the worker's activate step then deletes. A frozen name (the
 * former `mdblog-pwa-v1`) accumulated entries no cleanup ever owned.
 */
export const CLIENT_CACHE_NAME = `mdblog-pwa-${APP_VERSION || "dev"}`;

const io = createBrowserIO({
  cacheName: CLIENT_CACHE_NAME,
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
 * @description How long a document request may stay unanswered before the
 * reader reports it as failed, in milliseconds.
 *
 * A request that never settles is indistinguishable from a slow one, and the
 * loading state has no way out of its own: without a budget the reader is left
 * watching a bar that will never finish instead of the card that explains the
 * failure and offers the way back to the start page. That is what happens when
 * a service worker loses its cache underneath an open tab.
 */
export const NAVIGATION_TIMEOUT_MS = 15_000;

/**
 * @description Settles a promise no later than a deadline, rejecting with a
 * descriptive error when the original one is still pending.
 * @param pending - The work to guard, typically a document request.
 * @param ms - How long to wait for it.
 * @param route - What was asked for, quoted in the rejection message.
 * @returns The result of the original promise, or a rejection.
 * @example
 * ```ts
 * import { withTimeout } from "./router.ts";
 * const doc = await withTimeout(mdFetch("./articles/guide.md", io), 500, "guide.md");
 * ```
 */
export function withTimeout<T,>(
  pending: Promise<T>,
  ms: number,
  route: string,
): Promise<T> {
  return new Promise<T>((resolve, reject,) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `${route} did not answer within ${
            Math.round(ms / 1000,)
          }s. The copy held by the browser may be damaged: reload the page, and if it keeps happening clear the site data.`,
        ),
      );
    }, ms,);
    // The original work is not cancelled — it is simply no longer waited for. A
    // late answer still lands, because committing state is guarded by the
    // navigation token rather than by this timer.
    pending.then(resolve, reject,).then(() => clearTimeout(timer,));
  },);
}

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
  // Route cleaning itself is what normalizePath already does (hash, `./`,
  // articles/ and docs/ prefixes, empty/index spellings all collapse to the
  // filename); only the implicit `.md` suffix is added here.
  let clean = normalizePath(path,);
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
    const doc = await withTimeout(
      mdFetch(fetchPath, io, config,),
      NAVIGATION_TIMEOUT_MS,
      fetchPath,
    );
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
