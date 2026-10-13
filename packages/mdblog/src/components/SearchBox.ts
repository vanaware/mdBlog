import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";
import { useEffect, } from "preact/hooks";
import { get, } from "idb-keyval";
import { isWideScreen, type SearchDocItem, searchDocs, } from "../state.ts";
import { navigateTo, } from "../router.ts";
import { articleHrefFromPath, } from "../utils.ts";

/**
 * @description Properties accepted by the SearchBox component.
 */
export interface SearchBoxProps {
  /** @description Placeholder text displayed in search input. */
  placeholder?: string;
}

/**
 * @description Search box component with responsive trigger (input on desktop, icon button on mobile), interactive dialog, keyboard shortcuts (Ctrl/Cmd+K to open, Escape to close), auto-indexed full-text search, and quick navigation.
 * @param props - Search configuration props.
 * @returns Preact VNode representing the search trigger and dialog.
 * @example
 * ```ts
 * import { SearchBox } from "./SearchBox.ts";
 * import { html } from "htm/preact";
 * const node = html`<${SearchBox} placeholder="Search..." />`;
 * ```
 */
export function SearchBox({
  placeholder = "Buscar artigos...",
}: SearchBoxProps = {},): unknown {
  const query = useSignal("",);
  const isOpen = useSignal(false,);
  const panelInput = useSignal<HTMLInputElement | null>(null,);

  // `autofocus` nativo é ignorado num dialog mostrado por classe (o BeerCSS
  // usa .active), pelo que o foco tem de ser colocado explicitamente: sem
  // isto, quem abre a pesquisa pelo botão de ícone teria de tocar duas vezes.
  useEffect(() => {
    if (isOpen.value) panelInput.value?.focus();
  }, [isOpen.value,],);

  // Tenta restaurar índice do IndexedDB se o signal ainda estiver vazio
  useEffect(() => {
    if (searchDocs.value.length === 0) {
      get<SearchDocItem[]>("mdblog-search-index",).then((cached,) => {
        if (Array.isArray(cached,) && cached.length > 0) {
          searchDocs.value = cached;
        }
      },).catch(() => {},);
    }
  }, [],);

  // Atalhos globais de teclado: Ctrl/Cmd+K abre a busca, Escape fecha
  useEffect(() => {
    if (typeof globalThis === "undefined") return;
    const handleKeydown = (e: KeyboardEvent,): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        isOpen.value = true;
      } else if (e.key === "Escape" && isOpen.value) {
        handleClose();
      }
    };
    globalThis.addEventListener("keydown", handleKeydown,);
    return () => globalThis.removeEventListener("keydown", handleKeydown,);
  }, [],);

  const trimmed = query.value.trim().toLowerCase();
  const indexedCount = searchDocs.value.length;
  const results = trimmed === "" ? [] : searchDocs.value.filter((doc,) => {
    const matchTitle = doc.title.toLowerCase().includes(trimmed,);
    const matchDesc = doc.description &&
      doc.description.toLowerCase().includes(trimmed,);
    const matchContent = doc.content &&
      doc.content.toLowerCase().includes(trimmed,);
    const matchTags = Array.isArray(doc.tags,) &&
      doc.tags.some((tag,) => tag.toLowerCase().includes(trimmed,));
    return matchTitle || matchDesc || matchContent || matchTags;
  },).slice(0, 10,);

  function handleSelect(path: string,): void {
    isOpen.value = false;
    query.value = "";
    navigateTo(path,);
  }

  function handleClose(): void {
    isOpen.value = false;
    query.value = "";
  }

  return html`
    <div class="row items-center no-margin">
      <!-- Os dois gatilhos são mutuamente exclusivos no DOM, não por classes de
          breakpoint: as classes s/m/l do BeerCSS deixam de esconder qualquer um
          deles em larguras fracionárias (zoom do navegador entre 600 e 601 ou
          entre 992 e 993), o que mostraria os dois e estoiraria a largura da
          barra. Em telas estreitas cabe apenas o botão de ícone. -->
      ${isWideScreen.value
        ? html`
          <div
            class="field prefix round fill small surface-container-highest no-margin"
            onClick=${() => (isOpen.value = true)}
            title="Buscar (Ctrl+K)"
          >
            <i class="front">search</i>
            <input
              type="search"
              placeholder=${placeholder}
              value=${query.value}
              aria-label="Buscar artigos"
              aria-keyshortcuts="Control+K Meta+K"
              onFocus=${() => (isOpen.value = true)}
              onInput=${(e: Event,) => {
                query.value = (e.target as HTMLInputElement).value;
                isOpen.value = true;
              }}
            />
          </div>
        `
        : html`
          <button
            class="circle transparent"
            onClick=${() => (isOpen.value = true)}
            aria-label="Buscar artigos"
            title="Buscar (Ctrl+K)"
          >
            <i>search</i>
          </button>
        `}

      <!-- Painel de resultados: dialog nativo do BeerCSS (z-index 100). Em telas
          largas é um cartão centrado de largura fixa; em telas estreitas ocupa o
          ecrã inteiro, que é a forma mais legível de apresentar uma lista de
          resultados num telemóvel. O dialog já traz overflow-y:auto e
          max-block-size, por isso não precisa de classe de scroll própria. -->
      ${isOpen.value
        ? html`
          <div class="overlay active" onClick=${handleClose}></div>

          <dialog
            class=${isWideScreen.value ? "active large-width" : "active max"}
            aria-label="Pesquisar artigos"
          >
            <!-- Título à esquerda e acções encostadas à direita. Um <header> não
                serve aqui: o BeerCSS dá-lhe flex-direction:column e
                justify-content:center, o que empilhava o chip "Esc" e o botão de
                fecho no meio do painel. O separador .max (flex:1) é o único
                mecanismo de alinhamento à direita disponível — a framework não
                tem justify-between. -->
            <div class="row no-margin">
              <i class="primary-text">search</i>
              <h6 class="bold no-margin">Pesquisar artigos</h6>
              <div class="max"></div>
              ${isWideScreen.value
                ? html`
                  <span class="chip" title="Fechar com a tecla Esc">Esc</span>
                `
                : null}
              <button
                class="circle transparent"
                onClick=${handleClose}
                aria-label="Fechar busca"
                title="Fechar (Esc)"
              >
                <i>close</i>
              </button>
            </div>

            <!-- O .field não usa fill nem border: mantém o elevate1 do BeerCSS,
                que é o contraste correto sobre o fundo do dialog. Os ícones levam
                .front porque os filhos absolutos do campo são pintados por ordem
                de documento e o input, sendo relativo, ficaria por cima do
                último, tornando o "limpar" inclicável. -->
            <div
              class=${query.value
                ? "field prefix suffix round no-margin"
                : "field prefix round no-margin"}
            >
              <i class="front">search</i>
              <input
                type="search"
                placeholder=${placeholder}
                value=${query.value}
                aria-label="Buscar artigos"
                aria-keyshortcuts="Control+K Meta+K"
                autofocus
                ref=${(el: HTMLInputElement | null,) => {
                  panelInput.value = el;
                }}
                onInput=${(e: Event,) => {
                  query.value = (e.target as HTMLInputElement).value;
                }}
              />
              ${query.value
                ? html`
                  <i
                    class="front link"
                    title="Limpar busca"
                    onClick=${() => {
                      query.value = "";
                      panelInput.value?.focus();
                    }}
                  >
                    close
                  </i>
                `
                : null}
            </div>

            ${trimmed === ""
              ? html`
                <div class="row small-padding round surface-container-low">
                  <i class="primary-text">tips_and_updates</i>
                  <div class="max small-text">
                    Busque por título, etiqueta ou palavra do artigo.
                  </div>
                  <span class="small-text surface-variant-text">
                    ${indexedCount} artigos
                  </span>
                </div>
              `
              : null}

            ${results.length > 0
              ? html`
                <div class="row small-text surface-variant-text">
                  <div class="max">
                    ${results.length} resultado${results.length > 1
                      ? "s"
                      : ""} para "${query.value}"
                  </div>
                </div>
              `
              : null}

            <!-- O BeerCSS zera as margens de qualquer "a.row" (regra própria),
                pelo que a separação entre cartões não vem do fluxo: small-margin +
                vertical-margin escrevem var(---margin) com !important e afastam as
                linhas sem lhes retirar a largura inteira. A coluna de texto também
                leva .truncate: um item de flexbox com overflow diferente de
                "visible" passa a ter tamanho mínimo zero, e sem isso o texto de
                uma linha (white-space:nowrap) empurrava o .max para a largura
                inteira da frase — cortando o título a meio e atirando a seta para
                fora do painel. -->
            <div class="vertical-margin small-margin" aria-live="polite">
              ${results.map((doc,) =>
                html`
                  <a
                    key=${doc.path}
                    href=${articleHrefFromPath(doc.path,)}
                    class="row wave round small-padding vertical-margin small-margin surface-container-low"
                    onClick=${(e: Event,) => {
                      e.preventDefault();
                      handleSelect(doc.path,);
                    }}
                  >
                    <i class="primary-text">${doc.icon || "article"}</i>
                    <div class="max truncate">
                      <div class="bold truncate">${doc.title}</div>
                      ${doc.description
                        ? html`
                          <div class="small-text surface-variant-text truncate">
                            ${doc.description}
                          </div>
                        `
                        : null}
                    </div>
                    <i class="tiny surface-variant-text">arrow_forward</i>
                  </a>
                `
              )}
            </div>

            ${trimmed !== "" && results.length === 0
              ? html`
                <div
                  class="center-align small-padding round surface-container-low vertical-margin">
                  <i class="primary-text large">search_off</i>
                  <p class="no-margin">
                    Nenhum artigo encontrado para "${query.value}"
                  </p>
                  <p class="small-text surface-variant-text no-margin">
                    Verifique a ortografia ou tente uma palavra mais genérica.
                  </p>
                </div>
              `
              : null}
          </dialog>
        `
        : null}
    </div>
  `;
}
