import { assert, assertEquals, assertStringIncludes, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { defaultShell, injectWireShell, } from "../src/plugin/core/shell.ts";
import { processMarkdown, } from "../src/plugin/core/pipeline.ts";

const TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>mdBlog</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css" />
    <script>/* the deadline that reports a mount that never happened */</script>
  </head>
  <body class="auto">
    <div id="app"></div>
    <script type="module" src="./mdblog.js"></script>
  </body>
</html>`;

const doc = processMarkdown(
  "# Getting Started\n\nThe body.",
  "/articles/getting-started.md",
);

function count(source: string, needle: string,): number {
  return source.split(needle,).length - 1;
}

function beerRelease(source: string,): string | undefined {
  return source.match(/beercss@(\d+\.\d+\.\d+)/,)?.[1];
}

function payloadOf(html: string,): string {
  return html.match(
    /<script id="__md_wire" type="application\/json">([\s\S]*?)<\/script>/,
  )?.[1] ?? "";
}

describe("First-paint shell", () => {
  it("embeds the payload in the head without touching anything else the document asked for", () => {
    const html = injectWireShell(TEMPLATE, doc,);

    assert(html.indexOf("__md_wire",) < html.indexOf("</head>",),);
    assert(html.includes("beercss@3.7.12",), "the stylesheets must survive",);
    assert(
      html.includes(`<script type="module" src="./mdblog.js"></script>`,),
      "the bundle tag must survive",
    );
    assert(
      html.includes("the deadline that reports a mount",),
      "the scripts the application ships are the reason the payload is injected here",
    );
    assertEquals(JSON.parse(payloadOf(html,),), doc,);
  });

  it("titles the document after the article it renders", () => {
    const html = injectWireShell(TEMPLATE, doc,);

    assertStringIncludes(html, "<title>Getting Started - mdBlog</title>",);
  });

  it("replaces a payload the template already carries instead of shipping two", () => {
    const withPlaceholder = TEMPLATE.replace(
      "</head>",
      '    <script id="__md_wire" type="application/json">{"stale":true}</script>\n  </head>',
    );

    const html = injectWireShell(withPlaceholder, doc,);

    assertEquals(count(html, "__md_wire",), 1,);
    assertEquals(payloadOf(html,) === JSON.stringify(doc,), true,);
  });

  it("escapes a title that would otherwise close the payload early", () => {
    const hostile = processMarkdown(
      "# </script><script>alert(1)</script>\n\nBody.",
      "/x.md",
    );

    const html = injectWireShell(TEMPLATE, hostile,);

    // One closing tag for each script the template asked for, plus the payload's
    // own: anything more means the JSON wrote markup into the document.
    assertEquals(count(html, "</script>",), count(TEMPLATE, "</script>",) + 1,);
    assertEquals(JSON.parse(payloadOf(html,),), hostile,);
  });

  it("answers with a document when the template has no head at all", () => {
    const html = injectWireShell(
      '<html><body><div id="app"></div></body></html>',
      doc,
    );

    assert(html.includes("__md_wire",),);
  });

  it("keeps the fallback document on the release the application is built for", async () => {
    const shipped = await Deno.readTextFile(
      new URL("../public/index.html", import.meta.url,),
    );

    assertEquals(beerRelease(defaultShell(doc,),), beerRelease(shipped,),);
    assertEquals(
      defaultShell(doc,).includes("AiStudio",),
      false,
      "the fallback must not carry another project's name",
    );
  });

  it("preloads the icon font in both shells", async () => {
    const shipped = await Deno.readTextFile(
      new URL("../public/index.html", import.meta.url,),
    );

    // beer.min.css declares its @font-face with font-display: block, so a head
    // that does not preload the woff2 keeps every glyph invisible until the
    // font arrives behind the stylesheet — and the fallback shell is read
    // exactly when the network is already failing.
    const fontOf = (html: string,) =>
      html.match(/beercss@[\d.]+\/dist\/cdn\/material-symbols-outlined\.woff2/,)
        ?.[0];

    assert(
      fontOf(shipped,),
      "the shipped index.html must preload the icon font",
    );
    assertEquals(fontOf(defaultShell(doc,),), fontOf(shipped,),);
  });
});
