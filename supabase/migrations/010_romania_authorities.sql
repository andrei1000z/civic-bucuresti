-- ============================================================
-- Migration 010: National authorities system
-- ============================================================
-- Extends Civia from București-only to all of Romania.
-- Tables: counties, localities, authorities, complaint_routing
-- Idempotent — safe to re-run.

-- 1. Counties (județe) — 41 + București
create table if not exists public.counties (
  id text primary key,           -- 2-letter code: "AB", "AR", "B" etc.
  name text not null,            -- "Alba", "Arad", "București"
  center_lat double precision,
  center_lng double precision,
  population integer,
  created_at timestamptz default now()
);

-- 2. Localities (UAT-uri: municipii, orașe, comune, sate, sectoare)
create table if not exists public.localities (
  id text primary key,           -- SIRUTA code or slug: "alba-iulia", "s1" etc.
  name text not null,
  type text not null check (type in ('municipiu','oras','comuna','sat','sector')),
  county_id text references public.counties(id) on delete cascade,
  parent_id text references public.localities(id) on delete set null,
  lat double precision,
  lng double precision,
  population integer,
  created_at timestamptz default now()
);

create index if not exists idx_localities_county on public.localities(county_id);
create index if not exists idx_localities_type on public.localities(type);
create index if not exists idx_localities_name_trgm on public.localities using gin (name gin_trgm_ops);

-- 3. Authorities (instituții publice)
create table if not exists public.authorities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in (
    'primarie','politie_locala','consiliu_judetean','prefectura',
    'ipj','isu','dsp','isj','apm','dsvsa','garda_mediu',
    'cjpc','itm','drdp','minister','other'
  )),
  email text,
  phone text,
  website text,
  county_id text references public.counties(id) on delete cascade,
  locality_id text references public.localities(id) on delete cascade,
  verified boolean default false,
  verified_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_authorities_county on public.authorities(county_id);
create index if not exists idx_authorities_locality on public.authorities(locality_id);
create index if not exists idx_authorities_type on public.authorities(type);

-- 4. Complaint routing rules (what authority handles what type)
create table if not exists public.complaint_routing (
  id uuid primary key default gen_random_uuid(),
  complaint_type text not null,  -- matches SESIZARE_TIPURI values
  authority_type text not null,  -- matches authorities.type
  role text not null default 'primary' check (role in ('primary','cc')),
  priority integer default 1,
  created_at timestamptz default now(),
  unique (complaint_type, authority_type, role)
);

-- 5. RLS policies
alter table public.counties enable row level security;
alter table public.localities enable row level security;
alter table public.authorities enable row level security;
alter table public.complaint_routing enable row level security;

-- Public read access
drop policy if exists "counties_read" on public.counties;
create policy "counties_read" on public.counties for select using (true);

drop policy if exists "localities_read" on public.localities;
create policy "localities_read" on public.localities for select using (true);

drop policy if exists "authorities_read" on public.authorities;
create policy "authorities_read" on public.authorities for select using (true);

drop policy if exists "routing_read" on public.complaint_routing;
create policy "routing_read" on public.complaint_routing for select using (true);

-- 6. Default routing rules (same logic as current getAuthoritiesFor)
insert into public.complaint_routing (complaint_type, authority_type, role, priority) values
  ('groapa', 'primarie', 'primary', 1),
  ('groapa', 'politie_locala', 'cc', 2),
  ('trotuar', 'primarie', 'primary', 1),
  ('iluminat', 'primarie', 'primary', 1),
  ('copac', 'primarie', 'primary', 1),
  ('copac', 'apm', 'cc', 2),
  ('gunoi', 'primarie', 'primary', 1),
  ('gunoi', 'garda_mediu', 'cc', 2),
  ('parcare', 'politie_locala', 'primary', 1),
  ('parcare', 'primarie', 'cc', 2),
  ('stalpisori', 'primarie', 'primary', 1),
  ('canalizare', 'primarie', 'primary', 1),
  ('semafor', 'primarie', 'primary', 1),
  ('semafor', 'ipj', 'cc', 2),
  ('pietonal', 'primarie', 'primary', 1),
  ('graffiti', 'primarie', 'primary', 1),
  ('graffiti', 'politie_locala', 'cc', 2),
  ('mobilier', 'primarie', 'primary', 1),
  ('zgomot', 'politie_locala', 'primary', 1),
  ('zgomot', 'primarie', 'cc', 2),
  ('animale', 'primarie', 'primary', 1),
  ('animale', 'dsvsa', 'cc', 2),
  ('transport', 'primarie', 'primary', 1),
  ('altele', 'primarie', 'primary', 1)
on conflict (complaint_type, authority_type, role) do nothing;

select 'Migration 010: National authorities schema created.' as status;
