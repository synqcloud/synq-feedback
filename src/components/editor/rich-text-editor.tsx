"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Eye, Pencil } from "lucide-react";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { MentionNode } from "@/components/editor/mention-extension";
import { ImageNode } from "@/components/editor/image-node";
import { useOpenUserProfile } from "@/components/profile/user-profile-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const PROSE_CLASSES =
  "prose-content text-sm leading-relaxed text-fg outline-none [&_a]:text-accent [&_a]:underline [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5";

type MentionAttrs = { kind: string; id: string; label: string; avatarUrl: string | null };

export function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Write something...",
  className,
  size = "sm",
}: {
  content?: JSONContent | string | null;
  onChange?: (json: JSONContent) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  size?: "sm" | "base";
}) {
  const router = useRouter();
  const openUserProfile = useOpenUserProfile();
  const [previewing, setPreviewing] = React.useState(false);
  const isEditingNow = editable && !previewing;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        link: { openOnClick: !editable, autolink: true },
      }),
      ImageNode,
      Placeholder.configure({ placeholder }),
      MentionNode,
    ],
    content: content ?? "",
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange?.(editor.getJSON()),
    editorProps: {
      attributes: {
        class: cn(PROSE_CLASSES, size === "base" && "text-base leading-7", editable && "min-h-24"),
      },
      // Only in read-only display (comments, posted suggestion bodies) --
      // while composing, clicking a mention should just move the cursor.
      handleClickOn: (_view, _pos, node) => {
        if (editable || node.type.name !== "mention") return false;
        const attrs = node.attrs as MentionAttrs;
        if (attrs.kind === "suggestion") {
          router.push(`/suggestions/${attrs.id}`);
        } else {
          openUserProfile({ id: attrs.id, display_name: attrs.label, avatar_url: attrs.avatarUrl });
        }
        return true;
      },
    },
  });

  React.useEffect(() => {
    editor?.setEditable(isEditingNow);
  }, [editor, isEditingNow]);

  async function uploadImage(file: File) {
    if (!editor) return;
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("suggestion-images").upload(path, file);
    if (error) return;
    const { data } = supabase.storage.from("suggestion-images").getPublicUrl(path);
    editor.chain().focus().setImage({ src: data.publicUrl }).run();
  }

  if (!editable) {
    return <EditorContent editor={editor} className={className} />;
  }

  return (
    <div
      className={cn(
        "group relative rounded-md border border-border bg-bg focus-within:border-border-strong",
        className,
      )}
    >
      {editor && !previewing && <EditorToolbar editor={editor} onUploadImage={uploadImage} />}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
      {editor && (
        <button
          type="button"
          onClick={() => setPreviewing((current) => !current)}
          aria-label={previewing ? "Back to editing" : "Preview"}
          className="absolute right-2 bottom-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-bg text-fg-subtle opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 hover:bg-surface-hover hover:text-fg focus-visible:opacity-100"
        >
          {previewing ? <Pencil size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
}
