import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";

const STORAGE_KEY = "mdblog-theme";

function readSavedTheme(): boolean | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY,);
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * @description Decides whether the toggle starts in dark mode.
 *
 * A saved choice always wins. Without one the page is in BeerCSS `auto` mode,
 * where `material-dynamic-colors` follows the OS palette and no `dark` class is
 * ever written on the body: reading only the class list showed the button
 * offering "switch to dark" on a page that was already dark, so the media query
 * — the very preference the auto mode mirrors — seeds the fallback.
 * @returns True when the effective theme is dark.
 * @example
 * ```ts
 * import { initialThemeIsDark } from "./ThemeToggle.ts";
 * const dark = initialThemeIsDark();
 * ```
 */
export function initialThemeIsDark(): boolean {
  const saved = readSavedTheme();
  if (saved !== null) return saved;
  if (
    typeof document !== "undefined" &&
    document.body.classList.contains("dark",)
  ) {
    return true;
  }
  if (typeof globalThis.matchMedia === "function") {
    return globalThis.matchMedia("(prefers-color-scheme: dark)",).matches;
  }
  return false;
}

/**
 * @description Keeps the `theme-color` meta equal to the painted background.
 *
 * The meta drives the browser chrome and the PWA splash; shipping it as a fixed
 * brand purple left a dark theme with a light-colored status bar. The value is
 * read from the body's computed background — whichever palette is in effect,
 * static BeerCSS or a dynamic one — so no color constant is duplicated here.
 * @example
 * ```ts
 * import { syncThemeColor } from "./ThemeToggle.ts";
 * syncThemeColor();
 * ```
 */
export function syncThemeColor(): void {
  if (typeof document === "undefined") return;
  try {
    const bg = getComputedStyle(document.body,).backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") return;
    let meta = document.querySelector('meta[name="theme-color"]',);
    if (!meta) {
      meta = document.createElement("meta",);
      meta.setAttribute("name", "theme-color",);
      document.head.appendChild(meta,);
    }
    meta.setAttribute("content", bg,);
  } catch {
    // No computed styles available: keep whatever the document shipped
  }
}

function applyTheme(dark: boolean,): void {
  if (typeof document === "undefined") return;
  document.body.classList.remove(dark ? "light" : "dark",);
  document.body.classList.remove("auto",);
  document.body.classList.add(dark ? "dark" : "light",);
  syncThemeColor();
}

/**
 * @description Properties accepted by the ThemeToggle component.
 */
export interface ThemeToggleProps {
  /**
   * @description Extra classes added to the button, so the bar it sits in can space it (BeerCSS rows keep a 1rem gap unless the row is told to have none).
   */
  class?: string;
}

/**
 * @description Button component toggling BeerCSS light and dark color themes on document.body, persisting the choice in localStorage.
 * @param props - Toggle configuration, including the spacing classes of the container.
 * @returns Preact VNode representing the theme toggle button.
 * @example
 * ```ts
 * import { ThemeToggle } from "./ThemeToggle.ts";
 * import { html } from "htm/preact";
 * const node = html`<${ThemeToggle} />`;
 * ```
 */
export function ThemeToggle({
  class: extraClass = "",
}: ThemeToggleProps = {},): unknown {
  const saved = readSavedTheme();
  const isDark = useSignal(initialThemeIsDark(),);

  // Makes sure the saved preference wins over the system "auto" mode
  if (saved !== null) {
    applyTheme(saved,);
  } else {
    // The shipped meta carries the brand color for both modes; in auto mode no
    // applyTheme call follows, so the correction happens right here instead.
    syncThemeColor();
  }

  function toggle(): void {
    isDark.value = !isDark.value;
    applyTheme(isDark.value,);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, isDark.value ? "dark" : "light",);
      }
    } catch {
      // Persistence unavailable (private mode): stays in memory only
    }
  }

  return html`
    <button
      class=${`circle transparent ${extraClass}`.trim()}
      onClick=${toggle}
      title=${isDark.value ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <i>${isDark.value ? "light_mode" : "dark_mode"}</i>
    </button>
  `;
}
