import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
} from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  CLIENT_CACHE_NAME,
  NAVIGATION_TIMEOUT_MS,
  withTimeout,
} from "../src/router.ts";
import { APP_VERSION, } from "../src/version.ts";

describe("Navigation budget", () => {
  it("hands the answer of work that settles in time straight through", async () => {
    const doc = await withTimeout(
      new Promise<string>((resolve,) => setTimeout(() => resolve("wire",), 5,)),
      500,
      "guide.md",
    );

    assertEquals(doc, "wire",);
  });

  it("gives up on work that never answers, naming the route it waited for", async () => {
    const never = new Promise<never>(() => {},);

    const error = await assertRejects(
      () => withTimeout(never, 1_500, "./articles/guide.md",),
      Error,
      "did not answer",
    );

    assertStringIncludes(error.message, "./articles/guide.md",);
  });

  it("keeps the original failure when the work rejects first", async () => {
    const error = await assertRejects(
      () =>
        withTimeout(
          Promise.reject(new Error("404: not found",),),
          NAVIGATION_TIMEOUT_MS,
          "missing.md",
        ),
      Error,
      "404: not found",
    );

    assertStringIncludes(error.message, "404",);
  });

  it("sets a budget nobody is asked to wait out, long enough for a cold host", () => {
    // Below five seconds a slow cold start on GitHub Pages is reported as a
    // failure it never was; above half a minute the reader has closed the tab.
    assertEquals(NAVIGATION_TIMEOUT_MS >= 5_000, true,);
    assertEquals(NAVIGATION_TIMEOUT_MS <= 30_000, true,);
  });
});

describe("Client cache bucket naming", () => {
  it("follows the build stamp, mirroring the worker's own bucket scheme", () => {
    // Page and worker share one versioned bucket whenever they come from the
    // same build; a frozen name (the former "mdblog-pwa-v1") accumulated
    // entries no cleanup ever owned.
    assertEquals(
      CLIENT_CACHE_NAME,
      `mdblog-pwa-${APP_VERSION || "dev"}`,
    );
    const swSource = Deno.readTextFileSync(
      new URL("../public/sw.js", import.meta.url,),
    );
    assertEquals(
      swSource.includes(
        'const CACHE_NAME = `mdblog-pwa-${mdTranspiler.version || "dev"}`;',
      ),
      true,
      "sw.js must keep naming its cache with the same template",
    );
  });
});
