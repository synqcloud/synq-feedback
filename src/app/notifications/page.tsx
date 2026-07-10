import { getCurrentProfile } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data/settings";
import { PageShell } from "@/components/layout/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import { Button } from "@/components/ui/button";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { NotificationPreferencesForm } from "@/components/auth/notification-preferences-form";

export const metadata = { title: "Notification settings" };

// The one URL emailed notifications point to ("Manage your notification
// settings") -- unlike the same form rendered inside NotificationsDialog,
// this needs its own real route so an email link has somewhere to land,
// signed in or not.
export default async function NotificationsPage() {
  const [profile, settings] = await Promise.all([getCurrentProfile(), getSiteSettings()]);

  return (
    <PageShell className="py-10">
      <div className="mx-auto max-w-[520px]">
        <ContentCard className="p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-fg">Notification settings</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Control which emails you get from {settings.name}.
          </p>

          {profile ? (
            <div className="mt-6">
              <NotificationPreferencesForm />
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-start gap-3 rounded-md border border-border bg-bg-inset p-4">
              <p className="text-sm text-fg-muted">
                Sign in to manage your notification settings.
              </p>
              <SignInDialog redirectTo="/notifications">
                <Button variant="primary" size="sm">
                  Sign in
                </Button>
              </SignInDialog>
            </div>
          )}
        </ContentCard>
      </div>
    </PageShell>
  );
}
