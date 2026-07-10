"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { Pencil } from "lucide-react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { updateSuggestion } from "@/lib/actions/suggestions";

export function SuggestionBody({
  suggestionId,
  title,
  body,
  canEdit,
  children,
}: {
  suggestionId: string;
  title: string;
  body: JSONContent;
  canEdit: boolean;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState(title);
  const [draftBody, setDraftBody] = React.useState<JSONContent | null>(body);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!editing) {
    return (
      <div className="group/title">
        <div className="flex items-start gap-2">
          <h1 className="text-2xl font-semibold text-fg">{title}</h1>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setDraftTitle(title);
                setDraftBody(body);
                setError(null);
                setEditing(true);
              }}
              aria-label="Edit post"
              className="mt-1.5 shrink-0 rounded-md p-1 text-fg-subtle opacity-0 transition-opacity group-hover/title:opacity-100 hover:bg-surface-hover hover:text-fg"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
        {children}
        <RichTextEditor content={body} editable={false} size="base" className="mt-5" />
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateSuggestion(
      suggestionId,
      draftTitle,
      JSON.stringify(draftBody ?? { type: "doc", content: [] }),
    );
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={draftTitle}
        onChange={(event) => setDraftTitle(event.target.value)}
        className="w-full rounded-md border border-border bg-bg px-3 py-2 text-2xl font-semibold text-fg outline-none focus-visible:border-border-strong"
      />
      {children}
      <RichTextEditor content={draftBody} onChange={setDraftBody} size="base" />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex items-center gap-2 self-end">
        <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
