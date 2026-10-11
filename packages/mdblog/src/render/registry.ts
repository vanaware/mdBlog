import { type ComponentChildren, type ComponentType, h, type VNode } from "preact";
import { html } from "htm/preact";
import { useSignal } from "@preact/signals";

export interface HeadingProps {
  depth?: number | string;
  id?: string;
  children?: ComponentChildren;
}

export function Heading({ depth = 1, id, children }: HeadingProps = {}): VNode {
  const headingTags = ["h4", "h5", "h6", "h6", "h6", "h6"];
  const clampedDepth = Math.min(Math.max(Number(depth) || 1, 1), 6);
  const tag = headingTags[clampedDepth - 1] ?? "h6";
  const isSmall = clampedDepth >= 4;

  const anchor = id
    ? html`
      <a
        href="#${id}"
        class="surface-variant-text link small-text opacity-50 margin-left"
        title="Link direto para esta seção"
        aria-label="Link direto"
      >
        <i>link</i>
      </a>
    `
    : null;

  return h(
    tag,
    {
      id,
      class: `wrap bold margin-top margin-bottom ${isSmall ? "small" : ""}`.trim(),
    },
    children,
    anchor,
  );
}

export interface ParagraphProps {
  children?: ComponentChildren;
}

export function Paragraph({ children }: ParagraphProps = {}): VNode {
  return html`<p class="margin-bottom wrap">${children}</p>`;
}

export interface CodeBlockProps {
  lang?: string;
  value?: string;
}

export function CodeBlock({ lang, value = "" }: CodeBlockProps = {}): VNode {
  const copied = useSignal(false);

  async function handleCopy(): Promise<void> {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      }
    } catch {
      // Ignore copy error
    }
  }

  return html`
    <article class="no-padding surface-container-highest border round margin">
      <div class="row items-center justify-between padding-left padding-right small-padding surface-container border-bottom">
        <span class="chip small primary-container bold">
          ${lang || "text"}
        </span>
        <button
          class="circle small transparent"
          onClick=${handleCopy}
          title="Copiar código"
          aria-label="Copiar código"
        >
          <i>${copied.value ? "check" : "content_copy"}</i>
        </button>
      </div>
      <div class="padding scroll">
        <pre class="no-margin"><code class="small-text">${value}</code></pre>
      </div>
    </article>
  `;
}

export interface InlineCodeProps {
  value?: string;
}

export function InlineCode({ value = "" }: InlineCodeProps = {}): VNode {
  return html`<code class="surface-container-high round">${value}</code>`;
}

export interface BlockquoteProps {
  children?: ComponentChildren;
}

export function Blockquote({ children }: BlockquoteProps = {}): VNode {
  return html`
    <blockquote class="surface-container-low border left-border border-primary padding round margin wrap">
      ${children}
    </blockquote>
  `;
}

export interface ListProps {
  ordered?: boolean;
  start?: number;
  children?: ComponentChildren;
}

export function List({ ordered, start, children }: ListProps = {}): VNode {
  if (ordered) {
    return html`<ol start=${start} class="padding-left margin-bottom wrap">${children}</ol>`;
  }
  return html`<ul class="padding-left margin-bottom wrap">${children}</ul>`;
}

export interface ListItemProps {
  checked?: boolean;
  children?: ComponentChildren;
}

export function ListItem({ checked, children }: ListItemProps = {}): VNode {
  if (typeof checked === "boolean") {
    return html`
      <li class="row wrap items-center gap margin-bottom">
        <label class="checkbox">
          <input type="checkbox" checked=${checked} disabled />
          <span></span>
        </label>
        <div class="max wrap">${children}</div>
      </li>
    `;
  }
  return html`<li class="margin-bottom wrap">${children}</li>`;
}

export interface TableProps {
  children?: ComponentChildren;
}

export function Table({ children }: TableProps = {}): VNode {
  return html`
    <div class="responsive scroll margin">
      <table class="border round">${children}</table>
    </div>
  `;
}

export interface TableRowProps {
  children?: ComponentChildren;
}

export function TableRow({ children }: TableRowProps = {}): VNode {
  return html`<tr>${children}</tr>`;
}

export interface TableCellProps {
  align?: string;
  children?: ComponentChildren;
}

export function TableCell({ align, children }: TableCellProps = {}): VNode {
  return html`<td class=${align ? `align-${align}` : undefined}>${children}</td>`;
}

export interface LinkProps {
  href?: string;
  title?: string;
  children?: ComponentChildren;
}

export function Link({ href = "", title, children }: LinkProps = {}): VNode {
  let targetHref = href;
  const isExternal = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");

  if (!isExternal) {
    if (href.endsWith(".md") || href.includes(".md#")) {
      const cleanHref = href.startsWith("./") ? href.slice(2) : href;
      const fullPath = cleanHref.startsWith("/") ? cleanHref : `/docs/${cleanHref}`;
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

export function Image({ src, alt, title }: ImageProps = {}): VNode {
  return html`
    <figure class="no-margin margin-top margin-bottom">
      <img src=${src} alt=${alt || ""} title=${title} class="responsive round border" loading="lazy" />
      ${alt ? html`<figcaption class="small-text surface-variant-text center-align margin-top">${alt}</figcaption>` : null}
    </figure>
  `;
}

export interface UnknownProps {
  nodeType?: string;
}

export function Unknown({ nodeType }: UnknownProps = {}): VNode {
  return html`
    <span class="chip error-container small" title=${`Unknown node type: ${nodeType}`}>
      [${nodeType ?? "Unknown"}]
    </span>
  `;
}

export const defaultRegistry: Record<string, ComponentType<never>> = {
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
