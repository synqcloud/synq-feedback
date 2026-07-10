import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import type { JSONContent } from "@tiptap/core";
import { getCurrentProfile } from "@/lib/auth";
import { getSuggestion, getComments } from "@/lib/data/suggestions";
import { VoteButton } from "@/components/suggestions/vote-button";
import { StatusBadge } from "@/components/suggestions/status-badge";
import { StatusSelect } from "@/components/suggestions/status-select";
import { TypeBadge } from "@/components/suggestions/type-badge";
import { SubscribeToggle } from "@/components/suggestions/subscribe-toggle";
import { SuggestionBody } from "@/components/suggestions/suggestion-body";
import { CommentList } from "@/components/suggestions/comment-list";
import { CommentForm } from "@/components/suggestions/comment-form";
import { AuthorLink } from "@/components/suggestions/author-link";

export async function SuggestionDetail({
  id,
  showBackLink = true,
}: {
  id: string;
  showBackLink?: boolean;
}) {
  const profile = await getCurrentProfile();
  const suggestion = await getSuggestion(id, profile?.id ?? null);

  if (!suggestion) {
    notFound();
  }

  const comments = await getComments(id);

  return (
    <div>
      {showBackLink && (
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft size={14} />
          Back to feedback
        </Link>
      )}

      <SuggestionBody
        suggestionId={suggestion.id}
        title={suggestion.title}
        body={suggestion.body as JSONContent}
        canEdit={profile?.id === suggestion.author?.id}
      >
        <div className="mt-4 flex flex-col gap-2">
          {(profile?.is_admin || suggestion.status !== "unassigned") && (
            <div className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0 text-fg-subtle">Status</span>
              {profile?.is_admin ? (
                <StatusSelect suggestionId={suggestion.id} status={suggestion.status} />
              ) : (
                <StatusBadge status={suggestion.status} />
              )}
            </div>
          )}
          {suggestion.type && (
            <div className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0 text-fg-subtle">Type</span>
              <TypeBadge type={suggestion.type} />
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-fg-subtle">
            <span className="w-14 shrink-0">By</span>
            {suggestion.author ? (
              <AuthorLink author={suggestion.author} />
            ) : (
              <span>Anonymous</span>
            )}
            <span>
              &middot; {formatDistanceToNowStrict(new Date(suggestion.created_at), { addSuffix: true })}
              {suggestion.edited_at && " · (edited)"}
            </span>
          </div>
        </div>
      </SuggestionBody>

      <div className="mt-6 flex items-center justify-between border-y border-border py-3">
        <SubscribeToggle
          suggestionId={suggestion.id}
          isSubscribed={suggestion.is_subscribed}
          isSignedIn={Boolean(profile)}
        />
        <VoteButton
          suggestionId={suggestion.id}
          voteCount={suggestion.vote_count}
          hasVoted={suggestion.has_voted}
          isSignedIn={Boolean(profile)}
          variant="pill"
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-sm font-semibold text-fg">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h2>
        <div className="mb-5">
          <CommentList
            suggestionId={suggestion.id}
            initialComments={comments}
            currentUserId={profile?.id}
          />
        </div>
        <CommentForm suggestionId={suggestion.id} isSignedIn={Boolean(profile)} />
      </div>
    </div>
  );
}
