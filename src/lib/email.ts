import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (process.env.DISABLE_EMAILS === "true") {
    console.log(`[email skipped: DISABLE_EMAILS=true] to=${to} subject="${subject}"`);
    return;
  }

  if (!resend) {
    console.log(`[email skipped: RESEND_API_KEY not set] to=${to} subject="${subject}"`);
    return;
  }

  const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  if (error) {
    console.error("Resend send failed:", error);
  }
}
