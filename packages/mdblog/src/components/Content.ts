import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";
import { useEffect, } from "preact/hooks";
import {
  type ArticleItem,
  articles,
  currentDoc,
  currentPath,
  errorMessage,
  isLoading,
  isWideScreen,
  tocRailOpen,
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
  const tocOpen = useSignal(false,);

  const doc = currentDoc.value;
  const path = currentPath.value;
  const loading = isLoading.value;
  const error = errorMessage.value;

  // A versão vai no rodapé para se conferir, sem abrir a consola, que o bundle
  // servido é o da última compilação: "major.minor.patch#buildHash", sendo o
  // sufixo o instante da build. Fica vazio quando o módulo é consumido sem
  // bundle (sem o define da compilação), pelo que se omite em vez de deixar um
  // espaço solto no texto.
  const versionSuffix = APP_VERSION ? ` ${APP_VERSION}` : "";

  useEffect(() => {
    tocOpen.value = false;
    if (doc) {
      hydrateIslands();
      if (typeof globalThis !== "undefined" && globalThis.scrollTo) {
        globalThis.scrollTo({ top: 0, },);
      }
    }
  }, [doc, path,],);

  // O painel modal só existe em telas estreitas: ao alargar a janela fecha-o,
  // para que um estreitamento posterior não o reabra sozinho sobre o artigo.
  useEffect(() => {
    if (tocOpen.value && isWideScreen.value) tocOpen.value = false;
  }, [isWideScreen.value,],);

  if (loading && !doc) {
    return html`
      <main class="responsive max padding center-align margin-top">
        <i class="large primary-text">menu_book</i>
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
            <a class="button primary" href="#/">
              <i>home</i> Ir para Início
            </a>
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
    (a,) => normalizePath(a.path,) === normalizePath(path,),
  );

  // Monta o breadcrumb discreto a partir da hierarquia do artigo
  const breadcrumbs: ArticleItem[] = [];
  let curr: ArticleItem | undefined = currentArticle;
  while (curr) {
    breadcrumbs.unshift(curr,);
    if (
      !curr.parentPath ||
      normalizePath(curr.parentPath,) === normalizePath(curr.path,)
    ) break;
    curr = articles.value.find(
      (a,) => normalizePath(a.path,) === normalizePath(curr?.parentPath,),
    );
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

  // Título, autor e data extraídos do frontmatter ou metadados
  const title = doc.frontmatter?.title || currentArticle?.title || doc.title ||
    "Artigo";
  const author = doc.frontmatter?.author || currentArticle?.author;
  const date = doc.frontmatter?.date || currentArticle?.date;
  const tags: string[] = Array.isArray(currentArticle?.tags,)
    ? currentArticle!.tags!
    : Array.isArray(doc.frontmatter?.tags,)
    ? doc.frontmatter.tags as string[]
    : [];
  const readingTime = estimateReadingTimeMinutes(doc.raw || "",);

  // Evita duplicar o título h1 do topo do markdown se já estiver no cabeçalho
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

  // O sumário tem sempre um ponto de controlo, em qualquer largura: nas telas
  // largas o botão alterna a coluna própria (preferência persistida); nas
  // estreitas abre o painel modal, que não pode ficar aberto entre artigos.
  const showRail = hasToc && isWideScreen.value && tocRailOpen.value;
  const showTocPanel = hasToc && !isWideScreen.value;
  // Somente sumários longos recebem altura fixa com barra de rolagem (igual à
  // gaveta lateral); os curtos ficam na altura natural para não sobrar espaço
  // vazio na coluna.
  const railScrollClass = toc.length > 8 ? "scroll medium-height" : "";

  function toggleToc(): void {
    if (isWideScreen.value) {
      tocRailOpen.value = !tocRailOpen.value;
    } else {
      tocOpen.value = !tocOpen.value;
    }
  }

  return html`
    <main class="responsive max padding">
      <!-- 1. Breadcrumb discreto e compacto com wrap -->
      ${breadcrumbs.length > 1
        ? html`
          <nav
            class="row wrap no-space items-center small-text surface-variant-text margin-bottom">
            ${breadcrumbs.map((crumb, idx,) => {
              const isLast = idx === breadcrumbs.length - 1;
              const label = (idx === 0 &&
                  (crumb.name === "index.md" ||
                    crumb.path.endsWith("/index.md",)))
                ? "Início"
                : crumb.title;
              return html`
                ${idx > 0
                  ? html`<i class="tiny tiny-margin opacity-50">chevron_right</i>`
                  : null}
                <a
                  href=${articleHrefFromPath(crumb.path,)}
                  class=${`wrap ${
                    isLast ? "bold primary-text" : "surface-variant-text wave"
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
          <!-- 2. Cabeçalho limpo: Título, metadados, tags e tempo de leitura -->
          <header class="margin-bottom-large padding-bottom border-bottom">
            <h3 class="bold no-margin-bottom wrap">${title}</h3>
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
              <span
                class="row items-center gap-tiny"
                title="Tempo estimado de leitura"
              >
                <i class="tiny">schedule</i>
                <span>${readingTime} min de leitura</span>
              </span>
              <div class="max"></div>
              ${hasToc
                ? html`
                  <button
                    class="small tertiary no-margin"
                    onClick=${toggleToc}
                    aria-expanded=${isWideScreen.value
                      ? tocRailOpen.value
                      : tocOpen.value}
                    aria-label=${isWideScreen.value
                      ? "Mostrar ou ocultar o sumário"
                      : "Abrir ou fechar o sumário"}
                    title=${isWideScreen.value
                      ? (tocRailOpen.value
                        ? "Ocultar sumário desta página"
                        : "Mostrar sumário desta página")
                      : "Sumário desta página"}
                  >
                    <i>toc</i>
                    <span>Nesta página</span>
                  </button>
                `
                : null}
            </div>
            ${tags.length > 0
              ? html`
                <div class="row wrap items-center gap-tiny margin-top-small">
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

          <!-- 3. Conteúdo do artigo -->
          <article class="no-border no-padding wrap">
            ${wireToVNode(renderWire,)}
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
                  ${currentArticle.children.map((sub,) =>
                    html`
                      <a
                        key=${sub.path}
                        href=${articleHrefFromPath(sub.path,)}
                        class="row wrap items-center justify-between border round padding-small surface-container wave gap-small"
                      >
                        <div class="row wrap items-center gap-small max min">
                          <i class="primary-text small">${sub.icon ||
                            "article"}</i>
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

          <!-- 5. Paginação Anterior/Próximo seguindo a ordem da árvore de artigos -->
          ${prev || next
            ? html`
              <nav
                class="grid margin-top-large"
                aria-label="Navegação entre artigos"
              >
                ${prev
                  ? html`
                    <a
                      href=${articleHrefFromPath(prev.path,)}
                      class="s12 m6 l6 border round padding wave surface-container-low row items-center gap-small no-margin"
                    >
                      <i class="surface-variant-text">arrow_back</i>
                      <div class="max min">
                        <div class="tiny-text surface-variant-text uppercase">
                          Anterior
                        </div>
                        <div class="bold small-text wrap">${prev.title}</div>
                      </div>
                    </a>
                  `
                  : html`<div class="s12 m6 l6"></div>`}
                ${next
                  ? html`
                    <a
                      href=${articleHrefFromPath(next.path,)}
                      class="s12 m6 l6 border round padding wave surface-container-low row items-center gap-small no-margin"
                    >
                      <div class="max min right-align">
                        <div class="tiny-text surface-variant-text uppercase">
                          Próximo
                        </div>
                        <div class="bold small-text wrap">${next.title}</div>
                      </div>
                      <i class="surface-variant-text">arrow_forward</i>
                    </a>
                  `
                  : null}
              </nav>
            `
            : null}

          <!-- 6. Rodapé simplificado. O nome e a versão partilham o mesmo span
              porque o BeerCSS define footer{flex-direction:column} e ".row" não
              desfaz isso: um segundo filho cairia para a linha de baixo. -->
          <footer class="margin-top-large padding-top padding-bottom border-top center-align surface-variant-text small-text">
            <span>Made with mdBlog${versionSuffix}</span>
          </footer>
        </div>

        <!-- Sumário rolável em telas largas (l), recolhível pelo botão do cabeçalho
            ou por este fecho próprio da coluna. -->
        ${showRail
          ? html`
            <aside class="l l3 padding-left" aria-label="Sumário desta página">
              <div class="row items-center justify-between no-padding">
                <p class="bold small-text surface-variant-text uppercase no-margin">
                  Nesta página
                </p>
                <button
                  class="circle tiny transparent"
                  onClick=${() => (tocRailOpen.value = false)}
                  aria-label="Fechar sumário"
                  title="Ocultar sumário desta página"
                >
                  <i class="small">close</i>
                </button>
              </div>
              <div class=${railScrollClass}>
                <${Toc} headings=${toc} />
              </div>
            </aside>
          `
          : null}
      </div>

      <!-- Sumário em painel lateral (dialog posicionado) para telas pequenas e médias (s/m) -->
      ${showTocPanel
        ? html`
          ${tocOpen.value
            ? html`
              <div
                class="overlay active"
                onClick=${() => (tocOpen.value = false)}
              ></div>
            `
            : null}
          <dialog
            class=${`right medium-width round surface-container scroll small-padding border ${
              tocOpen.value ? "active" : ""
            }`}
            aria-label="Sumário"
          >
            <div
              class="row items-center justify-between no-padding border-bottom no-margin">
              <div class="row items-center gap-tiny">
                <i class="primary-text tiny">toc</i>
                <span class="bold tiny-text">Nesta página</span>
              </div>
              <button
                class="circle tiny transparent"
                onClick=${() => (tocOpen.value = false)}
                aria-label="Fechar sumário"
              >
                <i class="small">close</i>
              </button>
            </div>
            <${Toc}
              headings=${toc}
              onNavigate=${() => (tocOpen.value = false)}
            />
          </dialog>
        `
        : null}
    </main>
  `;
}
