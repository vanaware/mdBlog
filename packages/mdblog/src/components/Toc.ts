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
    <!-- A plain .vertical box, not a nav: BeerCSS gives every nav
        display:flex with align-items:center, so entries inside nav.vertical
        shrink-wrap to their text and float in the middle of the column instead
        of filling it. The accessible name already comes from the aside or the
        dialog this list lives in. -->
    <div class="vertical">
      ${headings.map((heading,) =>
        html`
          <a
            key=${heading.id}
            href="#${heading.id}"
            onClick=${scrollTo(heading.id,)}
            class="row no-space wave round tiny-padding small-text secondary-text no-margin"
            title=${heading.text}
          >
            <!-- The indent is padding on the label, not a margin on the entry:
                .vertical zeroes the inline margins of its children, so a
                left-margin class would silently do nothing here. -->
            <span
              class=${`max truncate ${
                heading.depth >= 3 ? "left-padding small-padding" : ""
              }`}
            >
              ${heading.text}
            </span>
          </a>
        `
      )}
    </div>
  `;
}
