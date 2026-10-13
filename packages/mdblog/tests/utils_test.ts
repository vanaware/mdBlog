import { assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  articleHrefFromPath,
  estimateReadingTimeMinutes,
  extractTocHeadings,
  findAdjacentArticles,
  normalizePath,
  tocRailHeight,
} from "../src/utils.ts";
import type { ArticleItem, } from "../src/state.ts";
import type { WireFragment, } from "../src/plugin/wire.ts";

describe("normalizePath", () => {
  it("normalizes hash routes with articles prefix", () => {
    assertEquals(normalizePath("#/articles/intro.md",), "intro.md",);
  });

  it("normalizes relative paths with docs prefix", () => {
    assertEquals(normalizePath("./docs/guide.md",), "guide.md",);
  });

  it("normalizes plain relative paths", () => {
    assertEquals(normalizePath("./articles/overview.md",), "overview.md",);
  });

  it("falls back to index.md for empty or root variants", () => {
    assertEquals(normalizePath("",), "index.md",);
    assertEquals(normalizePath("#/",), "index.md",);
    assertEquals(normalizePath("index",), "index.md",);
  });
});

describe("articleHrefFromPath", () => {
  it("builds root hash for the home page", () => {
    assertEquals(articleHrefFromPath("./articles/index.md",), "#/",);
  });

  it("builds hash route for regular articles", () => {
    assertEquals(articleHrefFromPath("./articles/intro.md",), "#/intro.md",);
  });
});

describe("extractTocHeadings", () => {
  const wire: WireFragment = {
    t: "f",
    c: [
      { t: "c", n: "Heading", p: { depth: 1, id: "title", }, c: ["Title",], },
      {
        t: "c",
        n: "Heading",
        p: { depth: 2, id: "intro", },
        c: ["Intro ", { t: "e", n: "strong", c: ["Bold",], },],
      },
      { t: "c", n: "Paragraph", c: ["text",], },
      {
        t: "c",
        n: "Heading",
        p: { depth: 3, id: "details", },
        c: ["Details",],
      },
      {
        t: "c",
        n: "Heading",
        p: { depth: 4, id: "deep", },
        c: ["Too deep",],
      },
    ],
  };

  it("collects only h2..h3 headings with ids in document order", () => {
    const toc = extractTocHeadings(wire,);
    assertEquals(toc, [
      { id: "intro", text: "Intro Bold", depth: 2, },
      { id: "details", text: "Details", depth: 3, },
    ],);
  });

  it("returns empty list when no headings match", () => {
    assertEquals(extractTocHeadings({ t: "f", c: ["plain",], },), [],);
  });
});

describe("estimateReadingTimeMinutes", () => {
  it("rounds word count to whole minutes", () => {
    const text = "word ".repeat(400,);
    assertEquals(estimateReadingTimeMinutes(text,), 2,);
  });

  it("returns at least one minute for short documents", () => {
    assertEquals(estimateReadingTimeMinutes("short doc",), 1,);
  });

  it("ignores frontmatter blocks", () => {
    const doc = "---\ntitle: Test\n---\n" + "word ".repeat(200,);
    assertEquals(estimateReadingTimeMinutes(doc,), 1,);
  });
});

describe("findAdjacentArticles", () => {
  const list: ArticleItem[] = ["index.md", "a.md", "b.md",].map((name,) => ({
    name,
    slug: name.replace(/\.md$/, "",),
    path: `./articles/${name}`,
    title: name,
    icon: "article",
    depth: 0,
  }));

  it("returns null prev at the first article", () => {
    const { prev, next, } = findAdjacentArticles(list, "#/articles/index.md",);
    assertEquals(prev, null,);
    assertEquals(next?.name, "a.md",);
  });

  it("returns both neighbors for middle articles", () => {
    const { prev, next, } = findAdjacentArticles(list, "./articles/a.md",);
    assertEquals(prev?.name, "index.md",);
    assertEquals(next?.name, "b.md",);
  });

  it("returns null next at the last article", () => {
    const { prev, next, } = findAdjacentArticles(list, "b.md",);
    assertEquals(prev?.name, "a.md",);
    assertEquals(next, null,);
  });

  it("returns nulls when the path is unknown", () => {
    const { prev, next, } = findAdjacentArticles(list, "missing.md",);
    assertEquals(prev, null,);
    assertEquals(next, null,);
  });
});

describe("tocRailHeight", () => {
  it("grows the box with the screen instead of with the entry count", () => {
    assertEquals(tocRailHeight(900,).heightClass, "large-height",);
    assertEquals(tocRailHeight(600,).heightClass, "medium-height",);
    assertEquals(tocRailHeight(400,).heightClass, "small-height",);
  });

  it("reports the pixel height each class sets", () => {
    assertEquals(tocRailHeight(900,).maxHeightPx, 576,);
    assertEquals(tocRailHeight(600,).maxHeightPx, 384,);
    assertEquals(tocRailHeight(400,).maxHeightPx, 192,);
  });

  it("falls back to the shortest box on tiny viewports", () => {
    assertEquals(tocRailHeight(0,).heightClass, "small-height",);
    assertEquals(tocRailHeight(0,).maxHeightPx, 192,);
  });
});
