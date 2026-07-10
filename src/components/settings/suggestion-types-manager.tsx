"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  createSuggestionType,
  deleteSuggestionType,
  updateSuggestionType,
} from "@/lib/actions/suggestion-types";
import type { SuggestionType } from "@/lib/types";

export function SuggestionTypesManager({ types }: { types: SuggestionType[] }) {
  const toast = useToast();
  const [items, setItems] = React.useState(types);
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#5e6ad2");
  const [creating, setCreating] = React.useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    const result = await createSuggestionType({ name, color });
    setCreating(false);

    if (result.error) {
      toast.add({ title: "Couldn't create type", description: result.error, type: "error" });
      return;
    }
    setName("");
    setItems((current) => [
      ...current,
      { id: crypto.randomUUID(), name, color, sort_order: current.length },
    ]);
  }

  async function handleColorChange(type: SuggestionType, nextColor: string) {
    setItems((current) => current.map((t) => (t.id === type.id ? { ...t, color: nextColor } : t)));
    await updateSuggestionType(type.id, { name: type.name, color: nextColor });
  }

  async function handleDelete(type: SuggestionType) {
    setItems((current) => current.filter((t) => t.id !== type.id));
    const result = await deleteSuggestionType(type.id);
    if (result.error) {
      toast.add({ title: "Couldn't delete type", description: result.error, type: "error" });
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-3">
      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((type) => (
            <li
              key={type.id}
              className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2"
            >
              <input
                type="color"
                value={type.color}
                onChange={(event) => handleColorChange(type, event.target.value)}
                className="h-6 w-6 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
                aria-label={`Color for ${type.name}`}
              />
              <span className="flex-1 text-sm text-fg">{type.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(type)}
                aria-label={`Delete ${type.name}`}
                className="text-fg-subtle transition-colors hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0"
          aria-label="New type color"
        />
        <input
          required
          placeholder="New type name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-9 flex-1 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
        />
        <Button type="submit" variant="secondary" disabled={creating}>
          {creating ? "Adding..." : "Add"}
        </Button>
      </form>
    </div>
  );
}
