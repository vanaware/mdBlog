---
title: "🔄 Fluxos e Ciclo de Vida"
icon: "sync"
date: "2026-10-09"
author: "SyntaxMesh Team"
tags:
  - "pwa"
  - "service-worker"
  - "cache"
  - "spa"
description: "Ciclo de vida, first paint com shell e navegação client-side SPA no mdBlog."
location: "#/articles/FLUXOS_E_CICLO_DE_VIDA.md"
---

# 🔄 Fluxos de Navegação e Ciclo de Vida

Este documento detalha o comportamento do mdBlog durante os diferentes momentos de execução: primeira carga no navegador, navegação interna via SPA, operação offline e fallback resiliente.

---

## ⚡ Fluxo 1: Navegação Direta e First Paint

Ocorre quando o usuário acessa diretamente uma URL no navegador ou recarrega a página (F5):

1. **Interceptação no Service Worker:** O Service Worker intercepta a requisição com cabeçalho `Accept: text/html`.
2. **Consulta ao CacheStorage:** Verifica se o documento já existe em `md-wire-v1`. Em caso de cache válido, utiliza a AST prévia.
3. **Transformação em Background:** Se o cache não existir ou estiver expirado, busca o `.md` cru, gera a árvore Wire Format e armazena em cache.
4. **HTML Shell Completo:** O Service Worker responde com um HTML contendo BeerCSS e a árvore Wire embutida em `<script id="__md_wire">`.
5. **Renderização Imediata:** O bundle cliente consome a tag inline, monta os VNodes Preact instantaneamente e aciona a hidratação de ilhas sem requisições adicionais de rede.

---

## 🚀 Fluxo 2: Navegação SPA (Transição entre Artigos)

Ocorre quando o usuário clica em links internos ou quando a rota hash é modificada:

1. **Disparo do Roteador:** O clique atualiza o sinal reativo `currentPath.value`.
2. **Requisição de Dados:** O leitor envia uma requisição solicitando `Accept: application/json`.
3. **Resposta Otimizada:** O Service Worker (ou o fallback local) entrega apenas a árvore JSON `WireDoc` do artigo de destino.
4. **Reconciliação no DOM:** O Preact atualiza o leitor suavemente, sem piscar a tela ou recarregar a página inteira.
5. **Hidratação de Novas Ilhas:** Apenas os elementos `[data-island]` recém-criados são ativados.

---

## 🛡️ Fluxo 3: Fallback Sem Service Worker (Client-Side Puro)

Ocorre em ambientes restritos, navegação privada ou antes da ativação do Service Worker:

1. **Detecção Automática:** A função `isSWControlling()` identifica que não há Service Worker ativo.
2. **Ativação do Pipeline Local:** O adaptador client-side executa o mesmo pipeline de parsing diretamente na thread do navegador.
3. **Persistência em Cache:** A árvore processada é gravada no CacheStorage e IndexedDB para disponibilidade posterior.
4. **Experiência Idêntica:** Para o usuário final, a navegação funciona de maneira transparente e sem degradação visual.

---

## 💾 Estratégia de Cache e Armazenamento Offline

- **CacheStorage (`md-wire-v1`):** Armazena os documentos processados com TTL configurável (padrão de 60 segundos).
- **IndexedDB (`idb-keyval`):** Garante persistência durável dos artigos mesmo se os dados temporários de cache forem reciclados.
- **Prevenção de Loops:** Requisições internas de arquivos `.md` utilizam parâmetros de controle para evitar re-interceptações circulares no Service Worker.
