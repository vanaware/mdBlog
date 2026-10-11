---
title: "⚙️ Wire AST Spec"
icon: "schema"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "wire-format"
  - "ast"
  - "json"
description: "Especificação formal do formato intermediário JSON agnóstico (Wire Format)."
location: "#/articles/ARQUITETURA_WIRE_FORMAT.md"
pages:
  - "WIRE_SCHEMA_DETALHES.md"
---

# 📐 Arquitetura do Wire Format

O **Wire Format** é a representação intermediária (IR) entre o analisador Markdown e o renderizador de interface, garantindo desacoplamento, segurança e alta performance no mdBlog.

---

## 🎯 Por que usar Wire Format?

Em geradores convencionais de documentação, o fluxo padrão converte Markdown em strings HTML e as injeta no DOM via `innerHTML`:

- **Vulnerabilidade a XSS:** Exige sanitizadores complexos (como DOMPurify) para tentar bloquear scripts injetados.
- **Perda de Reatividade:** Strings HTML não se conectam a componentes reativos sem scripts soltos no DOM.
- **Redundância:** HTML cru duplica atributos, classes e marcações desnecessárias.

No mdBlog, o fluxo é totalmente estruturado:

1. **Markdown** é analisado pela biblioteca `mdast` com extensões GFM.
2. A AST resultante é transformada em **Wire Format JSON puro**.
3. O cliente converte os nós Wire diretamente em **VNodes Preact tipados**.

Como nenhum HTML cru é gerado ou aceito, a aplicação é imune a ataques de XSS por arquitetura.

---

## 🧩 Tipagem Formal dos Nós (TypeScript)

```typescript
export type Wire =
  | string
  | number
  | boolean
  | null
  | Wire[]
  | WireElement      // Elementos HTML intrínsecos (strong, em, hr...)
  | WireComponent    // Componentes de bloco (Heading, CodeBlock, Table...)
  | WireIsland       // Ilhas reativas ([data-island])
  | WireFragment;    // Fragmentos agrupadores

export interface WireElement {
  t: "e";
  n: string;
  p?: Record<string, unknown>;
  c?: Wire[];
}

export interface WireComponent {
  t: "c";
  n: string;
  p?: Record<string, unknown>;
  c?: Wire[];
}

export interface WireIsland {
  t: "i";
  n: string;
  p?: Record<string, unknown>;
  c?: Wire[];
}
```

---

## 🛡️ Propriedades Higienizadas (Prop Sanitization)

Todas as propriedades de nós no Wire Format passam por uma função de higienização que:
- Remove funções e referências a objetos não serializáveis.
- Garante conformidade total com o formato JSON.
- Permite que a árvore seja armazenada com segurança no `CacheStorage` do Service Worker ou no IndexedDB do navegador.

---

## 📖 Sub-páginas

- **[📐 Schema & Nós do AST](./WIRE_SCHEMA_DETALHES.md)**: Detalhamento específico da hierarquia e especificações de cada tipo de nó.
