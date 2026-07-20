import "server-only";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { renderEmailShell } from "@/lib/email-template";

export async function notifySubscribers({
  suggestionId,
  excludeUserId,
  subject,
  preheader,
  bodyHtml,
  ctaText = "View suggestion",
}: {
  suggestionId: string;
  excludeUserId: string;
  subject: string;
  preheader: string;
  bodyHtml: string;
  ctaText?: string;
}) {
  const supabase = await createClient();
  // Read subscribers through a SECURITY DEFINER function: the request-scoped
  // client runs under the acting user's RLS context, and the subscriptions
  // SELECT policy only exposes that user's own rows -- querying the table
  // directly would return nobody else, collapsing every email to the admin
  // copy. The function bypasses that restriction (see the migration).
  const [{ data: subscribers }, { data: settings }] = await Promise.all([
    supabase.rpc("subscriber_emails", {
      p_suggestion_id: suggestionId,
      p_exclude_user_id: excludeUserId,
    }),
    supabase.from("site_settings").select("name, admin_email").eq("id", 1).single(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const siteName = settings?.name ?? "Feedback";
  const ctaUrl = `${siteUrl}/suggestions/${suggestionId}`;

  const recipients = (subscribers ?? []).map((row) => row.email);

  const html = renderEmailShell({ siteName, siteUrl, preheader, bodyHtml, ctaText, ctaUrl });

  await Promise.all(recipients.map((email) => sendEmail({ to: email, subject, html })));

  const adminEmail = settings?.admin_email;
  if (adminEmail && !recipients.includes(adminEmail)) {
    const adminHtml = renderEmailShell({
      siteName,
      siteUrl,
      preheader,
      bodyHtml: `${bodyHtml}<p style="margin:16px 0 0 0;padding-top:12px;border-top:1px solid #e6e7e9;font-size:12px;color:#9a9ea5;">You're receiving this copy as the site admin, to check outgoing notification emails.</p>`,
      ctaText,
      ctaUrl,
    });
    await sendEmail({ to: adminEmail, subject: `[Copy] ${subject}`, html: adminHtml });
  }
}
