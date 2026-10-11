import { type ComponentType, h, render } from "preact";

/**
 * @description Options for island selective hydration.
 */
export interface HydrateOptions {
  /** @description Root DOM container element to scan for islands. Defaults to document.body. */
  root?: HTMLElement;
}

/**
 * @description In-memory registry cache of dynamically imported island components.
 */
export const dynamicIslandsCache: Record<string, ComponentType<any>> = {};

const inFlightImports: Record<string, Promise<Record<string, any> | null>> = {};

if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).__mdblog_islands = dynamicIslandsCache;
}

function mountIsland(
  comp: ComponentType<any>,
  props: Record<string, unknown>,
  el: HTMLElement,
) {
  el.innerHTML = "";
  render(h(comp, props as any), el);
}

/**
 * @description Scans the DOM for dynamic `[data-island]` markers and hydrates them on-demand.
 * Loads HTML+ES modules dynamically from `./islands/${islandFileName}` with zero bundler dependency.
 * @param opts - Configuration options specifying root DOM node.
 * @returns Resolves to the count of newly hydrated island components.
 * @example
 * ```ts
 * import { hydrateIslands } from "./hydrate-islands.ts";
 * const hydrated = await hydrateIslands();
 * console.log(`Hydrated ${hydrated} islands.`);
 * ```
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

    let dynamicProps: Record<string, unknown> = {};
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
        if (!inFlightImports[islandFileName]) {
          const islandUrl = globalThis.location
            ? new URL(`./islands/${islandFileName}`, globalThis.location.href).href
            : `./islands/${islandFileName}`;

          const dynamicImport = new Function("path", "return import(path)");
          inFlightImports[islandFileName] = dynamicImport(islandUrl).catch(() =>
            dynamicImport(`./islands/${islandFileName}`)
          );
        }

        const mod = await inFlightImports[islandFileName];

        const firstKey = mod ? Object.keys(mod)[0] : undefined;
        const dynamicComp = (mod
          ? (mod[baseName] || mod.default || (firstKey ? mod[firstKey] : null))
          : null) as ComponentType<any> | null;

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
