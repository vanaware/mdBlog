/**
 * Path detection, URL normalization, and environment utilities.
 */

/**
 * Checks whether the current window is actively controlled by a Service Worker.
 */
export function isSWControlling(): boolean {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  return Boolean(navigator.serviceWorker.controller);
}

/**
 * Computes canonical directory base URL respecting subfolders (e.g. GitHub Pages).
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
 * Normalizes and resolves a documentation request path.
 * Maps clean paths like "/docs/guia" or "docs/guia" or "/docs/guia.md" to canonical ".md" paths.
 * Supports subfolder hosting on GitHub Pages (e.g. "/mdBlog/articles/guia.md").
 */
export function resolveDocPath(
  urlOrPath: string,
  basePath: string = "./articles",
): { docPath: string; isDoc: boolean } {
  let pathname = urlOrPath;
  try {
    const parsed = new URL(urlOrPath, "http://localhost");
    pathname = parsed.pathname;
  } catch {
    // Relative path or raw string
  }

  // Remove trailing slashes and hash
  pathname = pathname.replace(/#.*$/, "").replace(/\?.*$/, "");

  const cleanBase = basePath.replace(/^\.?\//, "").replace(/\/$/, "");

  // If path is root or empty
  if (pathname === "" || pathname === "/" || pathname === "./") {
    pathname = `./${cleanBase}/index.md`;
  }

  // Check if it pertains to articles, docs, or ends with .md
  const isDoc = pathname.includes(`/${cleanBase}/`) ||
    pathname.startsWith(`${cleanBase}/`) ||
    pathname.startsWith(`./${cleanBase}/`) ||
    pathname.endsWith(`/${cleanBase}`) ||
    pathname.endsWith(`/${cleanBase}/`) ||
    pathname.endsWith(".md");

  if (!isDoc) {
    return { docPath: pathname, isDoc: false };
  }

  let docPath = pathname;
  if (!docPath.endsWith(".md")) {
    if (docPath.endsWith(`/${cleanBase}`) || docPath.endsWith(`/${cleanBase}/`)) {
      docPath = `${docPath.replace(/\/+$/, "")}/index.md`;
    } else {
      docPath = `${docPath}.md`;
    }
  }

  // Normalize duplicate slashes
  docPath = docPath.replace(/\/+/g, "/");

  return { docPath, isDoc: true };
}

/**
 * Generates a clean URL slug for heading anchors.
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
