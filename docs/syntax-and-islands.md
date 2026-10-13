# ✍️ Guia de Sintaxe e Dynamic Islands no mdBlog

Este guia detalha toda a sintaxe suportada pelo **mdBlog**, cobrindo a especificação **CommonMark**, as extensões **GitHub Flavored Markdown (GFM)**, opções de **Frontmatter** e a arquitetura de **Dynamic Islands (HTML+ES)**.

---

## 1. Sintaxe Markdown Base (CommonMark)

O mdBlog suporta todas as marcações padrão do CommonMark:

### Títulos
```markdown
# Título 1 (vira o título do documento se for o primeiro)
## Título 2 (Gera âncora automática e link direto)
### Título 3
#### Título 4
```

### Formatação de Texto
```markdown
*Texto em itálico* ou _itálico_
**Texto em negrito** ou __negrito__
`código em linha`
```

### Links e Imagens
```markdown
[Link Interno para Artigo](guia.md)
[Link Externo](https://deno.com)
![Texto Alternativo da Imagem](./icon.svg "Título da Imagem")
```

### Listas e Citações
```markdown
- Lista com marcadores
  - Sub-item indentado
- Outro item

1. Lista numerada
2. Segundo item

> Bloco de citação estilizado com borda BeerCSS
```

### Blocos de Código
```markdown
```typescript
function hello(name: string): string {
  return `Hello, ${name}!`;
}
```
```
Os blocos de código incluem botão nativo de cópia para a área de transferência (`clipboard`) com feedback visual.

---

## 2. Extensões GFM (GitHub Flavored Markdown)

O parser integra extensões completas do GFM:

### Tabelas
```markdown
| Recurso | Suportado? | Notas |
|:---|:---:|---:|
| Tabelas | ✅ Sim | Alinhamento configurável |
| Checklists | ✅ Sim | Caixas de seleção desabilitadas |
| Tachado | ✅ Sim | `~~texto tachado~~` |
```

### Listas de Tarefas (Task Lists)
```markdown
- [x] Tarefa concluída com checkbox marcado
- [ ] Tarefa pendente
```

### Texto Tachado
```markdown
~~Este texto foi removido ou corrigido~~
```

---

## 3. Frontmatter YAML

No início de qualquer arquivo `.md`, você pode incluir metadados YAML delimitados por `---`:

```yaml
---
title: "Título Personalizado da Página"
author: "Vanaware"
date: "2026-10-10"
icon: "auto_stories"       # Nome do ícone Material Symbols
badge: "Novo"              # Chip visual exibido nos cartões
tags:
  - "tutorial"
  - "deno"
pages:                     # Navegação recursiva para sub-páginas
  - path: "sub-artigo-1.md"
    title: "Parte 1"
    icon: "filter_1"
  - path: "sub-artigo-2.md"
    title: "Parte 2"
    icon: "filter_2"
---
```

### Propriedades Suportadas

| Campo | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Título do artigo (substitui o primeiro `# H1` caso definido) |
| `author` | `string` | Nome do autor exibido nos metadados |
| `date` | `string` | Data de publicação ou revisão |
| `icon` | `string` | Nome de ícone dos Google Material Symbols |
| `badge` | `string` | Rótulo/chip visual de destaque |
| `tags` | `string[]` | Lista de palavras-chave para busca |
| `pages` | `Array` | Lista recursiva de sub-páginas filhas |

---

## 4. Dynamic Islands (HTML+ES — Zero Bundle)

As ilhas dinâmicas permitem incorporar componentes interativos reativos sem precisar recompilar a biblioteca.

### Onde ficam os arquivos?
Ficam exclusivamente na pasta `public/islands/`.

### Como escrever uma ilha?
Escreva um módulo JavaScript ES padrão usando `htm/preact` importado de `../mdblog.js`:

```javascript
// public/islands/DemoCounter.js
import { html, useSignal } from "../mdblog.js";

export function DemoCounter({ start = 0, step = 1, label = "Contador" }) {
  const count = useSignal(Number(start));

  return html`
    <article class="border round medium-padding surface-container margin">
      <div class="row items-center justify-between">
        <div>
          <h6 class="no-margin bold">${label}</h6>
          <span class="small-text surface-variant-text">Ilha Dinâmica nativa</span>
        </div>
        <div class="row items-center gap">
          <button class="circle small surface-variant" onClick=${() => count.value -= Number(step)}>
            <i>remove</i>
          </button>
          <span class="chip primary bold">${count.value}</span>
          <button class="circle small primary" onClick=${() => count.value += Number(step)}>
            <i>add</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default DemoCounter;
```

### Como inserir a ilha no Markdown?

#### Opção A: Sintaxe de Diretiva (Recomendada)
```markdown
::DemoCounter.js{start: 20, step: 5, label: "Meu Contador"}
```

#### Opção B: Sintaxe de Bloco de Código
```markdown
```island:DemoCounter.js
{
  "start": 50,
  "step": 10,
  "label": "Contador em Bloco"
}
```
```

### Ciclo de Execução da Ilha
1. O transformador (`to-wire.ts`) gera um nó `WireIsland`:
   ```json
   { "t": "i", "n": "DemoCounter.js", "p": { "start": 20, "step": 5 } }
   ```
2. O renderizador Preact cria um elemento HTML estático marcador:
   ```html
   <div data-island="DemoCounter.js" data-props='{"start":20,"step":5}'></div>
   ```
3. A rotina `hydrateIslands()` faz o `import("./islands/DemoCounter.js")` nativo no navegador e hidrata o componente sob demanda!
