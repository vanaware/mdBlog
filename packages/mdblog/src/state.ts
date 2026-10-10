import { effect, signal } from "@preact/signals";
import type { WireDoc } from "./plugin/wire.ts";
import { parseFrontmatter } from "./plugin/core/frontmatter.ts";
import { get, set } from "idb-keyval";
import { getAppBaseUrl } from "./plugin/detect.ts";

export type ViewMode = "preview" | "ast" | "raw";

export interface ArticleItem {
  name: string;
  slug: string;
  path: string;
  title: string;
  icon: string;
  badge?: string;
  date?: string;
  location?: string;
  author?: string;
  description?: string;
  tags?: string[];
  depth: number; // 0 = root/index, 1 = páginas de primeiro nível, 2 = sub-páginas, 3 = sub-sub-páginas...
  parentPath?: string; // Caminho da página pai
  children?: ArticleItem[]; // Sub-páginas diretas
}

export interface SearchDocItem {
  path: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  icon: string;
  badge?: string;
  depth: number;
}

// O estado inicial começa vazio - gerado dinamicamente no browser via index.md frontmatter recursivamente
export const articles = signal<ArticleItem[]>([]);
export const articleTree = signal<ArticleItem[]>([]);
export const isArticlesLoading = signal<boolean>(false);

// Índice de busca dinâmico populado a partir de index.md e sub-páginas recorrentemente
export const searchDocs = signal<SearchDocItem[]>([]);

export const currentPath = signal<string>("./articles/index.md");
export const currentDoc = signal<WireDoc | null>(null);
export const isLoading = signal<boolean>(true);
export const errorMessage = signal<string | null>(null);
export const isOffline = signal<boolean>(
  typeof navigator !== "undefined" ? !navigator.onLine : false,
);
export const isSWActive = signal<boolean>(false);
export const sidebarOpen = signal<boolean>(false);
export const parseTimeMs = signal<number>(0);
export const viewMode = signal<ViewMode>("preview");

/**
 * Atribui ícone semântico baseado no nome ou conteúdo do artigo.
 */
function inferArticleIcon(slug: string, title: string): string {
  const combined = `${slug} ${title}`.toLowerCase();
  if (
    combined.includes("index") || combined.includes("home") ||
    combined.includes("início")
  ) return "home";
  if (combined.includes("readme")) return "article";
  if (
    combined.includes("guia") || combined.includes("demo") ||
    combined.includes("pratico")
  ) return "science";
  if (
    combined.includes("html") || combined.includes("migracao") ||
    combined.includes("code")
  ) return "code";
  if (
    combined.includes("wire") || combined.includes("ast") ||
    combined.includes("spec") || combined.includes("schema")
  ) return "schema";
  if (combined.includes("island") || combined.includes("ilha")) {
    return "widgets";
  }
  if (
    combined.includes("fluxo") || combined.includes("ciclo") ||
    combined.includes("vida")
  ) return "sync";
  if (combined.includes("plano") || combined.includes("desenvolvimento")) {
    return "checklist";
  }
  return "description";
}

/**
 * Extrai o título principal de um texto Markdown (# Título) no browser.
 */
function extractTitleFromMarkdown(text: string, fallbackName: string): string {
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      return trimmed.replace(/^#\s+/, "").trim();
    }
  }
  return fallbackName.replace(/\.md$/, "");
}

/**
 * Remove sintaxe markdown para obter texto puro indexável em mecanismos de busca.
 */
export function cleanMarkdownText(markdownBody: string): string {
  if (!markdownBody) return "";
  return markdownBody
    .replace(/^#+\s+/gm, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~`#>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Achata a árvore hierárquica em uma lista sequencial em pré-ordem (preservando depth e parentPath).
 */
export function flattenArticles(items: ArticleItem[]): ArticleItem[] {
  const flattened: ArticleItem[] = [];
  function traverse(node: ArticleItem) {
    flattened.push(node);
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
  for (const item of items) {
    traverse(item);
  }
  return flattened;
}

/**
 * Carrega recursivamente uma página e suas sub-páginas a partir do frontmatter de cada uma,
 * populando simultaneamente a árvore de artigos e a lista de itens para indexação de busca.
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
  const normalized = cleanName.replace(/^\.?\//, "");
  if (!normalized || visited.has(normalized)) return null;
  visited.add(normalized);

  try {
    const baseUrl = getAppBaseUrl();
    let pageText = "";
    try {
      const res = await fetch(`${baseUrl}articles/${normalized}?_md_raw=1`);
      if (res.ok) {
        pageText = await res.text();
      } else {
        const res2 = await fetch(`${baseUrl}articles/${normalized}`);
        if (res2.ok) pageText = await res2.text();
      }
    } catch {
      // offline ou falha de rede
    }

    const { frontmatter: pageFm, body: pageBody } = parseFrontmatter(pageText);
    const slug = normalized.replace(/\.md$/, "");
    const title = pageFm.title ||
      extractTitleFromMarkdown(pageText, normalized);
    const icon = pageFm.icon || inferArticleIcon(slug, title);
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
      tags: Array.isArray(pageFm.tags)
        ? pageFm.tags
        : (pageFm.tag ? [pageFm.tag] : []),
      depth,
      parentPath,
      children: [],
    };

    // Popula item de busca para o IndexedDB
    searchAccumulator.push({
      path: itemPath,
      title,
      description: pageFm.description || "",
      content: cleanMarkdownText(pageBody),
      tags: item.tags || [],
      icon,
      badge: pageFm.badge,
      depth,
    });

    // Suporta 'pages', 'articles' ou 'subpages' no frontmatter da própria página recursivamente
    const subPagesRaw = pageFm.pages || pageFm.articles || pageFm.subpages;
    if (Array.isArray(subPagesRaw) && subPagesRaw.length > 0) {
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
          children.push(childNode);
        }
      }
      item.children = children;
    }

    return item;
  } catch (err) {
    console.warn(`[state] Falha ao processar página ${normalized}:`, err);
    const slug = normalized.replace(/\.md$/, "");
    return {
      name: normalized,
      slug,
      path: `./articles/${normalized}`,
      title: cleanName,
      icon: inferArticleIcon(slug, cleanName),
      depth,
      parentPath,
      children: [],
    };
  }
}

/**
 * GERAÇÃO DINÂMICA RECURSIVA NO BROWSER:
 * 1. Procura exclusivamente o arquivo ./articles/index.md como raiz (depth: 0).
 * 2. Lê seu frontmatter YAML contendo a lista recursiva de sub-páginas ('pages').
 * 3. Para cada página, lê recursivamente seu frontmatter e descobre sub-páginas sucessivamente.
 * 4. Popula simultaneamente o IndexedDB (via idb-keyval) com os dados para busca do SearchBox.
 * 5. Sem dependência de fallback estático (articles.json ou articles/index.html removidos).
 */
export async function loadArticles(): Promise<ArticleItem[]> {
  isArticlesLoading.value = true;

  try {
    // 1. Carrega o index.md e analisa seu frontmatter
    const baseUrl = getAppBaseUrl();
    let indexRaw: string | null = null;
    try {
      const res = await fetch(`${baseUrl}articles/index.md?_md_raw=1`);
      if (res.ok) {
        indexRaw = await res.text();
      } else {
        const res2 = await fetch(`${baseUrl}articles/index.md`);
        if (res2.ok) indexRaw = await res2.text();
      }
    } catch {
      // offline ou erro de rede
    }

    if (indexRaw) {
      const { frontmatter, body } = parseFrontmatter(indexRaw);
      const pagesList: any[] = frontmatter.pages || frontmatter.articles ||
        frontmatter.subpages;

      const visited = new Set<string>(["index.md"]);
      const searchAccumulator: SearchDocItem[] = [];

      // Página Inicial (Home) a partir do próprio index.md (depth: 0)
      const indexItem: ArticleItem = {
        name: "index.md",
        slug: "index",
        path: "./articles/index.md",
        title: frontmatter.title
          ? `🏠 ${frontmatter.title.split("-")[0].trim()}`
          : "🏠 Página Inicial",
        icon: "home",
        badge: "Home",
        date: frontmatter.date,
        location: frontmatter.location || "#/articles/index.md",
        author: frontmatter.author,
        description: frontmatter.description,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        depth: 0,
        children: [],
      };

      // Adiciona o index.md ao índice de busca
      searchAccumulator.push({
        path: "./articles/index.md",
        title: frontmatter.title || "Página Inicial",
        description: frontmatter.description || "",
        content: cleanMarkdownText(body),
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        icon: "home",
        badge: "Home",
        depth: 0,
      });

      // Carrega recursivamente cada página filha declarada no frontmatter
      if (Array.isArray(pagesList) && pagesList.length > 0) {
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
            childNodes.push(node);
          }
        }
        indexItem.children = childNodes;
      }

      const tree = [indexItem];
      const flattened = flattenArticles(tree);

      articleTree.value = tree;
      articles.value = flattened;
      searchDocs.value = searchAccumulator;

      // Persiste cache no IndexedDB via idb-keyval
      try {
        await set("browser-articles-cache", flattened);
        await set("mdblog-search-index", searchAccumulator);
      } catch {
        // non-fatal
      }

      return articles.value;
    }

    // 2. Fallback offline: busca cache salvo no IndexedDB (idb-keyval)
    try {
      const cached = await get<ArticleItem[]>("browser-articles-cache");
      if (cached && Array.isArray(cached) && cached.length > 0) {
        articles.value = cached;
      }
      const cachedSearch = await get<SearchDocItem[]>("mdblog-search-index");
      if (cachedSearch && Array.isArray(cachedSearch) && cachedSearch.length > 0) {
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
    loadArticles().catch(() => {});
  });
  globalThis.addEventListener("offline", () => {
    isOffline.value = true;
  });

  if (typeof document !== "undefined") {
    effect(() => {
      // Trava rolagem do fundo (body) quando o menu lateral estiver aberto no mobile
      if (sidebarOpen.value && window.innerWidth < 992) {
        document.body.classList.add("no-scroll");
      } else {
        document.body.classList.remove("no-scroll");
      }
    });
  }
}
