-- ============================================================
-- Migration 007: sesizare_follows (urmărire notificări status)
-- ============================================================
-- Un user poate urmări orice sesizare publică (nu doar a sa).
-- La schimbare status, toți urmăritorii primesc notificare email (Batch 6).
-- Idempotent — safe to re-run.

create table if not exists public.sesizare_follows (
  sesizare_id uuid references public.sesizari(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (sesizare_id, user_id)
);

create index if not exists idx_follows_user
  on public.sesizare_follows(user_id, created_at desc);

create index if not exists idx_follows_sesizare
  on public.sesizare_follows(sesizare_id);

alter table public.sesizare_follows enable row level security;

drop policy if exists "follows_read_own" on public.sesizare_follows;
create policy "follows_read_own"
  on public.sesizare_follows for select
  using (auth.uid() = user_id);

drop policy if exists "follows_read_count" on public.sesizare_follows;
-- Allow public to see count of followers per sesizare (but not WHO)
-- We enforce this via the view below instead.

drop policy if exists "follows_insert_auth" on public.sesizare_follows;
create policy "follows_insert_auth"
  on public.sesizare_follows for insert
  with check (auth.uid() = user_id);

drop policy if exists "follows_delete_own" on public.sesizare_follows;
create policy "follows_delete_own"
  on public.sesizare_follows for delete
  using (auth.uid() = user_id);

-- Helper function: count followers (public read via function)
create or replace function public.follows_count(p_sesizare_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.sesizare_follows
  where sesizare_id = p_sesizare_id;
$$;

-- Add follows count to the feed view
drop view if exists public.sesizari_feed;
create view public.sesizari_feed as
  select s.*,
    coalesce(sum(case when v.value = 1 then 1 else 0 end), 0)::int as upvotes,
    coalesce(sum(case when v.value = -1 then 1 else 0 end), 0)::int as downvotes,
    coalesce(sum(v.value), 0)::int as voturi_net,
    (select count(*) from public.sesizare_comments c where c.sesizare_id = s.id)::int as nr_comentarii,
    (select count(*) from public.sesizare_verifications ver
       where ver.sesizare_id = s.id and ver.agrees = true)::int as verif_da,
    (select count(*) from public.sesizare_verifications ver
       where ver.sesizare_id = s.id and ver.agrees = false)::int as verif_nu,
    (select count(*) from public.sesizare_follows f where f.sesizare_id = s.id)::int as nr_followers
  from public.sesizari s
  left join public.sesizare_votes v on v.sesizare_id = s.id
  where s.moderation_status = 'approved' and s.publica = true
  group by s.id;

select 'Migration 007 aplicată: sesizare_follows + view actualizat.' as status;
