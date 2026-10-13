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

function applyTheme(dark: boolean,): void {
  if (typeof document === "undefined") return;
  document.body.classList.remove(dark ? "light" : "dark",);
  document.body.classList.remove("auto",);
  document.body.classList.add(dark ? "dark" : "light",);
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
  const isDark = useSignal(
    saved ??
      (typeof document !== "undefined" &&
        document.body.classList.contains("dark",)),
  );

  // Makes sure the saved preference wins over the system "auto" mode
  if (saved !== null) {
    applyTheme(saved,);
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
