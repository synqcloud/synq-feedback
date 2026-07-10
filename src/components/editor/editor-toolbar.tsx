"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg",
        active && "bg-accent-soft text-accent",
      )}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  editor,
  onUploadImage,
}: {
  editor: Editor;
  onUploadImage: (file: File) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-0.5 border-b border-border px-1.5 py-1">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Link URL", previousUrl ?? "");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        <LinkIcon size={15} />
      </ToolbarButton>
      <ToolbarButton label="Image" onClick={() => fileInputRef.current?.click()}>
        <ImageIcon size={15} />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUploadImage(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
