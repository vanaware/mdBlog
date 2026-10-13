---
title: "⚙️ Arquitetura e Recursos do mdBlog"
icon: "settings"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "arquitetura"
  - "recursos"
  - "islands"
description: "Guia completo sobre os recursos essenciais do mdBlog: frontmatter, sub-páginas, islands e PWA."
pages:
  - "PLANO_MIGRACAO_HTML_ES.md"
---

# ⚙️ Arquitetura e Recursos do mdBlog

Este documento detalha o funcionamento técnico do **mdBlog**, demonstrando como os recursos de **frontmatter**, **sub-páginas recursivas**, **ilhas reativas** e **armazenamento offline** operam em conjunto no navegador.

---

## 📑 Metadados via Frontmatter

O frontmatter no mdBlog é processado através de um parser YAML embutido e suporta escalares, listas, datas e metadados de apresentação.

### Estrutura Completa de Campos

```yaml
---
title: "Título Principal do Artigo"
icon: "article"              # Ícone do Material Symbols exibido na navegação
date: "2026-10-10"           # Data de publicação ou revisão
author: "Nome do Autor"      # Exibido no cabeçalho do artigo
description: "Resumo curto"  # Usado para descrição e metatags
tags:
  - "tutorial"
  - "frontend"
pages:
  - "subpagina-exemplo.md"    # Sub-páginas pertencentes a este artigo
---
```

Quando um artigo é carregado, esses metadados alimentam os componentes de interface:
- **Navbar & Sidebar:** Apresentam o título e o ícone correspondente.
- **Cabeçalho do Leitor (`Content`):** Renderiza o título, data de publicação e autor de forma harmoniosa com o design do BeerCSS.
- **Breadcrumbs:** Mostram o caminho hierárquico até a página atual.

---

## 🌳 Sub-Páginas e Navegação Hierárquica

O mdBlog adota um modelo de **descoberta dinâmica** em que a estrutura do site é montada por relação de pertencimento:

1. **Página Inicial (`index.md`):** É o ponto de entrada da documentação e lista as seções ou páginas principais em seu frontmatter.
2. **Páginas Filhas:** Cada página listada pode ter seus próprios artigos declarados na propriedade `pages:`.
3. **Sub-páginas Recursivas:** O aninhamento pode ter múltiplos níveis de profundidade. O roteador descobre os nós dinamicamente conforme navega ou indexa os artigos.
4. **Navegação no Sidebar:** Sub-páginas recebem recuo visual limpo no menu lateral e são listadas ao final do artigo pai em cartões de navegação rápida.

---

## 🏝 Ilhas Interativas (Islands)

Uma ilha é um componente Preact que se isola dentro do documento Markdown estático, recebendo propriedades e mantendo seu próprio estado reativo.

### Exemplo 1: Sintaxe de Diretiva

```markdown
::Counter.js{start: 10, step: 2, label: "Contador Rápido"}
```

### Exemplo 2: Sintaxe com Bloco de Código

````markdown
```island:Counter.js
{
  "start": 50,
  "step": 10,
  "label": "Contador em Lote"
}
```
````

### Como uma Ilha é Hidratada:
1. O transformador converte a declaração Markdown em um nó `{ t: "i", n: "Counter.js", p: { ... } }`.
2. O Preact renderiza um contêiner `<div data-island="Counter.js" data-props="..."></div>`.
3. A rotina `hydrateIslands()` carrega o módulo `./islands/Counter.js` nativamente no navegador e monta o componente no elemento alvo.

---

## 🛡️ Segurança e Execução Offline

- **Sem injeção de HTML cru:** Tags HTML digitadas no Markdown são descartadas para proteger o usuário de vulnerabilidades de XSS.
- **Service Worker e CacheStorage:** O arquivo `sw.js` intercepta requisições de leitura de arquivos `.md`, transformando o Markdown em AST em segundo plano e armazenando as respostas no cache `md-wire-v1`.
- **IndexedDB:** O cliente utiliza `idb-keyval` para persistência durável no navegador, permitindo leitura completa mesmo sem conexão de rede.

---

## 📖 Sub-páginas

- **[⚡ Desenvolvimento em HTML+ES](./PLANO_MIGRACAO_HTML_ES.md)**: Como escrever ilhas e componentes sem compilação prévia usando módulos ES e `htm/preact`.
