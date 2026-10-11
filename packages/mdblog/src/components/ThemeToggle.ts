import { html } from "htm/preact";
import type { VNode } from "preact";
import { useSignal } from "@preact/signals";

/**
 * @description Button component toggling BeerCSS light and dark color themes on document.body.
 * @returns Preact VNode representing the theme toggle button.
 * @example
 * ```ts
 * import { ThemeToggle } from "./ThemeToggle.ts";
 * import { html } from "htm/preact";
 * const node = html`<${ThemeToggle} />`;
 * ```
 */
export function ThemeToggle(): unknown {


  const isDark = useSignal(
    typeof document !== "undefined" &&
      document.body.classList.contains("dark"),
  );

  function toggle(): void {
    isDark.value = !isDark.value;
    if (typeof document !== "undefined") {
      if (isDark.value) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
      }
    }
  }

  return html`
    <button
      class="circle transparent"
      onClick=${toggle}
      title=${isDark.value ? "Mudar para modo claro" : "Mudar para modo escuro"}
      aria-label="Alternar tema"
    >
      <i>${isDark.value ? "light_mode" : "dark_mode"}</i>
    </button>
  `;
}
