import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { fromFileUrl, } from "@std/path";

const distDir = fromFileUrl(
  new URL("../../server/build/dist", import.meta.url,),
);
const publicDir = fromFileUrl(new URL("../public", import.meta.url,),);
const srcDir = fromFileUrl(new URL("../src", import.meta.url,),);

async function runBuild(): Promise<void> {
  const command = new Deno.Command("deno", {
    args: ["task", "esbuild", "noversion",],
    stdout: "piped",
    stderr: "piped",
  },);
  const { code, } = await command.output();
  assertEquals(code, 0,);
}

describe("Build Script & Distribution", () => {
  it("bundles packages/mdblog and outputs dist with esbuild", async () => {
    await runBuild();

    // Verifica se o index.html existe em dist
    const indexStat = await Deno.stat(`${distDir}/index.html`,);
    assertEquals(indexStat.isFile, true,);

    // Verifica se sw.js existe em dist
    const swStat = await Deno.stat(`${distDir}/sw.js`,);
    assertEquals(swStat.isFile, true,);

    // Verifica se mdblog.js foi gerado a partir do bundle da biblioteca
    const mdblogStat = await Deno.stat(`${distDir}/mdblog.js`,);
    assertEquals(mdblogStat.isFile, true,);

    // Lê o conteúdo do HTML e verifica script mdblog.js, título e ausência de tags <style>
    const htmlContent = await Deno.readTextFile(`${distDir}/index.html`,);
    assert(htmlContent.includes("<title>mdBlog</title>",),);
    assert(htmlContent.includes('src="./mdblog.js"',),);
    assert(!htmlContent.includes("<style>",),);
    assert(!htmlContent.includes("style=",),);

    // Verifica se o manifest está devidamente linkado
    assert(htmlContent.includes('rel="manifest"',),);

    // Lê o sw.js compilado e verifica o conteúdo
    const swContent = await Deno.readTextFile(`${distDir}/sw.js`,);
    assert(swContent.includes("mdblog-pwa-v2",),);

    // Verifica se o arquivo public/sw.js padrão demonstra o uso da biblioteca empacotada
    const publicSw = await Deno.readTextFile(`${publicDir}/sw.js`,);
    assert(
      publicSw.includes('from "./mdblog.js"',),
      "sw.js must show how it imports bundled library",
    );
    assert(
      publicSw.includes("createBrowserIO",),
      "sw.js must use createBrowserIO",
    );

    // Verifica se src/mod.ts inclui a biblioteca com fallback quando não existe app.js
    const mainSrc = await Deno.readTextFile(`${srcDir}/mod.ts`,);
    assert(
      mainSrc.includes("export {",),
      "mod.ts must export library components and utilities",
    );
    assert(
      mainSrc.includes("ComponentToMount",),
      "mod.ts must support mounting built-in App if app.js is absent",
    );
  });

  it("copies public assets and manifest into dist", async () => {
    const iconStat = await Deno.stat(`${distDir}/icon.svg`,);
    assertEquals(iconStat.isFile, true,);

    const manifestStat = await Deno.stat(`${distDir}/manifest.json`,);
    assertEquals(manifestStat.isFile, true,);

    const articlesStat = await Deno.stat(`${distDir}/articles`,);
    assertEquals(articlesStat.isDirectory, true,);

    const readmeStat = await Deno.stat(`${distDir}/articles/index.md`,);
    assertEquals(readmeStat.isFile, true,);

    const manifest = JSON.parse(
      await Deno.readTextFile(`${distDir}/manifest.json`,),
    );
    assertEquals(manifest.name, "mdBlog",);
  });

  it("verifies Sidebar uses BeerCSS scroll and compact classes in TypeScript (.ts)", async () => {
    const sidebarSrc = await Deno.readTextFile(
      `${srcDir}/components/Sidebar.ts`,
    );
    assert(sidebarSrc.includes("drawer scroll",),);
    assert(sidebarSrc.includes("small-padding",),);
    assert(sidebarSrc.includes('from "htm/preact"',),);
    assert(sidebarSrc.includes("html`",),);
    assert(!sidebarSrc.includes("style=",),);
    assert(!sidebarSrc.includes("<style>",),);
  });

  it("confirms all components and render registry in src use TypeScript (.ts)", async () => {
    async function checkDir(dir: string,) {
      for await (const entry of Deno.readDir(dir,)) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory) {
          await checkDir(path,);
        } else if (entry.isFile) {
          assert(
            entry.name.endsWith(".ts",),
            `Expected only .ts files in src: ${path}`,
          );
        }
      }
    }
    await checkDir(`${srcDir}/components`,);
    await checkDir(`${srcDir}/render`,);
  });
});
