import {
  type ComponentChildren,
  type ComponentType,
  Fragment,
  h,
  type VNode,
} from "preact";
import type {
  Wire,
  WireComponent,
  WireElement,
  WireFragment,
  WireIsland,
} from "../plugin/wire.ts";
import { defaultRegistry } from "./registry.ts";
import { dynamicIslandsCache } from "./hydrate-islands.ts";

/**
 * @description Map of component names to component implementations.
 */
export type ComponentRegistry = Record<string, unknown>;

/**
 * @description Options for rendering Wire AST to Preact VNodes.
 */
export interface WireToVNodeOptions {
  /** @description Custom component registry override. */
  registry?: ComponentRegistry;
  /** @description Island component registry map. */
  islands?: Record<string, unknown>;
}

/**
 * @description Transforms a Wire node tree into Preact VNodes without dangerouslySetInnerHTML.
 * Ensures complete XSS safety and maps elements and components to Preact virtual DOM.
 * @param wire - Wire AST node, array of nodes, or primitive.
 * @param options - Optional custom components and islands registries.
 * @returns Preact VNode, children, or primitive renderable by Preact.
 * @example
 * ```ts
 * import { wireToVNode } from "./from-wire.ts";
 * const vnode = wireToVNode({ t: "c", n: "Paragraph", c: ["Hello"] });
 * ```
 */
export function wireToVNode(
  wire: Wire,
  options: WireToVNodeOptions = {},
): unknown {

  const registry: Record<string, any> = {
    ...defaultRegistry,
    ...options.registry,
  };
  const islandRegistry: Record<string, any> = options.islands ?? {};


  if (wire === null || wire === undefined) {
    return null;
  }

  // Primitive types
  if (
    typeof wire === "string" || typeof wire === "number" ||
    typeof wire === "boolean"
  ) {
    return wire;
  }

  // Array of nodes
  if (Array.isArray(wire)) {
    return wire.map((item, index) =>
      h(Fragment, { key: index }, wireToVNode(item, options) as any)
    );
  }

  // Object node
  const node = wire as WireElement | WireComponent | WireIsland | WireFragment;

  switch (node.t) {
    case "f": {
      const children = (node.c ?? []).map((child, idx) =>
        h(Fragment, { key: idx }, wireToVNode(child, options) as any)
      );
      return h(Fragment, null, children);
    }

    case "e": {
      const children = (node.c ?? []).map((child, idx) =>
        h(Fragment, { key: idx }, wireToVNode(child, options) as any)
      );
      return h(node.n, (node.p ?? {}) as Record<string, unknown>, children);
    }

    case "c": {
      const Comp = (registry[node.n] ?? registry.Unknown) as ComponentType<
        Record<string, unknown>
      >;
      const children = (node.c ?? []).map((child, idx) =>
        h(Fragment, { key: idx }, wireToVNode(child, options) as any)
      );
      const props = { ...(node.p ?? {}), nodeType: node.n };
      return h(Comp, props, children);
    }

    case "i": {
      // Dynamic Island Node (HTML+ES)
      const islandFileName = node.n.endsWith(".js") ? node.n : `${node.n}.js`;
      const baseName = islandFileName.replace(/\.js$/, "");
      const Comp = islandRegistry[node.n] ||
        islandRegistry[islandFileName] ||
        islandRegistry[baseName] ||
        dynamicIslandsCache[node.n] ||
        dynamicIslandsCache[islandFileName] ||
        dynamicIslandsCache[baseName];
      const propsJson = JSON.stringify(node.p ?? {});
      const isMissing = options.islands !== undefined ? !Comp : false;

      // Children inside container for initial render / fallback
      let innerContent: ComponentChildren = null;
      if (Comp) {
        try {
          innerContent = h(Comp as any, (node.p ?? {}) as Record<string, unknown>);
        } catch (err) {
          console.warn(
            `[from-wire] Initial render error for island ${node.n}:`,
            err,
          );
        }
      }

      if (!innerContent && node.c && node.c.length > 0) {
        innerContent = (node.c ?? []).map((child, idx) =>
          h(Fragment, { key: idx }, wireToVNode(child, options) as any)
        );
      }


      return h("div", {
        "data-island": node.n,
        "data-props": propsJson,
        "data-island-missing": isMissing ? "true" : undefined,
        children: innerContent,
      });
    }

    default: {
      return null;
    }
  }
}

