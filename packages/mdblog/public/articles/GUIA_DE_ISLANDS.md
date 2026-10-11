---
title: "🏝️ Guia de Islands"
icon: "widgets"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "islands"
  - "preact"
  - "signals"
  - "hidratação"
description: "Guia completo sobre a arquitetura de ilhas interativas no mdBlog com HTML+ES e Preact Signals."
location: "#/articles/GUIA_DE_ISLANDS.md"
---

# 🏝 Guia de Islands no mdBlog

O modelo de **Islands** (Ilhas de Interatividade) no mdBlog permite incluir componentes reativos e dinâmicos dentro de documentos Markdown essencialmente estáticos, sem sobrecarregar a página com JavaScript desnecessário.

---

## 🎯 Princípios Fundamentais

1. **Hidratação Seletiva e Idempotente:**
   Apenas os elementos marcados com `[data-island]` são hidratados. O restante do conteúdo (títulos, parágrafos, listas) permanece puramente estático.

2. **Zero Compilação Prévia:**
   Ilhas residem como arquivos `.js` comuns em `public/islands/` e são carregadas sob demanda pelo navegador via `import()` assíncrono nativo.

3. **Wire Format Agóstico e Seguro:**
   No AST, uma ilha é representada apenas por metadados JSON seguros: `{ t: "i", n: "Counter.js", p: { start: 10 } }`. Nenhuma closure ou função é transportada pelo pipeline.

4. **Isolamento de Estado:**
   Cada instância de ilha opera de maneira autônoma com seus próprios `@preact/signals`.

---

## 💻 Sintaxes Suportadas no Markdown

### 1. Sintaxe de Diretiva

Ideal para componentes simples e valores literais na mesma linha:

```markdown
::Counter.js{start: 25, step: 5, label: "Meu Contador"}
```

### 2. Sintaxe de Bloco de Código

Ideal para passar objetos com múltiplas propriedades ou dados JSON estruturados:

````markdown
```island:Counter.js
{
  "start": 50,
  "step": 10,
  "label": "Contador em Lote"
}
```
````

---

## 🔬 Como Funciona o Ciclo de Hidratação

1. **Geração dos Marcadores no DOM:**
   Quando `wireToVNode()` processa um nó de ilha (`t: "i"`), ele gera um contêiner com atributos de dados:
   ```html
   <div data-island="Counter.js" data-props='{"start": 10, "step": 1}'></div>
   ```

2. **Varredura pelo `hydrateIslands()`:**
   Após a renderização do leitor, a função `hydrateIslands()` localiza todos os elementos `[data-island]` que ainda não foram inicializados.

3. **Importação Dinâmica:**
   O navegador importa o módulo `./islands/Counter.js` sob demanda e monta o componente Preact diretamente no contêiner com as propriedades deserializadas de `data-props`.

4. **Cache em Memória:**
   Uma vez carregado, o componente é mantido no cache de ilhas em memória (`dynamicIslandsCache`), garantindo montagem instantânea em futuras navegações.
