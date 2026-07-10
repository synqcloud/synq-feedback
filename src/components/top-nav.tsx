import { getCurrentProfile } from "@/lib/auth";
import { getNotifications } from "@/lib/data/notifications";
import { UserMenu } from "@/components/auth/user-menu";
import { TopNavTabs } from "@/components/top-nav-tabs";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { PageShell } from "@/components/layout/page-shell";

export async function TopNav() {
  const profile = await getCurrentProfile();
  const notifications = profile ? await getNotifications(profile.id) : [];

  return (
    <header className="sticky top-0 z-40 bg-bg">
      <PageShell className="flex items-center justify-between">
        <TopNavTabs />
        <div className="flex items-center gap-2">
          {profile && (
            <NotificationBell userId={profile.id} initialNotifications={notifications} />
          )}
          <UserMenu profile={profile} />
        </div>
      </PageShell>
    </header>
  );
}
