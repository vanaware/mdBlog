import { html } from "htm/preact";
import { articles, currentPath, sidebarOpen } from "../state.ts";

function norm(p) {
  let s = (p || "")
    .replace(/^#\/?/, "")
    .replace(/^\.?\//, "")
    .replace(/^articles\//, "")
    .replace(/^docs\//, "");
  if (!s || s === "index") s = "index.md";
  return s;
}

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

    <!-- Navbar lateral compacta: pequena largura (small-width) em telas grandes (l) e médias (m) -->
    <nav
      class=${`left drawer scroll surface-container-low border-right small-padding small-width ${
        sidebarOpen.value ? "active" : "m l"
      }`}
    >
      <!-- Topo compacto sem margens excessivas -->
      <div class="row items-center justify-between no-padding border-bottom no-margin">
        <div class="row items-center gap-tiny">
          <i class="primary-text tiny">menu_book</i>
          <span class="bold tiny-text truncate">Artigos</span>
        </div>
        <button
          class="circle tiny transparent s"
          onClick=${() => (sidebarOpen.value = false)}
          aria-label="Fechar navegação lateral"
        >
          <i class="small">close</i>
        </button>
      </div>

      <!-- Lista vertical com espaçamento ultracompacto (gap-tiny) -->
      <div class="column gap-tiny no-padding no-margin margin-top-small">
        ${list.map((item) => {
          const isActive = norm(current) === norm(item.path);
          const depth = item.depth || 0;
          const indentClass = depth === 1 ? "left-margin" : depth >= 2 ? "small-margin left-margin" : "";
          const linkHref = item.name === "index.md" ? "#/" : `#/${item.name}`;

          return html`
            <a
              key=${item.path}
              href=${linkHref}
              class=${`row items-center wave round tiny-padding no-margin gap-tiny ${
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
            </a>
          `;
        })}
      </div>
    </nav>
  `;
}
