-- Local dev seed: default site settings + admin bootstrap.
-- The first user to sign up with `admin_email` is auto-promoted to admin
-- (see handle_new_user in the init_schema migration). Change the email
-- below, or update the row later from Studio / the admin settings page.
insert into public.site_settings (id, name, description, admin_email)
values (
  1,
  'Synq',
  'Let us know how we can improve. Vote on existing ideas or suggest new ones.',
  'iamtelmoo@gmail.com'
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  admin_email = excluded.admin_email;

insert into public.suggestion_types (name, color, sort_order)
values
  ('New Feature', '#5e6ad2', 0),
  ('Feature Update', '#4cb782', 1),
  ('Bug', '#e5484d', 2),
  ('Theme Request', '#f2994a', 3)
on conflict (name) do nothing;

-- Demo content so the board isn't empty after a fresh `supabase db reset`,
-- and versatile enough to exercise real edge cases: very short and very
-- long titles, plain and richly-formatted bodies, posts with zero, one, or
-- several images, zero-to-many comments, and vote counts spanning 0 to
-- four digits. Fixed ids (rather than gen_random_uuid()) so later
-- statements in this file can reference them directly -- `supabase db
-- reset` runs seed.sql as separate batches, so a session-scoped temp table
-- from an earlier statement isn't visible to later ones.
--
-- These are fake auth users, never meant to sign in -- they only exist so
-- demo suggestions/comments/votes have a real author_id. Names are chosen
-- for variety (short, long, hyphenated, non-Latin) to exercise avatar and
-- truncation rendering.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'demo.alice@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Alice Chen"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'demo.ben@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Ben Osei"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'demo.priya@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Priya Nair"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'demo.diego@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Diego Fernández-López"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'demo.wei@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Wei Zhang"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'demo.fatima@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Fatima Al-Rashid"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'demo.jp@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Jean-Pierre Dubois"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000008', 'authenticated', 'authenticated', 'demo.minjun@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"김민준"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000009', 'authenticated', 'authenticated', 'demo.sam@example.com', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Sam Ray"}', now(), now())
on conflict (id) do nothing;

insert into public.suggestions (id, title, body, status, author_id, type_id, created_at)
values
  (
    'b1000000-0000-0000-0000-000000000001',
    'Add dark mode',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Staring at a bright white screen at night is rough. A dark theme that follows the OS setting would be great."}]}]}'::jsonb,
    'planned',
    'a1000000-0000-0000-0000-000000000001',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '9 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Export data as CSV',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Would love a one-click export of my data as CSV for reporting in other tools."}]}]}'::jsonb,
    'in_progress',
    'a1000000-0000-0000-0000-000000000002',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '7 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Mobile navigation is hard to tap',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The menu button overlaps the search bar on small screens, making it easy to tap the wrong thing."}]}]}'::jsonb,
    'testing',
    'a1000000-0000-0000-0000-000000000003',
    (select id from public.suggestion_types where name = 'Bug'),
    now() - interval '5 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'Keyboard shortcuts for common actions',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Power users would benefit from shortcuts to upvote, comment, and create a new suggestion."}]}]}'::jsonb,
    'unassigned',
    'a1000000-0000-0000-0000-000000000001',
    (select id from public.suggestion_types where name = 'Feature Update'),
    now() - interval '3 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'Slack notifications for status changes',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Ping our team Slack channel whenever a suggestion we follow changes status."}]}]}'::jsonb,
    'unassigned',
    'a1000000-0000-0000-0000-000000000002',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '2 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000006',
    'Broken link in the footer',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The privacy policy link in the footer 404s. Small thing but worth a quick fix."}]}]}'::jsonb,
    'completed',
    'a1000000-0000-0000-0000-000000000003',
    (select id from public.suggestion_types where name = 'Bug'),
    now() - interval '14 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000007',
    'Fix typo in onboarding email',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Subject line says Welcom instead of Welcome."}]}]}'::jsonb,
    'completed',
    'a1000000-0000-0000-0000-000000000004',
    (select id from public.suggestion_types where name = 'Bug'),
    now() - interval '40 days'
  ),
  (
    -- Edge case: 3-char title, the app's own minimum length.
    'b1000000-0000-0000-0000-000000000008',
    'UX?',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Just a general placeholder for UX feedback, will add details later."}]}]}'::jsonb,
    'unassigned',
    'a1000000-0000-0000-0000-000000000005',
    null,
    now() - interval '3 hours'
  ),
  (
    'b1000000-0000-0000-0000-000000000009',
    'Add support for custom domains',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"We would like to host the feedback portal on our own subdomain instead of the default one, with automatic SSL."}]}]}'::jsonb,
    'planned',
    'a1000000-0000-0000-0000-000000000006',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '12 days'
  ),
  (
    -- Edge case: very long title, to test wrapping/truncation in list
    -- rows, kanban cards, roadmap items, and the notification bell.
    'b1000000-0000-0000-0000-000000000010',
    'Please add support for exporting the full changelog history including all archived and completed items as a downloadable PDF report for stakeholders and leadership review meetings',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Right now there is no way to generate a shareable summary of everything that shipped this quarter. A PDF export would save us from manually copy-pasting the roadmap into slide decks."}]}]}'::jsonb,
    'in_progress',
    'a1000000-0000-0000-0000-000000000007',
    (select id from public.suggestion_types where name = 'Feature Update'),
    now() - interval '6 days'
  ),
  (
    -- Edge case: HTML-ish special characters, to exercise output escaping
    -- (rendered UI, and the notification email templates).
    'b1000000-0000-0000-0000-000000000011',
    'Support <script> tags & "smart quotes" safely?',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Tried pasting a snippet like <b>bold</b> & some \"curly quotes\" into a comment and want to make sure it renders as text, not markup."}]}]}'::jsonb,
    'testing',
    'a1000000-0000-0000-0000-000000000008',
    (select id from public.suggestion_types where name = 'Bug'),
    now() - interval '4 days'
  ),
  (
    -- Edge case: long, richly-formatted body with four images, lists,
    -- a blockquote, a code block, a link, and a horizontal rule.
    'b1000000-0000-0000-0000-000000000012',
    'Comprehensive design system overhaul proposal',
    ('{"type":"doc","content":[' ||
      '{"type":"paragraph","content":[{"type":"text","text":"After the last round of user interviews, a few patterns kept coming up. Sharing a full proposal below with references."}]},' ||
      '{"type":"image","attrs":{"src":"https://picsum.photos/seed/synq-ds-1/800/450","alt":"Current dashboard screenshot","title":null}},' ||
      '{"type":"paragraph","content":[{"type":"text","text":"The "},{"type":"text","marks":[{"type":"bold"}],"text":"biggest issue"},{"type":"text","text":" is inconsistent spacing between cards. Here is a closer look:"}]},' ||
      '{"type":"image","attrs":{"src":"https://picsum.photos/seed/synq-ds-2/800/450","alt":"Spacing comparison","title":null}},' ||
      '{"type":"bulletList","content":[' ||
        '{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Standardize on an 8px spacing scale"}]}]},' ||
        '{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Unify the two shades of gray currently used for borders"}]}]},' ||
        '{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Document the components in a shared library"}]}]}' ||
      ']},' ||
      '{"type":"paragraph","content":[{"type":"text","text":"Proposed rollout order:"}]},' ||
      '{"type":"orderedList","attrs":{"start":1},"content":[' ||
        '{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Audit existing components"}]}]},' ||
        '{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Ship the new spacing tokens behind a flag"}]}]},' ||
        '{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Migrate screens one at a time"}]}]}' ||
      ']},' ||
      '{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"Small, consistent details compound into a much more polished feel overall."}]}]},' ||
      '{"type":"image","attrs":{"src":"https://picsum.photos/seed/synq-ds-3/800/450","alt":"Proposed spacing scale","title":null}},' ||
      '{"type":"codeBlock","attrs":{"language":null},"content":[{"type":"text","text":"--space-1: 4px;\n--space-2: 8px;\n--space-3: 16px;\n--space-4: 24px;"}]},' ||
      '{"type":"paragraph","content":[{"type":"text","text":"Full write-up and Figma file: "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://example.com/design-system"}}],"text":"example.com/design-system"}]},' ||
      '{"type":"horizontalRule"},' ||
      '{"type":"image","attrs":{"src":"https://picsum.photos/seed/synq-ds-4/800/450","alt":"Final mockup","title":null}},' ||
      '{"type":"paragraph","content":[{"type":"text","text":"Happy to pair with whoever picks this up."}]}' ||
    ']}')::jsonb,
    'planned',
    'a1000000-0000-0000-0000-000000000001',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '20 days'
  ),
  (
    -- Edge case: image-only body, effectively no text.
    'b1000000-0000-0000-0000-000000000013',
    'Mockup for new empty state',
    '{"type":"doc","content":[{"type":"image","attrs":{"src":"https://picsum.photos/seed/synq-empty-state/700/700","alt":"Empty state mockup","title":null}}]}'::jsonb,
    'unassigned',
    'a1000000-0000-0000-0000-000000000002',
    (select id from public.suggestion_types where name = 'Feature Update'),
    now() - interval '1 day'
  ),
  (
    -- Edge case: four-digit vote count (see override below).
    'b1000000-0000-0000-0000-000000000014',
    'Add public API access with rate-limited tokens',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A read-only REST API with per-token rate limits would let us build internal tooling on top of the board without scraping the UI."}]}]}'::jsonb,
    'planned',
    'a1000000-0000-0000-0000-000000000003',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '30 days'
  ),
  (
    -- Edge case: many comments (see below), to test long comment threads.
    'b1000000-0000-0000-0000-000000000015',
    'What is the roadmap for Q3?',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Curious what the team is prioritizing next quarter, and whether any of the top-voted items here are already planned."}]}]}'::jsonb,
    'unassigned',
    'a1000000-0000-0000-0000-000000000004',
    null,
    now() - interval '5 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000016',
    'Dark mode flickers on page load',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"There is a brief flash of the light theme before dark mode kicks in, most noticeable on a slow connection."}]}]}'::jsonb,
    'in_progress',
    'a1000000-0000-0000-0000-000000000005',
    (select id from public.suggestion_types where name = 'Bug'),
    now() - interval '3 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000017',
    'Archive old suggestions automatically after a year of inactivity',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Would help keep the unassigned column tidy without anyone having to manually triage every stale post."}]}]}'::jsonb,
    'archived',
    'a1000000-0000-0000-0000-000000000006',
    (select id from public.suggestion_types where name = 'Feature Update'),
    now() - interval '200 days'
  ),
  (
    -- Edge case: extremely short title.
    'b1000000-0000-0000-0000-000000000018',
    'Typo',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Settings page footer says Save Changs."}]}]}'::jsonb,
    'completed',
    'a1000000-0000-0000-0000-000000000007',
    (select id from public.suggestion_types where name = 'Bug'),
    now() - interval '60 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000019',
    'Add integrations with Zapier and Make',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Would like to trigger workflows automatically. A few ideas:"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"New suggestion posted"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Status changed to Completed"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Vote count crosses a threshold"}]}]}]}]}'::jsonb,
    'unassigned',
    'a1000000-0000-0000-0000-000000000008',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '9 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000020',
    'Allow custom status names per workspace',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Our team calls the review stage QA instead of Testing. Being able to rename statuses would match our internal language."}]}]}'::jsonb,
    'planned',
    'a1000000-0000-0000-0000-000000000009',
    (select id from public.suggestion_types where name = 'Feature Update'),
    now() - interval '15 days'
  ),
  (
    -- Edge case: two images plus several paragraphs, moderate length.
    'b1000000-0000-0000-0000-000000000021',
    'Two images to test layout with several attachments and text',
    ('{"type":"doc","content":[' ||
      '{"type":"paragraph","content":[{"type":"text","text":"Sharing two screenshots side by side conceptually to see how the reader lays them out with surrounding text."}]},' ||
      '{"type":"image","attrs":{"src":"https://picsum.photos/seed/synq-layout-a/800/450","alt":"Before","title":null}},' ||
      '{"type":"paragraph","content":[{"type":"text","text":"Before: cards are cramped and the vote button overlaps the title on narrow screens."}]},' ||
      '{"type":"image","attrs":{"src":"https://picsum.photos/seed/synq-layout-b/800/450","alt":"After","title":null}},' ||
      '{"type":"paragraph","content":[{"type":"text","text":"After: more breathing room, and the vote button moves below the title once it wraps."}]}' ||
    ']}')::jsonb,
    'testing',
    'a1000000-0000-0000-0000-000000000001',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '7 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000022',
    'Emoji support in comments and titles',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Small thing, but being able to add a 🎉 or 🚀 here and there makes the board feel a lot friendlier."}]}]}'::jsonb,
    'unassigned',
    'a1000000-0000-0000-0000-000000000002',
    (select id from public.suggestion_types where name = 'Theme Request'),
    now() - interval '2 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000023',
    'Really old archived idea nobody remembers',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Not sure this is still relevant, keeping it around mostly to test how very old archived items look."}]}]}'::jsonb,
    'archived',
    'a1000000-0000-0000-0000-000000000003',
    null,
    now() - interval '400 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000024',
    'Improve loading skeleton on kanban',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The current placeholder blocks all pulse at the same time, a slight stagger would feel smoother."}]}]}'::jsonb,
    'completed',
    'a1000000-0000-0000-0000-000000000004',
    (select id from public.suggestion_types where name = 'Bug'),
    now() - interval '25 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000025',
    'Add bulk actions for admins',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Selecting several suggestions and changing their status at once would save a lot of clicking. Rough flow:"}]},{"type":"orderedList","attrs":{"start":1},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Check the boxes on the board"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Pick a new status from a toolbar dropdown"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Confirm"}]}]}]}]}'::jsonb,
    'planned',
    'a1000000-0000-0000-0000-000000000005',
    (select id from public.suggestion_types where name = 'Feature Update'),
    now() - interval '11 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000026',
    'Voting should show who voted, like GitHub reactions',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hovering the vote count to see avatars of everyone who upvoted would help gauge who cares about a given request."}]}]}'::jsonb,
    'testing',
    'a1000000-0000-0000-0000-000000000006',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '8 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000027',
    'Search is case sensitive, should not be',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Searching dark mode finds nothing but Dark Mode does. Should be case-insensitive."}]}]}'::jsonb,
    'in_progress',
    'a1000000-0000-0000-0000-000000000007',
    (select id from public.suggestion_types where name = 'Bug'),
    now() - interval '4 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000028',
    'Consider a public roadmap embed widget for our marketing site',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"An embeddable, read-only version of the roadmap would let us show progress on our own site without an iframe hack. Similar to "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://example.com/embeds"}}],"text":"this example"},{"type":"text","text":"."}]}]}'::jsonb,
    'unassigned',
    'a1000000-0000-0000-0000-000000000008',
    (select id from public.suggestion_types where name = 'New Feature'),
    now() - interval '1 day'
  ),
  (
    'b1000000-0000-0000-0000-000000000029',
    'High-contrast accessibility theme',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Our accessibility team flagged that some status colors do not meet contrast guidelines. A dedicated high-contrast theme option would help."}]}]}'::jsonb,
    'planned',
    'a1000000-0000-0000-0000-000000000009',
    (select id from public.suggestion_types where name = 'Theme Request'),
    now() - interval '13 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000030',
    'Completed ages ago, padding out the completed column',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Here mostly to make the completed column look realistically populated for testing."}]}]}'::jsonb,
    'completed',
    'a1000000-0000-0000-0000-000000000001',
    null,
    now() - interval '100 days'
  )
on conflict (id) do nothing;

insert into public.votes (suggestion_id, user_id)
values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000005'),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000005'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000006'),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000005'),
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000006'),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000007'),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000008'),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000009'),
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000004')
on conflict do nothing;

-- A handful of suggestions get a bumped-up vote_count on top of the real
-- vote rows above, so the UI has realistic-looking three- and four-digit
-- numbers to test (denormalized column, safe to set directly for seed
-- data -- see handle_vote_change in the init migration).
update public.suggestions set vote_count = 18 where id = 'b1000000-0000-0000-0000-000000000009';
update public.suggestions set vote_count = 42 where id = 'b1000000-0000-0000-0000-000000000010';
update public.suggestions set vote_count = 156 where id = 'b1000000-0000-0000-0000-000000000012';
update public.suggestions set vote_count = 1247 where id = 'b1000000-0000-0000-0000-000000000014';
update public.suggestions set vote_count = 27 where id = 'b1000000-0000-0000-0000-000000000016';
update public.suggestions set vote_count = 64 where id = 'b1000000-0000-0000-0000-000000000019';
update public.suggestions set vote_count = 11 where id = 'b1000000-0000-0000-0000-000000000020';
update public.suggestions set vote_count = 33 where id = 'b1000000-0000-0000-0000-000000000021';
update public.suggestions set vote_count = 14 where id = 'b1000000-0000-0000-0000-000000000024';
update public.suggestions set vote_count = 22 where id = 'b1000000-0000-0000-0000-000000000025';
update public.suggestions set vote_count = 71 where id = 'b1000000-0000-0000-0000-000000000026';
update public.suggestions set vote_count = 19 where id = 'b1000000-0000-0000-0000-000000000028';
update public.suggestions set vote_count = 38 where id = 'b1000000-0000-0000-0000-000000000029';

-- comments.body is jsonb (Tiptap doc shape, see the convert_comments_to_rich_text
-- migration) -- wrap each plain-text row into a single-paragraph doc below.
insert into public.comments (suggestion_id, author_id, body)
select
  t.suggestion_id::uuid,
  t.author_id::uuid,
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', t.body_text))
      )
    )
  )
from (values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Big +1 from me, my eyes would thank you.'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Would this include filtered views, or just the full dataset?'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', 'We need this too, currently stuck on a shared subdomain that confuses our customers.'),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000004', 'A quarterly PDF would be perfect for our board updates.'),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000006', 'Would it include comments too, or just titles and statuses?'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000007', 'Just tested this myself, looks like it is already escaped correctly, nice.'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000002', 'Love the direction, especially the spacing scale.'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000003', 'Could we also standardize the border radius while we are at it?'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004', 'The before/after screenshots make this so much easier to evaluate.'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000005', 'Happy to help test the migration on a couple of screens.'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000006', 'Agreed on the two grays, that inconsistency has bugged me for a while.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000001', 'Following, would love visibility into this too.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000002', 'Same, especially for the API access request further down the board.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000003', 'Any chance of a public roadmap page with target dates?'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'Bumping this, coming up on a quarter with no update.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000006', 'Would also help us plan our own integration work.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000007', 'Seconding the target dates idea from above.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000008', 'Even a rough priority order would be useful.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000009', 'This thread is a good example of a long comment list for testing, by the way.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000004', 'Ha, fair, but also a real question on my end.'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000001', 'Closing the loop: heard informally that Q3 focuses on the API and bulk actions.'),
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000004', 'Confirmed on Safari as well, not just Chrome.'),
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000006', 'Might be worth setting the theme via a blocking script in <head> to avoid the flash.'),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000001', 'Zapier support would let us skip a bunch of custom glue code.'),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000003', 'Make (formerly Integromat) support would be great too, we use it heavily.'),
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000006', 'A generic outgoing webhook would probably cover most of this in one shot.'),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000004', 'We would rename Testing to QA and Planned to Backlog.'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000002', 'The after screenshot is a lot easier to scan, nice work.'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000009', 'Does this account for three or more images in one post too?'),
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000005', 'Small but agreed, would make status updates feel less dry.'),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000002', 'This would save me so much time during weekly triage.'),
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000007', 'Would want an undo option in case of a misclick.'),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000001', 'This mirrors how GitHub reactions work, would love the same pattern here.'),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000002', 'Could get noisy on high-vote items though, maybe cap the avatar list at ten.'),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000008', 'Agreed with the cap idea above.'),
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000009', 'Would also help us identify who to loop into a deeper discussion.'),
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000003', 'Also noticed accented characters do not match either, e.g. cafe vs café.'),
  ('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000001', 'Our accessibility audit flagged the same statuses, glad to see this posted.'),
  ('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000005', 'Would this be a full theme, or just adjusted status colors?')
) as t(suggestion_id, author_id, body_text);
