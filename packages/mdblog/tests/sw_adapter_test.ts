import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import type { IO, } from "../src/plugin/types.ts";
import { toBaseRelativePath, } from "../src/plugin/detect.ts";
import { createSWFetchHandler, } from "../src/plugin/adapters/sw.ts";

/** An IO that answers every document with the same markdown and records the
 * paths it was asked for, which is exactly what these tests are about. */
function recordingIO(markdown: string,): {
  io: IO;
  requested: string[];
} {
  const requested: string[] = [];
  const io: IO = {
    readText(url: string,): Promise<string> {
      requested.push(url,);
      return Promise.resolve(markdown,);
    },
    cacheGet(): Promise<string | null> {
      return Promise.resolve(null,);
    },
    cachePut(): Promise<void> {
      return Promise.resolve();
    },
    cacheDelete(): Promise<void> {
      return Promise.resolve();
    },
  };
  return { io, requested, };
}

/** The part of a fetch event the adapter uses, shaped like the browser's. */
interface ProbeFetchEvent {
  request: Request;
  respondWith(response: Response | Promise<Response>,): void;
}

/** A fetch event whose answer can be awaited. */
function fetchEvent(
  url: string,
  accept: string,
): { event: ProbeFetchEvent; answer: () => Promise<Response> } {
  let replied: Response | Promise<Response> | null = null;
  const event: ProbeFetchEvent = {
    request: new Request(url, { headers: { Accept: accept, }, },),
    respondWith(response: Response | Promise<Response>,) {
      replied = response;
    },
  };
  return {
    event,
    answer: async (): Promise<Response> => {
      if (replied === null) {
        throw new Error(`the handler did not answer ${url}`,);
      }
      return await Promise.resolve(replied,);
    },
  };
}

describe("Document path resolution", () => {
  it("reduces an origin-rooted request to the application's own directory", () => {
    // A site published under /mdBlog/ is asked for /mdBlog/articles/index.md,
    // and the reader resolves paths against that same directory: keeping the
    // prefix would ask for the folder twice and miss every document.
    assertEquals(
      toBaseRelativePath("/mdBlog/articles/index.md", "/mdBlog/",),
      "articles/index.md",
    );
    assertEquals(
      toBaseRelativePath("/mdBlog/docs/guide.md", "/mdBlog/",),
      "docs/guide.md",
    );
  });

  it("leaves a path served at the root of a domain relative to that root", () => {
    assertEquals(
      toBaseRelativePath("/articles/guide.md", "/",),
      "articles/guide.md",
    );
  });

  it("settles the spellings already relative to the application", () => {
    assertEquals(
      toBaseRelativePath("./articles/guide.md", "/mdBlog/",),
      "articles/guide.md",
    );
    assertEquals(
      toBaseRelativePath("articles/guide.md", "/mdBlog/",),
      "articles/guide.md",
    );
    assertEquals(toBaseRelativePath("", "/mdBlog/",), "",);
  });

  it("accepts a base written with or without its trailing slash", () => {
    assertEquals(
      toBaseRelativePath("/mdBlog/articles/index.md", "/mdBlog",),
      "articles/index.md",
    );
  });
});

describe("Service Worker fetch adapter", () => {
  const MARKDOWN = "# Home\n\nThe first article.";

  it("asks the reader for the document below the application directory", async () => {
    const { io, requested, } = recordingIO(MARKDOWN,);
    const handler = createSWFetchHandler(io, { basePath: "./articles", },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "application/json",
    );
    const handled = handler(event,);
    const response = await answer();

    assert(handled, "an article request must be intercepted,",);
    assertEquals(requested, ["articles/index.md",],);
    assert(
      !requested[0]?.startsWith("/",),
      "a path handed to the reader must not be origin-rooted: it resolves against the application directory, so a leading slash is paid for twice under a subfolder deployment",
    );
    assertEquals(response.status, 200,);
    assertEquals(
      (await response.json()).title,
      "Home",
    );
  });

  it("answers a browser navigation with the document and its payload", async () => {
    const { io, } = recordingIO(MARKDOWN,);
    const handler = createSWFetchHandler(io, { basePath: "./articles", },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "text/html",
    );
    handler(event,);
    const response = await answer();

    assertEquals(response.status, 200,);
    assert(
      (response.headers.get("content-type",) ?? "").includes("text/html",),
      "a navigation must be answered with a document, not with the wire alone",
    );
    assert(
      (await response.text()).includes("__md_wire",),
      "the first paint carries the pre-rendered wire payload",
    );
  });

  it("passes raw markdown and everything that is not a document through", () => {
    const { io, requested, } = recordingIO(MARKDOWN,);
    const handler = createSWFetchHandler(io, { basePath: "./articles", },);

    // The reader asks for the markdown with _md_raw=1; answering that would make
    // the worker intercept its own request forever.
    const rawEvent = fetchEvent(
      "https://example.com/articles/index.md?_md_raw=1",
      "text/plain",
    ).event;
    assert(
      !handler(rawEvent,),
      "a raw markdown request must reach the network",
    );
    const assetEvent = fetchEvent(
      "https://example.com/manifest.json",
      "application/json",
    ).event;
    assert(
      !handler(assetEvent,),
      "a static asset is not a document",
    );
    assertEquals(requested, [],);
  });
});

describe("Bounded answers", () => {
  /** An IO whose reads never settle — the wedged-fetch signature. */
  function stalledIO(): IO {
    return {
      readText: (): Promise<string> => new Promise<string>(() => {},),
      cacheGet: (): Promise<string | null> =>
        new Promise<string | null>(() => {},),
      cachePut: (): Promise<void> => Promise.resolve(),
      cacheDelete: (): Promise<void> => Promise.resolve(),
    };
  }

  it("ends a never-settling navigation with a 504 page instead of a spinning tab", async () => {
    const handler = createSWFetchHandler(stalledIO(), {
      basePath: "./articles",
      handlerTimeoutMs: 30,
    },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "text/html",
    );
    assert(handler(event,),);

    const response = await answer();
    assertEquals(response.status, 504,);
    assert(
      (response.headers.get("Content-Type",) ?? "").includes("text/html",),
      "a navigation must be answered with a document, not with JSON",
    );
    assert((await response.text()).includes("Still loading",),);
  });

  it("ends a never-settling JSON request with a JSON error", async () => {
    const handler = createSWFetchHandler(stalledIO(), {
      basePath: "./articles",
      handlerTimeoutMs: 30,
    },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "application/json",
    );
    assert(handler(event,),);

    const response = await answer();
    assertEquals(response.status, 504,);
    const body = JSON.parse(await response.text(),) as { error?: string };
    assert(body.error?.includes("did not answer in time",),);
  });

  it("answers a settling chain immediately and leaves no deadline behind", async () => {
    const { io, } = recordingIO("# Home\n\nBody.",);
    const handler = createSWFetchHandler(io, {
      basePath: "./articles",
      handlerTimeoutMs: 60000,
    },);

    const { event, answer, } = fetchEvent(
      "https://example.com/articles/index.md",
      "application/json",
    );
    assert(handler(event,),);

    // A one-minute deadline could only be observed as a test that never
    // finishes if the fast answer did not clear it.
    const response = await answer();
    assertEquals(response.status, 200,);
  });
});
