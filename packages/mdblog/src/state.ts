import { computed, effect, type Signal, signal, } from "@preact/signals";
import type { WireDoc, } from "./plugin/wire.ts";
import { parseFrontmatter, } from "./plugin/core/frontmatter.ts";
import { get, set, } from "idb-keyval";
import { getAppBaseUrl, } from "./plugin/detect.ts";
import { TOC_RAIL_HEIGHT_TIERS, } from "./utils.ts";

/**
 * @description View rendering mode: rendered preview, AST wire tree JSON, or raw markdown.
 */
export type ViewMode = "preview" | "ast" | "raw";

/**
 * @description Article node representation in the hierarchical articles tree.
 */
export interface ArticleItem {
  /** @description Relative filename (e.g. "intro.md"). */
  name: string;
  /** @description URL slug for navigation. */
  slug: string;
  /** @description Relative document path (e.g. "./articles/intro.md"). */
  path: string;
  /** @description Document display title. */
  title: string;
  /** @description Semantic Material Symbols icon name. */
  icon: string;
  /** @description Optional badge text. */
  badge?: string;
  /** @description Document publication or update date. */
  date?: string;
  /** @description Document route location hash. */
  location?: string;
  /** @description Author name. */
  author?: string;
  /** @description Short description or summary. */
  description?: string;
  /** @description List of tags or categories. */
  tags?: string[];
  /** @description Hierarchical depth (0 = root/index.md, 1 = top level, 2 = subpages). */
  depth: number;
  /** @description Path of the parent document. */
  parentPath?: string;
  /** @description Nested sub-pages. */
  children?: ArticleItem[];
}

/**
 * @description Search index item for client-side search.
 */
export interface SearchDocItem {
  /** @description Document path. */
  path: string;
  /** @description Document title. */
  title: string;
  /** @description Document description. */
  description: string;
  /** @description Plain text content extracted for indexing. */
  content: string;
  /** @description Document tags. */
  tags: string[];
  /** @description Document icon. */
  icon: string;
  /** @description Optional badge text. */
  badge?: string;
  /** @description Nesting depth. */
  depth: number;
}

/**
 * @description Reactive signal holding the flattened list of all articles in pre-order.
 */
export const articles: Signal<ArticleItem[]> = signal<ArticleItem[]>([],);

/**
 * @description Reactive signal holding the hierarchical article tree starting from index.md.
 */
export const articleTree: Signal<ArticleItem[]> = signal<ArticleItem[]>([],);

/**
 * @description Reactive signal indicating whether article discovery is in progress.
 */
export const isArticlesLoading: Signal<boolean> = signal<boolean>(false,);

/**
 * @description Reactive signal holding search index items for SearchBox.
 */
export const searchDocs: Signal<SearchDocItem[]> = signal<SearchDocItem[]>([],);

/**
 * @description Reactive signal holding current active article route hash.
 */
export const currentPath: Signal<string> = signal<string>(
  "./articles/index.md",
);

/**
 * @description Reactive signal holding currently loaded and parsed WireDoc document.
 */
export const currentDoc: Signal<WireDoc | null> = signal<WireDoc | null>(null,);

/**
 * @description Reactive signal indicating whether a document is currently being loaded.
 */
export const isLoading: Signal<boolean> = signal<boolean>(true,);

/**
 * @description Reactive signal holding current error message string, or null if healthy.
 */
export const errorMessage: Signal<string | null> = signal<string | null>(null,);

/**
 * @description Reactive signal indicating whether browser is offline.
 */
export const isOffline: Signal<boolean> = signal<boolean>(
  typeof navigator !== "undefined" ? !navigator.onLine : false,
);

/**
 * @description Reactive signal indicating whether Service Worker is actively controlling page.
 */
export const isSWActive: Signal<boolean> = signal<boolean>(false,);

/**
 * @description Minimum viewport width (CSS pixels) of the inline layout: from it on, the sidebar and the table of contents get columns that reserve their own space, and only below it do they open as modal panels. It matches BeerCSS's `l` breakpoint.
 */
export const WIDE_SCREEN_MIN_PX = 993;

/**
 * @description localStorage key holding the user's sidebar open/closed preference.
 */
const SIDEBAR_STORAGE_KEY = "mdblog-sidebar";

/**
 * Reads the persisted sidebar preference. The preference only applies to wide screens: on narrow ones the drawer is a transient modal and must always start closed.
 */
function readSidebarPreference(): boolean {
  if (
    typeof window !== "undefined" &&
    window.innerWidth < WIDE_SCREEN_MIN_PX
  ) return false;
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY,);
      if (stored === "open") return true;
      if (stored === "closed") return false;
    }
  } catch {
    // Storage unavailable: falls back to the default derived from the width
  }
  return true;
}

/**
 * @description Reactive signal controlling sidebar drawer visibility on every breakpoint (persisted in localStorage).
 */
export const sidebarOpen: Signal<boolean> = signal<boolean>(
  readSidebarPreference(),
);

/**
 * @description Reactive signal tracking whether the viewport is wide (at least `WIDE_SCREEN_MIN_PX`), used to switch the sidebar and the summary between inline columns and modal panels.
 */
export const isWideScreen: Signal<boolean> = signal<boolean>(
  typeof window !== "undefined"
    ? window.innerWidth >= WIDE_SCREEN_MIN_PX
    : true,
);

/**
 * @description Viewport height in CSS pixels, kept current on resize. The table of contents rail takes its scrollable height from it, so the scrollbar shows up as soon as the entries no longer fit the screen however many of them there are.
 */
export const viewportHeight: Signal<number> = signal<number>(
  typeof window !== "undefined" ? window.innerHeight : 0,
);

/**
 * @description Reactive signal controlling the search dialog. The dialog is a modal at every breakpoint, which is why its state lives here instead of inside the component: the page behind it must stop scrolling.
 */
export const searchOpen: Signal<boolean> = signal<boolean>(false,);

/**
 * @description Query typed into the search dialog. It is global for one reason: the keyboard shortcuts are registered once at the module level, outside the component tree, and `Escape` has to both dismiss the panel and discard what was typed so the next opening starts clean.
 */
export const searchQuery: Signal<string> = signal<string>("",);

/**
 * @description Opens the search dialog. The only entry point a caller needs: nothing outside the component (icon button, focused field, `Ctrl/Cmd+K`) should have to remember to reset the query on the way in.
 */
export function openSearch(): void {
  searchOpen.value = true;
}

/**
 * @description Dismisses the search dialog and discards its query.
 */
export function closeSearch(): void {
  searchOpen.value = false;
  searchQuery.value = "";
}

/**
 * @description Document that asked for the narrow-screen summary panel, or null when nobody did. Keeping the *request* (a path) rather than a boolean is what makes the open state below purely derived: a new document invalidates the old request on its own, without any effect having to write it back to false.
 */
const tocPanelRequest: Signal<string | null> = signal<string | null>(null,);

/**
 * @description Whether the narrow-screen table of contents modal is on screen. Derived, never written: it holds only while the requesting document is still the one being read and the viewport is narrow, so navigating away or widening the window closes the panel by itself. On wide screens the summary is the inline `tocRailOpen` column instead.
 */
export const tocModalOpen: Signal<boolean> = computed(
  () =>
    tocPanelRequest.value !== null &&
    tocPanelRequest.value === currentPath.value &&
    !isWideScreen.value,
);

/**
 * @description Toggles the narrow-screen summary panel for the document currently on screen.
 */
export function toggleTocModal(): void {
  tocPanelRequest.value = tocModalOpen.value ? null : currentPath.value;
}

/**
 * @description Closes the narrow-screen summary panel, forgetting which document asked for it.
 */
export function closeTocModal(): void {
  tocPanelRequest.value = null;
}

/**
 * @description localStorage key holding the user's table of contents rail open/closed preference.
 */
const TOC_STORAGE_KEY = "mdblog-toc";

/**
 * Reads the persisted table of contents preference. Open by default: the rail only occupies a column on wide screens, so a stored "open" can never cover content on narrow ones.
 */
function readTocPreference(): boolean {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(TOC_STORAGE_KEY,) !== "closed";
    }
  } catch {
    // Storage unavailable: falls back to the open default
  }
  return true;
}

/**
 * @description Reactive signal controlling the inline table of contents rail column on wide screens (persisted in localStorage). On narrow screens the summary is a transient modal driven by local state instead.
 */
export const tocRailOpen: Signal<boolean> = signal<boolean>(
  readTocPreference(),
);

/**
 * @description Reactive signal tracking document parse time in milliseconds.
 */
export const parseTimeMs: Signal<number> = signal<number>(0,);

/**
 * @description Reactive signal controlling document view mode (preview, ast, raw).
 */
export const viewMode: Signal<ViewMode> = signal<ViewMode>("preview",);

/**
 * Assigns a semantic icon based on the article name or title.
 */
function inferArticleIcon(slug: string, title: string,): string {
  // The keyword table keeps the Portuguese terms next to their English
  // equivalents: the engine is language agnostic, so an article tree written in
  // Portuguese has to get the same icons as one written in English. The slug is
  // part of what is matched here, which is why the shipped articles use English
  // slugs.
  const combined = `${slug} ${title}`.toLowerCase();
  if (
    combined.includes("index",) || combined.includes("home",) ||
    combined.includes("início",) || combined.includes("start",)
  ) return "home";
  if (combined.includes("readme",) || combined.includes("overview",)) {
    return "article";
  }
  if (
    combined.includes("guia",) || combined.includes("guide",) ||
    combined.includes("demo",) || combined.includes("pratico",)
  ) return "science";
  if (
    combined.includes("html",) || combined.includes("migracao",) ||
    combined.includes("migration",) || combined.includes("code",)
  ) return "code";
  if (
    combined.includes("wire",) || combined.includes("ast",) ||
    combined.includes("spec",) || combined.includes("schema",)
  ) return "schema";
  if (combined.includes("island",) || combined.includes("ilha",)) {
    return "widgets";
  }
  if (
    combined.includes("fluxo",) || combined.includes("flow",) ||
    combined.includes("ciclo",) || combined.includes("vida",)
  ) return "sync";
  if (
    combined.includes("plano",) || combined.includes("plan",) ||
    combined.includes("desenvolvimento",) || combined.includes("roadmap",)
  ) {
    return "checklist";
  }
  return "description";
}

/**
 * Extracts the main heading (# Title) of a Markdown text in the browser.
 */
function extractTitleFromMarkdown(text: string, fallbackName: string,): string {
  const lines = text.split("\n",);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ",)) {
      return trimmed.replace(/^#\s+/, "",).trim();
    }
  }
  return fallbackName.replace(/\.md$/, "",);
}

/**
 * @description Removes markdown syntax and code blocks to produce clean plain text for search indexing.
 * @param markdownBody - Markdown string to strip.
 * @returns Cleaned plain text string.
 * @example
 * ```ts
 * import { cleanMarkdownText } from "./state.ts";
 * const plain = cleanMarkdownText("# Heading\n\n**bold** and [link](url)");
 * ```
 */
export function cleanMarkdownText(markdownBody: string,): string {
  if (!markdownBody) return "";
  return markdownBody
    .replace(/^#+\s+/gm, " ",)
    .replace(/```[\s\S]*?```/g, " ",)
    .replace(/`([^`]+)`/g, "$1",)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1",)
    .replace(/[*_~`#>-]/g, " ",)
    .replace(/\s+/g, " ",)
    .trim();
}

/**
 * @description Flattens a hierarchical article tree into a sequential list in pre-order.
 * @param items - Hierarchical list of ArticleItems.
 * @returns Flattened array of ArticleItems preserving depth and parentPath.
 * @example
 * ```ts
 * import { flattenArticles } from "./state.ts";
 * const flat = flattenArticles(articleTree.value);
 * ```
 */
export function flattenArticles(items: ArticleItem[],): ArticleItem[] {
  const flattened: ArticleItem[] = [];
  function traverse(node: ArticleItem,) {
    flattened.push(node,);
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child,);
      }
    }
  }
  for (const item of items) {
    traverse(item,);
  }
  return flattened;
}

/**
 * Loads a page and its sub-pages recursively, from each page's frontmatter.
 */
async function loadPageRecursive(
  rawItem: any,
  depth: number,
  parentPath: string,
  visited: Set<string>,
  searchAccumulator: SearchDocItem[],
): Promise<ArticleItem | null> {
  const cleanName = typeof rawItem === "string"
    ? rawItem.trim()
    : (rawItem?.path || "").trim();
  const normalized = cleanName.replace(/^\.?\//, "",);
  if (!normalized || visited.has(normalized,)) return null;
  visited.add(normalized,);

  try {
    const baseUrl = getAppBaseUrl();
    let pageText = "";
    try {
      const res = await fetch(`${baseUrl}articles/${normalized}?_md_raw=1`,);
      if (res.ok) {
        pageText = await res.text();
      } else {
        const res2 = await fetch(`${baseUrl}articles/${normalized}`,);
        if (res2.ok) pageText = await res2.text();
      }
    } catch {
      // offline or network failure
    }

    const { frontmatter: pageFm, body: pageBody, } = parseFrontmatter(
      pageText,
    );
    const slug = normalized.replace(/\.md$/, "",);
    const title = pageFm.title ||
      extractTitleFromMarkdown(pageText, normalized,);
    const icon = pageFm.icon || inferArticleIcon(slug, title,);
    const itemPath = `./articles/${normalized}`;

    const item: ArticleItem = {
      name: normalized,
      slug,
      path: itemPath,
      title,
      icon,
      badge: pageFm.badge,
      date: pageFm.date,
      location: pageFm.location || `#/articles/${normalized}`,
      author: pageFm.author,
      description: pageFm.description,
      tags: Array.isArray(pageFm.tags,)
        ? pageFm.tags
        : (pageFm.tag ? [pageFm.tag,] : []),
      depth,
      parentPath,
      children: [],
    };

    // Fills the search entry that later goes to IndexedDB
    searchAccumulator.push({
      path: itemPath,
      title,
      description: pageFm.description || "",
      content: cleanMarkdownText(pageBody,),
      tags: item.tags || [],
      icon,
      badge: pageFm.badge,
      depth,
    },);

    // Accepts 'pages', 'articles' or 'subpages' in the page's own frontmatter
    const subPagesRaw = pageFm.pages || pageFm.articles || pageFm.subpages;
    if (Array.isArray(subPagesRaw,) && subPagesRaw.length > 0) {
      const children: ArticleItem[] = [];
      for (const subItem of subPagesRaw) {
        const childNode = await loadPageRecursive(
          subItem,
          depth + 1,
          itemPath,
          visited,
          searchAccumulator,
        );
        if (childNode) {
          children.push(childNode,);
        }
      }
      item.children = children;
    }

    return item;
  } catch (err) {
    console.warn(`[state] Failed to process page ${normalized}:`, err,);
    const slug = normalized.replace(/\.md$/, "",);
    return {
      name: normalized,
      slug,
      path: `./articles/${normalized}`,
      title: cleanName,
      icon: inferArticleIcon(slug, cleanName,),
      depth,
      parentPath,
      children: [],
    };
  }
}

/**
 * @description Fills `searchDocs` from the index previously persisted in IndexedDB, if there is one. Used as the offline path and as a safety net whenever discovery produces nothing searchable.
 * @returns Resolves once the store has been read (or failed to be read).
 * @example
 * ```ts
 * import { restoreSearchIndexFromCache } from "./state.ts";
 * await restoreSearchIndexFromCache();
 * ```
 */
export async function restoreSearchIndexFromCache(): Promise<void> {
  try {
    const cached = await get<SearchDocItem[]>("mdblog-search-index",);
    if (Array.isArray(cached,) && cached.length > 0) {
      searchDocs.value = cached;
    }
  } catch {
    // Storage unavailable: search simply has nothing to filter yet
  }
}

/**
 * @description Dynamically loads and discovers all articles starting from index.md frontmatter.

 * Recursively parses sub-page trees and updates both `articleTree` and `articles` signals.
 * @returns Resolves to the discovered flattened articles list.
 * @example
 * ```ts
 * import { loadArticles } from "./state.ts";
 * await loadArticles();
 * ```
 */
export async function loadArticles(): Promise<ArticleItem[]> {
  isArticlesLoading.value = true;

  try {
    // 1. Load index.md and parse its frontmatter
    const baseUrl = getAppBaseUrl();
    let indexRaw: string | null = null;
    try {
      const res = await fetch(`${baseUrl}articles/index.md?_md_raw=1`,);
      if (res.ok) {
        indexRaw = await res.text();
      } else {
        const res2 = await fetch(`${baseUrl}articles/index.md`,);
        if (res2.ok) indexRaw = await res2.text();
      }
    } catch {
      // offline or network error
    }

    if (indexRaw) {
      const { frontmatter, body, } = parseFrontmatter(indexRaw,);
      const pagesList: any[] = frontmatter.pages || frontmatter.articles ||
        frontmatter.subpages;

      const visited = new Set<string>(["index.md",],);
      const searchAccumulator: SearchDocItem[] = [];

      // Home page, built from index.md itself (depth: 0)
      const indexItem: ArticleItem = {
        name: "index.md",
        slug: "index",
        path: "./articles/index.md",
        title: frontmatter.title || "Home page",
        icon: "home",
        date: frontmatter.date,
        location: frontmatter.location || "#/articles/index.md",
        author: frontmatter.author,
        description: frontmatter.description,
        tags: Array.isArray(frontmatter.tags,) ? frontmatter.tags : [],
        depth: 0,
        children: [],
      };

      // Adds index.md to the search index
      searchAccumulator.push({
        path: "./articles/index.md",
        title: frontmatter.title || "Home page",
        description: frontmatter.description || "",
        content: cleanMarkdownText(body,),
        tags: Array.isArray(frontmatter.tags,) ? frontmatter.tags : [],
        icon: "home",
        depth: 0,
      },);

      // Recursively loads each child page declared in the frontmatter
      if (Array.isArray(pagesList,) && pagesList.length > 0) {
        const childNodes: ArticleItem[] = [];
        for (const item of pagesList) {
          const node = await loadPageRecursive(
            item,
            1,
            "./articles/index.md",
            visited,
            searchAccumulator,
          );
          if (node) {
            childNodes.push(node,);
          }
        }
        indexItem.children = childNodes;
      }

      const tree = [indexItem,];
      const flattened = flattenArticles(tree,);

      articleTree.value = tree;
      articles.value = flattened;
      searchDocs.value = searchAccumulator;

      // Persists the cache to IndexedDB through idb-keyval
      try {
        await set("browser-articles-cache", flattened,);
        await set("mdblog-search-index", searchAccumulator,);
      } catch {
        // non-fatal
      }

      return articles.value;
    }

    // 2. Offline fallback: read the cache stored in IndexedDB (idb-keyval)
    try {
      const cached = await get<ArticleItem[]>("browser-articles-cache",);
      if (cached && Array.isArray(cached,) && cached.length > 0) {
        articles.value = cached;
      }
      if (articles.value.length > 0) {
        return articles.value;
      }
    } catch {
      // ignored
    }

    return articles.value;
  } finally {
    isArticlesLoading.value = false;
    // Whatever the outcome — online discovery, offline cache, a failed listing —
    // an empty index is the one thing the search dialog cannot work with, so the
    // persisted copy is the last source tried. It belongs here rather than in a
    // mount effect of the component: the dialog is created on demand and may be
    // opened by a shortcut long before, or never, the panel is on screen.
    if (searchDocs.value.length === 0) await restoreSearchIndexFromCache();
  }
}

if (typeof window !== "undefined") {
  globalThis.addEventListener("online", () => {
    isOffline.value = false;
    loadArticles().catch(() => {},);
  },);
  globalThis.addEventListener("offline", () => {
    isOffline.value = true;
  },);

  // Keyboard shortcuts live next to the state they drive. `Ctrl/Cmd+K` opens the
  // dialog and `Escape` dismisses it together with its query, so the handler has
  // to reach a signal the component does not own any more; registering it here
  // also means the shortcut works whether or not the panel is mounted, which a
  // component effect could only guarantee while SearchBox happened to be on
  // screen.
  globalThis.addEventListener("keydown", (e: KeyboardEvent,) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    } else if (e.key === "Escape" && searchOpen.value) {
      closeSearch();
    }
  },);

  // Keeps the viewport-derived signals in step with the layout. `resize` alone
  // is not reliable: some viewport changes (browser zoom, an iframe reflow, a
  // mobile URL bar collapsing) reach it late or not at all, whereas a
  // media-query change always fires when a breakpoint is crossed. Watching the
  // very thresholds the UI acts on — the inline/overlay switch and the rail
  // height tiers — and then re-reading the live metrics is therefore both
  // cheaper and steadier than tracking every pixel of every resize.
  const syncViewport = (): void => {
    isWideScreen.value = window.innerWidth >= WIDE_SCREEN_MIN_PX;
    viewportHeight.value = window.innerHeight;
  };

  globalThis.addEventListener("resize", syncViewport,);

  if (typeof window.matchMedia === "function") {
    const watched = [
      `(min-width: ${WIDE_SCREEN_MIN_PX}px)`,
      ...TOC_RAIL_HEIGHT_TIERS.filter((tier,) => tier.minViewportPx > 0).map(
        (tier,) => `(min-height: ${tier.minViewportPx}px)`,
      ),
    ];
    for (const query of watched) {
      window.matchMedia(query,).addEventListener("change", syncViewport,);
    }
  }

  if (typeof document !== "undefined") {
    effect(() => {
      // Persists the table of contents column preference. It is stored at every
      // width: on narrow screens the panel uses its own state and never reads
      // this signal, so a stored "open" can never cover the content.
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(
            TOC_STORAGE_KEY,
            tocRailOpen.value ? "open" : "closed",
          );
        }
      } catch {
        // Persistence unavailable: stays in memory only
      }
    },);

    effect(() => {
      // Persists the sidebar open/closed preference, but only on wide screens:
      // on narrow ones the drawer is a transient modal and must not reappear
      // open on the next load.
      const wide = isWideScreen.value;
      try {
        if (typeof localStorage !== "undefined") {
          if (!wide) {
            localStorage.removeItem(SIDEBAR_STORAGE_KEY,);
          } else {
            localStorage.setItem(
              SIDEBAR_STORAGE_KEY,
              sidebarOpen.value ? "open" : "closed",
            );
          }
        }
      } catch {
        // Persistence unavailable: stays in memory only
      }
    },);

    effect(() => {
      // Locks the background scroll while a modal panel is on screen, so that
      // the wheel and the touch drag act on the opened panel alone. Only the
      // genuinely modal panels qualify: on wide screens the sidebar and the
      // summary are inline columns that reserve their own space, and the search
      // dialog is modal at every width. Each panel owns its own scroll area
      // (`.scroll` plus the full-height dialog), so nothing inside gets stuck.
      // The class goes on the root element as well: `overflow:hidden` on the
      // body only reaches the viewport through the browser's body-to-root
      // propagation rule, and pinning `html` makes the lock independent of it.
      const narrow = !isWideScreen.value;
      const modalShowing = searchOpen.value ||
        (narrow && (sidebarOpen.value || tocModalOpen.value));
      document.body.classList.toggle("no-scroll", modalShowing,);
      document.documentElement.classList.toggle("no-scroll", modalShowing,);
    },);

    effect(() => {
      // One transient panel at a time. Two stacked dialogs would double the
      // backdrop and fight over the scroll lock, so opening search dismisses
      // whatever narrow-screen panel is up. On wide screens the sidebar is a
      // permanent column, hence left alone.
      if (!searchOpen.value) return;
      closeTocModal();
      if (!isWideScreen.value) sidebarOpen.value = false;
    },);
  }
}
