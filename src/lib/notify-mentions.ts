import "server-only";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { renderEmailShell, escapeHtml } from "@/lib/email-template";

type MentionNode = {
  type?: string;
  attrs?: { kind?: string; id?: string };
  content?: MentionNode[];
};

function collectMentionedUserIds(node: MentionNode, ids: Set<string>) {
  if (node.type === "mention" && node.attrs?.kind === "user" && node.attrs.id) {
    ids.add(node.attrs.id);
  }
  node.content?.forEach((child) => collectMentionedUserIds(child, ids));
}

function getMentionedUserIds(body: unknown, excludeUserId: string): string[] {
  const ids = new Set<string>();
  collectMentionedUserIds(body as MentionNode, ids);
  ids.delete(excludeUserId);
  return [...ids];
}

// Emails mentioned users, honoring each recipient's own `email_on_mention`
// preference. The in-app bell notification (unaffected by that preference)
// is created separately by the `notify_mentioned_users_*` DB triggers.
export async function emailMentionedUsers({
  body,
  actorId,
  actorName,
  suggestionId,
  contextLabel,
  preview,
}: {
  body: unknown;
  actorId: string;
  actorName: string;
  suggestionId: string;
  contextLabel: string;
  preview: string;
}) {
  const mentionedIds = getMentionedUserIds(body, actorId);
  if (mentionedIds.length === 0) return;

  const supabase = await createClient();
  const [{ data: mentioned }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("email, email_on_mention").in("id", mentionedIds),
    supabase.from("site_settings").select("name").eq("id", 1).single(),
  ]);

  const recipients = (mentioned ?? [])
    .filter((profile) => profile.email_on_mention && profile.email)
    .map((profile) => profile.email);
  if (recipients.length === 0) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const siteName = settings?.name ?? "Feedback";
  const ctaUrl = `${siteUrl}/suggestions/${suggestionId}`;
  const subject = `${actorName} mentioned you in "${contextLabel}"`;
  const bodyHtml = `<p style="margin:0 0 10px 0;"><strong>${escapeHtml(actorName)}</strong> mentioned you in <strong>${escapeHtml(contextLabel)}</strong>:</p><p style="margin:0;padding:12px 14px;background-color:#f6f7f8;border-radius:8px;color:#33353b;">${escapeHtml(preview)}</p>`;
  const html = renderEmailShell({
    siteName,
    siteUrl,
    preheader: `${actorName} mentioned you`,
    bodyHtml,
    ctaText: "View suggestion",
    ctaUrl,
  });

  await Promise.all(recipients.map((email) => sendEmail({ to: email, subject, html })));
}
