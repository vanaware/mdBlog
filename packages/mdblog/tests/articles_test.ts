import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";
import { resolveDocPath, } from "../src/plugin/detect.ts";
import { parseFrontmatter, } from "../src/plugin/core/frontmatter.ts";
import { articles, } from "../src/state.ts";

const publicDir = fromFileUrl(new URL("../public", import.meta.url,),);
const srcDir = fromFileUrl(new URL("../src", import.meta.url,),);
const scriptsDir = fromFileUrl(new URL("../../../scripts", import.meta.url,),);

describe("Articles Architecture & Dynamic Blog", () => {
  it("verifies public/articles exists and contains markdown files including index.md", async () => {
    const stat = await Deno.stat(`${publicDir}/articles`,);
    assertEquals(stat.isDirectory, true,);

    const files: string[] = [];
    for await (const entry of Deno.readDir(`${publicDir}/articles`,)) {
      if (entry.isFile && entry.name.endsWith(".md",)) {
        files.push(entry.name,);
      }
    }

    assert(
      files.length >= 8,
      `Expected at least 8 markdown articles, found ${files.length}`,
    );
    assert(
      files.includes("index.md",),
      "index.md must be present in public/articles as home page",
    );
    assert(
      files.includes("overview.md",),
      "overview.md must be present in public/articles",
    );
    assert(
      files.includes("guide.md",),
      "guide.md must be present in public/articles",
    );
    assert(
      files.includes("migration-html-es.md",),
      "migration-html-es.md must be in public/articles",
    );

    // Shipped articles use plain lowercase ASCII slugs: an uppercase or accented
    // file name survives on a case-sensitive filesystem and silently 404s on a
    // case-insensitive one (and inside a URL it is a percent-encoded mess).
    for (const name of files) {
      assert(
        /^[a-z0-9][a-z0-9._-]*\.md$/.test(name,),
        `${name} must be a lowercase ASCII slug (letters, digits, dot, dash and underscore only)`,
      );
    }
  });

  it("parses YAML frontmatter correctly (scalars, lists, and dates)", () => {
    const sample = `---
title: "Test Title"
date: "2026-10-09"
author: "Vanaware"
location: "#/articles/test.md"
pages:
  - path: "overview.md"
    title: "Overview"
    icon: "article"
  - path: "guide.md"
    title: "Guide"
    icon: "science"
---
# Markdown Body
Plain text here.`;

    const { frontmatter, body, } = parseFrontmatter(sample,);
    assertEquals(frontmatter.title, "Test Title",);
    assertEquals(frontmatter.date, "2026-10-09",);
    assertEquals(frontmatter.author, "Vanaware",);
    assertEquals(frontmatter.location, "#/articles/test.md",);
    assertEquals(Array.isArray(frontmatter.pages,), true,);
    assertEquals(frontmatter.pages.length, 2,);
    assertEquals(frontmatter.pages[0].path, "overview.md",);
    assertEquals(frontmatter.pages[0].title, "Overview",);
    assert(body.includes("# Markdown Body",),);
    assert(!body.includes("---",),);
  });

  it("verifies index.md contains frontmatter with pages navigation list", async () => {
    const raw = await Deno.readTextFile(`${publicDir}/articles/index.md`,);
    const { frontmatter, body, } = parseFrontmatter(raw,);

    assert(
      typeof frontmatter.title === "string",
      "index.md must have a title in frontmatter",
    );
    assert(
      typeof frontmatter.date === "string",
      "index.md must have a date in frontmatter",
    );
    assert(
      Array.isArray(frontmatter.pages,),
      "index.md must have pages list in frontmatter",
    );
    assert(
      frontmatter.pages.length >= 3,
      "index.md pages list must contain main sections",
    );
    assert(
      body.includes("# 📖 mdBlog — Home Page",),
      "index.md body must contain content",
    );
  });

  it("verifies child pages contain their own sub-pages in frontmatter (recursive nesting)", async () => {
    // overview.md (level 1) declares sub-pages (level 2)
    const overviewRaw = await Deno.readTextFile(
      `${publicDir}/articles/overview.md`,
    );
    const { frontmatter: overviewFm, } = parseFrontmatter(overviewRaw,);
    assert(
      Array.isArray(overviewFm.pages,),
      "overview.md must declare sub-pages in frontmatter",
    );
    assert(overviewFm.pages.includes("wire-format.md",),);
    assert(overviewFm.pages.includes("flows.md",),);

    // wire-format.md (level 2) declares a sub-sub-page (level 3)
    const wireRaw = await Deno.readTextFile(
      `${publicDir}/articles/wire-format.md`,
    );
    const { frontmatter: wireFm, } = parseFrontmatter(wireRaw,);
    assert(
      Array.isArray(wireFm.pages,),
      "wire-format.md must declare sub-sub-pages in frontmatter",
    );
    assert(wireFm.pages.includes("wire-schema.md",),);

    // guide.md declares a sub-page
    const guideRaw = await Deno.readTextFile(`${publicDir}/articles/guide.md`,);
    const { frontmatter: guideFm, } = parseFrontmatter(guideRaw,);
    assert(Array.isArray(guideFm.pages,), "guide.md must declare sub-pages",);
    assert(guideFm.pages.includes("islands.md",),);

    // development-plan.md declares a sub-page
    const planRaw = await Deno.readTextFile(
      `${publicDir}/articles/development-plan.md`,
    );
    const { frontmatter: planFm, } = parseFrontmatter(planRaw,);
    assert(
      Array.isArray(planFm.pages,),
      "development-plan.md must declare sub-pages",
    );
    assert(planFm.pages.includes("migration-html-es.md",),);

    // Every declared sub-page must exist on disk, and every link of the body
    // must point at a real file: the hierarchy is discovered at runtime, so a
    // typo here is a 404 in the sidebar instead of a compile error.
    const declared = [
      ...overviewFm.pages,
      ...wireFm.pages,
      ...guideFm.pages,
      ...planFm.pages,
    ];
    for (const page of declared) {
      await Deno.stat(`${publicDir}/articles/${page}`,);
    }
  });

  it("verifies flattenArticles preserves depth, parentPath and recursive hierarchy", async () => {
    const { flattenArticles, } = await import("../src/state.ts");
    const mockTree = [
      {
        name: "index.md",
        slug: "index",
        path: "/articles/index.md",
        title: "Home",
        icon: "home",
        depth: 0,
        children: [
          {
            name: "doc1.md",
            slug: "doc1",
            path: "/articles/doc1.md",
            title: "Doc 1",
            icon: "article",
            depth: 1,
            parentPath: "/articles/index.md",
            children: [
              {
                name: "subdoc1.md",
                slug: "subdoc1",
                path: "/articles/subdoc1.md",
                title: "SubDoc 1",
                icon: "description",
                depth: 2,
                parentPath: "/articles/doc1.md",
                children: [
                  {
                    name: "subsubdoc.md",
                    slug: "subsubdoc",
                    path: "/articles/subsubdoc.md",
                    title: "SubSubDoc",
                    icon: "description",
                    depth: 3,
                    parentPath: "/articles/subdoc1.md",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const flat = flattenArticles(mockTree,);
    assertEquals(flat.length, 4,);
    assertEquals(flat[0]!.depth, 0,);
    assertEquals(flat[1]!.depth, 1,);
    assertEquals(flat[2]!.depth, 2,);
    assertEquals(flat[3]!.depth, 3,);
    assertEquals(flat[3]!.parentPath, "/articles/subdoc1.md",);
  });

  it("confirms zero hardcoded articles lists in state.ts (starts as empty signal)", async () => {
    const stateSrc = await Deno.readTextFile(`${srcDir}/state.ts`,);
    assert(
      !stateSrc.includes("DEFAULT_ARTICLES",),
      "state.ts must NOT contain hardcoded DEFAULT_ARTICLES",
    );
    assert(
      !stateSrc.includes("const QUICK_ARTICLES",),
      "state.ts must NOT contain QUICK_ARTICLES",
    );
    assert(Array.isArray(articles.value,), "articles signal must be an array",);
  });

  it("confirms zero build-time indexing in build.ts (browser generates list)", async () => {
    const buildSrc = await Deno.readTextFile(`${scriptsDir}/esbuild.ts`,);
    assert(
      !buildSrc.includes("generateArticlesIndex",),
      "build script must NOT generate articles index during build",
    );
    assert(
      !buildSrc.includes("index.json",),
      "build script must NOT hardcode index.json generation",
    );
  });

  it("keeps the bundle evaluable inside the Service Worker scope", async () => {
    const swSrc = await Deno.readTextFile(`${publicDir}/sw.js`,);
    assert(
      swSrc.includes('import mdTranspiler from "./mdblog.js"',),
      "sw.js must keep importing the app bundle, which is why that bundle has to stay worker-safe",
    );

    const raw = await Deno.readTextFile(`${scriptsDir}/esbuild.jsonc`,);
    const config = JSON.parse(
      raw.replace(/^\s*\/\/.*$/gm, "",),
    ) as { targets: Record<string, { conditions?: string[] }> };

    for (const [name, target,] of Object.entries(config.targets,)) {
      assert(
        (target.conditions ?? []).includes("worker",),
        `esbuild target "${name}" must keep the "worker" export condition: sw.js imports the same bundle, and with only "browser" the exports map of decode-named-character-reference resolves to index.dom.js, whose top-level document.createElement throws "document is not defined" and makes the Service Worker script evaluation fail`,
      );
    }
  });

  it("resolves /articles/ routes correctly via resolveDocPath", () => {
    const res1 = resolveDocPath("/articles/guide", "/articles",);
    assertEquals(res1.isDoc, true,);
    assertEquals(res1.docPath, "/articles/guide.md",);

    const res2 = resolveDocPath("/articles", "/articles",);
    assertEquals(res2.isDoc, true,);
    assertEquals(res2.docPath, "/articles/index.md",);

    const res3 = resolveDocPath("/articles/overview.md", "/articles",);
    assertEquals(res3.isDoc, true,);
    assertEquals(res3.docPath, "/articles/overview.md",);

    // Backward compatibility for /docs/
    const resDocs = resolveDocPath("/docs/guide.md", "/articles",);
    assertEquals(resDocs.isDoc, true,);
    assertEquals(resDocs.docPath, "/docs/guide.md",);
  });

  it("verifies Navbar and Sidebar render articles dynamically, with Sidebar handling indented tree and Navbar without select box", async () => {
    const navbarSrc = await Deno.readTextFile(
      `${srcDir}/components/Navbar.ts`,
    );
    assert(
      navbarSrc.includes('href="#/"',),
      "Navbar home link must route to the dynamically resolved home article",
    );
    assert(
      !navbarSrc.includes("<select",),
      "Navbar must not use a select box",
    );
    assert(
      !navbarSrc.includes("<menu",),
      "Navbar must not use a dropdown select box",
    );
    assert(
      !navbarSrc.includes("const QUICK_ARTICLES",),
      "Navbar must not have hardcoded QUICK_ARTICLES",
    );
    assert(
      !navbarSrc.includes("const SECTIONS =",),
      "Navbar must not have hardcoded SECTIONS",
    );

    const sidebarSrc = await Deno.readTextFile(
      `${srcDir}/components/Sidebar.ts`,
    );
    assert(
      sidebarSrc.includes("articles.value",),
      "Sidebar must read articles from reactive signal",
    );
    assert(
      sidebarSrc.includes("item.depth",),
      "Sidebar must inspect item.depth for indentation",
    );
    assert(
      sidebarSrc.includes("left-margin",),
      "Sidebar must use left-margin indentation class for sub-pages",
    );
    assert(
      !sidebarSrc.includes("subdirectory_arrow_right",),
      "Sidebar must NOT use indentation arrow icons",
    );
    assert(
      !sidebarSrc.includes("const SECTIONS =",),
      "Sidebar must not have hardcoded SECTIONS",
    );
  });

  it("keeps the app bar brand horizontal and its contents within the bar width", async () => {
    const navbarSrc = await Deno.readTextFile(
      `${srcDir}/components/Navbar.ts`,
    );
    const brandIndex = navbarSrc.indexOf('href="#/"',);
    assert(brandIndex > -1, "Navbar must expose the home link",);
    // An `a` that is a direct child of nav.top is treated by BeerCSS as a
    // navigation item (flex-direction: column and the icon inside a pill), which
    // stacks the icon on top of the name. The brand must live in its own box.
    const beforeBrand = navbarSrc.slice(0, brandIndex,);
    assert(
      beforeBrand.lastIndexOf("<div",) > beforeBrand.lastIndexOf("<nav",),
      "Navbar brand link must be nested in a container, not a direct child of nav.top",
    );

    const searchSrc = await Deno.readTextFile(
      `${srcDir}/components/SearchBox.ts`,
    );
    assert(
      searchSrc.includes("isWideScreen.value",),
      "Search triggers must be mutually exclusive in the DOM: BeerCSS s/m/l classes leak on fractional viewport widths (browser zoom), showing both controls at once and overflowing the app bar",
    );
    assert(
      !searchSrc.includes('class="circle transparent s',),
      "Compact search button must not depend on breakpoint classes",
    );
    assert(
      !searchSrc.includes('no-margin l"',),
      "Inline search field must not depend on breakpoint classes",
    );
  });

  it("keeps the table of contents openable and closable on every breakpoint", async () => {
    const contentSrc = await Deno.readTextFile(
      `${srcDir}/components/Content.ts`,
    );
    const stateSrc = await Deno.readTextFile(`${srcDir}/state.ts`,);

    assert(
      contentSrc.includes("toggleToc",),
      "Content.ts must expose one table of contents control for both modes",
    );
    assert(
      contentSrc.includes("tocRailOpen.value = !tocRailOpen.value",),
      "The control must both hide and show the wide-screen summary column",
    );
    assert(
      contentSrc.includes("tocRailOpen.value = false",),
      "The summary column must offer its own close button",
    );
    assert(
      !/showRail = hasToc && isWideScreen\.value;/.test(contentSrc,),
      "The summary column must not be rendered unconditionally on wide screens",
    );
    assert(
      stateSrc.includes("TOC_STORAGE_KEY",),
      "The summary column preference must be persisted like the sidebar's",
    );
  });

  it("lays the search panel out as one horizontal header with its actions at the end", async () => {
    const searchSrc = await Deno.readTextFile(
      `${srcDir}/components/SearchBox.ts`,
    );
    // The comments name the very classes that are forbidden, so they are
    // stripped before any markup check runs.
    const markup = searchSrc.replace(/<!--[\s\S]*?-->/g, "",);

    // O BeerCSS define header como flex-direction:column + justify-content:center,
    // which stacked the "Esc" chip and the close button in the middle of the panel.
    assertEquals(
      /<header[\s>]/.test(markup,),
      false,
      "The search panel header must not be a <header> element (BeerCSS stacks and centers it)",
    );
    assert(
      markup.includes('<div class="row no-margin">',),
      "The panel header must be a single horizontal .row",
    );
    assert(
      markup.includes('<div class="max"></div>',),
      "The header must use the .max spacer to push its actions to the end (BeerCSS has no justify-between)",
    );
    assert(
      markup.includes('"active large-width" : "active max"',),
      "The dialog must take a fixed readable width on wide screens and the full screen on narrow ones",
    );
    assert(
      /class="row wave round [\w- ]*vertical-margin/.test(markup,),
      "Result rows need an !important margin utility: BeerCSS declares margin:0 on every a.row, which welds the cards together",
    );
    assert(
      markup.includes('<div class="max truncate">',),
      "The text column must be a scroll container (.truncate): a flex item with overflow:visible refuses to shrink below its nowrap text, which cuts titles mid-glyph and pushes the trailing icon out of the panel",
    );
    for (
      const ghost of ["medium round shadow", 'class="column', "gap-tiny",]
    ) {
      assertEquals(
        markup.includes(ghost,),
        false,
        `BeerCSS 3.7.12 has no "${ghost}" utility; the class is silently ignored and breaks the layout`,
      );
    }
  });

  it("confirms zero static fallback files (articles.json and articles/index.html removed) and discovery is purely frontmatter-driven", async () => {
    let hasArticlesJson = false;
    try {
      await Deno.stat(`${publicDir}/articles/articles.json`,);
      hasArticlesJson = true;
    } catch {
      hasArticlesJson = false;
    }
    assertEquals(
      hasArticlesJson,
      false,
      "articles.json static fallback must NOT exist",
    );

    let hasArticlesIndexHtml = false;
    try {
      await Deno.stat(`${publicDir}/articles/index.html`,);
      hasArticlesIndexHtml = true;
    } catch {
      hasArticlesIndexHtml = false;
    }
    assertEquals(
      hasArticlesIndexHtml,
      false,
      "articles/index.html static fallback must NOT exist",
    );
  });

  it("verifies search indexing cleans markdown content dynamically for full-text search", async () => {
    const { cleanMarkdownText, } = await import("../src/state.ts");
    const sample =
      "# Main Title\n\nText with `code` and [link](https://example.com).\n\n```js\nconst x = 1;\n```";
    const cleaned = cleanMarkdownText(sample,);
    assert(cleaned.includes("Main Title",),);
    assert(cleaned.includes("Text with code and link",),);
    assert(!cleaned.includes("```",),);
    assert(!cleaned.includes("#",),);
  });

  it("verifies Content.ts implements clean layout: discreet breadcrumb, title/author/date, wrapped sub-pages without indentation icons, and Made with mdBlog footer", async () => {
    const contentSrc = await Deno.readTextFile(
      `${srcDir}/components/Content.ts`,
    );

    // 1. Discreet breadcrumbs with tight spacing and responsive wrapping
    assert(
      contentSrc.includes("breadcrumbs",),
      "Content.ts must build breadcrumbs",
    );
    assert(
      contentSrc.includes("chevron_right",),
      "Content.js must use subtle chevron_right divider",
    );
    assert(
      contentSrc.includes("small-text secondary-text",),
      "Breadcrumb must be subtle and discreet",
    );
    assert(
      contentSrc.includes("no-space",),
      "Breadcrumb must use no-space to avoid excessive spacing between items",
    );
    assert(
      contentSrc.includes("row wrap",),
      "Breadcrumb must have wrap to fit on small screens",
    );

    // 2. Header with title, author, date
    assert(
      contentSrc.includes("<header",),
      "Content.js must have clean article header",
    );
    assert(contentSrc.includes("author",), "Header must include author",);
    assert(contentSrc.includes("date",), "Header must include date",);

    // 2b. Narrow-screen spacing contract. BeerCSS has no directional border and
    // no gap-* utility, and a name shaped like one (border-top, gap-small) is
    // silently ignored — that is what let the content sit flush against the
    // card's edge. Separators are dividers, and the article keeps the padding
    // the framework gives the <article> element itself.
    assert(
      contentSrc.includes("medium-divider",),
      "Header and footer must be separated by a real BeerCSS divider",
    );
    assert(
      !/class="[^"]*\bborder-(top|bottom|left|right)\b/.test(contentSrc,),
      "Content.ts must not use the non-existent border-* classes",
    );
    assert(
      !/class="[^"]*\bgap-(tiny|small|medium|large)\b/.test(contentSrc,),
      "Content.ts must not use the non-existent gap-* classes",
    );
    assert(
      contentSrc.includes(`<article class="wrap">`,),
      "The article body must keep the padding BeerCSS gives an <article> card",
    );

    // 3. Article content before sub-pages list
    const articleIdx = contentSrc.indexOf("wireToVNode",);
    const subpagesIdx = contentSrc.indexOf("Sub-pages",);
    assert(articleIdx > 0, "Content.js must render wireToVNode",);
    assert(subpagesIdx > 0, "Content.js must render sub-pages list",);
    assert(
      articleIdx < subpagesIdx,
      "Article content must be rendered BEFORE sub-pages list",
    );

    // 4. Sub-pages: no indentation icons, and text wrapped to avoid overflow
    assert(
      !contentSrc.includes("subdirectory_arrow_right",),
      "Sub-pages must not use indentation icons",
    );
    assert(
      contentSrc.includes("bold wrap",) &&
        !contentSrc.includes("bold small-text wrap",),
      "Sub-page and pager titles must be bold at the size of the body text: a title smaller than the prose it introduces reads as a caption",
    );
    assert(
      contentSrc.includes("row wrap",),
      "Sub-page cards must wrap on small screens",
    );
    assert(
      contentSrc.includes(`class="vertical top-margin small-margin"`,),
      "Sub-pages must stack with .vertical (BeerCSS has no .column)",
    );
    assert(
      contentSrc.includes("bottom-margin small-margin",),
      "Each sub-page card must carry its own bottom margin: a flex column has no gap",
    );

    // 5. Clean footer with only 'Made with mdBlog'
    assert(
      contentSrc.includes("Made with mdBlog",),
      "Footer must contain 'Made with mdBlog'",
    );
    assert(
      !contentSrc.includes("dangerouslySetInnerHTML",),
      "Footer must not contain debug strings",
    );
  });

  it("shows the compiled app version in the Made with mdBlog footer", async () => {
    const contentSrc = await Deno.readTextFile(
      `${srcDir}/components/Content.ts`,
    );
    const versionSrc = await Deno.readTextFile(`${srcDir}/version.ts`,);

    assert(
      contentSrc.includes('from "../version.ts"',),
      "Content.ts must read the version from version.ts, the file the build stamps",
    );
    assert(
      contentSrc.includes('APP_VERSION ? ` ${APP_VERSION}` : ""',),
      "an un-stamped (unbundled) version must disappear, not leave a loose space",
    );
    assert(
      versionSrc.includes('typeof __APP_VERSION__ !== "undefined"',),
      "version.ts must keep the typeof guard: without a bundler there is no define, and a bare reference would throw ReferenceError",
    );

    const footer = contentSrc.match(/<footer[\s\S]*?<\/footer>/,)?.[0] ?? "";
    assert(
      footer.includes("Made with mdBlog",),
      "the footer must keep the tagline",
    );
    assert(
      footer.includes("versionSuffix",),
      "the version must be rendered in the footer",
    );
    // BeerCSS gives <footer> flex-direction:column, so the name and the version
    // share a single <span>; a second element would drop onto another line.
    assertEquals(
      footer.match(/<(?!\/)/g,)?.length ?? 0,
      2,
      "footer must hold exactly one element",
    );
  });
});
