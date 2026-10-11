import {
  Component,
  type ComponentChildren,
  type ComponentType,
  Fragment,
  h,
  hydrate,
  render,
  type VNode,
} from "preact";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { html as rawHtml } from "htm/preact";
import {
  batch as rawBatch,
  computed as rawComputed,
  effect as rawEffect,
  signal as rawSignal,
  useSignal as rawUseSignal,
} from "@preact/signals";
import * as stateNamespace from "./state.ts";

/**
 * @description Reactive application state, signals, and dynamic article tree discovery.
 */
export const state: typeof stateNamespace = stateNamespace;

import { App } from "./components/App.ts";
import { Navbar } from "./components/Navbar.ts";
import { Sidebar } from "./components/Sidebar.ts";
import { Content } from "./components/Content.ts";
import { ThemeToggle } from "./components/ThemeToggle.ts";
import { SearchBox, type SearchBoxProps } from "./components/SearchBox.ts";
import { initRouter, navigateTo } from "./router.ts";
import { registerServiceWorker } from "./register-sw.ts";
import {
  dynamicIslandsCache,
  hydrateIslands,
  type HydrateOptions,
} from "./render/hydrate-islands.ts";
import {
  type ComponentRegistry,
  wireToVNode,
  type WireToVNodeOptions,
} from "./render/from-wire.ts";
import { defaultRegistry } from "./render/registry.ts";
import { parseMarkdown } from "./plugin/core/parse.ts";
import { mdastToWire } from "./plugin/core/to-wire.ts";
import { loadDoc, processMarkdown } from "./plugin/core/pipeline.ts";
import {
  type CacheIOOptions,
  createBrowserIO,
  createMemoryIO,
} from "./plugin/core/io.ts";
import {
  createSWFetchHandler,
  type SWPluginOptions,
} from "./plugin/adapters/sw.ts";
import { defaultShell } from "./plugin/core/shell.ts";
import type { DocConfig, IO } from "./plugin/types.ts";
import {
  isSWControlling,
  resolveDocPath,
  slugify,
} from "./plugin/detect.ts";
import {
  countWireIslands,
  countWireNodes,
  type MdastRoot,
  sanitizeProps,
  type Wire,
  type WireComponent,
  type WireDoc,
  type WireElement,
  type WireFragment,
  type WireIsland,
} from "./plugin/wire.ts";


/**
 * @description Reactive Signal container holding a mutable value.
 */
export interface Signal<T = unknown> {
  /** @description The current reactive value. */
  value: T;
  /** @description Converts signal value to string representation. */
  toString(): string;
  /** @description Returns primitive value. */
  valueOf(): T;
}

/**
 * @description Tagged template literal for JSX/HTML evaluation without a build step.
 * @param strings - Template strings array.
 * @param values - Interpolated values.
 * @returns Renderable Preact virtual element.
 * @example
 * ```ts
 * import { html } from "./mod.ts";
 * const node = html`<div class="banner">Hello World</div>`;
 * ```
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): unknown {
  return rawHtml(strings, ...values);
}


/**
 * @description Creates a new reactive state signal with an initial value.
 * @param initialValue - Initial value for the signal.
 * @returns A reactive Signal container.
 * @example
 * ```ts
 * import { signal } from "./mod.ts";
 * const count = signal(0);
 * count.value++;
 * ```
 */
export function signal<T>(initialValue: T): Signal<T> {
  return rawSignal(initialValue) as unknown as Signal<T>;
}

/**
 * @description Preact hook for creating a component-scoped reactive signal.
 * @param initialValue - Initial value for the signal.
 * @returns Component-scoped reactive Signal container.
 * @example
 * ```ts
 * import { useSignal } from "./mod.ts";
 * function Counter() {
 *   const count = useSignal(0);
 *   return count.value;
 * }
 * ```
 */
export function useSignal<T>(initialValue: T): Signal<T> {
  return rawUseSignal(initialValue) as unknown as Signal<T>;
}

/**
 * @description Creates a computed reactive value derived from other signals.
 * @param compute - Computation function reading signals.
 * @returns Read-only derived Signal.
 * @example
 * ```ts
 * import { signal, computed } from "./mod.ts";
 * const count = signal(2);
 * const double = computed(() => count.value * 2);
 * ```
 */
export function computed<T>(compute: () => T): Readonly<Signal<T>> {
  return rawComputed(compute) as unknown as Readonly<Signal<T>>;
}

/**
 * @description Subscribes to reactive signals and triggers side-effects upon mutations.
 * @param callback - Function to execute when accessed signals change.
 * @returns Cleanup unsubscribe function.
 * @example
 * ```ts
 * import { signal, effect } from "./mod.ts";
 * const count = signal(0);
 * const dispose = effect(() => console.log(count.value));
 * ```
 */
export function effect(callback: () => void | (() => void)): () => void {
  return rawEffect(callback);
}

/**
 * @description Batches multiple signal updates into a single notification cycle.
 * @param callback - Function executing multiple signal mutations.
 * @returns Result of the callback execution.
 * @example
 * ```ts
 * import { signal, batch } from "./mod.ts";
 * const a = signal(1);
 * const b = signal(2);
 * batch(() => { a.value = 10; b.value = 20; });
 * ```
 */
export function batch<T>(callback: () => T): T {
  return rawBatch(callback);
}

export {
  App,
  Content,
  countWireIslands,
  countWireNodes,
  createBrowserIO,
  createMemoryIO,
  createSWFetchHandler,
  defaultRegistry,
  defaultShell,
  dynamicIslandsCache,
  hydrateIslands,
  initRouter,
  isSWControlling,
  loadDoc,
  mdastToWire,
  Navbar,
  navigateTo,
  parseMarkdown,
  processMarkdown,
  registerServiceWorker,
  resolveDocPath,
  sanitizeProps,
  SearchBox,
  Sidebar,
  slugify,
  ThemeToggle,

  wireToVNode,
};

export type {
  CacheIOOptions,
  ComponentRegistry,
  DocConfig,
  HydrateOptions,
  IO,
  MdastRoot,
  SearchBoxProps,
  SWPluginOptions,
  Wire,
  WireComponent,
  WireDoc,
  WireElement,
  WireFragment,
  WireIsland,
  WireToVNodeOptions,
};




/**
 * @description Transpiler and Service Worker pipeline suite bundled with mdBlog.
 */
const mdTranspiler = {
  countWireIslands,
  countWireNodes,
  createBrowserIO,
  createMemoryIO,
  createSWFetchHandler,
  defaultShell,
  isSWControlling,
  loadDoc,
  mdastToWire,
  parseMarkdown,
  processMarkdown,
  resolveDocPath,
  sanitizeProps,
  slugify,
};

export { mdTranspiler };
export default mdTranspiler;


// Disponibiliza a biblioteca e todas as primitivas no escopo global para consumo direto no browser
if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).mdBlog = {
    App,
    Navbar,
    Sidebar,
    Content,
    ThemeToggle,
    SearchBox,
    initRouter,
    navigateTo,
    registerServiceWorker,
    state,
    mdTranspiler,
    hydrateIslands,
    // Primitivas reativas e de renderização para ilhas
    html,
    signal,
    useSignal,
    computed,
    effect,
    batch,
    h,
    render,
    hydrate,
    Component,
    Fragment,
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
    useContext,
  };
}

/**
 * Inicialização automática no browser:
 * 1. Procura o container #app (ou cria um se ausente).
 * 2. Tenta carregar um app.js customizado do usuário caso exista.
 * 3. Caso NÃO exista app.js, utiliza automaticamente o App padrão com todos os componentes da biblioteca embutidos.
 * 4. Inicializa o router reativo e registra o Service Worker.
 */
async function bootstrap() {
  let root = document.getElementById("app");
  if (!root && document.body) {
    root = document.createElement("div");
    root.id = "app";
    document.body.appendChild(root);
  }

  // 1. Verifica se há um componente customizado provido via window ou arquivo app.js
  let ComponentToMount = App;

  const g = typeof globalThis !== "undefined"
    ? (globalThis as Record<string, unknown>)
    : null;
  if (g && typeof g.mdBlogApp === "function") {
    ComponentToMount = g.mdBlogApp as typeof App;
  } else {
    try {
      // Tenta importar dinamicamente app.js em tempo de execução no browser se existir
      const dynamicImport = new Function("path", "return import(path)");
      const userModule = await dynamicImport("./app.js").catch(() => null);
      if (userModule) {
        if (typeof userModule.App === "function") {
          ComponentToMount = userModule.App;
        } else if (typeof userModule.default === "function") {
          ComponentToMount = userModule.default;
        }
      }
    } catch {
      // Nenhum app.js encontrado: usa a biblioteca e componentes embutidos por padrão
    }
  }

  if (root) {
    render(html`<${ComponentToMount} />`, root);
  }

  // Inicializa o roteador para leitura reativa dos artigos
  initRouter();

  // Registra o Service Worker padrão com escopo relativo
  registerServiceWorker();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bootstrap().catch((err) =>
        console.error("[mdBlog] Bootstrap error:", err)
      );
    });
  } else {
    bootstrap().catch((err) => console.error("[mdBlog] Bootstrap error:", err));
  }
}
