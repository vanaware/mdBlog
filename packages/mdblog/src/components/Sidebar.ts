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

  // On narrow screens the drawer overlaps the content: a `dialog.left` is fixed
  // and does not trigger the `*:has(>nav...drawer.left)` rules, so no width is
  // reserved for the article. On wide screens it stays inline through
  // `nav.drawer` (exactly 20rem reserved), aligning the text with the menu.
  const overlayMode = !isWideScreen.value;

  // The empty `<header>` occupies the strip the top bar would cover, keeping the
  // top of the panel visible and clickable right below it.
  const panel = html`
    <header class="no-padding no-margin"></header>

    <!-- Panel head: label on the left, close control on the right. There is no
        justify-between in BeerCSS — the .max spacer (flex:1) is the mechanism —
        and no directional border, so the separator below is a divider. -->
    <div class="row no-padding no-space">
      <i class="primary-text tiny right-margin tiny-margin">menu_book</i>
      <span class="bold small-text truncate">Articles</span>
      <div class="max"></div>
      <button
        class="circle tiny transparent"
        onClick=${() => (sidebarOpen.value = false)}
        aria-label="Close the side navigation"
        title="Close the side menu"
      >
        <i class="small">close</i>
      </button>
    </div>

    <div class="medium-divider"></div>

    <div class="no-margin">
      ${list.map((item,) => {
        const isActive = normalizePath(current,) === normalizePath(item.path,);
        const depth = item.depth || 0;
        // The depth is shown as padding on the label, not as a margin on the entry:
        // the entries keep no-margin (which is what zeroes the 1rem BeerCSS puts
        // between consecutive blocks), and one size class feeds every margin class
        // of the element at once, so an indent could not be sized independently.
        const indentClass = depth >= 2
          ? "left-padding"
          : depth === 1
          ? "left-padding small-padding"
          : "";

        return html`
          <a
            key=${item.path}
            href=${articleHrefFromPath(item.path,)}
            class=${`row no-space wave round tiny-padding no-margin ${
              isActive ? "primary-container bold" : "transparent"
            }`}
            onClick=${() => {
              if (!isWideScreen.value) sidebarOpen.value = false;
            }}
            title=${item.title}
          >
            <i
              class=${`tiny right-margin tiny-margin ${
                isActive ? "primary-text" : "secondary-text"
              }`}
            >
              ${item.icon || "article"}
            </i>
            <span class=${`max truncate small-text ${indentClass}`}>
              ${item.title}
            </span>
            ${item.badge
              ? html`
                <span
                  class="chip small primary-container left-margin tiny-margin"
                >
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
        class="left small drawer active scroll surface-container-low small-padding"
        aria-label="Article navigation"
      >
        ${panel}
      </dialog>
    `;
  }

  return html`
    <nav
      class="left drawer scroll surface-container-low elevate small-padding"
      aria-label="Article navigation"
    >
      ${panel}
    </nav>
  `;
}
