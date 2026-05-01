-- ============================================================
-- Migration 027: intreruperi_scraped table for live outage data
-- ============================================================
--
-- Until now `src/data/intreruperi-scraped.json` was committed to the
-- repo and refreshed by `npm run scrape:intreruperi` from a developer's
-- laptop. Vercel's filesystem is read-only at runtime so the scraper
-- can't run on cron — meaning data goes stale until someone manually
-- re-scrapes and pushes a commit.
--
-- This migration moves the scraped catalog into Postgres so a Vercel
-- cron job can refresh it every 6h via the `/api/intreruperi/refresh`
-- endpoint. The static `intreruperi-scraped.json` stays in the repo as
-- a build-time fallback / deterministic seed.

create table if not exists public.intreruperi_scraped (
  id text primary key,
  external_id text,
  type text not null check (type in (
    'apa', 'caldura', 'gaz', 'electricitate',
    'lucrari-strazi', 'altele'
  )),
  status text not null check (status in (
    'programat', 'in-desfasurare', 'finalizat', 'anulat'
  )),
  provider text not null,
  source_url text,
  source_entry_url text,
  source_entry_title text,
  reason text not null,
  addresses text[] not null default '{}',
  lat double precision,
  lng double precision,
  county text not null,
  locality text,
  sector text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  affected_population integer,
  excerpt text,
  -- Fingerprint of source content so we don't bump updated_at when
  -- nothing actually changed on the upstream source.
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

comment on table public.intreruperi_scraped is
  'Scraper output for utility outages and street works. Refreshed every 6h by /api/intreruperi/refresh. The page reads from here merged with static seed.';

-- Most reads filter by county + currently-active end window
create index if not exists idx_intreruperi_county_end
  on public.intreruperi_scraped(county, end_at desc);
create index if not exists idx_intreruperi_type
  on public.intreruperi_scraped(type);
create index if not exists idx_intreruperi_status_end
  on public.intreruperi_scraped(status, end_at desc);
-- Useful for the /admin queue ("when did the scraper last see this?")
create index if not exists idx_intreruperi_last_seen
  on public.intreruperi_scraped(last_seen_at desc);

alter table public.intreruperi_scraped enable row level security;

-- Public read — outages are explicitly public information
drop policy if exists intreruperi_read_all on public.intreruperi_scraped;
create policy intreruperi_read_all
  on public.intreruperi_scraped for select
  using (true);

-- Writes only via service role (no anon / authenticated insert/update)
-- — RLS denies by default, the refresh endpoint uses the admin client.

select 'Migration 027 (intreruperi_scraped) aplicată.' as status;
