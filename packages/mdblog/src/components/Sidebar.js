import { html } from "htm/preact";
import { articles, currentPath, sidebarOpen } from "../state.ts";

export function Sidebar() {
  const current = currentPath.value;
  const list = articles.value;

  return html`
    <!-- Overlay escurecedor nativo do BeerCSS para fechar gaveta exclusivamente no mobile (s) -->
    ${sidebarOpen.value ? html`
      <div
        class="overlay active s"
        onClick=${() => (sidebarOpen.value = false)}
        onTouchMove=${(e) => e.preventDefault()}
      ></div>
    ` : null}

    <!-- Navbar lateral: docado em telas grandes (l) e médias (m com layout compacto) -->
    <nav
      class=${`left drawer scroll surface-container-low border-right ${
        sidebarOpen.value ? "active" : "m l"
      }`}
    >
      <!-- Topo compacto com título, contagem e botão de fechar para mobile -->
      <div class="row items-center justify-between small-padding border-bottom">
        <div class="row items-center gap">
          <i class="primary-text">menu_book</i>
          <span class="bold medium-text truncate">Artigos do Blog</span>
        </div>
        <button
          class="circle transparent s"
          onClick=${() => (sidebarOpen.value = false)}
          aria-label="Fechar navegação lateral"
        >
          <i>close</i>
        </button>
      </div>

      <!-- Lista dinâmica completa de artigos e sub-páginas -->
      <div class="small-padding">
        <div class="small-margin bottom-margin">
          <div class="row items-center justify-between tiny-margin bottom-margin left-padding right-padding">
            <span class="small-text surface-variant-text bold uppercase truncate">
              Publicações (${list.length})
            </span>
            <span class="chip tiny surface-variant l">Hierárquico</span>
          </div>

          <div class="column">
            ${list.map((item) => {
              const isActive = current === item.path ||
                current.replace(/^\.?\//, "") === (item.path || "").replace(/^\.?\//, "");
              const depth = item.depth || 0;
              const indentClass = depth === 1 ? "left-margin" : depth >= 2 ? "large-margin left-margin" : "";
              return html`
                <a
                  key=${item.path}
                  href="#${item.path}"
                  class=${`row items-center wave round small-padding tiny-margin bottom-margin ${
                    isActive
                      ? "primary-container bold"
                      : "transparent surface-text"
                  } ${indentClass}`}
                  onClick=${() => {
                    if (typeof window !== "undefined" && window.innerWidth < 600) {
                      sidebarOpen.value = false;
                    }
                  }}
                  title=${item.title}
                >
                  <i
                    class=${`small ${
                      isActive ? "primary-text" : "surface-variant-text"
                    }`}
                  >
                    ${item.icon || "article"}
                  </i>
                  <span class="max truncate small-text">${item.title}</span>
                  ${item.badge ? html`
                    <span class="badge none primary l">${item.badge}</span>
                  ` : null}
                </a>
              `;
            })}
          </div>
        </div>
      </div>
    </nav>
  `;
}
