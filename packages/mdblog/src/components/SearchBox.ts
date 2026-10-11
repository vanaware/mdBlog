import { html } from "htm/preact";
import type { VNode } from "preact";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { get } from "idb-keyval";
import { searchDocs, type SearchDocItem } from "../state.ts";
import { navigateTo } from "../router.ts";

export interface SearchBoxProps {
  placeholder?: string;
}

export function SearchBox({ placeholder = "Buscar artigos..." }: SearchBoxProps = {}): VNode {
  const query = useSignal("");
  const isOpen = useSignal(false);

  // Tenta restaurar índice do IndexedDB se o signal ainda estiver vazio
  useEffect(() => {
    if (searchDocs.value.length === 0) {
      get<SearchDocItem[]>("mdblog-search-index").then((cached) => {
        if (Array.isArray(cached) && cached.length > 0) {
          searchDocs.value = cached;
        }
      }).catch(() => {});
    }
  }, []);

  const trimmed = query.value.trim().toLowerCase();
  const results = trimmed === ""
    ? []
    : searchDocs.value.filter((doc) => {
      const matchTitle = doc.title.toLowerCase().includes(trimmed);
      const matchDesc = doc.description && doc.description.toLowerCase().includes(trimmed);
      const matchContent = doc.content && doc.content.toLowerCase().includes(trimmed);
      const matchTags = Array.isArray(doc.tags) &&
        doc.tags.some((tag) => tag.toLowerCase().includes(trimmed));
      return matchTitle || matchDesc || matchContent || matchTags;
    }).slice(0, 10);

  function handleSelect(path: string): void {
    isOpen.value = false;
    query.value = "";
    navigateTo(path);
  }

  function handleClose(): void {
    isOpen.value = false;
    query.value = "";
  }

  return html`
    <div class="row items-center no-margin">
      <!-- Botão/Campo de ativação na barra de navegação -->
      <div
        class="field prefix round fill small surface-container-highest no-margin"
        onClick=${() => (isOpen.value = true)}
      >
        <i class="front">search</i>
        <input
          type="search"
          placeholder=${placeholder}
          value=${query.value}
          onFocus=${() => (isOpen.value = true)}
          onInput=${(e: Event) => {
            query.value = (e.target as HTMLInputElement).value;
            isOpen.value = true;
          }}
          readonly=${false}
        />
      </div>

      <!-- Modal de busca flutuante via BeerCSS dialog (z-index 100, imune a sobreposição da sidebar) -->
      ${isOpen.value
        ? html`
          <div
            class="overlay active"
            onClick=${handleClose}
          ></div>

          <dialog class="medium round shadow active border surface-container-high scroll">
            <header class="row items-center justify-between no-margin margin-bottom">
              <div class="row items-center gap-small">
                <i class="primary-text small">search</i>
                <h6 class="no-margin bold small-text">Pesquisar Artigos</h6>
              </div>
              <button
                class="circle tiny transparent"
                onClick=${handleClose}
                aria-label="Fechar busca"
              >
                <i>close</i>
              </button>
            </header>

            <div class="field prefix round fill small surface-container-highest no-margin">
              <i class="front">search</i>
              <input
                type="search"
                placeholder=${placeholder}
                value=${query.value}
                autofocus
                onInput=${(e: Event) => {
                  query.value = (e.target as HTMLInputElement).value;
                }}
              />
              ${query.value
                ? html`
                  <i
                    class="back link"
                    onClick=${() => {
                      query.value = "";
                    }}
                  >
                    close
                  </i>
                `
                : null}
            </div>

            ${results.length > 0
              ? html`
                <div class="column gap-tiny margin-top scroll small-height">
                  ${results.map((doc) =>
                    html`
                      <a
                        key=${doc.path}
                        class="row items-center wave padding-small round surface-container-low gap-small"
                        onClick=${(e: Event) => {
                          e.preventDefault();
                          handleSelect(doc.path);
                        }}
                      >
                        <i class="primary-text small">${doc.icon || "article"}</i>
                        <span class="bold truncate small-text max">${doc.title}</span>
                        <i class="tiny surface-variant-text">arrow_forward</i>
                      </a>
                    `
                  )}
                </div>
              `
              : null}

            ${trimmed !== "" && results.length === 0
              ? html`
                <div class="padding center-align margin-top">
                  <p class="small-text surface-variant-text no-margin">
                    Nenhum artigo encontrado para "${query.value}"
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
