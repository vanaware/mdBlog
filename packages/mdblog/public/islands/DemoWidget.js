// Pure interactive HTML+ES island (runs directly in the browser, no compilation or bundling)
// Uses the utilities exported by the mdBlog bundle (no external CDN requests)
import { html as _html, signal as _signal, useSignal as _useSignal } from "../mdblog.js";

const html = _html || (typeof globalThis !== "undefined" ? globalThis.mdBlog?.html : null);
const signal = _signal || (typeof globalThis !== "undefined" ? globalThis.mdBlog?.signal : null);
const useSignal = _useSignal || (typeof globalThis !== "undefined" ? globalThis.mdBlog?.useSignal : null);

export function DemoWidget({ title = "Dynamic HTML+ES Island", step = 1 }) {
  const count = typeof useSignal === "function" ? useSignal(0) : signal(0);

  return html`
    <article class="border round padding surface-container bottom-margin">
      <div class="row wrap">
        <div class="max wrap">
          <h6 class="no-margin bold small wrap">${title}</h6>
          <p class="small-text secondary-text no-margin wrap">
            Native ES module using Preact Signals from the mdBlog bundle
          </p>
        </div>
        <div class="row">
          <button
            class="circle small surface-variant"
            onClick=${() => (count.value -= Number(step))}
            aria-label="Decrease"
          >
            <i>remove</i>
          </button>
          <span class="chip primary bold center-align">${count.value}</span>
          <button
            class="circle small primary"
            onClick=${() => (count.value += Number(step))}
            aria-label="Increase"
          >
            <i>add</i>
          </button>
        </div>
      </div>
    </article>
  `;
}

export default DemoWidget;
