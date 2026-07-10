"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updateSiteSettings } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/types";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-9 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = React.useState(settings.name);
  const [description, setDescription] = React.useState(settings.description);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await updateSiteSettings({ name, description });
    setSaving(false);

    if (result.error) {
      toast.add({ title: "Couldn't save settings", description: result.error, type: "error" });
      return;
    }
    toast.add({ title: "Settings saved" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <Field label="Site name">
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Description">
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Shown in search results and link previews."
          className={`${inputClass} h-auto resize-none py-2`}
        />
      </Field>
      <Button type="submit" variant="primary" disabled={saving} className="self-start">
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
