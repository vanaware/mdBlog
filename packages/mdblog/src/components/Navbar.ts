import { html } from "htm/preact";
import type { VNode } from "preact";
import {
  articles,
  currentPath,
  isOffline,
  isSWActive,
  sidebarOpen,
} from "../state.ts";
import { ThemeToggle } from "./ThemeToggle.ts";
import { SearchBox } from "./SearchBox.ts";
import { navigateTo } from "../router.ts";

function norm(p?: string | null): string {
  let s = (p || "")
    .replace(/^#\/?/, "")
    .replace(/^\.?\//, "")
    .replace(/^articles\//, "")
    .replace(/^docs\//, "");
  if (!s || s === "index") s = "index.md";
  return s;
}

export function Navbar(): VNode {
  const current = currentPath.value;
  const list = articles.value;

  return html`
    <nav class="top surface-container border-bottom sticky">
      <button
        class="circle transparent"
        onClick=${() => (sidebarOpen.value = !sidebarOpen.value)}
        aria-label="Alternar menu lateral"
      >
        <i>menu</i>
      </button>

      <a
        class="row items-center gap-small wave transparent surface-text no-margin"
        onClick=${() =>
          navigateTo(articles.value[0]?.path || "./articles/index.md")}
        title="Página Inicial"
      >
        <i class="primary-text bold">menu_book</i>
        <h6 class="bold no-margin">mdBlog</h6>
      </a>

      <div class="max"></div>

      <div class="row items-center gap">
        <!-- Indicador compacto de status online/offline -->
        <span
          class="circle small transparent"
          title=${isOffline.value
            ? "Offline (Sem conexão)"
            : isSWActive.value
            ? "Online (Service Worker Ativo)"
            : "Online"}
        >
          <i class=${isOffline.value ? "error-text" : "success-text"}>
            ${isOffline.value ? "cloud_off" : "cloud_done"}
          </i>
        </span>

        <!-- Busca com suporte a todas as telas -->
        <div class="m l">
          <${SearchBox} placeholder="Buscar artigos..." />
        </div>

        <${ThemeToggle} />
      </div>
    </nav>
  `;
}
