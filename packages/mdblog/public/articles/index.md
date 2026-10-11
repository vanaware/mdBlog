---
title: "mdBlog - Blog & Documentação Estática"
description: "Motor de documentação estático moderno baseado em Deno, Preact Signals, BeerCSS e Islands em HTML+ES."
date: "2026-10-09"
author: "SyntaxMesh Team"
location: "#/articles/index.md"
tags:
  - "Deno"
  - "PWA"
  - "Preact"
  - "BeerCSS"
  - "Islands"
pages:
  - "README.md"
  - "guia.md"
  - "PLANO_DESENVOLVIMENTO.md"
---

# 📖 mdBlog — Página Inicial

Bem-vindo ao **mdBlog**, um gerador de documentação e blog estático moderno construído com **Deno, Preact Signals, BeerCSS e Wire Format AST**.

Esta página principal é carregada a partir do arquivo **`index.md`**. A estrutura do menu e dos breadcrumbs é montada automaticamente a partir da lista de arquivos declarada no frontmatter `pages:`, enquanto títulos, ícones, datas e tags são extraídos dinamicamente de cada artigo individual.

---

## ⚡ Demonstração Reativa (Ilha Interativa)

Abaixo temos uma ilha Preact hidratada dinamicamente via módulo HTML+ES:

::Counter.js{start: 42, step: 1, label: "Contador Interativo na Home"}

### Segunda Instância de Ilha via Bloco de Código

Você também pode instanciar ilhas informando dados estruturados em JSON:

```island:Counter.js
{
  "start": 100,
  "step": 5,
  "label": "Contador em Lote (+5)"
}
```

---

## 🚀 Artigos em Destaque

Navegue pelos guias e documentações técnicas disponíveis:

- **[📚 Visão Geral do mdBlog](./README.md)**: Conheça a motivação, o pipeline de dados e os princípios de segurança.
- **[🧪 Guia Prático & Demonstração de Ilhas](./guia.md)**: Veja componentes interativos (*islands*) funcionando em tempo real.
- **[⚙️ Arquitetura e Recursos](./PLANO_DESENVOLVIMENTO.md)**: Entenda o funcionamento do frontmatter, sub-páginas recursivas e PWA.
- **[⚡ Desenvolvimento em HTML+ES (.js)](./PLANO_MIGRACAO_HTML_ES.md)**: Aprenda a criar novas ilhas em arquivos `.js` nativos sem etapas de compilação.
- **[📐 Especificação do Wire Format AST](./ARQUITETURA_WIRE_FORMAT.md)**: Contrato JSON serializável imune a XSS.
- **[🏝️ Guia de Islands](./GUIA_DE_ISLANDS.md)**: Manual de hidratação seletiva sob demanda no cliente.
- **[🔄 Fluxos de Navegação e Cache PWA](./FLUXOS_E_CICLO_DE_VIDA.md)**: Estratégias de Service Worker e IndexedDB (`idb-keyval`).

---

## 🌳 Estrutura Hierárquica e Sub-Páginas

O mdBlog suporta **sub-páginas recursivas aninhadas** descobertas diretamente via frontmatter:

1. **Página Raiz (`index.md`)**: Declara as seções principais na lista `pages:`.
2. **Páginas Principais**: Cada página (ex.: `README.md`) pode ter sua própria lista `pages:` com sub-páginas (ex.: `ARQUITETURA_WIRE_FORMAT.md`).
3. **Sub-sub-páginas**: Uma sub-página também pode ter `pages:` (ex.: `WIRE_SCHEMA_DETALHES.md`), permitindo múltiplos níveis de profundidade.
4. **Navegação no Sidebar e Drawer**: As sub-páginas aparecem organizadas com indentação limpa no menu lateral e trilha de breadcrumbs no topo.

---

## 🛠 Como Publicar Novos Artigos ou Sub-Páginas

1. Adicione um novo arquivo `.md` na pasta `public/articles/` (ex.: `public/articles/meu-artigo.md`) com seu próprio bloco de frontmatter (`title`, `icon`, `date`, `tags`, etc.).
2. Adicione o nome do arquivo na lista `pages:` da página pai onde deseja que ele apareça.
3. O navegador descobre a hierarquia em tempo de execução e atualiza o Navbar, Sidebar e Breadcrumbs automaticamente sem precisar recompilar o aplicativo.
