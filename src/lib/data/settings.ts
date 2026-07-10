import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

const DEFAULT_SETTINGS: SiteSettings = {
  name: "Feedback",
  description: "",
  logo_url: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("name, description, logo_url")
    .eq("id", 1)
    .single();

  return data ?? DEFAULT_SETTINGS;
}
