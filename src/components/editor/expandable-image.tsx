"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { DialogRoot, DialogContent } from "@/components/ui/dialog";

const IMAGE_CLASSES = "max-h-80 max-w-full w-auto rounded-md border border-border object-contain";

// Read-only content (posted comments/suggestions) gets a capped, clickable
// thumbnail that opens a full-size lightbox -- a raw <img> in prose renders
// at native size, which turns one pasted screenshot into a mile of
// scrolling. The editable compose view keeps a plain <img> (no button
// wrapper) so ProseMirror's normal node-selection/delete click handling on
// the image isn't intercepted.
export function ExpandableImage({ node, editor }: NodeViewProps) {
  const [open, setOpen] = React.useState(false);
  const src = node.attrs.src as string;
  const alt = (node.attrs.alt as string | null) ?? "";

  if (editor.isEditable) {
    return (
      <NodeViewWrapper as="div" className="my-2">
        <img src={src} alt={alt} className={IMAGE_CLASSES} />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="div" className="my-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block cursor-pointer overflow-hidden rounded-md transition-opacity hover:opacity-90"
      >
        <img src={src} alt={alt} className={IMAGE_CLASSES} />
      </button>
      <DialogRoot open={open} onOpenChange={setOpen}>
        <DialogContent
          width="lg"
          showClose={false}
          className="w-auto max-w-[92vw] border-none bg-transparent p-0 shadow-none"
        >
          <img src={src} alt={alt} className="max-h-[85vh] w-auto rounded-lg" />
        </DialogContent>
      </DialogRoot>
    </NodeViewWrapper>
  );
}
