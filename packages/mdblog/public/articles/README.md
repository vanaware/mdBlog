---
title: "📚 Visão Geral do mdBlog"
icon: "article"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "visão geral"
  - "arquitetura"
  - "islands"
description: "Visão geral e guia de uso do mdBlog com Preact Signals, BeerCSS e Islands."
pages:
  - "ARQUITETURA_WIRE_FORMAT.md"
  - "FLUXOS_E_CICLO_DE_VIDA.md"
---

# 📚 Visão Geral do mdBlog

O **mdBlog** é um motor de documentação e blog estático moderno inspirado na simplicidade do Docsify, mas reconstruído com uma arquitetura de alta performance, segurança rigorosa e suporte a componentes interativos.

Diferente de geradores tradicionais que dependem de injeção insegura de HTML (`dangerouslySetInnerHTML`), o mdBlog converte arquivos Markdown em uma árvore de nós serializável em JSON chamada **Wire Format AST**. Essa árvore é materializada pelo Preact no navegador como elementos e componentes nativos seguros contra ataques de XSS.

---

## ✨ Principais Funcionalidades

1. **Descoberta Dinâmica por Frontmatter:**
   Não há índices estáticos ou arquivos de rotas compilados no build. A estrutura de navegação, breadcrumbs e menus é montada lendo as declarações `pages:` nos metadados YAML de cada artigo.

2. **Islands Reativas em HTML+ES (Zero Compilação):**
   Adicione componentes interativos ao seu Markdown como arquivos `.js` padrão em `public/islands/`. Eles rodam diretamente no navegador usando `htm/preact` e `@preact/signals`, sem a necessidade de compiladores ou transpiladores em tempo de execução.

3. **Arquitetura Wire Format Imune a XSS:**
   O Markdown nunca é convertido para strings HTML cruas. Todo o conteúdo é estruturado em nós tipados, higienizado e renderizado pelo Preact.

4. **Operação PWA Offline com Service Worker:**
   O Service Worker intercepta a leitura de artigos `.md`, processa o Wire Format em segundo plano e mantém cópias em cache (`CacheStorage` e IndexedDB via `idb-keyval`).

5. **Interface Material Design 3 com BeerCSS:**
   Layout fluido, tipografia balanceada, suporte a temas claro/escuro e navegação responsiva em telas móveis e desktop.

---

## 🧭 Organização de Artigos e Sub-Páginas

Para criar uma estrutura hierárquica de documentação, use o campo `pages:` no frontmatter do artigo pai.

### Exemplo de Configuração de Frontmatter

```yaml
---
title: "Meu Artigo Principal"
icon: "book"
date: "2026-10-10"
author: "Equipe de Engenharia"
tags:
  - "docs"
  - "tutorial"
pages:
  - "subpagina-1.md"
  - "subpagina-2.md"
---
```

Cada sub-página listada em `pages:` pode, por sua vez, conter seu próprio frontmatter e declarar suas próprias sub-páginas, gerando árvores de documentação com múltiplos níveis de profundidade de forma intuitiva.

---

## ⚡ Como Usar Ilhas Interativas

O mdBlog suporta duas formas expressivas de incluir ilhas interativas no Markdown:

### 1. Sintaxe de Diretiva

Útil para ilhas compactas e parâmetros inline:

```markdown
::Counter.js{start: 10, step: 2, label: "Meu Contador"}
```

### 2. Sintaxe de Bloco de Código

Ideal quando a ilha recebe configurações em lote ou objetos JSON estruturados:

````markdown
```island:Counter.js
{
  "start": 100,
  "step": 5,
  "label": "Contador em Lote"
}
```
````

---

## 📖 Sub-páginas Desta Seção

- **[📐 Arquitetura do Wire Format](./ARQUITETURA_WIRE_FORMAT.md)**: Especificação formal do contrato JSON intermediário e tipagem dos nós AST.
- **[🔄 Fluxos e Ciclo de Vida](./FLUXOS_E_CICLO_DE_VIDA.md)**: Detalhamento do ciclo de carregamento, Service Worker, navegação SPA e fallback offline.
