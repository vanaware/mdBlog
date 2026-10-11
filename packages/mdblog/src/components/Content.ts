import { html } from "htm/preact";
import type { VNode } from "preact";
import { useEffect } from "preact/hooks";
import {
  articles,
  currentDoc,
  currentPath,
  errorMessage,
  isLoading,
  type ArticleItem,
} from "../state.ts";
import { wireToVNode } from "../render/from-wire.ts";
import { navigateTo } from "../router.ts";
import { hydrateIslands } from "../render/hydrate-islands.ts";
import type { WireComponent, WireFragment } from "../plugin/wire.ts";

function norm(p?: string | null): string {
  let s = (p || "")
    .replace(/^#\/?/, "")
    .replace(/^\.?\//, "")
    .replace(/^articles\//, "")
    .replace(/^docs\//, "");
  if (!s || s === "/" || s === "index") s = "index.md";
  return s;
}

export function Content(): VNode {
  const doc = currentDoc.value;
  const path = currentPath.value;
  const loading = isLoading.value;
  const error = errorMessage.value;

  useEffect(() => {
    if (doc) {
      hydrateIslands();
    }
  }, [doc, path]);

  if (loading && !doc) {
    return html`
      <main class="responsive max padding center-align margin-top">
        <progress class="circle large"></progress>
        <p class="margin-top surface-variant-text">
          Carregando...
        </p>
      </main>
    `;
  }

  if (error && !doc) {
    return html`
      <main class="responsive max padding">
        <article class="border error-container round medium-padding margin">
          <div class="row items-center gap">
            <i class="error-text large">error</i>
            <div>
              <h5 class="no-margin bold">Falha ao carregar o artigo</h5>
              <p class="margin-top">${error}</p>
            </div>
          </div>
          <div class="margin-top">
            <button
              class="button primary"
              onClick=${() =>
                navigateTo(articles.value[0]?.path || "./articles/index.md")}
            >
              <i>home</i> Ir para Início
            </button>
          </div>
        </article>
      </main>
    `;
  }

  if (!doc) {
    return html`
      <main class="responsive max padding center-align">
        <p class="surface-variant-text">Nenhum artigo selecionado.</p>
      </main>
    `;
  }

  const currentArticle = articles.value.find(
    (a) => norm(a.path) === norm(path),
  );

  // Monta o breadcrumb discreto a partir da hierarquia do artigo
  const breadcrumbs: ArticleItem[] = [];
  let curr: ArticleItem | undefined = currentArticle;
  while (curr) {
    breadcrumbs.unshift(curr);
    if (!curr.parentPath || norm(curr.parentPath) === norm(curr.path)) break;
    curr = articles.value.find(
      (a) => norm(a.path) === norm(curr?.parentPath),
    );
  }

  const rootArticle = articles.value.find(
    (a) =>
      a.depth === 0 || a.name === "index.md" || a.path.endsWith("/index.md"),
  );
  if (
    rootArticle && breadcrumbs.length > 0 &&
    breadcrumbs[0] && breadcrumbs[0].path !== rootArticle.path
  ) {
    breadcrumbs.unshift(rootArticle);
  }

  // Título, autor e data extraídos do frontmatter ou metadados
  const title = doc.frontmatter?.title || currentArticle?.title || doc.title ||
    "Artigo";
  const author = doc.frontmatter?.author || currentArticle?.author;
  const date = doc.frontmatter?.date || currentArticle?.date;

  // Evita duplicar o título h1 do topo do markdown se já estiver no cabeçalho
  let renderWire = doc.wire;
  if (
    renderWire &&
    renderWire.t === "f" &&
    Array.isArray(renderWire.c) &&
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
        c: renderWire.c.slice(1),
      } as WireFragment;
    }
  }

  return html`
    <main class="responsive max padding">
      <!-- 1. Breadcrumb discreto e compacto com wrap -->
      ${breadcrumbs.length > 1
        ? html`
          <nav
            class="row wrap no-space items-center small-text surface-variant-text margin-bottom">
            ${breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const label = (idx === 0 &&
                  (crumb.name === "index.md" ||
                    crumb.path.endsWith("/index.md")))
                ? "Início"
                : crumb.title;
              return html`
                ${idx > 0
                  ? html`<i class="tiny tiny-margin opacity-50">chevron_right</i>`
                  : null}
                <a
                  class=${`wrap ${
                    isLast ? "bold primary-text" : "surface-variant-text wave"
                  }`}
                  onClick=${() => navigateTo(crumb.path)}
                >
                  ${label}
                </a>
              `;
            })}
          </nav>
        `
        : null}

      <!-- 2. Cabeçalho limpo: Título, autor e data -->
      <header class="margin-bottom-large padding-bottom border-bottom">
        <h3 class="bold no-margin-bottom wrap">${title}</h3>
        ${(author || date)
          ? html`
            <div
              class="row wrap items-center gap-medium small-text surface-variant-text margin-top-small">
              ${author
                ? html`
                  <span class="row items-center gap-tiny">
                    <i class="tiny">person</i>
                    <span>${author}</span>
                  </span>
                `
                : null}
              ${date
                ? html`
                  <span class="row items-center gap-tiny">
                    <i class="tiny">calendar_today</i>
                    <span>${date}</span>
                  </span>
                `
                : null}
            </div>
          `
          : null}
      </header>

      <!-- 3. Conteúdo do artigo -->
      <article class="no-border no-padding wrap">
        ${wireToVNode(renderWire)}
      </article>

      <!-- 4. Lista de Sub-páginas (exibida após o conteúdo do artigo) -->
      ${currentArticle && currentArticle.children &&
          currentArticle.children.length > 0
        ? html`
          <section class="margin-top-large padding-top border-top">
            <p class="bold small-text surface-variant-text uppercase margin-bottom-small">
              Sub-páginas (${currentArticle.children.length})
            </p>
            <div class="column gap-small">
              ${currentArticle.children.map((sub) =>
                html`
                  <a
                    key=${sub.path}
                    class="row wrap items-center justify-between border round padding-small surface-container wave gap-small"
                    onClick=${() => navigateTo(sub.path)}
                  >
                    <div class="row wrap items-center gap-small max min">
                      <i class="primary-text small">${sub.icon || "article"}</i>
                      <div class="max min wrap">
                        <div class="bold small-text wrap">${sub.title}</div>
                        ${sub.description
                          ? html`
                            <div class="small-text surface-variant-text wrap no-margin">
                              ${sub.description}
                            </div>
                          `
                          : null}
                      </div>
                    </div>
                    <div class="row items-center gap-small">
                      <i class="surface-variant-text small">chevron_right</i>
                    </div>
                  </a>
                `
              )}
            </div>
          </section>
        `
        : null}

      <!-- 5. Rodapé simplificado -->
      <footer class="margin-top-large padding-top padding-bottom border-top center-align surface-variant-text small-text">
        <span>Made with mdBlog</span>
      </footer>
    </main>
  `;
}
