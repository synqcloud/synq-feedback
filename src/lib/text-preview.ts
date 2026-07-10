type NodeLike = {
  type?: string;
  text?: string;
  content?: NodeLike[];
  attrs?: { kind?: string; label?: string };
};

const BLOCK_TYPES = new Set(["paragraph", "heading", "listItem"]);

function collectText(node: NodeLike, parts: string[]) {
  if (node.type === "text" && node.text) {
    parts.push(node.text);
  }
  if (node.type === "mention" && node.attrs?.label) {
    parts.push(`${node.attrs.kind === "user" ? "@" : "#"}${node.attrs.label}`);
  }
  node.content?.forEach((child) => collectText(child, parts));
  if (node.type && BLOCK_TYPES.has(node.type)) {
    parts.push(" ");
  }
}

export function getTextPreview(body: unknown, maxLength = 160): string {
  const parts: string[] = [];
  if (body && typeof body === "object") {
    collectText(body as NodeLike, parts);
  }

  const text = parts.join("").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
