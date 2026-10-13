import { type ComponentType, h, render, } from "preact";

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
export const dynamicIslandsCache: Record<string, unknown> = {};

const inFlightImports: Record<string, Promise<Record<string, any> | null>> = {};

/**
 * @description Containers claimed by a hydration pass that is still running. A node is claimed before the first `await` so a second, overlapping pass cannot mount the same island a second time.
 */
const claimedNodes = new WeakSet<Element>();

/** @description Scan currently in flight, used to serialize concurrent hydration calls. */
let activePass: Promise<number> | null = null;

/** @description Roots requested by calls that arrived while a pass was already running. */
const pendingRoots = new Set<HTMLElement>();

if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).__mdblog_islands =
    dynamicIslandsCache;
}

function mountIsland(
  comp: ComponentType<any>,
  props: Record<string, unknown>,
  el: HTMLElement,
) {
  // Desmonta eventual root anterior deste container. Sem isso, uma segunda
  // montagem encontraria o vnode antigo ainda associado a nós já removidos do
  // DOM e produziria uma cópia extra do widget no mesmo slot.
  render(null, el,);
  el.innerHTML = "";
  render(h(comp, props as any,), el,);
}

/**
 * @description Reads and parses the current `data-props` of an island container.
 * @param el - The island placeholder element.
 * @returns Parsed props, or an empty object when the payload is invalid.
 */
function readIslandProps(el: HTMLElement,): Record<string, unknown> {
  try {
    return JSON.parse(el.dataset.props || "{}",);
  } catch (_) {
    // Ignora erro de parsing
    return {};
  }
}

/**
 * @description Stamps a container as mounted by this function, together with the exact props rendered.
 */
function markMounted(el: HTMLElement,): void {
  el.dataset.islandHydrated = "true";
  el.dataset.islandMountedProps = el.dataset.props ?? "{}";
  delete el.dataset.islandMissing;
}

/**
 * @description Mounts a single `[data-island]` container, importing its HTML+ES module on demand.
 * @param el - The island placeholder element.
 * @returns Resolves to `true` when the island was mounted (or already mounted by the main tree).
 */
async function hydrateNode(el: HTMLElement,): Promise<boolean> {
  const name = el.dataset.island;
  if (!name) return false;

  const islandFileName = name.endsWith(".js",) ? name : `${name}.js`;
  const baseName = islandFileName.replace(/\.js$/, "",);

  // 1. Verifica se já está em cache em memória
  const cachedComp = dynamicIslandsCache[name] ||
    dynamicIslandsCache[islandFileName] ||
    dynamicIslandsCache[baseName];

  if (cachedComp) {
    try {
      mountIsland(cachedComp as ComponentType<any>, readIslandProps(el,), el,);
      markMounted(el,);
      return true;
    } catch (err) {
      console.error(
        `[hydrate] Falha ao hidratar ilha "${name}" em cache:`,
        err,
      );
      el.dataset.islandError = "true";
      return false;
    }
  }

  // 2. Rotina principal: import dinâmico nativo de ./islands/
  try {
    if (!inFlightImports[islandFileName]) {
      const islandUrl = globalThis.location
        ? new URL(`./islands/${islandFileName}`, globalThis.location.href,).href
        : `./islands/${islandFileName}`;

      const dynamicImport = new Function("path", "return import(path)",);
      inFlightImports[islandFileName] = dynamicImport(islandUrl,).catch(() =>
        dynamicImport(`./islands/${islandFileName}`,)
      );
    }

    const mod = await inFlightImports[islandFileName];

    const firstKey = mod ? Object.keys(mod,)[0] : undefined;
    const dynamicComp = (mod
      ? (mod[baseName] || mod.default || (firstKey ? mod[firstKey] : null))
      : null) as ComponentType<any> | null;

    if (dynamicComp) {
      dynamicIslandsCache[name] = dynamicComp;
      dynamicIslandsCache[islandFileName] = dynamicComp;
      dynamicIslandsCache[baseName] = dynamicComp;

      // Relê as props: elas podem ter mudado enquanto o import estava em voo
      mountIsland(dynamicComp, readIslandProps(el,), el,);
      markMounted(el,);
      return true;
    }

    el.dataset.islandMissing = "true";
    return false;
  } catch (err) {
    console.warn(
      `[hydrate] Falha ao carregar ilha ./islands/${islandFileName}:`,
      err,
    );
    el.dataset.islandError = "true";
    return false;
  }
}

async function scanIslands(root: HTMLElement,): Promise<number> {
  const nodes = root.querySelectorAll<HTMLElement>("[data-island]",);
  let hydratedCount = 0;

  for (const el of nodes) {
    // Container pré-renderizado pela árvore principal: ela é a dona das props.
    if (el.dataset.islandPrerendered === "true") continue;

    const props = el.dataset.props ?? "{}";
    const mounted = el.dataset.islandMountedProps;

    // Já montado por esta função com as mesmas props: nada a fazer. Quando as
    // props mudam (navegação SPA reaproveita o mesmo elemento DOM) a ilha é
    // remontada, senão ficaria exibindo a instância do documento anterior.
    if (mounted !== undefined && mounted === props) continue;

    // Passada concorrente assumiu este nó e ainda está em `await`
    if (claimedNodes.has(el,)) continue;

    claimedNodes.add(el,);
    const didMount = await hydrateNode(el,);
    // A reivindicação dura apenas enquanto houver `await` pendente: as marcas
    // `data-island-*` passam a ser o sinal durável de "já montado com estas
    // props", permitindo remontar quando o documento mudar as props da ilha.
    claimedNodes.delete(el,);
    if (didMount) hydratedCount++;
  }

  return hydratedCount;
}

/**
 * @description Scans the DOM for dynamic `[data-island]` markers and hydrates them on-demand. Loads HTML+ES modules dynamically from `./islands/${islandFileName}` with zero bundler dependency. Concurrent calls are serialized: the island tree is mounted exactly once per container even when several entry points (router timeout, view effects, manual API) trigger hydration during the same render.
 * @param opts - Configuration options specifying root DOM node.
 * @returns Resolves to the count of newly hydrated island components.
 * @example
 * ```ts
 * import { hydrateIslands } from "./render/hydrate-islands.ts";
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

  if (activePass) {
    pendingRoots.add(root,);
    return activePass;
  }

  const pass = (async () => {
    let total = await scanIslands(root,);
    // Chamadas que chegaram durante a varredura pedem uma passada extra: é o
    // que captura placeholders criados por um re-render posterior ao `await`.
    while (pendingRoots.size > 0) {
      const queued = [...pendingRoots,];
      pendingRoots.clear();
      for (const nextRoot of queued) {
        total += await scanIslands(nextRoot,);
      }
    }
    return total;
  })();

  activePass = pass;
  try {
    return await pass;
  } finally {
    if (activePass === pass) activePass = null;
  }
}
