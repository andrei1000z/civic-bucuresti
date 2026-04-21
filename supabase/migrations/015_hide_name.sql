-- Migration 015: privacy flag on profiles — hide real name in public sesizare views
-- When a user sets profiles.hide_name = true, every public surface that would
-- normally show `sesizari.author_name` renders "Cetățean anonim" instead.
-- The real name stays in the sesizare row (for moderation + the outgoing
-- email body) — only the public-facing display changes.
--
-- Anonymization is applied server-side in src/lib/sesizari/repository.ts
-- after the sesizari_feed view returns its rows, so we don't need to
-- rebuild the view (which has dependent functions). Keeping this migration
-- minimal: just add the column.

alter table public.profiles
  add column if not exists hide_name boolean not null default false;

comment on column public.profiles.hide_name is
  'When true, public views hide the real author_name on sesizări owned by this user.';

select 'Migration 015 (hide_name on profiles) aplicată.' as status;
