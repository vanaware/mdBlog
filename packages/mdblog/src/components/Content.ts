import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";
import { useEffect, } from "preact/hooks";
import {
  type ArticleItem,
  articles,
  closeTocModal,
  currentDoc,
  currentPath,
  errorMessage,
  isLoading,
  isWideScreen,
  tocModalOpen,
  tocRailOpen,
  toggleTocModal,
  viewportHeight,
} from "../state.ts";
import { wireToVNode, } from "../render/from-wire.ts";
import { hydrateIslands, } from "../render/hydrate-islands.ts";
import { Toc, } from "./Toc.ts";
import { APP_VERSION, } from "../version.ts";
import {
  articleHrefFromPath,
  estimateReadingTimeMinutes,
  extractTocHeadings,
  findAdjacentArticles,
  normalizePath,
  tocRailHeight,
} from "../utils.ts";
import type { WireComponent, WireFragment, } from "../plugin/wire.ts";

/**
 * @description Main document content reader component rendering breadcrumbs, article metadata, table of contents, Wire AST body, prev/next pager, and footer.
 * @returns Preact VNode representing the main reading view.
 * @example
 * ```ts
 * import { Content } from "./Content.ts";
 * import { html } from "htm/preact";
 * const node = html`<${Content} />`;
 * ```
 */
export function Content(): unknown {
  const doc = currentDoc.value;
  const path = currentPath.value;
  const loading = isLoading.value;
  const error = errorMessage.value;

  // The footer carries the build version so that one can tell, without opening
  // the console, that the bundle being served is the latest compile: it reads
  // "major.minor.patch#buildHash", and the suffix is the build instant. It comes
  // out empty when the module is consumed without a bundle (no build-time
  // define), so it is dropped rather than leaving a loose space in the text.
  const versionSuffix = APP_VERSION ? ` ${APP_VERSION}` : "";

  // The rail column is only as tall as the screen allows, and it scrolls solely
  // when entries fall out of that budget: BeerCSS `.scroll` is `overflow:auto`,
  // so a short summary keeps its natural height instead of leaving a tall empty
  // box in the column, and a long one gets the bar as soon as items are cut off.
  // The inner box is never clamped, so it keeps reporting the natural height of
  // the list even after the outer one already scrolls.
  const railList = useSignal<HTMLDivElement | null>(null,);
  const railOverflowing = useSignal(false,);
  const railBudget = tocRailHeight(viewportHeight.value,);

  // Measured after every render on purpose: the rail mounts only once the
  // document arrives, which changes neither the route nor the viewport, so a
  // dependency list would miss exactly the render that creates the list.
  useEffect(() => {
    const list = railList.value;
    railOverflowing.value = !!list &&
      list.offsetHeight > railBudget.maxHeightPx;
  },);

  useEffect(() => {
    if (doc) {
      hydrateIslands();
      if (typeof globalThis !== "undefined" && globalThis.scrollTo) {
        globalThis.scrollTo({ top: 0, },);
      }
    }
  }, [doc, path,],);

  // Two rules that used to live here as component effects are now derived state
  // in state.ts: "widening dismisses the summary modal" and "a new document
  // starts with it closed". Both are consequences of signals this component
  // already reads, so tocModalOpen is a computed — and a component effect that
  // only writes global state would also depend on this view being mounted.

  if (loading && !doc) {
    return html`
      <main class="responsive max padding center-align top-margin">
        <i class="large primary-text">menu_book</i>
        <progress class="circle large"></progress>
        <p class="top-margin secondary-text">
          Loading...
        </p>
      </main>
    `;
  }

  if (error && !doc) {
    return html`
      <main class="responsive max padding">
        <article class="border error-container round padding margin">
          <div class="row">
            <i class="error-text large">error</i>
            <div>
              <h5
                class=${`no-margin bold ${isWideScreen.value ? "" : "small"}`}
              >Could not load the article</h5>
              <p class="top-margin">${error}</p>
            </div>
          </div>
          <div class="top-margin">
            <a class="button primary" href="#/">
              <i>home</i> Go to start
            </a>
          </div>
        </article>
      </main>
    `;
  }

  if (!doc) {
    return html`
      <main class="responsive max padding center-align">
        <p class="secondary-text">No article selected.</p>
      </main>
    `;
  }

  // One normalized-path index for the whole render: the breadcrumb walk below
  // follows parent links through the tree, and re-scanning the flat list per
  // hop is the kind of hidden O(n²) a lookup map settles in one pass.
  const articleByPath = new Map<string, ArticleItem>();
  for (const a of articles.value) {
    articleByPath.set(normalizePath(a.path,), a,);
  }

  const currentArticle = articleByPath.get(normalizePath(path,),);

  // Builds the discreet breadcrumb out of the article hierarchy
  const breadcrumbs: ArticleItem[] = [];
  let curr: ArticleItem | undefined = currentArticle;
  while (curr) {
    breadcrumbs.unshift(curr,);
    if (
      !curr.parentPath ||
      normalizePath(curr.parentPath,) === normalizePath(curr.path,)
    ) break;
    curr = articleByPath.get(normalizePath(curr.parentPath,),);
  }

  const rootArticle = articles.value.find(
    (a,) =>
      a.depth === 0 || a.name === "index.md" || a.path.endsWith("/index.md",),
  );
  if (
    rootArticle && breadcrumbs.length > 0 &&
    breadcrumbs[0] && breadcrumbs[0].path !== rootArticle.path
  ) {
    breadcrumbs.unshift(rootArticle,);
  }

  // Title, author and date taken from the frontmatter or from the metadata
  const title = doc.frontmatter?.title || currentArticle?.title || doc.title ||
    "Article";
  const author = doc.frontmatter?.author || currentArticle?.author;
  const date = doc.frontmatter?.date || currentArticle?.date;
  const tags: string[] = Array.isArray(currentArticle?.tags,)
    ? currentArticle!.tags!
    : Array.isArray(doc.frontmatter?.tags,)
    ? doc.frontmatter.tags as string[]
    : [];
  const readingTime = estimateReadingTimeMinutes(doc.raw || "",);

  // Drops the leading h1 of the markdown body when the header already shows it
  let renderWire = doc.wire;
  if (
    renderWire &&
    renderWire.t === "f" &&
    Array.isArray(renderWire.c,) &&
    renderWire.c.length > 0
  ) {
    const firstNode = renderWire.c[0] as WireComponent | undefined;
    if (
      firstNode &&
      firstNode.t === "c" &&
      firstNode.n === "Heading" &&
      (firstNode.p?.depth === 1 || (firstNode.p?.depth as unknown) === "1")
    ) {
      renderWire = {
        ...renderWire,
        c: renderWire.c.slice(1,),
      } as WireFragment;
    }
  }

  const toc = extractTocHeadings(renderWire,);
  const hasToc = toc.length >= 2;
  const { prev, next, } = findAdjacentArticles(articles.value, path,);

  // The summary always has one control point, at any width: on wide screens the
  // header button toggles its own column (persisted preference); on narrow ones
  // it opens the modal panel, which must not stay open between articles.
  const showRail = hasToc && isWideScreen.value && tocRailOpen.value;
  const showTocPanel = hasToc && !isWideScreen.value;

  function toggleToc(): void {
    if (isWideScreen.value) {
      tocRailOpen.value = !tocRailOpen.value;
    } else {
      toggleTocModal();
    }
  }

  return html`
    <main class="responsive max padding">
      <!-- 1. Discreet compact breadcrumb that wraps -->
      ${breadcrumbs.length > 1
        ? html`
          <nav
            class="row wrap no-space small-text secondary-text bottom-margin">
            ${breadcrumbs.map((crumb, idx,) => {
              const isLast = idx === breadcrumbs.length - 1;
              const label = (idx === 0 &&
                  (crumb.name === "index.md" ||
                    crumb.path.endsWith("/index.md",)))
                ? "Start"
                : crumb.title;
              return html`
                ${idx > 0
                  ? html`<i class="tiny tiny-margin medium-opacity">chevron_right</i>`
                  : null}
                <a
                  href=${articleHrefFromPath(crumb.path,)}
                  class=${`wrap ${
                    isLast ? "bold primary-text" : "secondary-text wave"
                  }`}
                >
                  ${label}
                </a>
              `;
            },)}
          </nav>
        `
        : null}

      <div class="grid">
        <div class=${showRail ? "s12 m12 l9" : "s12"}>
          <!-- 2. Clean header: title, metadata, tags and reading time -->
          <!-- The title block is a real <header>, which BeerCSS renders as a
              flex column carrying its own 1rem of horizontal padding and a
              surface-container tint. Both are neutralised here: the <main>
              already supplies the page margin, and a coloured band behind the
              title would read as a second card above the article one. The
              spacing below it is the divider's own 1rem, so no margin here. -->
          <header class="no-padding transparent no-margin">
            <!-- Same scale as the document headings: BeerCSS's h3 is 2.25rem,
                which no phone needs as a page title. The .small variant of the
                very same level (1.75rem) keeps it above the sections below it
                instead of collapsing the hierarchy. -->
            <h3
              class=${`bold no-margin wrap ${
                isWideScreen.value ? "" : "small"
              }`}
            >${title}</h3>
            <div
              class="row wrap small-text secondary-text top-margin small-margin">
              ${author
                ? html`
                  <span class="row no-space">
                    <i class="tiny right-margin tiny-margin">person</i>
                    <span>${author}</span>
                  </span>
                `
                : null}
              ${date
                ? html`
                  <span class="row no-space">
                    <i class="tiny right-margin tiny-margin">calendar_today</i>
                    <span>${date}</span>
                  </span>
                `
                : null}
              <span class="row no-space" title="Estimated reading time">
                <i class="tiny right-margin tiny-margin">schedule</i>
                <span>${readingTime} min read</span>
              </span>
              <div class="max"></div>
              ${hasToc
                ? html`
                  <button
                    class="small tertiary no-margin"
                    onClick=${toggleToc}
                    aria-expanded=${isWideScreen.value
                      ? tocRailOpen.value
                      : tocModalOpen.value}
                    aria-label=${isWideScreen.value
                      ? "Show or hide the table of contents"
                      : "Open or close the table of contents"}
                    title=${isWideScreen.value
                      ? (tocRailOpen.value
                        ? "Hide the contents of this page"
                        : "Show the contents of this page")
                      : "Contents of this page"}
                  >
                    <i>toc</i>
                    <span>On this page</span>
                  </button>
                `
                : null}
            </div>
            ${tags.length > 0
              ? html`
                <div class="row wrap top-margin small-margin">
                  ${tags.map((tag,) =>
                    html`
                      <span key=${tag} class="chip small secondary-container no-margin">
                        <i class="tiny">label</i>
                        ${tag}
                      </span>
                    `
                  )}
                </div>
              `
              : null}
          </header>

          <!-- The rule that closes the header. BeerCSS has no directional
              border utility: the former border-bottom class simply did not
              exist, and a *divider* is the framework's own separator —
              [class*=divider] paints the 1px line and .medium-divider gives it
              1rem above and below, which is also what keeps the header off the
              first line of the body. -->
          <div class="medium-divider"></div>

          <!-- 3. Article body. BeerCSS styles the bare <article> element as a
              card: 1rem of padding, an elevate1 shadow, a surface-container-low
              background and rounded corners. The view used to cancel that
              padding, which is exactly why the text ran against the card's own
              edge; the card now keeps its padding and the prose sits inside it. -->
          <article class="wrap">
            ${wireToVNode(renderWire,)}
          </article>

          <!-- 4. Sub-page list (shown right after the article body) -->
          ${currentArticle && currentArticle.children &&
              currentArticle.children.length > 0
            ? html`
              <section class="top-margin large-margin">
                <p class="bold small-text secondary-text no-margin">
                  Sub-pages (${currentArticle.children.length})
                </p>
                <!-- ".vertical" is the stacking utility BeerCSS actually has
                    ("column" is not one of them). A flex column has no gap of
                    its own — the 1rem of a row only runs along the main axis,
                    which here is vertical — so each card carries its own bottom
                    margin: that is what separates the entries, which previously
                    touched each other with no gap at all. -->
                <div class="vertical top-margin small-margin">
                  ${currentArticle.children.map((sub,) =>
                    html`
                      <a
                        key=${sub.path}
                        href=${articleHrefFromPath(sub.path,)}
                        class="row wrap border round small-padding surface-container wave bottom-margin small-margin"
                      >
                        <i class="primary-text small">${sub.icon ||
                          "article"}</i>
                        <div class="max wrap">
                          <div class="bold wrap">${sub.title}</div>
                          ${sub.description
                            ? html`
                              <div class="small-text secondary-text wrap no-margin">
                                ${sub.description}
                              </div>
                            `
                            : null}
                        </div>
                        <i class="secondary-text small">chevron_right</i>
                      </a>
                    `
                  )}
                </div>
              </section>
            `
            : null}

          <!-- 5. Previous/next pager, following the article tree order -->
          ${prev || next
            ? html`
              <nav
                class="grid top-margin large-margin"
                aria-label="Article navigation"
              >
                ${prev
                  ? html`
                    <a
                      href=${articleHrefFromPath(prev.path,)}
                      class="s12 m6 l6 row border round padding wave surface-container-low no-margin"
                    >
                      <i class="secondary-text">arrow_back</i>
                      <div class="max wrap">
                        <div class="small-text secondary-text">
                          Previous
                        </div>
                        <div class="bold wrap">${prev.title}</div>
                      </div>
                    </a>
                  `
                  : html`<div class="s12 m6 l6"></div>`}
                ${next
                  ? html`
                    <a
                      href=${articleHrefFromPath(next.path,)}
                      class="s12 m6 l6 row border round padding wave surface-container-low no-margin"
                    >
                      <div class="max wrap right-align">
                        <div class="small-text secondary-text">
                          Next
                        </div>
                        <div class="bold wrap">${next.title}</div>
                      </div>
                      <i class="secondary-text">arrow_forward</i>
                    </a>
                  `
                  : null}
              </nav>
            `
            : null}

          <!-- 6. Plain footer, separated by the same kind of rule the header
              uses. BeerCSS sets footer{flex-direction:column; padding:0 1rem;
              background-color:var(--surface-container)}: name and version share
              one span because a second child would drop onto the line below, and
              the padding and the tint are cancelled here for the same reason they
              are cancelled on the header. -->
          <div class="medium-divider"></div>
          <footer class="no-padding transparent vertical-margin small-margin center-align secondary-text small-text">
            <span>Made with mdBlog${versionSuffix}</span>
          </footer>
        </div>

        <!-- Scrollable summary column on wide screens (l), collapsed either by
            the header button or by this close control of the column itself. -->
        ${showRail
          ? html`
            <aside class="l l3 left-padding" aria-label="Contents of this page">
              <div class="row no-padding no-space">
                <p class="bold small-text secondary-text no-margin">
                  On this page
                </p>
                <div class="max"></div>
                <button
                  class="circle tiny transparent"
                  onClick=${() => (tocRailOpen.value = false)}
                  aria-label="Close the table of contents"
                  title="Hide the contents of this page"
                >
                  <i class="small">close</i>
                </button>
              </div>
              <div
                class=${railOverflowing.value
                  ? `scroll ${railBudget.heightClass}`
                  : ""}
              >
                <!-- Unclamped wrapper: its natural height is what tells whether
                    the entries below the budget exist at all. -->
                <div
                  ref=${(el: HTMLDivElement | null,) => {
                    railList.value = el;
                  }}
                >
                  <${Toc} headings=${toc} />
                </div>
              </div>
            </aside>
          `
          : null}
      </div>

      <!-- Summary as a side panel (positioned dialog) on small and medium screens (s/m) -->
      ${showTocPanel
        ? html`
          ${tocModalOpen.value
            ? html`
              <div class="overlay active" onClick=${closeTocModal}></div>
            `
            : null}
          <dialog
            class=${`right medium-width round surface-container scroll small-padding border ${
              tocModalOpen.value ? "active" : ""
            }`}
            aria-label="Table of contents"
          >
            <!-- The panel's own head: label on the left, control on the right.
                BeerCSS has no justify-between — the .max spacer is the only
                mechanism that pushes a row's last child to the far edge — and no
                directional border, so the separator below is a divider. -->
            <div class="row no-padding no-space no-margin">
              <i class="primary-text tiny right-margin tiny-margin">toc</i>
              <span class="bold small-text">On this page</span>
              <div class="max"></div>
              <button
                class="circle tiny transparent"
                onClick=${closeTocModal}
                aria-label="Close the table of contents"
              >
                <i class="small">close</i>
              </button>
            </div>
            <div class="medium-divider"></div>
            <${Toc} headings=${toc} onNavigate=${closeTocModal} />
          </dialog>
        `
        : null}
    </main>
  `;
}
