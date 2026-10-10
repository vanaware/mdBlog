import { type ComponentType, h, hydrate } from "preact";

export interface HydrateOptions {
  root?: HTMLElement;
}

/**
 * Registry em memória de componentes de ilhas importadas dinamicamente.
 */
const dynamicIslandsCache: Record<string, ComponentType<any>> = {};

/**
 * Rotina PRINCIPAL de hidratação de ilhas dinâmicas sob demanda.
 * Carrega exclusivamente componentes de ./islands/${islandFileName}.
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
    // Evita dupla hidratação
    if (el.dataset.islandHydrated === "true") {
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
        el.dataset.islandHydrated = "true";
        delete el.dataset.islandMissing;
        hydrate(h(cachedComp, dynamicProps), el);
        hydratedCount++;
        continue;
      } catch (err) {
        console.error(`[hydrate] Falha ao hidratar ilha "${name}" em cache:`, err);
        el.dataset.islandError = "true";
        continue;
      }
    }

    // 2. Rotina principal: import dinâmico nativo exclusivamente de ./islands/
    if (typeof globalThis !== "undefined") {
      try {
        const dynamicImport = new Function("path", "return import(path)");
        const mod = await dynamicImport(`./islands/${islandFileName}`);
        const dynamicComp = mod
          ? (mod[baseName] || mod.default || mod[Object.keys(mod)[0]])
          : null;

        if (dynamicComp) {
          dynamicIslandsCache[name] = dynamicComp;
          dynamicIslandsCache[islandFileName] = dynamicComp;
          dynamicIslandsCache[baseName] = dynamicComp;

          el.dataset.islandHydrated = "true";
          delete el.dataset.islandMissing;
          try {
            hydrate(h(dynamicComp, dynamicProps), el);
            hydratedCount++;
          } catch (err) {
            console.error(`[hydrate] Falha na hidratação de "${name}":`, err);
            el.dataset.islandError = "true";
          }
        } else {
          el.dataset.islandMissing = "true";
        }
      } catch (err) {
        console.warn(`[hydrate] Ilha dinâmica não encontrada em ./islands/${islandFileName}:`, err);
        el.dataset.islandMissing = "true";
      }
    } else {
      el.dataset.islandMissing = "true";
    }
  }

  return hydratedCount;
}
