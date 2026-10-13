import { effect, type Signal, signal, } from "@preact/signals";
import type { WireDoc, } from "./plugin/wire.ts";
import { parseFrontmatter, } from "./plugin/core/frontmatter.ts";
import { get, set, } from "idb-keyval";
import { getAppBaseUrl, } from "./plugin/detect.ts";

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
 * @description localStorage key holding the user's sidebar open/closed preference.
 */
const SIDEBAR_STORAGE_KEY = "mdblog-sidebar";

/**
 * Reads the persisted sidebar preference. The preference only applies to wide screens: on narrow ones the drawer is a transient modal and must always start closed.
 */
function readSidebarPreference(): boolean {
  if (typeof window !== "undefined" && window.innerWidth < 993) return false;
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY,);
      if (stored === "open") return true;
      if (stored === "closed") return false;
    }
  } catch {
    // Storage indisponível: usa padrão derivado da largura da janela
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
 * @description Reactive signal tracking whether the viewport is wide (>= 993px), used to switch the sidebar between inline and overlay modes.
 */
export const isWideScreen: Signal<boolean> = signal<boolean>(
  typeof window !== "undefined" ? window.innerWidth >= 993 : true,
);

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
    // Storage indisponível: usa o padrão aberto
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
 * Atribui ícone semântico baseado no nome ou conteúdo do artigo.
 */
function inferArticleIcon(slug: string, title: string,): string {
  const combined = `${slug} ${title}`.toLowerCase();
  if (
    combined.includes("index",) || combined.includes("home",) ||
    combined.includes("início",)
  ) return "home";
  if (combined.includes("readme",)) return "article";
  if (
    combined.includes("guia",) || combined.includes("demo",) ||
    combined.includes("pratico",)
  ) return "science";
  if (
    combined.includes("html",) || combined.includes("migracao",) ||
    combined.includes("code",)
  ) return "code";
  if (
    combined.includes("wire",) || combined.includes("ast",) ||
    combined.includes("spec",) || combined.includes("schema",)
  ) return "schema";
  if (combined.includes("island",) || combined.includes("ilha",)) {
    return "widgets";
  }
  if (
    combined.includes("fluxo",) || combined.includes("ciclo",) ||
    combined.includes("vida",)
  ) return "sync";
  if (combined.includes("plano",) || combined.includes("desenvolvimento",)) {
    return "checklist";
  }
  return "description";
}

/**
 * Extrai o título principal de um texto Markdown (# Título) no browser.
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
 * Carrega recursivamente uma página e suas sub-páginas a partir do frontmatter de cada uma.
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
      // offline ou falha de rede
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

    // Popula item de busca para o IndexedDB
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

    // Suporta 'pages', 'articles' ou 'subpages' no frontmatter da própria página recursivamente
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
    console.warn(`[state] Falha ao processar página ${normalized}:`, err,);
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
    // 1. Carrega o index.md e analisa seu frontmatter
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
      // offline ou erro de rede
    }

    if (indexRaw) {
      const { frontmatter, body, } = parseFrontmatter(indexRaw,);
      const pagesList: any[] = frontmatter.pages || frontmatter.articles ||
        frontmatter.subpages;

      const visited = new Set<string>(["index.md",],);
      const searchAccumulator: SearchDocItem[] = [];

      // Página Inicial (Home) a partir do próprio index.md (depth: 0)
      const indexItem: ArticleItem = {
        name: "index.md",
        slug: "index",
        path: "./articles/index.md",
        title: frontmatter.title || "Página Inicial",
        icon: "home",
        date: frontmatter.date,
        location: frontmatter.location || "#/articles/index.md",
        author: frontmatter.author,
        description: frontmatter.description,
        tags: Array.isArray(frontmatter.tags,) ? frontmatter.tags : [],
        depth: 0,
        children: [],
      };

      // Adiciona o index.md ao índice de busca
      searchAccumulator.push({
        path: "./articles/index.md",
        title: frontmatter.title || "Página Inicial",
        description: frontmatter.description || "",
        content: cleanMarkdownText(body,),
        tags: Array.isArray(frontmatter.tags,) ? frontmatter.tags : [],
        icon: "home",
        depth: 0,
      },);

      // Carrega recursivamente cada página filha declarada no frontmatter
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

      // Persiste cache no IndexedDB via idb-keyval
      try {
        await set("browser-articles-cache", flattened,);
        await set("mdblog-search-index", searchAccumulator,);
      } catch {
        // non-fatal
      }

      return articles.value;
    }

    // 2. Fallback offline: busca cache salvo no IndexedDB (idb-keyval)
    try {
      const cached = await get<ArticleItem[]>("browser-articles-cache",);
      if (cached && Array.isArray(cached,) && cached.length > 0) {
        articles.value = cached;
      }
      const cachedSearch = await get<SearchDocItem[]>("mdblog-search-index",);
      if (
        cachedSearch && Array.isArray(cachedSearch,) && cachedSearch.length > 0
      ) {
        searchDocs.value = cachedSearch;
      }
      if (articles.value.length > 0) {
        return articles.value;
      }
    } catch {
      // ignora
    }

    return articles.value;
  } finally {
    isArticlesLoading.value = false;
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

  globalThis.addEventListener("resize", () => {
    isWideScreen.value = window.innerWidth >= 993;
  },);

  if (typeof document !== "undefined") {
    effect(() => {
      // Persiste a preferência da coluna de sumário. Guarda em qualquer
      // largura: em telas estreitas o painel usa estado local e nunca lê este
      // signal, logo um "open" guardado não cobre o conteúdo.
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(
            TOC_STORAGE_KEY,
            tocRailOpen.value ? "open" : "closed",
          );
        }
      } catch {
        // Persistência indisponível: mantém apenas em memória
      }
    },);

    effect(() => {
      // Persiste a preferência de abertura do menu lateral, mas somente em
      // telas largas: em telas estreitas a gaveta é um modal transitório e não
      // deve reaparecer aberta no próximo carregamento.
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
        // Persistência indisponível: mantém apenas em memória
      }
    },);

    effect(() => {
      // Trava rolagem do fundo (body) quando o menu lateral estiver aberto no mobile
      if (sidebarOpen.value && !isWideScreen.value) {
        document.body.classList.add("no-scroll",);
      } else {
        document.body.classList.remove("no-scroll",);
      }
    },);
  }
}
