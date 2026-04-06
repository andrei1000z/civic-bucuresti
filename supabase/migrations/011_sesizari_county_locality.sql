-- ============================================================
-- Migration 011: Add county + locality columns to sesizari
-- ============================================================
-- Allows sesizari from anywhere in Romania, not just București.
-- Backwards compatible: existing sesizari have county=null (assumed "B").

alter table public.sesizari
  add column if not exists county text references public.counties(id) on delete set null;

alter table public.sesizari
  add column if not exists locality text;

-- Default existing sesizari to București
update public.sesizari set county = 'B' where county is null;

-- Index for filtering by county
create index if not exists idx_sesizari_county on public.sesizari(county);

-- Update sesizari_feed view to include county + locality
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

-- Recreate sesizari_similare RPC
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

notify pgrst, 'reload schema';

select 'Migration 011: sesizari county + locality added.' as status;
