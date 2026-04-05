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

-- Add follows count to the feed view.
-- CASCADE because sesizari_similare() RPC (migration 005) depends on this view.
-- We'll recreate the RPC right after.
drop view if exists public.sesizari_feed cascade;

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

-- Recreate sesizari_similare RPC (was dropped by CASCADE above)
create or replace function public.sesizari_similare(
  p_sesizare_id uuid,
  p_radius_m integer default 300
)
returns setof public.sesizari_feed
language sql
stable
as $$
  with origin as (
    select tip, lat, lng, id
    from public.sesizari
    where id = p_sesizare_id
  )
  select s.*
  from public.sesizari_feed s, origin o
  where s.id != o.id
    and s.tip = o.tip
    and abs(s.lat - o.lat) < (p_radius_m::float / 111000.0)
    and abs(s.lng - o.lng) < (p_radius_m::float / (111000.0 * cos(radians(o.lat))))
  order by s.created_at desc
  limit 10;
$$;

-- Force PostgREST to reload its schema cache so `nr_followers` is visible
notify pgrst, 'reload schema';

select 'Migration 007 aplicată: sesizare_follows + view + RPC recreat.' as status;
