"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { Plus } from "lucide-react";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { createSuggestion } from "@/lib/actions/suggestions";
import type { Profile, SuggestionType } from "@/lib/types";

export function NewSuggestionButton({
  profile,
  types,
}: {
  profile: Profile | null;
  types: SuggestionType[];
}) {
  if (!profile) {
    return (
      <SignInDialog>
        <Button variant="primary" size="sm">
          <Plus size={14} />
          Suggest an idea
        </Button>
      </SignInDialog>
    );
  }

  return <NewSuggestionDialog types={types} />;
}

function NewSuggestionDialog({ types }: { types: SuggestionType[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState<JSONContent | null>(null);
  const [typeId, setTypeId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setTitle("");
    setBody(null);
    setTypeId(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createSuggestion(
      title,
      JSON.stringify(body ?? { type: "doc", content: [] }),
      typeId,
    );

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    reset();
    router.refresh();
  }

  const typeItems = [{ value: "", label: "No type" }, ...types.map((t) => ({ value: t.id, label: t.name }))];

  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="primary" size="sm">
            <Plus size={14} />
            Suggest an idea
          </Button>
        }
      />
      <DialogContent width="lg">
        <DialogTitle>Suggest an idea</DialogTitle>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            required
            autoFocus
            placeholder="Short, descriptive title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          />

          {types.length > 0 && (
            <SelectRoot
              value={typeId ?? ""}
              onValueChange={(value: string | null) => setTypeId(value || null)}
              items={typeItems}
            >
              <SelectTrigger className="w-40">
                <SelectValue>{() => typeItems.find((t) => t.value === (typeId ?? ""))?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {typeItems.map((item) => (
                  <SelectItem key={item.value || "none"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          )}

          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Add more detail. What problem does this solve?"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Posting..." : "Post suggestion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
