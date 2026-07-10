"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { STATUS_DOT_CLASS, STATUS_LABEL } from "@/lib/types";
import type { MentionItem } from "@/lib/mention-search";
import { cn } from "@/lib/cn";

export type MentionListHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

function MentionRow({
  item,
  active,
  onSelect,
}: {
  item: MentionItem;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onSelect();
      }}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-fg",
        active ? "bg-accent-soft" : "hover:bg-surface-hover",
      )}
    >
      {item.kind === "user" ? (
        <>
          <Avatar name={item.label} src={item.avatarUrl} size={20} />
          <span className="truncate">{item.label}</span>
        </>
      ) : (
        <>
          <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT_CLASS[item.status])} />
          <span className="truncate">{item.label}</span>
          <span className="ml-auto shrink-0 text-xs text-fg-subtle">{STATUS_LABEL[item.status]}</span>
        </>
      )}
    </button>
  );
}

export const MentionList = React.forwardRef<
  MentionListHandle,
  { items: MentionItem[]; command: (item: MentionItem) => void }
>(function MentionList({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [syncedItems, setSyncedItems] = React.useState(items);

  // Reset the selection whenever the candidate list changes (e.g. the user
  // keeps typing after "@"), following React's documented "adjust state
  // during render" pattern instead of an effect.
  if (items !== syncedItems) {
    setSyncedItems(items);
    setSelectedIndex(0);
  }

  const selectItem = React.useCallback(
    (index: number) => {
      const item = items[index];
      if (item) command(item);
    },
    [items, command],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      onKeyDown: ({ event }) => {
        if (items.length === 0) return false;
        if (event.key === "ArrowUp") {
          setSelectedIndex((current) => (current + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((current) => (current + 1) % items.length);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }),
    [items, selectedIndex, selectItem],
  );

  if (items.length === 0) {
    return (
      <div className="w-64 rounded-lg border border-border bg-surface p-3 text-sm text-fg-muted shadow-lg">
        No matches
      </div>
    );
  }

  const users = items.filter((item) => item.kind === "user");
  const posts = items.filter((item) => item.kind === "suggestion");

  return (
    <div className="max-h-80 w-72 overflow-y-auto rounded-lg border border-border bg-surface py-1.5 shadow-lg">
      {users.length > 0 && (
        <div>
          <div className="px-3 py-1 text-xs font-medium text-fg-subtle">Users</div>
          {users.map((item) => (
            <MentionRow
              key={`user-${item.id}`}
              item={item}
              active={items.indexOf(item) === selectedIndex}
              onSelect={() => selectItem(items.indexOf(item))}
            />
          ))}
        </div>
      )}
      {posts.length > 0 && (
        <div>
          <div className="px-3 py-1 text-xs font-medium text-fg-subtle">Posts</div>
          {posts.map((item) => (
            <MentionRow
              key={`post-${item.id}`}
              item={item}
              active={items.indexOf(item) === selectedIndex}
              onSelect={() => selectItem(items.indexOf(item))}
            />
          ))}
        </div>
      )}
    </div>
  );
});
