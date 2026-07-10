import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data/settings";
import { getSuggestionTypes } from "@/lib/data/suggestions";
import { SettingsForm } from "@/components/settings/settings-form";
import { SuggestionTypesManager } from "@/components/settings/suggestion-types-manager";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/layout/page-header";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) {
    redirect("/");
  }

  const [settings, types] = await Promise.all([getSiteSettings(), getSuggestionTypes()]);

  return (
    <PageShell className="py-8">
      <div className="mx-auto max-w-[690px]">
        <PageHeader
          title="Site settings"
          description="Visible to everyone on your feedback portal."
        />
        <SettingsForm settings={settings} />

        <div className="mt-10 border-t border-border pt-8">
          <h2 className="mb-1 text-sm font-semibold text-fg">Suggestion types</h2>
          <p className="mb-4 text-sm text-fg-muted">
            Optional categories authors can pick when posting a suggestion.
          </p>
          <SuggestionTypesManager types={types} />
        </div>
      </div>
    </PageShell>
  );
}
