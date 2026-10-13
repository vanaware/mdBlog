import { assert, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";

/**
 * @description Directory holding the component and renderer sources.
 */
const srcDir = fromFileUrl(new URL("../src/", import.meta.url,),);

/**
 * @description Directory holding the static assets and the demo islands.
 */
const publicDir = fromFileUrl(new URL("../public/", import.meta.url,),);

/**
 * Utility class names that are NOT part of BeerCSS. They are all names a
 * Tailwind/CSS-first mind invents, and the framework silently ignores them —
 * which is worse than an error, because the layout then quietly loses the
 * spacing or the separator the name promised (the narrow-screen complaints of
 * this project were all traces of these classes).
 *
 * The right alternatives, all verified against beer.min.css 3.7.12:
 * - gap-small / gap-tiny / gap-medium / gap: the gap of a .row is its own 1rem
 *   default, settable only to 0 (.no-space), 1.5rem (.medium-space) or 2rem
 *   (.large-space); tighter rhythm comes from a directional margin class.
 * - items-center: every nav and .row already is align-items:center.
 * - justify-between: use a <div class="max"></div> spacer (flex:1).
 * - column: use .vertical.
 * - border-top / border-bottom / border-right / border-left / left-border:
 *   there is no directional border utility; separators are
 *   <div class="medium-divider"></div> and depth is .elevate.
 * - border-primary / surface-text / surface-variant-text / success-text /
 *   tiny-text / opacity-50 / uppercase / sticky / min: the palette is
 *   primary/secondary/tertiary/error/inverse-primary/black/white-text plus the
 *   fixed colour names (green-text, ...), the sizes are small/medium/large-text,
 *   the opacity is .medium-opacity, and shrinking text uses .truncate.
 * - margin-bottom / padding-top / medium-padding: the worst of them, because
 *   BeerCSS reads spacing with the attribute selector [class*=margin] (and
 *   [class*=padding]). A name in the wrong word order still matches it, so the
 *   element silently gets the default ONE REM on every side instead of the one
 *   side it asked for; medium-* is the same trap on the default value. The real
 *   directions are top/bottom/left/right/horizontal/vertical-margin (or
 *   -padding) and the sizes are tiny (.25rem), small (.5rem), the bare name
 *   (1rem) and large (1.5rem).
 */
const INVENTED_CLASSES = [
  "gap-tiny",
  "gap-small",
  "gap-medium",
  "gap-large",
  "items-center",
  "justify-between",
  "column",
  "border-top",
  "border-bottom",
  "border-left",
  "border-right",
  "left-border",
  "border-primary",
  "surface-text",
  "surface-variant-text",
  "success-text",
  "tiny-text",
  "opacity-50",
  "uppercase",
  "sticky",
  "margin-bottom",
  "margin-top",
  "margin-left",
  "margin-right",
  "padding-top",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "medium-margin",
  "medium-padding",
];

/**
 * @description Removes the comments of a source file.
 *
 * Comments are where these class names legitimately appear as documentation of
 * what not to write, so they are stripped before the scan. A double slash only
 * starts a comment when it is not part of a protocol in a string, and the markup
 * comments of the templates (which is where the rationale of a class is written
 * down) go the same way.
 */
function stripComments(source: string,): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, "",)
    .replace(/\/\*[\s\S]*?\*\//g, "",)
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1",);
}

/**
 * @description Lists the source files whose markup must stay BeerCSS-honest.
 *
 * Every component and renderer module is picked up, so a new view file is
 * covered the moment it is written instead of the moment someone remembers to
 * add it to a list. The demo islands are scanned too: they are the markup users
 * copy from, and they are plain browser JavaScript, not TypeScript.
 */
async function templateSources(): Promise<Record<string, string>> {
  const roots = [
    { base: `${srcDir}/components`, ext: ".ts", label: "components", },
    { base: `${srcDir}/render`, ext: ".ts", label: "render", },
    {
      base: `${srcDir}/plugin/core`,
      ext: ".ts",
      label: "plugin/core",
    },
    { base: `${publicDir}/islands`, ext: ".js", label: "public/islands", },
  ];
  const out: Record<string, string> = {};
  for (const { base, ext, label, } of roots) {
    for await (const entry of Deno.readDir(base,)) {
      if (!entry.isFile || !entry.name.endsWith(ext,)) continue;
      const file = `${label}/${entry.name}`;
      out[file] = stripComments(
        await Deno.readTextFile(`${base}/${entry.name}`,),
      );
    }
  }
  return out;
}

describe("BeerCSS class vocabulary", () => {
  it("does not use utility names the framework does not implement", async () => {
    const sources = await templateSources();
    for (const [file, source,] of Object.entries(sources,)) {
      for (const name of INVENTED_CLASSES) {
        const used = new RegExp(`\\b${name}\\b`,).test(source,);
        assert(
          !used,
          `${file} uses the class "${name}", which BeerCSS does not implement — see the INVENTED_CLASSES table in tests/beer_classes_test.ts for the real utility`,
        );
      }
    }
  });

  it("sizes every margin and padding class with a single value", async () => {
    // Every *margin / *padding utility of BeerCSS reads one custom property
    // (--margin / --padding) that the element holds as a single value, so two
    // size classes on one element (small-margin large-margin) fight over it and
    // one silently wins by stylesheet order. Directional classes
    // (top/left/...) are excluded from the all-sides rule, which is also why an
    // element carrying one must not also carry no-margin/no-padding: the size
    // class would set the very variable the directional class reads to zero.
    const sources = await templateSources();
    const sizeClasses = [
      "no-margin",
      "tiny-margin",
      "small-margin",
      "large-margin",
      "auto-margin",
      "margin",
    ];
    const paddingSizes = [
      "no-padding",
      "tiny-padding",
      "small-padding",
      "large-padding",
      "padding",
    ];
    const classAttrs =
      /class(?:Name)?=\$?\{?(?:"([^"]*)"|`([^`]*)`|'([^']*)')/g;
    for (const [file, source,] of Object.entries(sources,)) {
      for (const match of source.matchAll(classAttrs,)) {
        const value = match[1] ?? match[2] ?? match[3] ?? "";
        const tokens = value.split(/[\s${}?:'"()]+/,).filter(Boolean,);
        const margins = tokens.filter((t,) => sizeClasses.includes(t,));
        const paddings = tokens.filter((t,) => paddingSizes.includes(t,));
        assert(
          margins.length <= 1,
          `${file} sets two margin sizes (${
            margins.join(", ",)
          }) on one element: they write the same --margin variable`,
        );
        assert(
          paddings.length <= 1,
          `${file} sets two padding sizes (${
            paddings.join(", ",)
          }) on one element: they write the same --padding variable`,
        );
      }
    }
  });
});
