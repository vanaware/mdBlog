import { html, } from "htm/preact";
import { isOffline, isSWActive, sidebarOpen, } from "../state.ts";
import { ThemeToggle, } from "./ThemeToggle.ts";
import { SearchBox, } from "./SearchBox.ts";

/**
 * @description Top navigation bar component displaying logo, network status chip, search input, and theme toggle.
 * @returns Preact VNode representing the application header.
 * @example
 * ```ts
 * import { Navbar } from "./Navbar.ts";
 * import { html } from "htm/preact";
 * const node = html`<${Navbar} />`;
 * ```
 */
export function Navbar(): unknown {
  return html`
    <nav class="top surface-container border-bottom sticky">
      <button
        class="circle transparent"
        onClick=${() => (sidebarOpen.value = !sidebarOpen.value)}
        aria-label="Alternar menu lateral"
        aria-expanded=${sidebarOpen.value}
        title=${sidebarOpen.value
          ? "Ocultar lista de artigos"
          : "Mostrar lista de artigos"}
      >
        <i>${sidebarOpen.value ? "keyboard_arrow_left" : "menu"}</i>
      </button>

      <!-- O BeerCSS trata todo "a" filho direto de nav.top como item de navegação
          (flex-direction: column, largura fixa de 3.5rem e o ícone com raio de pill
          e fundo secondary-container em hover) — o que empilha o ícone sobre o nome
          e o faz parecer um badge. Envolver a marca num contentor neutro mantém o
          link fora desse seletor, deixando a classe row colocar o ícone à esquerda. -->
      <div class="row items-center no-margin">
        <a
          href="#/"
          class="row items-center gap-small wave transparent surface-text no-margin"
          title="Página Inicial"
        >
          <i class="primary-text bold">menu_book</i>
          <h6 class="bold no-margin">mdBlog</h6>
        </a>
      </div>

      <div class="max"></div>

      <div class="row items-center gap-small">
        <!-- Chip de status de conectividade: texto visível em telas médias/grandes -->
        <span
          class=${`chip small no-margin ${
            isOffline.value ? "error-container" : "surface-container-highest"
          }`}
          title=${isOffline.value
            ? "Offline (Sem conexão)"
            : isSWActive.value
            ? "Online (Service Worker Ativo)"
            : "Online"}
        >
          <i class=${isOffline.value ? "error-text" : "success-text"}>
            ${isOffline.value ? "cloud_off" : "cloud_done"}
          </i>
          <span class="m l">${isOffline.value ? "Offline" : "Online"}</span>
        </span>

        <!-- Busca responsiva: campo em m/l, botão compacto em s -->
        <${SearchBox} placeholder="Buscar artigos..." />

        <${ThemeToggle} />
      </div>
    </nav>
  `;
}
