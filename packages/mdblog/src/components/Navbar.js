import { html } from "htm/preact";
import {
  articles,
  currentPath,
  isOffline,
  isSWActive,
  sidebarOpen,
} from "../state.ts";
import { ThemeToggle } from "./ThemeToggle.js";
import { SearchBox } from "./SearchBox.js";
import { navigateTo } from "../router.ts";

export function Navbar() {
  const current = currentPath.value;
  const list = articles.value;
  const currentArticle = list.find(
    (a) =>
      a.path === current ||
      a.path.replace(/^\.?\//, "") === current.replace(/^\.?\//, ""),
  );

  return html`
    <nav class="top surface-container border-bottom sticky">
      <button
        class="circle transparent s m"
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

      <!-- Artigo ativo destacado no topo (em telas médias e grandes) -->
      ${currentArticle
        ? html`
          <div class="row items-center m l margin-left">
            <span class="chip surface-container-highest small">
              <i class="tiny primary-text">${currentArticle.icon || "article"}</i>
              <span class="small-text truncate">${currentArticle.title.replace(/^[^\w\s]*\s*/, "")}</span>
            </span>
          </div>
        `
        : null}

      <div class="max"></div>

      <div class="row items-center gap">
        <!-- Status badges - versão detalhada em telas médias/grandes -->
        ${isOffline.value
          ? html`
            <span class="chip error small bold m l" title="Aplicação operando offline">
              <i>cloud_off</i> Offline
            </span>
          `
          : html`
            <span class="chip success small bold m l" title="Conectado à internet">
              <i>cloud_done</i> Online
            </span>
          `}

        ${isSWActive.value
          ? html`
            <span class="chip primary-container small bold m l"
              title="Service Worker ativo">
              <i>bolt</i> SW Ativo
            </span>
          `
          : null}

        <!-- Indicador compacto exclusivo para mobile (telas pequenas .s) -->
        <span
          class="circle small transparent s"
          title=${isOffline.value
            ? "Offline"
            : isSWActive.value
            ? "Online (SW Ativo)"
            : "Online (Local)"}
        >
          <i class=${isOffline.value ? "error-text" : "success-text"}>
            ${isOffline.value ? "cloud_off" : "cloud_done"}
          </i>
        </span>

        <!-- Busca com suporte responsivo nativo BeerCSS (visível em telas m e l) -->
        <div class="m l">
          <${SearchBox} placeholder="Buscar artigos..." />
        </div>

        <${ThemeToggle} />
      </div>
    </nav>
  `;
}
