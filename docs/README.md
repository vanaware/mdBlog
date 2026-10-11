# 📚 Documentação do mdBlog

Bem-vindo ao portal de documentação e guias técnicos do **mdBlog** (`@vanaware/mdblog`).

---

## 📑 Índice dos Documentos

1. **[Guia Completo, Instalação e Publicação no JSR](publish-jsr-rules.md)**
   - O que é o mdBlog, pré-requisitos e instalação via JSR.
   - Estrutura de pastas, configuração do Service Worker e PWA.
   - Padrões de qualidade do Deno, JSDoc e automação CI/CD.

2. **[Referência da API TypeScript](API_REFERENCE.md)**
   - Assinaturas completas de todos os componentes (`App`, `Navbar`, `Sidebar`, `Content`...).
   - Pipeline de transpilação (`parseMarkdown`, `mdastToWire`, `processMarkdown`, `loadDoc`).
   - Abstrações de I/O (`createBrowserIO`, `createMemoryIO`) e interceptador do Service Worker.
   - Primitivas reativas de sinais e tipos do Wire Format.

3. **[Guia de Sintaxe e Dynamic Islands](SYNTAX_AND_ISLANDS.md)**
   - Sintaxe CommonMark e extensões GFM (tabelas, checklists, tachado).
   - Metadados YAML Frontmatter e navegação recursiva.
   - Criação e incorporação de Dynamic Islands (HTML+ES) sem bundle.

4. **[Arquitetura do Wire Format](ARQUITETURA_WIRE_FORMAT.md)**
   - Especificação do formato intermediário JSON agnóstico (AST -> Wire).
   - Tabela de mapeamento canônica de nós e imunidade completa a XSS.

5. **[Fluxos de Navegação e Ciclo de Vida](FLUXOS_E_CICLO_DE_VIDA.md)**
   - First Paint com HTML Shell e payload embutido (`<script id="__md_wire">`).
   - Navegação SPA com Content Negotiation (`Accept: application/json`).
   - Estratégias de cache unificado (`CacheStorage` + `IndexedDB`).

---

## 🧭 Diagrama de Arquitetura

```
                     ┌───────────────────────────────┐
                     │      Markdown (.md docs)      │
                     └──────────────┬────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
    [ Service Worker Fetch ]                    [ Client Local Fallback ]
               │                                         │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │    Pipeline Core (mdast -> Wire)     │
                └───────────────────┬──────────────────┘
                                    │
                           JSON Wire Format
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │   from-wire.ts (Preact Registry)     │
                └───────────────────┬──────────────────┘
                                    │
                        VNodes estáticos iniciais
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │  hydrateIslands() [data-island]      │
                └──────────────────────────────────────┘
```
