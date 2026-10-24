import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  hydrateIslands,
  inFlightImports,
} from "../src/render/hydrate-islands.ts";

/**
 * These tests stub `location` and `document` on the global scope: hydration is
 * browser-side code, but the failure path under test (an island import that
 * rejects) only needs the URL base to resolve the attempt against — no real
 * DOM. Nothing here mounts a component, so no preact rendering is involved.
 */
describe("Island import retry", () => {
  it("evicts a failed import so a later pass can retry it", async () => {
    const g = globalThis as Record<string, unknown>;
    // An absolute base pointing at a folder that cannot hold the island file:
    // both the resolved URL and the relative fallback of the import reject.
    g.location = new URL("file:///tmp/mdblog-missing-islands/index.html",);
    g.document = { body: null, };

    const el = {
      dataset: { island: "Ghost", props: "{}", } as Record<string, string>,
    };
    const root = {
      querySelectorAll: () => [el as unknown as HTMLElement,],
    } as unknown as HTMLElement;

    try {
      const hydrated = await hydrateIslands({ root, },);
      assertEquals(hydrated, 0,);
      assert(
        el.dataset.islandError === "true",
        "the failed container is marked for the fallback notice",
      );
      assertEquals(
        Object.keys(inFlightImports,).length,
        0,
        "a rejected import must not stay memoized forever",
      );

      // A second pass is free to attempt the very same island again
      const second = await hydrateIslands({ root, },);
      assertEquals(second, 0,);
      assertEquals(Object.keys(inFlightImports,).length, 0,);
    } finally {
      delete g.location;
      delete g.document;
    }
  });
});
