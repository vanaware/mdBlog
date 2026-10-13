import { html, } from "htm/preact";
import type { VNode, } from "preact";
import { Navbar, } from "./Navbar.ts";
import { Sidebar, } from "./Sidebar.ts";
import { Content, } from "./Content.ts";

/**
 * @description Main application layout component assembling Navbar, Sidebar, and Content.
 * @returns Preact VNode representing the top-level mdBlog layout.
 * @example
 * ```ts
 * import { App } from "./App.ts";
 * import { render, html } from "htm/preact";
 * render(html`<${App} />`, document.getElementById("app")!);
 * ```
 */
export function App(): unknown {
  // The drawer is rendered before the bar: both use `z-index: 100` in BeerCSS,
  // so the DOM order decides the stacking — this way the top bar stays clickable
  // even with the side menu open.
  return html`
    <${Sidebar} />
    <${Navbar} />
    <${Content} />
  `;
}
