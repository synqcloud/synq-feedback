import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// `next` is attacker-controlled input (this route reads it straight off its
// own incoming request, independent of whatever GoTrue's redirect_to
// allow-list validated when the original email link was generated -- anyone
// with *any* valid token_hash, e.g. for a throwaway email they signed up
// themselves, can hand-craft a confirm URL with an arbitrary `next` value).
// Passing it to redirect() unchecked is an open redirect: a real, trusted
// sign-in link on this domain that silently bounces the user to an
// arbitrary external site right after real authentication -- a much more
// convincing phishing vector than a bare external link. Only ever redirect
// to a same-origin destination.
// Accepts either origin: request.url's reported origin can legitimately
// differ from the configured site URL in local dev (e.g. Next.js normalizes
// the incoming request's host to "localhost" even when the browser actually
// connected via "127.0.0.1"), and we'd rather trust our own configured
// NEXT_PUBLIC_SITE_URL than derive a security check purely from
// request-supplied data anyway. Neither allows an arbitrary third-party
// origin through.
function safeNextPath(next: string, allowedOrigins: string[]): string {
  if (next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
    return next;
  }
  for (const origin of allowedOrigins) {
    try {
      const url = new URL(next, origin);
      if (url.origin === origin) {
        return `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      // try the next allowed origin
    }
  }
  return "/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const allowedOrigins = [origin, ...(process.env.NEXT_PUBLIC_SITE_URL ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).origin] : [])];
  const next = safeNextPath(searchParams.get("next") ?? "/", allowedOrigins);

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      redirect(next);
    }
  }

  redirect("/?auth_error=1");
}
