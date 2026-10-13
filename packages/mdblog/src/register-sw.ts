import { isSWActive, } from "./state.ts";
import { getAppBaseUrl, } from "./plugin/detect.ts";

/**
 * @description Registers the mdBlog offline Service Worker with dynamic subfolder scope resolution.
 * Updates the global `isSWActive` signal upon successful activation.
 * @returns Resolves when registration attempt finishes.
 * @example
 * ```ts
 * import { registerServiceWorker } from "./register-sw.ts";
 * await registerServiceWorker();
 * ```
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    console.info("[SW] Service Worker is not supported in this browser.",);
    isSWActive.value = false;
    return;
  }

  try {
    // Deriva caminho base e escopo dinamicamente para compatibilidade com subpastas (ex: GitHub Pages)
    const baseUrl = getAppBaseUrl();
    const swUrl = `${baseUrl}sw.js`;

    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: baseUrl,
      type: "module",
    },);

    // Check for updates immediately so stale workers are replaced
    registration.update().catch(() => {},);

    if (navigator.serviceWorker.controller) {
      isSWActive.value = true;
    }

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      isSWActive.value = true;
    },);

    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING", },);
    }

    if (registration.installing) {
      registration.installing.addEventListener("statechange", (e,) => {
        const sw = e.target as ServiceWorker;
        if (sw.state === "activated") {
          isSWActive.value = true;
        }
      },);
    }
  } catch (err) {
    // Pode ser apenas um ambiente sem Service Workers (preview isolado), mas uma
    // "script evaluation failed" é um bug do bundle: o sw.js importa o mesmo
    // ficheiro da aplicação e um worker não tem `document`. Declarar isto como
    // normal à partida esconde a falha real, pelo que se mantém o aviso neutro.
    console.warn("[SW] Registration failed:", err,);
    isSWActive.value = false;
  }
}
