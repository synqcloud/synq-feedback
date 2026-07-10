-- Comments move from plain text to the same Tiptap JSON doc shape as
-- suggestion bodies, so @mentions (users and posts) can live inside them
-- too. Existing plain-text comments are wrapped as a single paragraph.
alter table public.comments
  alter column body type jsonb
  using jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'text', 'text', body)
        )
      )
    )
  );
