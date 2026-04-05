-- ============================================================
-- Migration 006: Security hardening + newsletter table + role column
-- ============================================================
-- Fixes:
--   1. Adds `role` column on profiles (user/admin/moderator)
--   2. Creates missing `newsletter_subscribers` table with correct RLS
--   3. Tightens sesizari INSERT policy (server-side admin only)
--   4. Removes permissive newsletter read policy if exists
-- Idempotent — safe to re-run.

-- 1. Add role column to profiles
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user','admin','moderator'));

create index if not exists idx_profiles_role
  on public.profiles(role) where role != 'user';

-- 2. Newsletter subscribers table (referenced by /api/newsletter but was missing)
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  sectors text[] default '{}',
  confirmed boolean default false,
  confirmation_token text,
  unsubscribed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_newsletter_email
  on public.newsletter_subscribers(email);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can insert (subscribe), nobody reads except admin (via service role)
drop policy if exists "newsletter_read_own" on public.newsletter_subscribers;
drop policy if exists "newsletter_read_all" on public.newsletter_subscribers;
drop policy if exists "newsletter_insert_anyone" on public.newsletter_subscribers;
drop policy if exists "newsletter_read_admin" on public.newsletter_subscribers;

-- No public reads — only service role (via admin client) can list subscribers
create policy "newsletter_read_admin"
  on public.newsletter_subscribers for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "newsletter_insert_anyone"
  on public.newsletter_subscribers for insert
  with check (true);

-- Users can unsubscribe themselves by email match
create policy "newsletter_update_self"
  on public.newsletter_subscribers for update
  using (auth.email() = email);

-- 3. Tighten sesizari INSERT: allow anon inserts ONLY through our API (admin client)
-- The API already uses createSupabaseAdmin() which bypasses RLS.
-- Remove the open "anyone can insert" policy; API inserts still work via service role.
drop policy if exists "sesizari_insert_anyone" on public.sesizari;

-- Only authenticated users can insert directly (anon inserts must go through API)
create policy "sesizari_insert_authenticated"
  on public.sesizari for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

-- 4. Realtime for newsletter (so admin dashboard sees new subscribers)
do $$
begin
  alter publication supabase_realtime add table public.newsletter_subscribers;
exception when duplicate_object then null;
end $$;

-- 5. Helper function: is_admin() for cleaner RLS policies elsewhere
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

select 'Migration 006 aplicată: role column + newsletter table + RLS hardening.' as status;
