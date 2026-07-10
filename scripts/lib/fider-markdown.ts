// Converts Fider's Markdown (post descriptions, comments) into the exact
// Tiptap JSON shape this app's RichTextEditor renders. Routes through the
// same StarterKit config as the real editor (heading disabled, link
// enabled) so generated docs are guaranteed schema-compatible -- anything
// the schema doesn't support (e.g. headings) falls back gracefully instead
// of producing a doc the editor can't render.
import { JSDOM } from "jsdom";
import MarkdownIt from "markdown-it";
import { generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

const EXTENSIONS = [StarterKit.configure({ heading: false, link: { autolink: true } }), ImageExtension];

// Tiptap's generateJSON expects a DOM (it's normally browser-only); jsdom
// stands in for that in this Node script.
const dom = new JSDOM();
// generateJSON reads off the global DOM, not a param
globalThis.window = dom.window as unknown as Window & typeof globalThis;
globalThis.document = dom.window.document as unknown as Document;

const FIDER_CDN = "https://synq.fidercdn.com";

// `![](fider-image:attachments/xyz.png)` -> a resolvable CDN URL. Not
// documented anywhere; reverse-engineered by testing URL patterns against
// the tenant's actual CDN (see conversation notes).
function resolveFiderImages(markdown: string): string {
  return markdown.replace(/fider-image:([^)\s]+)/g, `${FIDER_CDN}/static/images/$1`);
}

type TiptapDoc = { type: "doc"; content: object[] };

export function fiderMarkdownToTiptapDoc(raw: string): TiptapDoc {
  const source = resolveFiderImages(raw ?? "");
  const html = md.render(source);
  const doc = generateJSON(html, EXTENSIONS) as TiptapDoc;
  if (!doc.content || doc.content.length === 0) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
  return doc;
}

// Fider's `attachments` array lists every image uploaded to a comment, but
// some of those are *also* already referenced inline in the markdown body
// (e.g. "![](fider-image:KEY)" pasted right into the text) -- appending all
// of them unconditionally double-renders those. Only append the ones that
// aren't already embedded inline.
export function appendAttachments(doc: TiptapDoc, attachmentKeys: string[], rawContent: string): TiptapDoc {
  if (!attachmentKeys || attachmentKeys.length === 0) return doc;
  const alreadyInline = attachmentKeys.filter((key) => (rawContent ?? "").includes(`fider-image:${key}`));
  const missing = attachmentKeys.filter((key) => !alreadyInline.includes(key));
  if (missing.length === 0) return doc;
  const imageNodes = missing.map((key) => ({
    type: "image",
    attrs: { src: `${FIDER_CDN}/static/images/${key}` },
  }));
  return { ...doc, content: [...doc.content, ...imageNodes] };
}
