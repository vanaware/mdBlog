/**
 * Path detection, URL normalization, and environment utilities.
 */

/**
 * @description Checks whether the current window is actively controlled by a Service Worker.
 * @returns True if `navigator.serviceWorker.controller` exists.
 * @example
 * ```ts
 * import { isSWControlling } from "./detect.ts";
 * if (isSWControlling()) {
 *   console.log("Managed by Service Worker");
 * }
 * ```
 */
export function isSWControlling(): boolean {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  return Boolean(navigator.serviceWorker.controller);
}

/**
 * @description Computes canonical directory base URL respecting subfolders (e.g. GitHub Pages).
 * @returns Normalized base URL ending with a slash.
 * @example
 * ```ts
 * import { getAppBaseUrl } from "./detect.ts";
 * const base = getAppBaseUrl();
 * ```
 */
export function getAppBaseUrl(): string {
  if (typeof globalThis === "undefined" || !globalThis.location) return "./";
  const { origin, pathname } = globalThis.location;
  if (!origin || origin === "null") return "./";
  if (pathname.endsWith(".html")) {
    const dir = pathname.substring(0, pathname.lastIndexOf("/") + 1);
    return `${origin}${dir}`;
  }
  const dir = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${origin}${dir}`;
}

/**
 * @description Normalizes and resolves a documentation request path.
 * Maps clean paths like "/docs/guia" or "docs/guia" or "/docs/guia.md" to canonical ".md" paths.
 * Supports subfolder hosting on GitHub Pages (e.g. "/mdBlog/articles/guia.md").
 * @param urlOrPath - Raw request pathname or link URL.
 * @param basePath - Root articles folder relative path.
 * @returns Object with normalized docPath and boolean isDoc flag.
 * @example
 * ```ts
 * import { resolveDocPath } from "./detect.ts";
 * const { docPath, isDoc } = resolveDocPath("/articles/intro");
 * // docPath === "/articles/intro.md"
 * ```
 */
export function resolveDocPath(
  urlOrPath: string,
  basePath: string = "./articles",
): { docPath: string; isDoc: boolean } {
  let pathname = (urlOrPath || "").trim();
  if (pathname.includes("#")) {
    pathname = pathname.substring(pathname.indexOf("#") + 1);
  }
  pathname = pathname.replace(/\?.*$/, "");

  const cleanBase = basePath.replace(/^\.?\//, "").replace(/\/$/, "");

  // If path is root or empty
  if (
    pathname === "" || pathname === "/" || pathname === "./" ||
    pathname === `/${cleanBase}` || pathname === `${cleanBase}`
  ) {
    return { docPath: `/${cleanBase}/index.md`, isDoc: true };
  }

  // Check if it pertains to articles, docs, or ends with .md
  const isDoc = pathname.includes(`/${cleanBase}/`) ||
    pathname.startsWith(`${cleanBase}/`) ||
    pathname.startsWith(`./${cleanBase}/`) ||
    pathname.endsWith(`/${cleanBase}`) ||
    pathname.endsWith(`/${cleanBase}/`) ||
    pathname.includes("/docs/") ||
    pathname.startsWith("docs/") ||
    pathname.endsWith(".md");

  if (!isDoc) {
    return { docPath: pathname, isDoc: false };
  }

  let docPath = pathname;
  if (!docPath.endsWith(".md")) {
    if (
      docPath.endsWith(`/${cleanBase}`) || docPath.endsWith(`/${cleanBase}/`)
    ) {
      docPath = `${docPath.replace(/\/+$/, "")}/index.md`;
    } else {
      docPath = `${docPath}.md`;
    }
  }

  if (
    !docPath.includes(`/${cleanBase}`) &&
    !docPath.startsWith(`${cleanBase}`) &&
    !docPath.includes("/docs/")
  ) {
    docPath = `/${cleanBase}/${docPath.replace(/^\.?\//, "")}`;
  }

  if (!docPath.startsWith("/") && !docPath.startsWith("./")) {
    docPath = `/${docPath}`;
  }

  // Normalize duplicate slashes
  docPath = docPath.replace(/\/+/g, "/");

  return { docPath, isDoc: true };
}

/**
 * @description Generates a clean URL slug for heading anchors.
 * @param text - Plain heading text.
 * @returns Clean kebab-case slug string.
 * @example
 * ```ts
 * import { slugify } from "./detect.ts";
 * const slug = slugify("Seção de Configuração!");
 * // slug === "secao-de-configuracao"
 * ```
 */
export function slugify(text: string): string {

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
