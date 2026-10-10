import { html } from "htm/preact";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { get } from "idb-keyval";
import { searchDocs } from "../state.ts";
import { navigateTo } from "../router.ts";

export function SearchBox({ placeholder = "Pesquisar documentação..." } = {}) {
  const query = useSignal("");
  const isOpen = useSignal(false);

  // Tenta restaurar índice do IndexedDB se o signal ainda estiver vazio
  useEffect(() => {
    if (searchDocs.value.length === 0) {
      get("mdblog-search-index").then((cached) => {
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
    }).slice(0, 8);

  function handleSelect(path) {
    isOpen.value = false;
    query.value = "";
    navigateTo(path);
  }

  return html`
    <div class="margin-none">
      <div class="field prefix round fill small surface-container-highest no-margin">
        <i class="front">search</i>
        <input
          type="search"
          placeholder=${placeholder}
          value=${query.value}
          onInput=${(e) => {
            query.value = e.target.value;
            isOpen.value = true;
          }}
          onFocus=${() => (isOpen.value = true)}
        />
        ${query.value
          ? html`
            <i
              class="back link"
              onClick=${() => {
                query.value = "";
                isOpen.value = false;
              }}
            >
              close
            </i>
          `
          : null}
      </div>

      ${isOpen.value && results.length > 0
        ? html`
          <div class="surface-container-high border round shadow medium-padding active scroll medium-height">
            <div class="row items-center justify-between no-margin margin-bottom">
              <span class="small-text surface-variant-text bold">
                ${results.length} resultado(s) encontrado(s):
              </span>
              <span class="chip tiny surface-variant">IndexedDB</span>
            </div>
            <div class="column gap-small">
              ${results.map((doc) =>
                html`
                  <a
                    key=${doc.path}
                    href="#${doc.path}"
                    class="row items-center wave padding-small round surface-container-low gap-small"
                    onClick=${(e) => {
                      e.preventDefault();
                      handleSelect(doc.path);
                    }}
                  >
                    <i class="primary-text small">${doc.icon || "description"}</i>
                    <div class="max truncate min">
                      <div class="bold truncate small-text">${doc.title}</div>
                      ${doc.description
                        ? html`
                          <div class="small-text surface-variant-text truncate">
                            ${doc.description}
                          </div>
                        `
                        : (doc.content
                          ? html`
                            <div class="small-text surface-variant-text truncate opacity-70">
                              ${doc.content.slice(0, 80)}...
                            </div>
                          `
                          : null)}
                    </div>
                    ${doc.badge
                      ? html`<span class="badge tiny primary">${doc.badge}</span>`
                      : null}
                  </a>
                `
              )}
            </div>
          </div>
        `
        : null}

      ${isOpen.value && trimmed !== "" && results.length === 0
        ? html`
          <div class="surface-container-high border round shadow small-padding active">
            <p class="small-text surface-variant-text no-margin center-align">
              Nenhum artigo encontrado para "${query.value}"
            </p>
          </div>
        `
        : null}
    </div>
  `;
}
