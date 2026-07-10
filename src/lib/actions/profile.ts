"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(input: { display_name: string; avatar_url: string | null }) {
  const displayName = input.display_name.trim();
  if (!displayName) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, avatar_url: input.avatar_url })
    .eq("id", userId);

  if (error) {
    return { error: "Could not save profile." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
