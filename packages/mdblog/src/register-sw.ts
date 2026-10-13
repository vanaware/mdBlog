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
    // Derives the base path and scope dynamically for subfolder compatibility (e.g. GitHub Pages)
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
    // It may simply be an environment without Service Worker support (isolated
    // preview), but a "script evaluation failed" is a bundle bug: sw.js imports
    // the same file as the app and a worker has no `document`. Treating that up
    // front as normal would hide the real failure, so the warning stays neutral.
    console.warn("[SW] Registration failed:", err,);
    isSWActive.value = false;
  }
}
