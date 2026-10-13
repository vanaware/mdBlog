import { html, } from "htm/preact";
import type { TocHeading, } from "../utils.ts";

/**
 * @description Properties accepted by the Toc component.
 */
export interface TocProps {
  /** @description Ordered heading entries extracted from the current document. */
  headings?: TocHeading[];
  /** @description Optional callback fired after an entry is activated (used to close drawers). */
  onNavigate?: () => void;
}

/**
 * @description Table of contents list rendering anchor links that smooth-scroll to document headings without touching the hash router.
 * @param props - Toc configuration props.
 * @returns Preact VNode representing the toc navigation list, or null when empty.
 * @example
 * ```ts
 * import { Toc } from "./Toc.ts";
 * import { html } from "htm/preact";
 * const node = html`<${Toc} headings=${[{ id: "intro", text: "Intro", depth: 2 }]} />`;
 * ```
 */
export function Toc({ headings = [], onNavigate, }: TocProps = {},): unknown {
  if (!headings.length) return null;

  function scrollTo(id: string,) {
    return (e: Event,): void => {
      e.preventDefault();
      if (typeof document !== "undefined") {
        document.getElementById(id,)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        },);
      }
      onNavigate?.();
    };
  }

  return html`
    <nav class="vertical margin-top-small" aria-label="Sumário">
      ${headings.map((heading,) =>
        html`
          <a
            key=${heading.id}
            href="#${heading.id}"
            onClick=${scrollTo(heading.id,)}
            class=${`wave round tiny-padding small-text surface-variant-text truncate no-margin ${
              heading.depth >= 3 ? "left-margin" : ""
            }`}
            title=${heading.text}
          >
            ${heading.text}
          </a>
        `
      )}
    </nav>
  `;
}
