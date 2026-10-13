import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import type { VNode, } from "preact";
import { wireToVNode, } from "../src/render/from-wire.ts";
import { dynamicIslandsCache, } from "../src/render/hydrate-islands.ts";
import { slugify, } from "../src/plugin/detect.ts";
import type {
  WireComponent,
  WireFragment,
  WireIsland,
} from "../src/plugin/wire.ts";

describe("Render Layer & Registry", () => {
  it("slugifies heading text into URL-friendly IDs", () => {
    assertEquals(
      slugify("Meu Título com Acentuação!",),
      "meu-titulo-com-acentuacao",
    );
    assertEquals(slugify("Getting Started & Setup",), "getting-started-setup",);
    assertEquals(slugify("   Espaços extras   ",), "espacos-extras",);
  });

  it("converts WireFragment into Preact VNodes without dangerouslySetInnerHTML", () => {
    const fragment: WireFragment = {
      t: "f",
      c: [
        {
          t: "c",
          n: "Heading",
          p: { depth: 2, id: "subtitulo", },
          c: ["Subtítulo Teste",],
        } as WireComponent,
        {
          t: "c",
          n: "Paragraph",
          p: {},
          c: ["Texto do parágrafo.",],
        } as WireComponent,
      ],
    };

    const vnode = wireToVNode(fragment,);
    assert(vnode !== null,);

    const serialized = JSON.stringify(vnode,);
    assert(!serialized.includes("dangerouslySetInnerHTML",),);
  });

  it("renders headings with BeerCSS wrap class and balanced hierarchy without non-wrapping row", async () => {
    const { Heading, } = await import("../src/render/registry.ts");
    const h1Node = Heading({
      depth: 1,
      id: "titulo-principal",
      children: "Título Principal",
    },) as VNode<{ class: string }>;
    const h2Node = Heading({
      depth: 2,
      id: "secao",
      children: "Subseção",
    },) as VNode<{ class: string }>;

    // depth 1 maps to h4 with wrap class
    assertEquals(h1Node.type, "h4",);
    assert(h1Node.props.class.includes("wrap",),);
    assert(!h1Node.props.class.includes("row",),);

    // depth 2 maps to h5 with wrap class
    assertEquals(h2Node.type, "h5",);
    assert(h2Node.props.class.includes("wrap",),);
  });

  it("renders a striped table with a distinct header band", async () => {
    const { Table, TableRow, TableCell, } = await import(
      "../src/render/registry.ts"
    );

    const wrapper = Table({ children: "sections", },) as VNode<{
      children: VNode<{ class: string }>;
    }>;
    const table = wrapper.props.children;
    assertEquals(table.type, "table",);
    // "stripes" é a única fonte do fundo alternado (table.stripes > tbody >
    // tr:nth-child(odd) usa --active, o mesmo cinza translúcido nos dois temas).
    assert(table.props.class.includes("stripes",),);
    assert(table.props.class.includes("border",),);

    const head = TableCell({
      header: true,
      align: "center",
      children: "Qtde",
    },) as VNode<{ class: string }>;
    assertEquals(head.type, "th",);
    assert(head.props.class.includes("primary-container",),);
    // O alinhamento GFM só chega ao ecrã através das classes do BeerCSS, que
    // são exatamente estas três; qualquer outro nome seria ignorado em silêncio.
    assert(head.props.class.includes("center-align",),);

    const unknownAlign = TableCell({
      align: "justify",
      children: "x",
    },) as VNode<
      { class?: string }
    >;
    assertEquals(unknownAlign.props.class, undefined,);

    const body = TableCell({ children: "3", },) as VNode<{
      class?: string;
    }>;
    assertEquals(body.type, "td",);
    assert(!(body.props.class ?? "").includes("primary-container",),);

    const row = TableRow({ children: "cells", },) as VNode<
      Record<string, never>
    >;
    assertEquals(row.type, "tr",);
  });

  it("marks missing islands with data-island-missing", () => {
    const islandNode: WireIsland = {
      t: "i",
      n: "NonExistentIsland",
      p: { test: true, },
      c: [],
    };

    const vnode = wireToVNode(islandNode, { islands: {}, },) as VNode<
      Record<string, string>
    >;
    assert(vnode !== null,);
    assertEquals(vnode.props["data-island"], "NonExistentIsland",);
    assertEquals(vnode.props["data-island-missing"], "true",);
  });

  it("leaves island containers empty for selective hydration", () => {
    const islandNode: WireIsland = {
      t: "i",
      n: "CounterLazy.js",
      p: { start: 7, },
      c: [],
    };

    // Mesmo com o módulo já em cache (hidratado antes), a árvore principal não
    // toma o container para si: dois donos no mesmo slot duplicariam o widget.
    dynamicIslandsCache["CounterLazy.js"] = function CounterLazy() {
      return null;
    };
    try {
      const vnode = wireToVNode(islandNode,) as VNode<
        Record<string, string | null>
      >;
      assertEquals(vnode.props["data-island"], "CounterLazy.js",);
      assertEquals(vnode.props["data-island-prerendered"], undefined,);
      assertEquals(vnode.props["data-island-missing"], undefined,);
      assertEquals(vnode.props.children, null,);
    } finally {
      delete dynamicIslandsCache["CounterLazy.js"];
    }
  });

  it("marks pre-rendered islands as owned by the main tree", () => {
    const islandNode: WireIsland = {
      t: "i",
      n: "CounterStatic.js",
      p: { start: 7, },
      c: [],
    };

    const vnode = wireToVNode(islandNode, {
      islands: {
        "CounterStatic.js": function CounterStatic() {
          return null;
        },
      },
    },) as VNode<Record<string, string | null>>;

    assertEquals(vnode.props["data-island-prerendered"], "true",);
    assertEquals(vnode.props["data-island-missing"], undefined,);
    assert(vnode.props.children != null,);
  });
});
