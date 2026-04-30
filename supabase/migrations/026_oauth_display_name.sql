-- ============================================================
-- Migration 026: OAuth providers populate the proper display_name
-- ============================================================
--
-- Until now `handle_new_user` only looked at
-- `raw_user_meta_data->>'display_name'`, which is set when our own
-- OTP magic-link flow forwards a name. Google OAuth never sends that
-- key — it sends `name` / `full_name` instead — so users who signed
-- up via Google ended up with `display_name = split_part(email, '@', 1)`
-- (e.g. „musattiberiu" for musattiberiu@gmail.com). The /cont page
-- then renders „Salut, Musattiberiu!" which is exactly what users
-- complained about.
--
-- This migration:
--   1. Rewrites the trigger to fall back through every OAuth metadata
--      key Google / Apple / GitHub / Facebook actually use, before
--      collapsing onto the email local-part as the last resort.
--   2. Backfills `display_name` + `full_name` for existing rows whose
--      values look like an email username (no spaces + matches the
--      email's local part) — gives every Google-OAuth account that
--      already exists a proper name without forcing a re-signup.

-- ─── 1. Updated trigger ────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_display text;
begin
  v_full_name := nullif(trim(coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name'
  )), '');

  v_display := nullif(trim(coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    -- Last resort: email username. Mirrors the original behavior so
    -- magic-link signups without metadata don't regress.
    split_part(coalesce(new.email, ''), '@', 1)
  )), '');

  insert into public.profiles (id, display_name, full_name)
  values (new.id, coalesce(v_display, 'Cetățean'), v_full_name)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ─── 2. Backfill existing rows ─────────────────────────────────────
-- Match profiles whose display_name is just the email's local part
-- (the auto-generated value). For each, pull the real name out of
-- auth.users.raw_user_meta_data and update both display_name +
-- full_name when we can find one. Untouched if the user already typed
-- a name in /cont (display_name no longer matches the local part).
update public.profiles p
set
  display_name = coalesce(
    nullif(trim(coalesce(
      au.raw_user_meta_data->>'name',
      au.raw_user_meta_data->>'full_name'
    )), ''),
    p.display_name
  ),
  full_name = coalesce(
    p.full_name,
    nullif(trim(coalesce(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name'
    )), '')
  )
from auth.users au
where au.id = p.id
  and au.email is not null
  and p.display_name is not null
  and lower(p.display_name) = lower(split_part(au.email, '@', 1))
  and (
    nullif(trim(au.raw_user_meta_data->>'name'), '') is not null
    or nullif(trim(au.raw_user_meta_data->>'full_name'), '') is not null
  );

select 'Migration 026 (OAuth display_name) aplicată.' as status;
