> **AI INSTRUCTION:** 
> The text below contains the configuration and runtime files of the SERVER @vanaware/server
> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).
> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.

---

# Exported Context from Project mdBlog [v0.2.3#mvmwaqyg] - Mode: SERVER

Automatically generated at: 2026-10-24T21:39:28.516Z

---

## File: `packages/server/deno.jsonc`

```json
{
  "name": "@mdblog/server",
  "publish": false,
  "compilerOptions": {
    "lib": [
      "deno.window"
    ]
  },
  "imports": {
    "@std/http": "jsr:@std/http@^1.1.4",
    "@std/path": "jsr:@std/path@^1.1.6"
  },
  "tasks": {
    "test": "deno test --no-check --allow-env --allow-net --allow-read tests/**/*test.ts",
    "check": "deno check src/**/*.{ts,tsx}",
    "tests": "deno task check && deno task test",
    "start": "deno run --allow-read --allow-write --allow-env --allow-net --env-file ./src/main.ts",
    "dev": "deno run --allow-read --allow-write --allow-env --allow-net --env-file --watch ./src/main.ts",
    "clean": "deno clean && rm -rf ./build && mkdir -p ./build/dist"
  },
  "exports": "./src/main.ts",
  "exclude": ["./build/"]
}

```

---

## File: `packages/server/src/main.ts`

```ts
/// <reference lib="deno.ns" />

import { serveDir, } from "@std/http/file-server";
import { fromFileUrl, } from "@std/path";

const rawPort = Deno.env.get("PORT",);
const port = rawPort ? Number(rawPort,) : 3000;

const fsRoot = (() => {
  const distUrl = fromFileUrl(new URL("../build/dist", import.meta.url,),);
  try {
    Deno.statSync(distUrl,);
    return distUrl;
  } catch {
    try {
      Deno.statSync("./build/dist",);
      return "./build/dist";
    } catch {
      return "./packages/server/build/dist";
    }
  }
})();

Deno.serve({ port, hostname: "0.0.0.0", }, async (req,) => {
  try {
    const url = new URL(req.url,);
    console.debug(`[REQ] ${req.method} ${url.pathname}`,);

    const staticResponse = await serveDir(req, {
      fsRoot,
      showDirListing: false,
      quiet: true,
    },);

    staticResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    staticResponse.headers.set("Pragma", "no-cache",);
    staticResponse.headers.set("Expires", "0",);

    // Allow a global scope for the Service Worker
    if (url.pathname === "/sw.js" || url.pathname.endsWith("/sw.js",)) {
      staticResponse.headers.set("Service-Worker-Allowed", "/",);
    }
    return staticResponse;
  } catch (err) {
    console.warn(
      `[STATIC] Failed to serve a static file. Did the build run?`,
      err instanceof Error ? err.message : err,
    );

    return new Response("Internal Server Error", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8", },
    },);
  }
},);

```

---

