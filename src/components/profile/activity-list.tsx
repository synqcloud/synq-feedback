"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import type { ActivityData } from "@/lib/actions/activity";

export type ActivityTab = "posts" | "comments" | "votes";

export function ActivityList({
  tab,
  data,
  onNavigate,
}: {
  tab: ActivityTab;
  data: ActivityData | null;
  onNavigate: () => void;
}) {
  if (!data) return null;

  if (tab === "posts") {
    if (data.posts.length === 0) return <EmptyState />;
    return (
      <ul className="flex flex-col gap-1">
        {data.posts.map((post) => (
          <ActivityRow
            key={post.id}
            href={`/suggestions/${post.id}`}
            title={post.title}
            createdAt={post.created_at}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    );
  }

  if (tab === "comments") {
    if (data.comments.length === 0) return <EmptyState />;
    return (
      <ul className="flex flex-col gap-1">
        {data.comments.map((comment) => (
          <ActivityRow
            key={comment.id}
            href={`/suggestions/${comment.suggestion_id}`}
            title={comment.suggestion_title}
            subtitle={comment.body}
            createdAt={comment.created_at}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    );
  }

  if (data.votes.length === 0) return <EmptyState />;
  return (
    <ul className="flex flex-col gap-1">
      {data.votes.map((vote) => (
        <ActivityRow
          key={vote.suggestion_id}
          href={`/suggestions/${vote.suggestion_id}`}
          title={vote.title}
          createdAt={vote.created_at}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}

function ActivityRow({
  href,
  title,
  subtitle,
  createdAt,
  onNavigate,
}: {
  href: string;
  title: string;
  subtitle?: string;
  createdAt: string;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className="block rounded-md px-2 py-2 transition-colors hover:bg-surface-hover"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-medium text-fg">{title}</span>
          <span className="shrink-0 text-xs text-fg-subtle">
            {formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
        {subtitle && <p className="mt-0.5 truncate text-xs text-fg-muted">{subtitle}</p>}
      </Link>
    </li>
  );
}

function EmptyState() {
  return <p className="py-10 text-center text-sm text-fg-muted">Nothing found.</p>;
}
