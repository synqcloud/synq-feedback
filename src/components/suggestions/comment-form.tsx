"use client";

import * as React from "react";
import type { JSONContent } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { addComment } from "@/lib/actions/comments";

export function CommentForm({
  suggestionId,
  isSignedIn,
}: {
  suggestionId: string;
  isSignedIn: boolean;
}) {
  const [body, setBody] = React.useState<JSONContent | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resetKey, setResetKey] = React.useState(0);

  if (!isSignedIn) {
    return (
      <SignInDialog>
        <Button variant="secondary" className="w-full justify-center">
          Sign in to comment
        </Button>
      </SignInDialog>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await addComment(
      suggestionId,
      JSON.stringify(body ?? { type: "doc", content: [] }),
    );

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setBody(null);
    setResetKey((current) => current + 1);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <RichTextEditor
        key={resetKey}
        content={body}
        onChange={setBody}
        placeholder="Add a comment"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" variant="primary" size="sm" disabled={submitting} className="self-end">
        {submitting ? "Posting..." : "Comment"}
      </Button>
    </form>
  );
}
