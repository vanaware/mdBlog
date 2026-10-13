import {
  type ComponentChildren,
  type ComponentType,
  h,
  type VNode,
} from "preact";
import { html, } from "htm/preact";
import { useSignal, } from "@preact/signals";

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
  const isSmall = clampedDepth >= 4;

  const anchor = id
    ? html`
      <a
        href="#${id}"
        class="surface-variant-text link small-text opacity-50 margin-left"
        title="Link direto para esta seção"
        aria-label="Link direto"
        onClick=${(e: Event,) => {
          // Evita que o hash da âncora acione o roteador de artigos
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

  return h(
    tag as any,
    {
      id,
      class: `wrap bold margin-top margin-bottom ${isSmall ? "small" : ""}`
        .trim(),
    },
    children,
    anchor,
  ) as VNode;
}

export interface ParagraphProps {
  children?: ComponentChildren;
}

export function Paragraph({ children, }: ParagraphProps = {},): VNode {
  return html`<p class="margin-bottom wrap">${children}</p>`;
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
      <div
        class="row items-center justify-between padding-left padding-right small-padding surface-container border-bottom">
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

export function InlineCode({ value = "", }: InlineCodeProps = {},): VNode {
  return html`<code class="surface-container-high round">${value}</code>`;
}

export interface BlockquoteProps {
  children?: ComponentChildren;
}

export function Blockquote({ children, }: BlockquoteProps = {},): VNode {
  return html`
    <blockquote
      class="surface-container-low border left-border border-primary padding round margin wrap">
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
    return html`<ol start=${start} class="padding-left margin-bottom wrap">${children}</ol>`;
  }
  return html`<ul class="padding-left margin-bottom wrap">${children}</ul>`;
}

export interface ListItemProps {
  checked?: boolean;
  children?: ComponentChildren;
}

export function ListItem({ checked, children, }: ListItemProps = {},): VNode {
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

export function Table({ children, }: TableProps = {},): VNode {
  // "stripes" pinta --active (um cinza de 19% de opacidade, definido uma única
  // vez em :root e por igual nos dois temas) nas linhas ímpares do tbody: é a
  // rasca par/ímpar pedida. "border" acrescenta o fio separador entre as linhas
  // do corpo; a do cabeçalho o BeerCSS já põe por regra própria em thead>tr>th.
  // Ambas exigem a estrutura thead/tbody que "to-wire.ts" emite. Não se põe
  // "round" na tabela: sem fundo nem caixa próprios o raio dela não se pintaria
  // (e :is(...,table,...):not(.round)) já o zera), e o canto arredondado que se
  // vê vem do "border-radius:inherit" do BeerCSS sobre o div, que com overflow
  // recorta a faixa de cabeçalho a 0.75rem, o raio do <article>.
  return html`
    <div class="responsive scroll margin">
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

/** Classes de alinhamento do BeerCSS para o alinhamento de coluna do GFM. */
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
    // O cabeçalho leva primary-container, não um tom de surface: as riscas do
    // corpo são cinza translúcido, e um cinza opaco perder-se-ia entre elas.
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
    <figure class="no-margin margin-top margin-bottom">
      <img src=${src} alt=${alt ||
        ""} title=${title} class="responsive round border" loading="lazy" />
      ${alt
        ? html`
          <figcaption
            class="small-text surface-variant-text center-align margin-top">${alt}</figcaption>
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
