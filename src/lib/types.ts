export type SuggestionStatus =
  | "unassigned"
  | "planned"
  | "in_progress"
  | "testing"
  | "completed"
  | "archived";

export const SUGGESTION_STATUSES: SuggestionStatus[] = [
  "unassigned",
  "planned",
  "in_progress",
  "testing",
  "completed",
  "archived",
];

export const STATUS_LABEL: Record<SuggestionStatus, string> = {
  unassigned: "Unassigned",
  planned: "Planned",
  in_progress: "In Progress",
  testing: "Testing",
  completed: "Completed",
  archived: "Archived",
};

export const STATUS_DOT_CLASS: Record<SuggestionStatus, string> = {
  unassigned: "bg-status-unassigned",
  planned: "bg-status-planned",
  in_progress: "bg-status-in-progress",
  testing: "bg-status-testing",
  completed: "bg-status-completed",
  archived: "bg-status-archived",
};

// Tailwind's JIT scanner needs literal class names, not runtime string
// concatenation, so this can't be derived from STATUS_DOT_CLASS at call sites.
export const STATUS_RING_CLASS: Record<SuggestionStatus, string> = {
  unassigned: "border-status-unassigned",
  planned: "border-status-planned",
  in_progress: "border-status-in-progress",
  testing: "border-status-testing",
  completed: "border-status-completed",
  archived: "border-status-archived",
};

export const STATUS_HOVER_BORDER_CLASS: Record<SuggestionStatus, string> = {
  unassigned: "hover:border-status-unassigned",
  planned: "hover:border-status-planned",
  in_progress: "hover:border-status-in-progress",
  testing: "hover:border-status-testing",
  completed: "hover:border-status-completed",
  archived: "hover:border-status-archived",
};

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
};

export type NotificationPreferences = {
  email_on_mention: boolean;
  auto_subscribe_own_posts: boolean;
  auto_subscribe_commented: boolean;
  auto_subscribe_voted: boolean;
};

export type SiteSettings = {
  name: string;
  description: string;
  logo_url: string | null;
};

export type SuggestionType = {
  id: string;
  name: string;
  color: string;
  sort_order: number;
};

export type Suggestion = {
  id: string;
  title: string;
  body: unknown;
  status: SuggestionStatus;
  vote_count: number;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  author: Profile | null;
  has_voted: boolean;
  is_subscribed: boolean;
  comment_count: number;
  type: SuggestionType | null;
};

export type Comment = {
  id: string;
  suggestion_id: string;
  body: unknown;
  created_at: string;
  edited_at: string | null;
  author: Profile | null;
};

export type NotificationType = "new_suggestion" | "new_comment" | "status_change" | "mention";

export type Notification = {
  id: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  actor: Profile | null;
  suggestion: { id: string; title: string; status: SuggestionStatus } | null;
  comment: { id: string; body: unknown } | null;
};
