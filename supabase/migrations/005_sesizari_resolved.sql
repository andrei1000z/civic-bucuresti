-- ============================================================
-- Migration 005: sesizari resolution + verifications + similar RPC
-- ============================================================
-- Adaugă:
--   1. Coloane pentru rezolvare (resolved_at, resolved_by_author, resolved_photo_url)
--   2. Tabelă de verificări (alți cetățeni confirmă că e rezolvat)
--   3. Funcția RPC `sesizari_similare` (raza geografică + același tip)
--   4. Actualizează view `sesizari_feed` cu contoarele de verificări.
-- Idempotent — safe to re-run.

-- 1. Coloane noi pe sesizari
alter table public.sesizari
  add column if not exists resolved_at timestamptz;
alter table public.sesizari
  add column if not exists resolved_by_author boolean default false;
alter table public.sesizari
  add column if not exists resolved_photo_url text;

-- 2. Tabelă de verificări (un cetățean confirmă/contestă rezolvarea)
create table if not exists public.sesizare_verifications (
  sesizare_id uuid references public.sesizari(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  agrees boolean not null,  -- true = confirmă rezolvarea, false = contestă
  created_at timestamptz default now(),
  primary key (sesizare_id, user_id)
);

create index if not exists idx_verifications_sesizare
  on public.sesizare_verifications(sesizare_id);

alter table public.sesizare_verifications enable row level security;

drop policy if exists "verifications_read_all" on public.sesizare_verifications;
create policy "verifications_read_all"
  on public.sesizare_verifications for select using (true);

drop policy if exists "verifications_upsert_auth" on public.sesizare_verifications;
create policy "verifications_upsert_auth"
  on public.sesizare_verifications for insert
  with check (auth.uid() = user_id);

drop policy if exists "verifications_update_own" on public.sesizare_verifications;
create policy "verifications_update_own"
  on public.sesizare_verifications for update
  using (auth.uid() = user_id);

drop policy if exists "verifications_delete_own" on public.sesizare_verifications;
create policy "verifications_delete_own"
  on public.sesizare_verifications for delete
  using (auth.uid() = user_id);

-- 3. Recreează view sesizari_feed cu noile contoare
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
       where ver.sesizare_id = s.id and ver.agrees = false)::int as verif_nu
  from public.sesizari s
  left join public.sesizare_votes v on v.sesizare_id = s.id
  where s.moderation_status = 'approved' and s.publica = true
  group by s.id;

-- 4. RPC sesizari_similare: găsește sesizari similare după tip + rază (în metri)
-- Formulă aproximativă bounding box (rapidă, fără extensia postgis)
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
    -- ~ 1° lat = 111km. convertim raza în grade
    and abs(s.lat - o.lat) < (p_radius_m::float / 111000.0)
    and abs(s.lng - o.lng) < (p_radius_m::float / (111000.0 * cos(radians(o.lat))))
  order by s.created_at desc
  limit 10;
$$;

-- 5. Realtime pentru verificări
do $$
begin
  alter publication supabase_realtime add table public.sesizare_verifications;
exception when duplicate_object then null;
end $$;

select 'Migration 005 aplicată cu succes.' as status;
