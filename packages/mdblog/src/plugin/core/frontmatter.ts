export interface ParsedFrontmatter {
  frontmatter: Record<string, any>;
  body: string;
}

/**
 * Lightweight, zero-dependency YAML frontmatter parser.
 * Handles scalars, string values, booleans, arrays (lists), and nested arrays of objects.
 */
function parseYAML(yamlStr: string): Record<string, any> {
  const result: Record<string, any> = {};
  if (!yamlStr || !yamlStr.trim()) return result;

  const lines = yamlStr.split(/\r?\n/);
  let currentKey: string | null = null;
  let currentList: any[] | null = null;
  let currentItem: Record<string, any> | null = null;

  for (const rawLine of lines) {
    const line = rawLine;
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#")) continue;

    // List item: "  - path: 'val'" or "  - 'val'"
    const listItemMatch = line.match(/^(\s*)-\s+(.*)$/);
    if (listItemMatch && listItemMatch[2] !== undefined && currentKey) {
      if (!currentList) {
        currentList = [];
        result[currentKey] = currentList;
      }
      const rest = listItemMatch[2].trim();
      const propMatch = rest.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (propMatch && propMatch[1] && propMatch[2] !== undefined) {
        currentItem = {};
        currentList.push(currentItem);
        const k = propMatch[1];
        const val = propMatch[2].trim().replace(/^["'`]|["'`]$/g, "");
        currentItem[k] = val;
      } else {
        const val = rest.replace(/^["'`]|["'`]$/g, "");
        currentList.push(val);
        currentItem = null;
      }
      continue;
    }

    // Indented sub-property of current list item: "    title: 'val'"
    const subPropMatch = line.match(/^\s{2,}([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (subPropMatch && subPropMatch[1] && subPropMatch[2] !== undefined && currentItem) {
      const k = subPropMatch[1];
      const val = subPropMatch[2].trim().replace(/^["'`]|["'`]$/g, "");
      currentItem[k] = val;
      continue;
    }

    // Top-level key: "key: value" or "key:"
    const topKeyMatch = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (topKeyMatch && topKeyMatch[1] && topKeyMatch[2] !== undefined) {
      const k = topKeyMatch[1];
      const valStr = topKeyMatch[2].trim();
      currentKey = k;
      currentList = null;
      currentItem = null;

      if (!valStr) {
        result[k] = null;
      } else if (valStr.startsWith("[") && valStr.endsWith("]")) {
        try {
          result[k] = JSON.parse(valStr);
        } catch {
          result[k] = valStr.slice(1, -1).split(",").map((s) => s.trim().replace(/^["'`]|["'`]$/g, ""));
        }
      } else {
        let val: any = valStr.replace(/^["'`]|["'`]$/g, "");
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(Number(val)) && val !== "") val = Number(val);
        result[k] = val;
      }
    }
  }

  return result;
}

export function parseFrontmatter(markdown: string): ParsedFrontmatter {
  if (!markdown) {
    return { frontmatter: {}, body: "" };
  }

  // Check if markdown starts with frontmatter delimiter ---
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { frontmatter: {}, body: markdown };
  }

  const frontmatterRaw = match[1] || "";
  const body = markdown.slice(match[0].length);
  const frontmatter = parseYAML(frontmatterRaw);

  return { frontmatter, body };
}
