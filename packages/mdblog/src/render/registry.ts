import {
  type ComponentChildren,
  type ComponentType,
  h,
  type VNode,
} from "preact";
import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";
import { isWideScreen, } from "../state.ts";

export interface HeadingProps {
  depth?: number | string;
  id?: string;
  children?: ComponentChildren;
}

export function Heading(
  { depth = 1, id, children, }: HeadingProps = {},
): VNode {
  const headingTags = ["h4", "h5", "h6", "h6", "h6", "h6",];
  const clampedDepth = Math.min(Math.max(Number(depth,) || 1, 1,), 6,);
  const tag = headingTags[clampedDepth - 1] ?? "h6";
  // BeerCSS sets the heading scale one level above what a phone can carry (an
  // `h4` is 2rem, 32px, and wraps a short title over three lines), but it also
  // ships a `.small` variant for every level: h4 1.5rem, h5 1.25rem, h6 1rem.
  // Narrow screens therefore take the small variant of their own level instead
  // of only the two deepest ones, which keeps the ladder even — 28px for the
  // document title, 24 for a section, 20 for a sub-section, 16 below that —
  // rather than a huge title over titles smaller than the body text.
  const isSmall = clampedDepth >= 4 || !isWideScreen.value;

  const anchor = id
    ? html`
      <a
        href="#${id}"
        class="secondary-text link small-text medium-opacity left-margin small-margin"
        title="Direct link to this section"
        aria-label="Direct link"
        onClick=${(e: Event,) => {
          // Keeps the anchor hash from driving the article router
          e.preventDefault();
          if (typeof document !== "undefined") {
            document.getElementById(id,)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            },);
          }
        }}
      >
        <i>link</i>
      </a>
    `
    : null;

  // Every margin class of an element reads one and the same custom property, so
  // a heading can only be spaced symmetrically: .large-margin sets the value both
  // .top-margin and .bottom-margin read. Adjacent block margins then collapse,
  // which is what keeps the rhythm at 1.5rem instead of 3rem.
  return h(
    tag as any,
    {
      id,
      class: `wrap bold top-margin bottom-margin large-margin ${
        isSmall ? "small" : ""
      }`.trim(),
    },
    children,
    anchor,
  ) as VNode;
}

export interface ParagraphProps {
  children?: ComponentChildren;
}

export function Paragraph({ children, }: ParagraphProps = {},): VNode {
  return html`<p class="bottom-margin large-margin wrap">${children}</p>`;
}

export interface CodeBlockProps {
  lang?: string;
  value?: string;
}

export function CodeBlock({ lang, value = "", }: CodeBlockProps = {},): VNode {
  const copied = useSignal(false,);

  async function handleCopy(): Promise<void> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value,);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000,);
      }
    } catch {
      // Ignore copy error
    }
  }

  return html`
    <article class="no-padding surface-container-highest border round margin">
      <!-- The card's head: language chip on the left, copy button on the right.
          BeerCSS has no justify-between, so a .max spacer does the pushing. The
          strip is padded with the two directional classes rather than a size
          class: a size class would pad it on all four sides and open a gap
          between the strip and the rounded edge of the card it sits in. -->
      <div
        class="row left-padding right-padding small-padding surface-container">
        <span class="chip small primary-container bold">
          ${lang || "text"}
        </span>
        <div class="max"></div>
        <button
          class="circle small transparent"
          onClick=${handleCopy}
          title="Copy code"
          aria-label="Copy code"
        >
          <i>${copied.value ? "check" : "content_copy"}</i>
        </button>
      </div>
      <!-- The <pre> keeps its own 1rem of padding: it is what holds the code off
          the card's border, so the wrapper adds none of its own. -->
      <div class="scroll">
        <pre class="no-margin"><code class="small-text">${value}</code></pre>
      </div>
    </article>
  `;
}

export interface InlineCodeProps {
  value?: string;
}

export function InlineCode({ value = "", }: InlineCodeProps = {},): VNode {
  return html`<code class="surface-container-high round">${value}</code>`;
}

export interface BlockquoteProps {
  children?: ComponentChildren;
}

export function Blockquote({ children, }: BlockquoteProps = {},): VNode {
  // BeerCSS already styles the element: blockquote{padding:1rem;
  // border-inline-start:.25rem solid var(--primary)} — the left accent is part of
  // the tag, which is why no "left-border"/"border-primary" class is added here
  // (neither exists). Only the card outline, the corner radius and the outer
  // spacing come from the classes.
  return html`
    <blockquote class="border round margin wrap">
      ${children}
    </blockquote>
  `;
}

export interface ListProps {
  ordered?: boolean;
  start?: number;
  children?: ComponentChildren;
}

export function List({ ordered, start, children, }: ListProps = {},): VNode {
  if (ordered) {
    return html`
      <ol
        start=${start}
        class="left-padding bottom-margin large-margin wrap"
      >${children}</ol>
    `;
  }
  return html`
    <ul class="left-padding bottom-margin large-margin wrap">${children}</ul>
  `;
}

export interface ListItemProps {
  checked?: boolean;
  children?: ComponentChildren;
}

export function ListItem({ checked, children, }: ListItemProps = {},): VNode {
  if (typeof checked === "boolean") {
    return html`
      <li class="row wrap bottom-margin">
        <label class="checkbox">
          <input type="checkbox" checked=${checked} disabled />
          <span></span>
        </label>
        <div class="max wrap">${children}</div>
      </li>
    `;
  }
  return html`<li class="bottom-margin wrap">${children}</li>`;
}

export interface TableProps {
  children?: ComponentChildren;
}

export function Table({ children, }: TableProps = {},): VNode {
  // "stripes" paints --active (a gray at 19% opacity, declared once in :root
  // and identical in both themes) on the odd rows of the tbody: that is the
  // requested even/odd banding. "border" adds the hairline between the body
  // rows; the one under the header, BeerCSS already applies through its own
  // thead>tr>th rule. Both need the thead/tbody structure that "to-wire.ts"
  // emits. No "round" on the table: with no background or box of its own its
  // radius would not paint anyway (and :is(...,table,...):not(.round) zeroes
  // it), while the rounded corners one does see come from BeerCSS's
  // "border-radius:inherit" on the wrapper div, whose overflow clips the
  // header band down to 0.75rem, the <article>'s own radius.
  return html`
    <div class="responsive scroll vertical-margin large-margin">
      <table class="border stripes">${children}</table>
    </div>
  `;
}

export interface TableRowProps {
  children?: ComponentChildren;
}

export function TableRow({ children, }: TableRowProps = {},): VNode {
  return html`<tr>${children}</tr>`;
}

export interface TableCellProps {
  align?: string;
  /** @description Marks the first row cells as column headers (<th>). */
  header?: boolean;
  children?: ComponentChildren;
}

/** @description BeerCSS alignment classes for the GFM per-column alignment. */
const CELL_ALIGN_CLASS: Record<string, string> = {
  left: "left-align",
  center: "center-align",
  right: "right-align",
};

export function TableCell({
  align,
  header,
  children,
}: TableCellProps = {},): VNode {
  const cellClass = [
    // The header gets primary-container rather than a surface tone: the body
    // bands are translucent gray, and an opaque gray would vanish among them.
    header ? "primary-container" : "",
    align ? CELL_ALIGN_CLASS[align] ?? "" : "",
  ].filter(Boolean,).join(" ",);

  if (header) {
    return html`<th class=${cellClass} scope="col">${children}</th>`;
  }
  return html`<td class=${cellClass || undefined}>${children}</td>`;
}

export interface LinkProps {
  href?: string;
  title?: string;
  children?: ComponentChildren;
}

export function Link({ href = "", title, children, }: LinkProps = {},): VNode {
  let targetHref = href;
  const isExternal = href.startsWith("http://",) ||
    href.startsWith("https://",) || href.startsWith("//",);

  if (!isExternal) {
    if (href.endsWith(".md",) || href.includes(".md#",)) {
      const cleanHref = href.startsWith("./",) ? href.slice(2,) : href;
      const fullPath = cleanHref.startsWith("/",)
        ? cleanHref
        : `/docs/${cleanHref}`;
      targetHref = `#${fullPath}`;
    }
  }

  return html`
    <a
      href=${targetHref}
      title=${title}
      class="link primary-text bold wrap"
      target=${isExternal ? "_blank" : undefined}
      rel=${isExternal ? "noopener noreferrer" : undefined}
    >
      ${children}
    </a>
  `;
}

export interface ImageProps {
  src?: string;
  alt?: string;
  title?: string;
}

export function Image({ src, alt, title, }: ImageProps = {},): VNode {
  return html`
    <!-- no-margin is not decoration: it cancels the user-agent figure margin
        (one em vertically, 40px inline), which would otherwise inset the image
        far more than the prose. The space around the figure then comes from the
        paragraphs before and after it, exactly as it does for every other block. -->
    <figure class="no-margin">
      <img src=${src} alt=${alt ||
        ""} title=${title} class="responsive round border" loading="lazy" />
      ${alt
        ? html`
          <figcaption
            class="small-text secondary-text center-align top-margin tiny-margin">
            ${alt}
          </figcaption>
        `
        : null}
    </figure>
  `;
}

export interface UnknownProps {
  nodeType?: string;
}

export function Unknown({ nodeType, }: UnknownProps = {},): VNode {
  return html`
    <span class="chip error-container small" title=${`Unknown node type: ${nodeType}`}>
      [${nodeType ?? "Unknown"}]
    </span>
  `;
}

/**
 * @description Default map of standard Markdown and GFM components used by mdBlog.
 */
export const defaultRegistry: Record<string, unknown> = {
  Heading,
  Paragraph,
  CodeBlock,
  InlineCode,
  Blockquote,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  Link,
  Image,
  Unknown,
};
