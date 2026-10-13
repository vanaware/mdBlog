import { html, } from "htm/preact";
import { isOffline, isSWActive, isWideScreen, sidebarOpen, } from "../state.ts";
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
    <!-- BeerCSS gives nav.top a justify-content:space-around below 600px and
        freezes the bar at 5rem, while every direct child is flex:none and
        therefore cannot shrink: with the default 1rem gap of a nav the brand,
        the status chip and the two icon buttons overflowed a 375px screen and
        the theme toggle fell off the right edge. The no-space class drops the
        gaps between the bar's own children (the .max spacer still pushes the
        actions to the end) and the wordmark steps down to h6.small. -->
    <nav class="top surface-container no-space elevate">
      <button
        class="circle transparent"
        onClick=${() => (sidebarOpen.value = !sidebarOpen.value)}
        aria-label="Toggle side menu"
        aria-expanded=${sidebarOpen.value}
        title=${sidebarOpen.value
          ? "Hide the article list"
          : "Show the article list"}
      >
        <i>${sidebarOpen.value ? "keyboard_arrow_left" : "menu"}</i>
      </button>

      <!-- BeerCSS treats every direct "a" child of nav.top as a navigation item
          (flex-direction: column, a fixed 3.5rem width and an icon that gets a
          pill radius plus secondary-container background on hover) — which
          stacks the icon over the name and makes it look like a badge. Wrapping
          the brand in a neutral container keeps the link out of that selector.
          The gap between the icon and the wordmark cannot come from a
          gap-small class (BeerCSS has none: the row keeps its default 1rem),
          so the icon carries an explicit right margin. The link keeps its
          vertical padding but not the 0.75rem of padding on each side: that is
          the one place the bar can lose 16px without anything reading tighter,
          and the space it frees is what keeps the theme toggle on screen when
          the phone is narrow or the user has the system text size turned up. -->
      <div class="row no-margin no-space">
        <a
          href="#/"
          class="row wave transparent no-margin horizontal-padding tiny-padding"
          title="Home page"
        >
          <i class="primary-text bold right-margin small-margin">menu_book</i>
          <h6 class="bold no-margin small">mdBlog</h6>
        </a>
      </div>

      <div class="max"></div>

      <div class="row no-space">
        <!-- The status chip, the search and the theme toggle are one group at the
            end of the bar, not three stations spread over it. The 1rem gap of a
            row cost 32px of the bar and, on the narrowest phones, pushed the
            theme toggle past the right edge — a nav does not wrap and clips what
            falls off. The no-space class drops the gap and the two items after
            the chip take the 0.5rem inline margin BeerCSS itself gives a button:
            enough separation to read as distinct targets, half of what it was. -->
        <!-- Connectivity status chip. The word and the roomy padding come with
            the wide layout and the icon alone with the narrow one: the two
            states branch in the DOM on the same signal, the way the search
            trigger already does, instead of through BeerCSS's s/m/l classes.
            A chip holding only an icon is mostly padding, and on the phone that
            padding is the difference between the bar fitting and the theme
            toggle falling off the edge, so the icon-only state keeps 0.25rem of
            it and the labelled state keeps the framework's own. -->
        <span
          class=${`chip small no-margin ${
            isWideScreen.value ? "" : "horizontal-padding tiny-padding"
          } ${
            isOffline.value ? "error-container" : "surface-container-highest"
          }`}
          title=${isOffline.value
            ? "Offline (no connection)"
            : isSWActive.value
            ? "Online (Service Worker active)"
            : "Online"}
        >
          <i class=${isOffline.value ? "error-text" : "green-text"}>
            ${isOffline.value ? "cloud_off" : "cloud_done"}
          </i>
          ${isWideScreen.value
            ? html`<span>${isOffline.value ? "Offline" : "Online"}</span>`
            : null}
        </span>

        <!-- Responsive search: field on m/l, compact button on s -->
        <${SearchBox}
          placeholder="Search articles..."
          class="left-margin small-margin"
        />

        <${ThemeToggle} class="left-margin small-margin" />
      </div>
    </nav>
  `;
}
