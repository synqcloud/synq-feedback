"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSuggestionType(input: { name: string; color: string }) {
  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("suggestion_types")
    .select("id", { count: "exact", head: true });

  const { error } = await supabase
    .from("suggestion_types")
    .insert({ name, color: input.color, sort_order: count ?? 0 });

  if (error) return { error: "Could not create type." };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateSuggestionType(id: string, input: { name: string; color: string }) {
  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("suggestion_types")
    .update({ name, color: input.color })
    .eq("id", id);

  if (error) return { error: "Could not update type." };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteSuggestionType(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suggestion_types").delete().eq("id", id);

  if (error) return { error: "Could not delete type." };

  revalidatePath("/", "layout");
  return { ok: true };
}
