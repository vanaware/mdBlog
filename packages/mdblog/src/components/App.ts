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
  // A gaveta é renderizada antes da barra: ambos usam `z-index: 100` no
  // BeerCSS, então a ordem no DOM define a sobreposição — assim a barra
  // superior permanece clicável mesmo com o menu lateral aberto.
  return html`
    <${Sidebar} />
    <${Navbar} />
    <${Content} />
  `;
}
