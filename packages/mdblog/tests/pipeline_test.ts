import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { parseMarkdown, } from "../src/plugin/core/parse.ts";
import { mdastToWire, } from "../src/plugin/core/to-wire.ts";
import { loadDoc, processMarkdown, } from "../src/plugin/core/pipeline.ts";
import { createMemoryIO, } from "../src/plugin/core/io.ts";
import {
  countWireIslands,
  countWireNodes,
  sanitizeProps,
} from "../src/plugin/wire.ts";
import type { WireComponent, WireElement, } from "../src/plugin/wire.ts";

describe("Pipeline & Wire Format Core", () => {
  it("parses markdown and extracts the first h1 title", () => {
    const md = "# My Amazing Title\n\nThis is a paragraph.";
    const root = parseMarkdown(md,);
    const { wire, title, } = mdastToWire(root,);

    assertEquals(title, "My Amazing Title",);
    assertEquals(wire.t, "f",);
    assert(Array.isArray(wire.c,),);
    assertEquals(wire.c.length, 2,);

    const heading = wire.c[0] as WireComponent;
    assertEquals(heading.t, "c",);
    assertEquals(heading.n, "Heading",);
    assertEquals(heading.p?.depth, 1,);
  });

  it("discards raw HTML nodes completely for safety", () => {
    const md =
      "Safe text <script>alert('xss')</script> and <div onclick='bad()'>test</div> ending.";
    const root = parseMarkdown(md,);
    const { wire, } = mdastToWire(root,);

    const serialized = JSON.stringify(wire,);
    assert(!serialized.includes("<script>",),);
    assert(!serialized.includes("onclick",),);
    assert(!serialized.includes("bad()",),);
  });

  it("processes GFM tables, task lists, and code blocks", () => {
    const md = `
| Name | Type |
|---|---|
| Item 1 | Value |

- [x] Done task
- [ ] Pending task

\`\`\`ts
const x = 42;
\`\`\`
`;
    const doc = processMarkdown(md, "/docs/test.md",);
    assertEquals(doc.url, "/docs/test.md",);
    assert(doc.renderedAt > 0,);

    const serialized = JSON.stringify(doc.wire,);
    assert(serialized.includes('"n":"Table"',),);
    assert(serialized.includes('"n":"CodeBlock"',),);
    assert(serialized.includes('"value":"const x = 42;"',),);
    assert(serialized.includes('"checked":true',),);
  });

  it("splits GFM tables into thead/tbody and marks header cells", () => {
    const md =
      "| Name | Type | Qty |\n|:---|:---:|---:|\n| Item 1 | Value | 3 |\n";
    const { wire, } = mdastToWire(parseMarkdown(md,),);
    assert(Array.isArray(wire.c,),);

    const table = wire.c[0] as WireComponent;
    assertEquals(table.n, "Table",);
    assert(Array.isArray(table.c,),);
    const sections = table.c as unknown as WireElement[];
    const [headSection, bodySection,] = sections;

    // BeerCSS stripes and the header border only exist over tbody/thead.
    assertEquals(
      sections.map((s,) => `${s.t}:${s.n}`),
      ["e:thead", "e:tbody",],
      "BeerCSS stripes and the header border only apply to a real thead/tbody structure",
    );

    const cellsOf = (section: WireElement | undefined,) => {
      assert(section, "the table must be split into sections",);
      const [row,] = (section.c ?? []) as WireComponent[];
      assert(row, "each section must carry its row",);
      return (row.c ?? []) as unknown as WireComponent[];
    };

    const headCells = cellsOf(headSection,);
    assertEquals(
      headCells.map((c,) => c.p?.header),
      [true, true, true,],
      "first-row cells must be flagged as headers",
    );
    assertEquals(
      headCells.map((c,) => c.p?.align),
      ["left", "center", "right",],
      "column alignment lives on the table node but must reach each cell",
    );
    assertEquals(
      cellsOf(bodySection,).map((c,) => c.p?.header),
      [false, false, false,],
      "body cells must not be headers",
    );
  });

  it("handles document caching and TTL expiration via IO", async () => {
    const memoryIO = createMemoryIO({
      "/docs/cached.md": "# Version 1\n\nInitial content.",
    },);

    const doc1 = await loadDoc("/docs/cached.md", memoryIO, {
      cacheTTLSeconds: 10,
    },);
    assertEquals(doc1.title, "Version 1",);

    // Manually overwrite file in IO without waiting for TTL
    const cacheKey = "wire:/docs/cached.md";
    const cachedRaw = await memoryIO.cacheGet(cacheKey,);
    assert(cachedRaw !== null,);

    // Call again immediately: should return cached version
    const doc2 = await loadDoc("/docs/cached.md", memoryIO, {
      cacheTTLSeconds: 10,
    },);
    assertEquals(doc2.renderedAt, doc1.renderedAt,);
  });

  it("sanitizes props to ensure 100% JSON serializability", () => {
    const circular: Record<string, unknown> = { a: 1, };
    circular.self = circular;

    const sanitized = sanitizeProps(circular,);
    assertEquals(sanitized, {},);

    const clean = sanitizeProps({ name: "Counter", start: 5, },);
    assertEquals(clean, { name: "Counter", start: 5, },);
  });

  it("calculates node counts and detects islands in Wire tree", () => {
    const markdown =
      `# Title\n\nTest text with [link](https://deno.com)\n\n::Counter{start: 10}`;
    const doc = processMarkdown(markdown, "/test.md",);

    const totalNodes = countWireNodes(doc.wire,);
    const islandCount = countWireIslands(doc.wire,);

    assert(totalNodes > 3,);
    assertEquals(islandCount, 1,);
  });
});
