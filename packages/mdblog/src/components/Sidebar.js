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

    <!-- Navbar lateral compacta: docada em telas grandes (l) e médias (m) -->
    <nav
      class=${`left drawer scroll surface-container-low border-right small-padding ${
        sidebarOpen.value ? "active" : "m l"
      }`}
    >
      <!-- Topo compacto sem margens excessivas -->
      <div class="row items-center justify-between tiny-padding border-bottom no-margin">
        <div class="row items-center gap-small">
          <i class="primary-text small">menu_book</i>
          <span class="bold small-text truncate">Artigos do Blog</span>
        </div>
        <button
          class="circle tiny transparent s"
          onClick=${() => (sidebarOpen.value = false)}
          aria-label="Fechar navegação lateral"
        >
          <i class="small">close</i>
        </button>
      </div>

      <!-- Cabeçalho de contagem compacto -->
      <div class="row items-center justify-between tiny-padding tiny-margin bottom-margin">
        <span class="tiny-text surface-variant-text bold uppercase truncate">
          Publicações (${list.length})
        </span>
        <span class="chip tiny surface-variant l">Hierárquico</span>
      </div>

      <!-- Lista vertical com espaçamento ultracompacto (gap-tiny) -->
      <div class="column gap-tiny no-padding no-margin">
        ${list.map((item) => {
          const isActive = current === item.path ||
            current.replace(/^\.?\//, "") === (item.path || "").replace(/^\.?\//, "");
          const depth = item.depth || 0;
          const indentClass = depth === 1 ? "left-margin" : depth >= 2 ? "small-margin left-margin" : "";
          return html`
            <a
              key=${item.path}
              href="#${item.path}"
              class=${`row items-center wave round tiny-padding no-margin ${
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
                class=${`tiny ${
                  isActive ? "primary-text" : "surface-variant-text"
                }`}
              >
                ${item.icon || "article"}
              </i>
              <span class="max truncate tiny-text">${item.title}</span>
              ${item.badge ? html`
                <span class="badge none primary tiny l">${item.badge}</span>
              ` : null}
            </a>
          `;
        })}
      </div>
    </nav>
  `;
}
