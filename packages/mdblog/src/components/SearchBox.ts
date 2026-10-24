import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";
import { useEffect, } from "preact/hooks";
import {
  closeSearch,
  isWideScreen,
  openSearch,
  searchDocs,
  searchOpen,
  searchQuery,
} from "../state.ts";
import { navigateTo, } from "../router.ts";
import { articleHrefFromPath, } from "../utils.ts";

/**
 * @description Properties accepted by the SearchBox component.
 */
export interface SearchBoxProps {
  /** @description Placeholder text displayed in search input. */
  placeholder?: string;
  /**
   * @description Extra classes added to the trigger element, so the bar it sits in can space it (BeerCSS rows keep a 1rem gap unless the row is told to have none).
   */
  class?: string;
}

/**
 * @description Search box component with responsive trigger (input on desktop, icon button on mobile), interactive dialog, keyboard shortcuts (Ctrl/Cmd+K to open, Escape to close), auto-indexed full-text search, and quick navigation.
 * @param props - Search configuration, including the spacing classes of the container.
 * @returns Preact VNode representing the search trigger and dialog.
 * @example
 * ```ts
 * import { SearchBox } from "./SearchBox.ts";
 * import { html } from "htm/preact";
 * const node = html`<${SearchBox} placeholder="Search..." />`;
 * ```
 */
export function SearchBox({
  placeholder = "Search articles...",
  class: extraClass = "",
}: SearchBoxProps = {},): unknown {
  // The typed query is global state, not local: the module-level shortcut
  // handler has to discard it when `Escape` dismisses the dialog, and an
  // alias keeps the template below reading exactly as it did before.
  const query = searchQuery;
  const panelInput = useSignal<HTMLInputElement | null>(null,);

  // The focus is placed explicitly rather than with the `autofocus` attribute:
  // BeerCSS shows a dialog by adding .active, and an attribute processed while
  // the element is still hidden does nothing — Chrome then reports
  // "Autofocus processing was blocked because a document already has a focused
  // element", because the control that opened the panel keeps its focus. Without
  // the call below, opening the search from the icon button would take two taps.
  // This is the one effect that genuinely belongs to the component: the dialog
  // element only exists once `searchOpen` turned true, and a signal effect runs
  // before the DOM is committed, so there would be nothing to focus yet.
  //
  // The restore of the persisted index and the Ctrl/Cmd+K and Escape handlers
  // used to live here too; they now sit with the state they drive —
  // `restoreSearchIndexFromCache()` inside `loadArticles()` and the keydown
  // listener at the bottom of state.ts — so the shortcuts work whether or not
  // this component happens to be mounted.
  useEffect(() => {
    if (searchOpen.value) panelInput.value?.focus();
  }, [searchOpen.value,],);

  const trimmed = query.value.trim().toLowerCase();
  const indexedCount = searchDocs.value.length;
  const results = trimmed === "" ? [] : searchDocs.value.filter((doc,) => {
    const matchTitle = doc.title.toLowerCase().includes(trimmed,);
    const matchDesc = doc.description &&
      doc.description.toLowerCase().includes(trimmed,);
    const matchContent = doc.content &&
      doc.content.toLowerCase().includes(trimmed,);
    const matchTags = Array.isArray(doc.tags,) &&
      doc.tags.some((tag,) => tag.toLowerCase().includes(trimmed,));
    return matchTitle || matchDesc || matchContent || matchTags;
  },).slice(0, 10,);

  function handleSelect(path: string,): void {
    closeSearch();
    navigateTo(path,);
  }

  function handleClose(): void {
    closeSearch();
  }

  return html`
    <div class=${`row no-margin ${extraClass}`.trim()}>
      <!-- The two triggers are mutually exclusive in the DOM rather than through
          breakpoint classes: BeerCSS's s/m/l classes stop hiding either one at
          fractional widths (browser zoom between 600 and 601, or between 992 and
          993), which would show both and blow up the bar. Narrow screens only
          have room for the icon button anyway. -->
      ${isWideScreen.value
        ? html`
          <div
            class="field prefix round fill small surface-container-highest no-margin"
            onClick=${openSearch}
            title="Search (Ctrl+K)"
          >
            <i class="front">search</i>
            <input
              type="search"
              placeholder=${placeholder}
              value=${query.value}
              aria-label="Search articles"
              aria-keyshortcuts="Control+K Meta+K"
              onFocus=${openSearch}
              onInput=${(e: Event,) => {
                query.value = (e.target as HTMLInputElement).value;
                openSearch();
              }}
            />
          </div>
        `
        : html`
          <button
            class="circle transparent"
            onClick=${openSearch}
            aria-label="Search articles"
            title="Search (Ctrl+K)"
          >
            <i>search</i>
          </button>
        `}

      <!-- Result panel: BeerCSS's native dialog (z-index 100). On wide screens
          it is a centered fixed-width card; on narrow ones it fills the whole
          screen, which is the most readable way to present a result list on a
          phone. The dialog already brings overflow-y:auto and max-block-size, so
          it needs no scroll class of its own. -->
      ${searchOpen.value
        ? html`
          <div class="overlay active" onClick=${handleClose}></div>

          <dialog
            class=${isWideScreen.value ? "active large-width" : "active max"}
            aria-label="Search articles"
          >
            <!-- Title on the left, actions pushed to the right edge. A <header>
                does not work here: BeerCSS gives it flex-direction:column and
                justify-content:center, which would stack the "Esc" chip and the
                close button in the middle of the panel. The .max spacer (flex:1)
                is the only right-alignment mechanism available — the framework
                has no justify-between. -->
            <div class="row no-margin">
              <i class="primary-text">search</i>
              <h6
                class=${`bold no-margin ${isWideScreen.value ? "" : "small"}`}
              >Search articles</h6>
              <div class="max"></div>
              ${isWideScreen.value
                ? html`
                  <span class="chip" title="Close with the Esc key">Esc</span>
                `
                : null}
              <button
                class="circle transparent"
                onClick=${handleClose}
                aria-label="Close search"
                title="Close (Esc)"
              >
                <i>close</i>
              </button>
            </div>

            <!-- The .field uses neither fill nor border: it keeps BeerCSS's
                elevate1, which is the right contrast against the dialog
                background. The icons carry .front because the absolute children
                of a field are painted in document order and the input, being
                relative, would end up on top of the last one, making "clear"
                unclickable. -->
            <div
              class=${query.value
                ? "field prefix suffix round no-margin"
                : "field prefix round no-margin"}
            >
              <i class="front">search</i>
              <input
                type="search"
                placeholder=${placeholder}
                value=${query.value}
                aria-label="Search articles"
                aria-keyshortcuts="Control+K Meta+K"
                ref=${(el: HTMLInputElement | null,) => {
                  panelInput.value = el;
                }}
                onInput=${(e: Event,) => {
                  query.value = (e.target as HTMLInputElement).value;
                }}
              />
              ${query.value
                ? html`
                  <i
                    class="front link"
                    title="Clear search"
                    onClick=${() => {
                      query.value = "";
                      panelInput.value?.focus();
                    }}
                  >
                    close
                  </i>
                `
                : null}
            </div>

            ${trimmed === ""
              ? html`
                <div class="row small-padding round surface-container-low">
                  <i class="primary-text">tips_and_updates</i>
                  <div class="max small-text">
                    Search by title, tag or any word of an article.
                  </div>
                  <span class="small-text secondary-text">
                    ${indexedCount} articles
                  </span>
                </div>
              `
              : null}

            ${results.length > 0
              ? html`
                <div class="row small-text secondary-text">
                  <div class="max">
                    ${results.length} result${results.length > 1 ? "s" : ""} for
                    "${query.value}"
                  </div>
                </div>
              `
              : null}

            <!-- BeerCSS zeroes the margins of every "a.row" (its own rule), so
                the gap between cards cannot come from the flow: small-margin +
                vertical-margin write var(---margin) with !important and separate
                the rows without taking their full width. The text column also
                needs .truncate: a flexbox item whose overflow is not "visible"
                gets a zero minimum size, and without it the text of a single
                line (white-space:nowrap) would push .max to the full width of
                the sentence — cutting the title in half and throwing the arrow
                outside the panel. -->
            <div class="vertical-margin small-margin" aria-live="polite">
              ${results.map((doc,) =>
                html`
                  <a
                    key=${doc.path}
                    href=${articleHrefFromPath(doc.path,)}
                    class="row wave round small-padding vertical-margin small-margin surface-container-low"
                    onClick=${(e: Event,) => {
                      e.preventDefault();
                      handleSelect(doc.path,);
                    }}
                  >
                    <i class="primary-text">${doc.icon || "article"}</i>
                    <div class="max truncate">
                      <div class="bold truncate">${doc.title}</div>
                      ${doc.description
                        ? html`
                          <div class="small-text secondary-text truncate">
                            ${doc.description}
                          </div>
                        `
                        : null}
                    </div>
                    <i class="tiny secondary-text">arrow_forward</i>
                  </a>
                `
              )}
            </div>

            ${trimmed !== "" && results.length === 0
              ? html`
                <div
                  class="center-align small-padding round surface-container-low vertical-margin">
                  <i class="primary-text large">search_off</i>
                  <p class="no-margin">
                    No article found for "${query.value}"
                  </p>
                  <p class="small-text secondary-text no-margin">
                    Check the spelling or try a more general word.
                  </p>
                </div>
              `
              : null}
          </dialog>
        `
        : null}
    </div>
  `;
}
