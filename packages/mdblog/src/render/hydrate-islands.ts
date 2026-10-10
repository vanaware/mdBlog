import { type ComponentType, h, render } from "preact";
import { getAppBaseUrl } from "../plugin/detect.ts";

export interface HydrateOptions {
  root?: HTMLElement;
}

/**
 * Registry em memória de componentes de ilhas importadas dinamicamente.
 */
export const dynamicIslandsCache: Record<string, ComponentType<any>> = {};

if (typeof globalThis !== "undefined") {
  (globalThis as any).__mdblog_islands = dynamicIslandsCache;
}

function mountIsland(
  comp: ComponentType<any>,
  props: Record<string, any>,
  el: HTMLElement,
) {
  el.innerHTML = "";
  render(h(comp, props), el);
}

/**
 * Rotina PRINCIPAL de hidratação de ilhas dinâmicas sob demanda.
 * Carrega componentes de ./islands/${islandFileName}.
 */
export async function hydrateIslands(
  opts: HydrateOptions = {},
): Promise<number> {
  if (typeof document === "undefined") {
    return 0;
  }

  const root = opts.root ?? document.body;
  const nodes = root.querySelectorAll<HTMLElement>("[data-island]");
  let hydratedCount = 0;

  for (const el of nodes) {
    // Se o elemento já tiver filhos renderizados e estiver marcado, pula
    if (el.dataset.islandHydrated === "true" && el.children.length > 0) {
      continue;
    }

    const name = el.dataset.island;
    if (!name) continue;

    const islandFileName = name.endsWith(".js") ? name : `${name}.js`;
    const baseName = islandFileName.replace(/\.js$/, "");

    let dynamicProps: Record<string, any> = {};
    try {
      dynamicProps = JSON.parse(el.dataset.props || "{}");
    } catch (_) {
      // Ignora erro de parsing
    }

    // 1. Verifica se já está em cache em memória
    const cachedComp = dynamicIslandsCache[name] ||
      dynamicIslandsCache[islandFileName] ||
      dynamicIslandsCache[baseName];

    if (cachedComp) {
      try {
        mountIsland(cachedComp, dynamicProps, el);
        el.dataset.islandHydrated = "true";
        delete el.dataset.islandMissing;
        hydratedCount++;
        continue;
      } catch (err) {
        console.error(`[hydrate] Falha ao hidratar ilha "${name}" em cache:`, err);
        el.dataset.islandError = "true";
        continue;
      }
    }

    // 2. Rotina principal: import dinâmico nativo de ./islands/
    if (typeof globalThis !== "undefined") {
      try {
        const baseUrl = getAppBaseUrl();
        const islandUrl = `${baseUrl}islands/${islandFileName}`;

        const dynamicImport = new Function("path", "return import(path)");
        const mod = await dynamicImport(islandUrl).catch(() =>
          dynamicImport(`./islands/${islandFileName}`)
        );

        const dynamicComp = mod
          ? (mod[baseName] || mod.default || mod[Object.keys(mod)[0]])
          : null;

        if (dynamicComp) {
          dynamicIslandsCache[name] = dynamicComp;
          dynamicIslandsCache[islandFileName] = dynamicComp;
          dynamicIslandsCache[baseName] = dynamicComp;

          mountIsland(dynamicComp, dynamicProps, el);
          el.dataset.islandHydrated = "true";
          delete el.dataset.islandMissing;
          hydratedCount++;
        } else {
          el.dataset.islandMissing = "true";
        }
      } catch (err) {
        console.warn(`[hydrate] Falha ao carregar ilha ./islands/${islandFileName}:`, err);
        el.dataset.islandError = "true";
      }
    } else {
      el.dataset.islandMissing = "true";
    }
  }

  return hydratedCount;
}
