import type { WireDoc, } from "../wire.ts";

/**
 * Escapes characters that could terminate or corrupt a script tag.
 */
function safeJsonSerialize(data: unknown,): string {
  return JSON.stringify(data,).replace(/</g, "\\u003c",);
}

/**
 * @description Generates the full HTML shell for first-paint navigation.
 * Emits BeerCSS, manifest, and an inline `<script id="__md_wire">` payload for zero-latency initial rendering.
 *
 * This is the fallback document, used when the application's own `index.html`
 * cannot be reached — offline, or on a host that does not serve it. The
 * Service Worker prefers {@linkcode injectWireShell} over that real file so a
 * deployed page always carries the head the application was shipped with.
 * Keep both in lockstep: the same BeerCSS release, the same title suffix.
 * @param doc - Parsed WireDoc document to embed into the shell.
 * @param bundlePath - Relative path to the application bundle script.
 * @returns Fully formatted HTML document string.
 * @example
 * ```ts
 * import { defaultShell } from "./shell.ts";
 * import { processMarkdown } from "./pipeline.ts";
 * const doc = processMarkdown("# Welcome", "/index.md");
 * const html = defaultShell(doc, "./mdblog.js");
 * ```
 */
export function defaultShell(
  doc: WireDoc,
  bundlePath = "./mdblog.js",
): string {
  const serializedWire = safeJsonSerialize(doc,);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(doc.title,)} - mdBlog</title>
    <meta name="description" content="Documentation powered by Service Worker, Wire Format and Preact Islands" />
    <meta name="theme-color" content="#6750a4" />

    <!-- Web App Manifest -->
    <link rel="manifest" href="./manifest.json" />

    <!-- Favicon SVG Inline -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📑</text></svg>" />


    <!-- BeerCSS Framework v3.7.12 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css" />
    <!-- The icon font ships inside beer.min.css as @font-face with font-display:
        block; preloading it starts the woff2 fetch in parallel with the
        stylesheet so the glyphs do not stay invisible behind the CSS round
        trip. Kept in lockstep with the application's own index.html. -->
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/material-symbols-outlined.woff2" as="font" type="font/woff2" crossorigin />
    <script type="module" src="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.js"></script>

    <!-- Material Dynamic Colors -->
    <script type="module" src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"></script>

    <!-- Pre-rendered Wire Format JSON -->
    <script id="__md_wire" type="application/json">${serializedWire}</script>
  </head>
  <body class="auto">
    <div id="app"></div>
    <script type="module" src="${bundlePath}"></script>
  </body>
</html>`;
}

/**
 * @description Splices a pre-rendered wire payload into an existing HTML document.
 *
 * The first paint of a navigation is the one moment the reader waits for the
 * network; the payload removes the round trip, but hand copying the head into a
 * second document is how the two drift apart — a shell loading another framework
 * version, or missing the script that recovers a broken cache, is a shell that
 * hangs on a blank page. So the payload is injected into the document the
 * application actually ships, and only that document decides what a first paint
 * needs.
 *
 * The payload goes last in `<head>`, before the stylesheets are requested or the
 * bundle is loaded, and any payload the template already carries is replaced
 * rather than duplicated. The title follows the document.
 * @param html - The application document to embed the payload into.
 * @param doc - Parsed WireDoc document to render on first paint.
 * @returns The same document with the payload and the title updated.
 * @example
 * ```ts
 * import { injectWireShell } from "./shell.ts";
 * const html = injectWireShell(await Deno.readTextFile("./index.html"), doc);
 * ```
 */
export function injectWireShell(html: string, doc: WireDoc,): string {
  const payload = `<script id="__md_wire" type="application/json">${
    safeJsonSerialize(doc,)
  }</script>`;

  // A template that already carries a placeholder keeps its position: two
  // payloads would leave the reader parsing the stale one first.
  if (html.includes('id="__md_wire"',) || html.includes("id='__md_wire'",)) {
    return replaceTitle(
      html.replace(
        /<script[^>]*id=["']__md_wire["'][^>]*>[\s\S]*?<\/script>/i,
        payload,
      ),
      doc,
    );
  }

  const closingHead = /<\/head>/i;
  if (closingHead.test(html,)) {
    return replaceTitle(
      html.replace(closingHead, `  ${payload}\n</head>`,),
      doc,
    );
  }

  const openingBody = /<body[^>]*>/i;
  if (openingBody.test(html,)) {
    return replaceTitle(html.replace(openingBody, `${payload}$&`,), doc,);
  }

  return replaceTitle(`${payload}\n${html}`, doc,);
}

/**
 * Rewrites a single `<title>` element, leaving a document without one alone.
 */
function replaceTitle(html: string, doc: WireDoc,): string {
  return html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(doc.title,)} - mdBlog</title>`,
  );
}

function escapeHtml(str: string,): string {
  return str
    .replace(/&/g, "&amp;",)
    .replace(/</g, "&lt;",)
    .replace(/>/g, "&gt;",)
    .replace(/"/g, "&quot;",)
    .replace(/'/g, "&#39;",);
}
