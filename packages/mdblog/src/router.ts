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
import { mdFetch } from "./plugin/adapters/client.ts";
import { createBrowserIO } from "./plugin/core/io.ts";
import { hydrateIslands } from "./render/hydrate-islands.ts";

const io = createBrowserIO({
  cacheName: "mdblog-pwa-v1",
  useIndexedDB: true,
});

const config = {
  basePath: "./articles",
  cacheTTLSeconds: 60,
};

/**
 * @description Navigates to a target article markdown route, loading Wire AST and hydrating dynamic islands.
 * @param path - Relative or hash route (e.g. "#/articles/intro.md" or "intro.md").
 * @returns Resolves when document is loaded and state is updated.
 * @example
 * ```ts
 * import { navigateTo } from "./router.ts";
 * await navigateTo("README.md");
 * ```
 */
export async function navigateTo(path: string): Promise<void> {

  let clean = (path || "").replace(/^#\/?/, "").replace(/^\.?\//, "");
  clean = clean.replace(/^articles\//, "").replace(/^docs\//, "");
  if (!clean || clean === "/" || clean === "index" || clean === "index.md") {
    clean = "index.md";
  }
  if (!clean.endsWith(".md")) {
    clean = `${clean}.md`;
  }

  const hashRoute = clean === "index.md" ? "#/" : `#/${clean}`;
  const fetchPath = `./articles/${clean}`;

  if (typeof globalThis !== "undefined" && globalThis.location) {
    if (globalThis.location.hash !== hashRoute) {
      globalThis.location.hash = hashRoute;
    }
  }

  currentPath.value = hashRoute;
  viewMode.value = "preview";
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const t0 = performance.now();
    const doc = await mdFetch(fetchPath, io, config);
    const t1 = performance.now();
    parseTimeMs.value = Math.max(0.1, Number((t1 - t0).toFixed(1)));

    currentDoc.value = doc;
    document.title = `${doc.title} - mdBlog`;

    // Schedule selective island hydration
    setTimeout(() => {
      hydrateIslands();
    }, 50);
  } catch (err) {
    console.error(`[router] Error loading ${fetchPath}:`, err);
    errorMessage.value = err instanceof Error ? err.message : String(err);
  } finally {
    isLoading.value = false;
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

  // Carrega dinamicamente a lista de artigos do blog
  loadArticles().then(() => {
    // Se a rota atual não foi definida, vai para o primeiro artigo
    const hash = globalThis.location.hash;
    if (!hash && articles.value.length > 0 && articles.value[0]) {
      navigateTo(articles.value[0].path);
    }
  }).catch(() => {});

  function handleRoute() {
    const hash = globalThis.location.hash;
    if (hash) {
      navigateTo(hash);
    } else {
      navigateTo("index.md");
    }
  }

  globalThis.addEventListener("hashchange", handleRoute);

  // Check if first paint has pre-rendered wire in DOM
  const preRenderedScript = document.getElementById("__md_wire");
  if (preRenderedScript && preRenderedScript.textContent) {
    try {
      const doc = JSON.parse(preRenderedScript.textContent);
      currentDoc.value = doc;
      currentPath.value = doc.url || "#/README.md";
      document.title = `${doc.title} - mdBlog`;
      preRenderedScript.remove();
      setTimeout(() => {
        hydrateIslands();
      }, 50);
      return;
    } catch (err) {
      console.warn("[router] Failed to parse inline __md_wire script:", err);
    }
  }

  // Otherwise, perform initial fetch
  handleRoute();
}
