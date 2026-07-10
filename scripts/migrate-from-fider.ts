/**
 * One-off migration: pulls users, posts, votes and comments out of a Fider
 * Cloud instance (via its public API) and writes them into this app's
 * Supabase project.
 *
 * Usage:
 *   set -a && source .env.migration && set +a
 *   npx tsx scripts/migrate-from-fider.ts                 # dry run (default)
 *   npx tsx scripts/migrate-from-fider.ts --apply          # actually writes
 *   npx tsx scripts/migrate-from-fider.ts --apply --users-only
 *
 * Required env vars (put them in .env.migration, not .env.local -- these
 * are one-off migration secrets, not app runtime config):
 *   FIDER_API_URL              e.g. https://yourapp.fider.io
 *   FIDER_API_KEY              Settings -> API Key in Fider (admin/collaborator only)
 *   SUPABASE_URL               your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  service_role key (Project Settings -> API)
 *   DATABASE_URL               direct Postgres connection string
 *                              (Project Settings -> Database -> Connection string,
 *                              "postgres" role, session mode -- we need
 *                              ALTER TABLE ... TRIGGER, which pooled/PgBouncer
 *                              transaction-mode connections don't support)
 *
 * Dry run fetches everything from Fider and prints counts + a sample of the
 * mapped rows, but never touches Supabase.
 *
 * Verified against the real synq.fider.io instance during development:
 *  - /api/v1/users is paginated behind a {users, totalPages, ...} envelope
 *  - /api/v1/posts is a flat array (its own inconsistency vs /users),
 *    paginated via ?page=N&limit=100&view=all
 *  - /api/v1/posts/:number/votes returns real voter identities
 *  - Post/comment bodies are real Markdown; `![](fider-image:KEY)` embeds
 *    resolve at https://{tenant}.fidercdn.com/static/images/KEY (undocumented,
 *    found by testing URL patterns against the CDN)
 *  - Comment attachments arrive as a separate `attachments: string[]` field,
 *    not inlined into `content` the way post description images are
 */

import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";
import { fiderMarkdownToTiptapDoc, appendAttachments } from "./lib/fider-markdown";

const FIDER_API_URL = requireEnv("FIDER_API_URL").replace(/\/$/, "");
const FIDER_API_KEY = requireEnv("FIDER_API_KEY");
const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const DATABASE_URL = requireEnv("DATABASE_URL");

const APPLY = process.argv.includes("--apply");
const USERS_ONLY = process.argv.includes("--users-only");

// Fider roles that should become Synq admins. Fider "collaborator" can also
// manage the board day-to-day; add it here if you want collaborators to
// land as admins too.
const ADMIN_ROLES = new Set(["administrator"]);

// Fider's built-in statuses -> this app's SuggestionStatus. Adjust freely --
// nothing else in the script depends on these specific values. Only
// open/planned/completed have been seen in real data so far; started/
// declined/duplicate are mapped defensively.
const STATUS_MAP: Record<string, string> = {
  open: "unassigned",
  planned: "planned",
  started: "in_progress",
  completed: "completed",
  declined: "archived",
  duplicate: "archived",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var ${name}`);
    process.exit(1);
  }
  return value;
}

// ---------------------------------------------------------------------
// Fider API client
// ---------------------------------------------------------------------

type FiderUser = {
  id: number;
  name: string;
  email: string;
  role: "visitor" | "collaborator" | "administrator";
};

type FiderPost = {
  id: number;
  number: number;
  title: string;
  description: string;
  status: string;
  user: FiderUser;
  createdAt: string;
};

type FiderComment = {
  id: number;
  content: string;
  user: FiderUser;
  attachments?: string[];
  createdAt: string;
};

type FiderVote = {
  user: FiderUser;
  createdAt: string;
};

async function fiderFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${FIDER_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${FIDER_API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Fider API ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function fetchAllUsers(): Promise<FiderUser[]> {
  const all: FiderUser[] = [];
  for (let page = 1; ; page++) {
    const res = await fiderFetch<{ users: FiderUser[]; totalPages: number }>(
      `/api/v1/users?page=${page}`,
    );
    all.push(...res.users);
    if (page >= res.totalPages) break;
  }
  return all;
}

async function fetchAllPosts(): Promise<FiderPost[]> {
  const all: FiderPost[] = [];
  for (let page = 1; ; page++) {
    const batch = await fiderFetch<FiderPost[]>(
      `/api/v1/posts?page=${page}&limit=100&view=all`,
    );
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

async function fetchComments(postNumber: number): Promise<FiderComment[]> {
  return fiderFetch<FiderComment[]>(`/api/v1/posts/${postNumber}/comments`);
}

async function fetchVotes(postNumber: number): Promise<FiderVote[]> {
  return fiderFetch<FiderVote[]>(`/api/v1/posts/${postNumber}/votes`);
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  console.log(APPLY ? "Running in APPLY mode -- this will write data." : "Dry run (pass --apply to write).");

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();

  try {
    // 1. Users -----------------------------------------------------------
    const fiderUsers = await fetchAllUsers();
    console.log(`Fider users: ${fiderUsers.length}`);

    const fiderIdToSynqId = new Map<number, string>();

    for (const user of fiderUsers) {
      if (!APPLY) {
        // Still need the id map for the posts/comments/votes dry-run
        // preview below, so look up any that already exist locally.
        const existing = await pg.query<{ id: string }>(
          "select id from auth.users where email = $1",
          [user.email],
        );
        if (existing.rows.length > 0) fiderIdToSynqId.set(user.id, existing.rows[0].id);
        console.log(`  [dry-run] would import ${user.email} (${user.role})`);
        continue;
      }

      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: { name: user.name },
      });

      let synqUserId: string;
      if (error) {
        if (error.code !== "email_exists") {
          throw error;
        }
        const existing = await pg.query<{ id: string }>(
          "select id from auth.users where email = $1",
          [user.email],
        );
        if (existing.rows.length === 0) {
          throw new Error(`${user.email} reported as duplicate but not found in auth.users`);
        }
        synqUserId = existing.rows[0].id;
      } else {
        synqUserId = created.user.id;
      }

      fiderIdToSynqId.set(user.id, synqUserId);

      if (ADMIN_ROLES.has(user.role)) {
        // profiles has a trigger that pins is_admin during ordinary
        // UPDATEs (so users can't self-promote) -- disable it for this one
        // write.
        await pg.query("alter table public.profiles disable trigger protect_profile_privileges_trigger");
        await pg.query("update public.profiles set is_admin = true where id = $1", [synqUserId]);
        await pg.query("alter table public.profiles enable trigger protect_profile_privileges_trigger");
      }
    }

    console.log(`Imported/matched ${fiderIdToSynqId.size} users.`);

    if (USERS_ONLY) {
      console.log("`--users-only` set, skipping posts/comments/votes.");
      return;
    }

    // 2. Posts, comments, votes ------------------------------------------
    const fiderPosts = await fetchAllPosts();
    console.log(`Fider posts: ${fiderPosts.length}`);

    const NOTIFY_TRIGGERS = [
      ["public.suggestions", "on_suggestion_notify_admins"],
      ["public.suggestions", "on_suggestion_auto_subscribe"],
      ["public.suggestions", "on_suggestion_notify_mentions"],
      ["public.comments", "on_comment_notify_admins"],
      ["public.comments", "on_comment_notify_subscribers"],
      ["public.comments", "on_comment_auto_subscribe"],
      ["public.comments", "on_comment_notify_mentions"],
      ["public.votes", "on_vote_auto_subscribe"],
    ] as const;

    if (APPLY) {
      for (const [table, trigger] of NOTIFY_TRIGGERS) {
        await pg.query(`alter table ${table} disable trigger ${trigger}`);
      }
    }

    try {
      let importedPosts = 0;
      let importedComments = 0;
      let importedVotes = 0;
      let skippedAuthors = 0;

      for (const post of fiderPosts) {
        const authorId = fiderIdToSynqId.get(post.user.id);
        if (!authorId) {
          skippedAuthors++;
          console.warn(`  skipping post #${post.number} "${post.title}": author not imported`);
          continue;
        }

        const status = STATUS_MAP[post.status] ?? "unassigned";
        const body = fiderMarkdownToTiptapDoc(post.description);

        if (!APPLY) {
          console.log(`  [dry-run] post #${post.number} "${post.title}" -> status=${status}, author=${post.user.name}`);
          importedPosts++;
          continue;
        }

        const { rows } = await pg.query<{ id: string }>(
          `insert into public.suggestions (title, body, status, author_id, created_at, updated_at)
           values ($1, $2, $3, $4, $5, $5)
           returning id`,
          [post.title, body, status, authorId, post.createdAt],
        );
        const suggestionId = rows[0].id;
        importedPosts++;

        const comments = await fetchComments(post.number);
        for (const comment of comments) {
          const commentAuthorId = fiderIdToSynqId.get(comment.user.id);
          if (!commentAuthorId) continue;
          const commentDoc = appendAttachments(
            fiderMarkdownToTiptapDoc(comment.content),
            comment.attachments ?? [],
            comment.content,
          );
          await pg.query(
            `insert into public.comments (suggestion_id, author_id, body, created_at)
             values ($1, $2, $3, $4)`,
            [suggestionId, commentAuthorId, commentDoc, comment.createdAt],
          );
          importedComments++;
        }

        const votes = await fetchVotes(post.number);
        for (const vote of votes) {
          const voterId = fiderIdToSynqId.get(vote.user.id);
          if (!voterId) continue;
          await pg.query(
            `insert into public.votes (suggestion_id, user_id, created_at)
             values ($1, $2, $3)
             on conflict do nothing`,
            [suggestionId, voterId, vote.createdAt],
          );
          importedVotes++;
        }
      }

      console.log(
        `Imported ${importedPosts} posts, ${importedComments} comments, ${importedVotes} votes` +
          (skippedAuthors ? ` (${skippedAuthors} posts skipped, author not found)` : ""),
      );
    } finally {
      if (APPLY) {
        for (const [table, trigger] of NOTIFY_TRIGGERS) {
          await pg.query(`alter table ${table} enable trigger ${trigger}`);
        }
      }
    }
  } finally {
    await pg.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
