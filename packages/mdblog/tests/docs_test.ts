import { assert, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";

/**
 * @description Repository documentation folder (the guides read on GitHub).
 */
const docsDir = fromFileUrl(new URL("../../../docs", import.meta.url,),);

/**
 * @description Folder holding the markdown documents served by the app itself.
 */
const articlesDir = fromFileUrl(
  new URL("../public/articles", import.meta.url,),
);

/**
 * @description The naming convention every document follows.
 *
 * A document name is also a URL segment, so an uppercase or accented name is a
 * trap: it survives on the case-insensitive filesystem of the developer machine
 * and 404s on the case-sensitive one of the CI server and of GitHub Pages.
 */
const SLUG_PATTERN = /^[a-z0-9][a-z0-9._-]*\.md$/;

/**
 * @description Lists the markdown files of a directory (non-recursive).
 */
async function markdownFiles(dir: string,): Promise<string[]> {
  const names: string[] = [];
  for await (const entry of Deno.readDir(dir,)) {
    if (entry.isFile && entry.name.endsWith(".md",)) names.push(entry.name,);
  }
  return names.sort();
}

/**
 * @description Removes fenced code blocks from a markdown document.
 *
 * An example of a link inside a tutorial is not a link: only the markup outside
 * the fences is the real navigation of the document.
 */
function withoutCodeBlocks(source: string,): string {
  return source.replace(/^```[\s\S]*?^```[ \t]*$/gm, "",);
}

describe("Documentation files", () => {
  it("uses lowercase ascii slugs in docs/ and in the served articles", async () => {
    for (const dir of [docsDir, articlesDir,]) {
      const files = await markdownFiles(dir,);
      assert(files.length > 0, `${dir} holds no markdown at all`,);
      for (const name of files) {
        // README.md is the one conventional exception: it is the index a
        // repository host renders for a folder, and its name is not free.
        if (name === "README.md") continue;
        assert(
          SLUG_PATTERN.test(name,),
          `${dir}/${name} is not a lowercase ascii slug (letters, digits, dot, dash and underscore)`,
        );
      }
    }
  });

  it("links only documents that exist", async () => {
    const link = /\[[^\]]*\]\((?!https?:|\/|#)([^)#\s]+\.md)(#[^)]*)?\)/g;
    for (const dir of [docsDir, articlesDir,]) {
      for (const name of await markdownFiles(dir,)) {
        const source = withoutCodeBlocks(
          await Deno.readTextFile(`${dir}/${name}`,),
        );
        for (const match of source.matchAll(link,)) {
          const target = match[1] ?? "";
          if (!target) continue;
          const path = `${dir}/${target}`;
          let exists = true;
          try {
            await Deno.stat(path,);
          } catch {
            exists = false;
          }
          assert(
            exists,
            `${name} links to "${target}", which is not a file next to it`,
          );
        }
      }
    }
  });
});
