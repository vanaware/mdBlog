---
title: "⚡ Desenvolvimento em HTML+ES (.js)"
icon: "code"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "htm/preact"
  - "zero-bundle"
  - "es-modules"
  - "islands"
description: "Guia prático de desenvolvimento com HTML+ES (.js), Preact Signals e criação de ilhas nativas no navegador."
location: "#/articles/PLANO_MIGRACAO_HTML_ES.md"
---

# ⚡ Desenvolvimento em HTML+ES (.js)

O padrão **HTML+ES** combina o poder de **`htm/preact`** com módulos padrão do JavaScript (**ES Modules** em arquivos **`.js`**). Isso permite criar componentes de interface e ilhas dinâmicas executados diretamente no navegador moderno sem nenhuma etapa de compilação ou transpilador em tempo de execução.

---

## 🎯 Por que HTML+ES?

1. **JavaScript Padrão e Válido:**
   Utiliza *Tagged Template Literals* nativas (`html\`<article>...\`\``). Não requer compiladores de JSX nem Babel.

2. **Extensão Canônica `.js`:**
   Arquivos `.js` são importados nativamente pelo navegador via `<script type="module">` ou `import()`.

3. **Reatividade Leve:**
   Usa `@preact/signals` para reatividade pontual e de alta performance, atualizando apenas os nós DOM necessários.

4. **Zero Compilação Prévia para Novas Ilhas:**
   Basta criar um arquivo `.js` na pasta `public/islands/` e chamá-lo no Markdown. O navegador o carrega sob demanda.

---

## 🛠 Como Criar uma Nova Ilha em 3 Passos

### Passo 1: Crie o arquivo em `public/islands/`

Crie um novo arquivo JavaScript, por exemplo `public/islands/TimerWidget.js`:

```javascript
import { html as _html, signal as _signal, useSignal as _useSignal } from "../mdblog.js";

const html = _html || globalThis.mdBlog?.html;
const signal = _signal || globalThis.mdBlog?.signal;
const useSignal = _useSignal || globalThis.mdBlog?.useSignal;

export function TimerWidget({ initialSeconds = 0, label = "Cronômetro" }) {
  const seconds = typeof useSignal === "function"
    ? useSignal(Number(initialSeconds))
    : signal(Number(initialSeconds));

  return html`
    <article class="border round medium-padding surface-container-low margin">
      <div class="row items-center justify-between gap">
        <div>
          <h6 class="no-margin bold">${label}</h6>
          <p class="small-text surface-variant-text no-margin">
            Tempo: ${seconds.value}s
          </p>
        </div>
        <div class="row items-center gap">
          <button
            class="circle small primary"
            onClick=${() => seconds.value++}
            aria-label="Incrementar tempo"
          >
            <i>add</i>
          </button>
          <button
            class="circle small transparent"
            onClick=${() => (seconds.value = Number(initialSeconds))}
            aria-label="Zerar tempo"
          >
            <i>restart_alt</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default TimerWidget;
```

### Passo 2: Use no Markdown

Você pode invocar sua ilha com a sintaxe de diretiva:

```markdown
::TimerWidget.js{initialSeconds: 0, label: "Temporizador de Testes"}
```

Ou usando o bloco de código tipado:

````markdown
```island:TimerWidget.js
{
  "initialSeconds": 60,
  "label": "Contagem Regressiva"
}
```
````

### Passo 3: Visualização Automática

O mdBlog detecta a presença da ilha no documento, reserva o espaço no Wire Format e o hidrata de forma isolada, sem afetar o restante da página estática.
