"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignInDialog({
  children,
  redirectTo = "/",
}: {
  children: React.ReactNode;
  /** Where to land after the magic link is confirmed (e.g. back on the page that prompted sign-in). */
  redirectTo?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    // Just the final destination -- the magic-link email template builds the
    // actual /auth/confirm?...&next=<this> URL itself (see
    // supabase/templates/magic-link.html). Building that full URL here and
    // reusing it as the template's base broke whenever GoTrue's `.RedirectTo`
    // fell back to a bare origin (no query string to safely append `&` to).
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${redirectTo}` },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setStatus("idle");
          setEmail("");
        }
      }}
    >
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent width="sm">
        <DialogTitle>Sign in</DialogTitle>
        <DialogDescription>
          We&apos;ll email you a magic link, no password needed.
        </DialogDescription>

        {status === "sent" ? (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-accent-soft px-3 py-2.5 text-sm text-fg">
            <Mail size={16} className="shrink-0 text-accent" />
            Check <span className="font-medium">{email}</span> for your link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <input
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            />
            {status === "error" && (
              <p className="text-sm text-danger">Something went wrong. Try again.</p>
            )}
            <Button type="submit" variant="primary" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Continue with email"}
            </Button>
          </form>
        )}
      </DialogContent>
    </DialogRoot>
  );
}
