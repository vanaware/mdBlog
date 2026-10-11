import { html } from "htm/preact";
import type { VNode } from "preact";
import { Navbar } from "./Navbar.ts";
import { Sidebar } from "./Sidebar.ts";
import { Content } from "./Content.ts";

export function App(): VNode {
  return html`
    <${Navbar} />
    <${Sidebar} />
    <${Content} />
  `;
}
