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
 * @description Button component toggling BeerCSS light and dark color themes on document.body, persisting the choice in localStorage.
 * @returns Preact VNode representing the theme toggle button.
 * @example
 * ```ts
 * import { ThemeToggle } from "./ThemeToggle.ts";
 * import { html } from "htm/preact";
 * const node = html`<${ThemeToggle} />`;
 * ```
 */
export function ThemeToggle(): unknown {
  const saved = readSavedTheme();
  const isDark = useSignal(
    saved ??
      (typeof document !== "undefined" &&
        document.body.classList.contains("dark",)),
  );

  // Garante que a preferência salva prevaleça sobre o modo "auto" do sistema
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
      // Persistência indisponível (modo privado): mantém apenas em memória
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
