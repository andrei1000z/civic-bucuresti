-- ============================================================
-- Migration 020: Petitii (civic petitions)
-- ============================================================
-- Adaugă funcționalitate de petiții civice care pot fi semnate online.
-- Admin postează petiții (link extern + poză + descriere); useri auth
-- semnează cu numele (display_name din profile). Count vizibil real-time.
--
-- Diff vs sesizari: sesizările sunt unidirecționale (tu → autoritate);
-- petițiile sunt mass-action (mulți useri → o cauză comună).
-- Idempotent — safe to re-run.

-- 1. Petitions table
create table if not exists public.petitii (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  body text not null,                       -- markdown OK
  image_url text,                            -- optional banner
  external_url text,                         -- optional link la petiția oficială
  target_signatures int default 1000,        -- target visible în UI
  category text,                             -- transport / mediu / educație / etc.
  county_code text,                          -- null = național
  starts_at timestamptz default now(),
  ends_at timestamptz,                       -- null = open-ended
  status text not null default 'active' check (status in ('draft','active','closed','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_petitii_slug on public.petitii(slug);
create index if not exists idx_petitii_status_starts on public.petitii(status, starts_at desc) where status = 'active';
create index if not exists idx_petitii_county on public.petitii(county_code) where county_code is not null;

-- 2. Signatures table
create table if not exists public.petitie_signatures (
  id uuid primary key default gen_random_uuid(),
  petitie_id uuid not null references public.petitii(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,                -- snapshot la momentul semnării
  comment text,                              -- optional motivation 200 chars
  created_at timestamptz default now(),
  unique(petitie_id, user_id)               -- 1 signature per user per petition
);

create index if not exists idx_petitie_sig_petitie on public.petitie_signatures(petitie_id, created_at desc);

-- 3. Trigger pentru updated_at on petitii
create or replace function public.touch_petitii_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists petitii_updated_at on public.petitii;
create trigger petitii_updated_at
  before update on public.petitii
  for each row execute function public.touch_petitii_updated_at();

-- 4. RLS

alter table public.petitii enable row level security;
alter table public.petitie_signatures enable row level security;

-- petitii — public reads (active + closed); admin all
drop policy if exists "petitii_read_public" on public.petitii;
drop policy if exists "petitii_admin_all" on public.petitii;
drop policy if exists "petitii_modify_admin" on public.petitii;

create policy "petitii_read_public"
  on public.petitii for select
  using (status in ('active','closed'));

-- Insert/update/delete: admin only (via service role check)
create policy "petitii_modify_admin"
  on public.petitii for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- petitie_signatures — public can read (count + display_names); only auth user can sign for self
drop policy if exists "petitie_sig_read_public" on public.petitie_signatures;
drop policy if exists "petitie_sig_insert_self" on public.petitie_signatures;
drop policy if exists "petitie_sig_delete_self" on public.petitie_signatures;

create policy "petitie_sig_read_public"
  on public.petitie_signatures for select
  using (true);

create policy "petitie_sig_insert_self"
  on public.petitie_signatures for insert
  with check (auth.uid() = user_id);

create policy "petitie_sig_delete_self"
  on public.petitie_signatures for delete
  using (auth.uid() = user_id);

-- 5. View pentru count rapid + listing
create or replace view public.petitii_with_count as
  select
    p.*,
    coalesce(s.signature_count, 0)::int as signature_count
  from public.petitii p
  left join (
    select petitie_id, count(*) as signature_count
    from public.petitie_signatures
    group by petitie_id
  ) s on s.petitie_id = p.id;

-- View nu are RLS direct (PostgreSQL views inherit from base tables).
-- Reads sunt public for active+closed via RLS pe petitii.

-- 6. Schema reload notify (PostgREST cache)
notify pgrst, 'reload schema';
