import { Component, Fragment, h, hydrate, render } from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { html } from "htm/preact";
import { batch, computed, effect, signal, useSignal } from "@preact/signals";
import { App } from "./components/App.js";
import { Navbar } from "./components/Navbar.js";
import { Sidebar } from "./components/Sidebar.js";
import { Content } from "./components/Content.js";
import { ThemeToggle } from "./components/ThemeToggle.js";
import { SearchBox } from "./components/SearchBox.js";
import { initRouter, navigateTo } from "./router.ts";
import { registerServiceWorker } from "./register-sw.ts";
import * as state from "./state.ts";
import * as mdTranspiler from "./lib/md-transpiler.ts";
import { hydrateIslands } from "./render/hydrate-islands.ts";

// Exporta todos os componentes, ferramentas e primitivas para consumo direto de ilhas e apps externos
export {
  App,
  batch,
  Component,
  computed,
  Content,
  effect,
  Fragment,
  h,
  html,
  hydrate,
  hydrateIslands,
  initRouter,
  mdTranspiler,
  Navbar,
  navigateTo,
  registerServiceWorker,
  render,
  SearchBox,
  Sidebar,
  signal,
  state,
  ThemeToggle,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSignal,
  useState,
};

export default mdTranspiler;

// Disponibiliza a biblioteca e todas as primitivas no escopo global para consumo direto no browser
if (typeof globalThis !== "undefined") {
  (globalThis as any).mdBlog = {
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

  if (typeof globalThis !== "undefined" && (globalThis as any).mdBlogApp) {
    ComponentToMount = (globalThis as any).mdBlogApp;
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
