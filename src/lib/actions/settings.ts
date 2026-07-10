"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSiteSettings(input: { name: string; description: string }) {
  const name = input.name.trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      name,
      description: input.description.trim(),
    })
    .eq("id", 1);

  if (error) {
    return { error: "Could not save settings." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
