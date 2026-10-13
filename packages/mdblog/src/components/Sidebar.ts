import { html, } from "htm/preact";
import { articles, currentPath, isWideScreen, sidebarOpen, } from "../state.ts";
import { articleHrefFromPath, normalizePath, } from "../utils.ts";

/**
 * @description Collapsible left sidebar drawer displaying hierarchical article navigation. Rendered only when open, so the article reclaims the full width on any breakpoint (BeerCSS reserves inline space solely while a `nav.left` sibling exists).
 * @returns Preact VNode representing the navigation drawer, or null when collapsed.
 * @example
 * ```ts
 * import { Sidebar } from "./Sidebar.ts";
 * import { html } from "htm/preact";
 * const node = html`<${Sidebar} />`;
 * ```
 */
export function Sidebar(): unknown {
  const current = currentPath.value;
  const list = articles.value;

  if (!sidebarOpen.value) return null;

  // Em telas estreitas a gaveta sobrescreve o conteúdo: um `dialog.left` é
  // fixo e não aciona as regras `*:has(>nav...drawer.left)`, então nenhuma
  // largura é reservada ao artigo. Em telas largas ela fica inline via
  // `nav.drawer` (exatamente 20rem reservados), alinhando o texto ao menu.
  const overlayMode = !isWideScreen.value;

  // O `<header>` vazio ocupa a faixa que a barra superior cobriria, mantendo
  // o topo do painel visível e clicável logo abaixo dela.
  const panel = html`
    <header class="no-padding no-margin"></header>

    <div class="row items-center justify-between no-padding border-bottom">
      <div class="row items-center">
        <i class="primary-text tiny">menu_book</i>
        <span class="bold tiny-text truncate">Artigos</span>
      </div>
      <button
        class="circle tiny transparent"
        onClick=${() => (sidebarOpen.value = false)}
        aria-label="Fechar navegação lateral"
        title="Fechar menu lateral"
      >
        <i class="small">close</i>
      </button>
    </div>

    <div class="no-padding no-margin margin-top-small">
      ${list.map((item,) => {
        const isActive = normalizePath(current,) === normalizePath(item.path,);
        const depth = item.depth || 0;
        const indentClass = depth === 1
          ? "left-margin"
          : depth >= 2
          ? "small-margin left-margin"
          : "";

        return html`
          <a
            key=${item.path}
            href=${articleHrefFromPath(item.path,)}
            class=${`row items-center wave round tiny-padding no-margin ${
              isActive ? "primary-container bold" : "transparent surface-text"
            } ${indentClass}`}
            onClick=${() => {
              if (!isWideScreen.value) sidebarOpen.value = false;
            }}
            title=${item.title}
          >
            <i
              class=${`tiny ${
                isActive ? "primary-text" : "surface-variant-text"
              }`}
            >
              ${item.icon || "article"}
            </i>
            <span class="max truncate tiny-text">${item.title}</span>
            ${item.badge
              ? html`
                <span class="chip tiny primary-container no-margin">
                  ${item.badge}
                </span>
              `
              : null}
          </a>
        `;
      },)}
    </div>
  `;

  if (overlayMode) {
    return html`
      <div
        class="overlay active"
        onClick=${() => (sidebarOpen.value = false)}
        onTouchMove=${(e: TouchEvent,) => e.preventDefault()}
      ></div>

      <dialog
        class="left small drawer active scroll surface-container-low border-right small-padding"
        aria-label="Navegação de artigos"
      >
        ${panel}
      </dialog>
    `;
  }

  return html`
    <nav
      class="left drawer scroll surface-container-low border-right small-padding"
      aria-label="Navegação de artigos"
    >
      ${panel}
    </nav>
  `;
}
