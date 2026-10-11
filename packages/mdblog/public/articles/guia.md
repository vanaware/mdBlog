---
title: "🧪 Guia Prático & Ilhas Reativas"
icon: "science"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "guia"
  - "islands"
  - "signals"
description: "Guia prático com demonstração viva de ilhas reativas em HTML+ES, sub-páginas e frontmatter."
location: "#/articles/guia.md"
pages:
  - "GUIA_DE_ISLANDS.md"
---

# 🧪 Guia Prático e Demonstração de Recursos

Bem-vindo à demonstração viva da arquitetura do **mdBlog**!

Este documento é processado pelo parser Markdown, transformado em nós JSON serializáveis (*Wire Format AST*) e materializado pelo Preact no navegador com layout responsivo do BeerCSS.

---

## ⚡ Demonstração de Ilhas Interativas (Solução HTML+ES)

Abaixo temos uma ilha reativa construída com **HTML+ES (`htm/preact` + ES Modules)**, executada diretamente no navegador sem compilação prévia:

::Counter.js{start: 10, step: 1, label: "Contador Interativo Reativo"}

### Segunda Ilha com Bloco de Código

Você também pode instanciar ilhas declarando parâmetros em formato JSON estruturado usando blocos de código:

```island:Counter.js
{
  "start": 100,
  "step": 5,
  "label": "Contador em Lote (+5)"
}
```

Cada instância de ilha gerencia seu próprio estado reativo através de `@preact/signals`. Clicar nos botões de uma ilha não interfere nos valores de outras ilhas presentes na mesma página.

---

## 🧭 Configuração de Frontmatter e Sub-Páginas

Cada documento no mdBlog inicia com um bloco de metadados em YAML:

```yaml
---
title: "Título do Artigo"
icon: "science"             # Ícone do Material Symbols
date: "2026-10-10"
author: "Equipe de Docs"
pages:
  - "GUIA_DE_ISLANDS.md"    # Sub-páginas acessíveis a partir daqui
---
```

Ao declarar `pages:`, o mdBlog constrói automaticamente a trilha de breadcrumbs no topo e disponibiliza links de navegação rápida para as sub-páginas ao final da leitura.

---

## 📊 Tabelas Formatadas (GFM)

O Wire Format converte tabelas Markdown em componentes Preact com layout responsivo do BeerCSS:

| Recurso | Tradicional (Docsify) | Wire Format (mdBlog) |
|---|---|---|
| Injeção HTML | `dangerouslySetInnerHTML` | VNodes Preact puros e tipados |
| Interceptação SW | Não nativo | Transforma `.md` em AST em segundo plano |
| Interatividade | Scripts avulsos no DOM | Preact Islands com `@preact/signals` |
| Proteção XSS | Complexa sem sanitizadores | Imune por arquitetura de AST |
| Suporte Offline | Básico | CacheStorage + IndexedDB (`idb-keyval`) |

---

## 💻 Blocos de Código com Botão de Copiar

Você pode copiar facilmente trechos de código clicando no botão no canto superior direito:

```typescript
import { mdFetch } from "./src/plugin/adapters/client.ts";
import { createBrowserIO } from "./src/plugin/core/io.ts";

const io = createBrowserIO();
const doc = await mdFetch("./articles/guia.md", io);

console.log("Título do Documento:", doc.title);
console.log("Nós no Wire Format:", doc.wire.c?.length);
```

---

## 📖 Sub-páginas Desta Seção

- **[🏝️ Guia Avançado de Islands](./GUIA_DE_ISLANDS.md)**: Detalhamento técnico do algoritmo de hidratação e ciclo de vida das ilhas.
