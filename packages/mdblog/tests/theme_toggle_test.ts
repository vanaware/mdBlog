import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  initialThemeIsDark,
  syncThemeColor,
} from "../src/components/ThemeToggle.ts";

/**
 * The helpers are exercised against hand stubs rather than a DOM shim: they are
 * the only part of the toggle that touches the document, and they read it in
 * exactly one way each (a class list, a media query, a computed color), so a
 * fake that answers those three questions tests the real behavior.
 */

type FakeElement = {
  tagName: string;
  attributes: Record<string, string>;
  setAttribute: (name: string, value: string,) => void;
};

function fakeElement(tagName: string,): FakeElement {
  const el: FakeElement = {
    tagName,
    attributes: {},
    setAttribute: (name: string, value: string,) => {
      el.attributes[name] = value;
    },
  };
  return el;
}

const globals = globalThis as unknown as Record<string, unknown>;

// The key ThemeToggle writes. localStorage exists natively under Deno and its
// global accessor ignores reassignment, so the stub stores the real thing
// instead of replacing it.
const STORAGE_KEY = "mdblog-theme";

interface DomStub {
  /** @description Saved theme value answered by the fake localStorage. */
  saved?: string | null;
  /** @description Classes present on the fake body. */
  bodyClasses?: string[];
  /** @description Whether the fake OS prefers dark. */
  mediaDark?: boolean;
  /** @description Computed background color of the fake body. */
  background?: string;
  /** @description Meta element found by querySelector (null: no meta). */
  meta?: FakeElement | null;
}

/** Installs the stubs for one test and restores the bare globals after. */
function withDom<T,>(
  stub: DomStub,
  body: (dom: { themeMeta: () => FakeElement | null },) => T,
): T {
  const previous: Record<string, unknown> = {};
  const keys = ["document", "getComputedStyle", "matchMedia",];
  for (const key of keys) previous[key] = globals[key];

  let meta = stub.meta === undefined ? fakeElement("meta",) : stub.meta;

  if (stub.saved) localStorage.setItem(STORAGE_KEY, stub.saved,);
  else localStorage.removeItem(STORAGE_KEY,);
  globals.document = {
    body: {
      classList: {
        contains: (name: string,) => (stub.bodyClasses ?? []).includes(name,),
      },
    },
    head: {
      appendChild: (el: FakeElement,) => {
        if (el.tagName === "meta" && !meta) meta = el;
      },
    },
    createElement: (tag: string,) => fakeElement(tag,),
    querySelector: (selector: string,) =>
      selector === 'meta[name="theme-color"]' ? meta : null,
  };
  globals.getComputedStyle = () => ({
    backgroundColor: stub.background ?? "rgb(255, 255, 255)",
  });
  globals.matchMedia = (query: string,) => ({
    matches: query === "(prefers-color-scheme: dark)" &&
      (stub.mediaDark ?? false),
  });

  try {
    return body({ themeMeta: () => meta ?? null, },);
  } finally {
    localStorage.removeItem(STORAGE_KEY,);
    for (const key of keys) {
      if (previous[key] === undefined) delete globals[key];
      else globals[key] = previous[key];
    }
  }
}

describe("ThemeToggle initial state", () => {
  it("lets a saved choice beat the class list and the OS", () => {
    withDom(
      { saved: "dark", mediaDark: false, bodyClasses: ["light",], },
      () => {
        assertEquals(initialThemeIsDark(), true,);
      },
    );
    withDom({ saved: "light", mediaDark: true, }, () => {
      assertEquals(initialThemeIsDark(), false,);
    },);
  });

  it("reads an explicit body class in auto mode", () => {
    withDom({ bodyClasses: ["dark",], mediaDark: false, }, () => {
      assertEquals(initialThemeIsDark(), true,);
    },);
  });

  it("falls back to the OS preference when nothing was saved", () => {
    // The point of the fix: with body class "auto" no class is ever written,
    // yet the page IS dark — the toggle must not offer dark mode on top of it.
    withDom({ mediaDark: true, bodyClasses: ["auto",], }, () => {
      assertEquals(initialThemeIsDark(), true,);
    },);
    withDom({ mediaDark: false, }, () => {
      assertEquals(initialThemeIsDark(), false,);
    },);
  });
});

describe("ThemeToggle theme-color sync", () => {
  it("mirrors the painted body background into the meta", () => {
    withDom({ background: "rgb(18, 18, 18)", }, ({ themeMeta, },) => {
      syncThemeColor();
      assertEquals(themeMeta()?.attributes.content, "rgb(18, 18, 18)",);
    },);
  });

  it("creates the meta when the document ships none", () => {
    withDom({ background: "rgb(250, 250, 250)", meta: null, }, ({
      themeMeta,
    },) => {
      syncThemeColor();
      assertEquals(themeMeta()?.attributes.content, "rgb(250, 250, 250)",);
    },);
  });

  it("leaves the shipped color alone over an unpainted background", () => {
    const meta = fakeElement("meta",);
    meta.attributes.content = "#6750a4";
    withDom({ background: "rgba(0, 0, 0, 0)", meta, }, () => {
      syncThemeColor();
      assertEquals(meta.attributes.content, "#6750a4",);
    },);
  });

  it("does not throw when the document is missing entirely", () => {
    delete globals.document;
    syncThemeColor();
    assert(true,);
  });
});
