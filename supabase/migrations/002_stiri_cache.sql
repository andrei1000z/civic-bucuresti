-- Migration 002: stiri_cache table for RSS news aggregation
-- Run once in Supabase SQL Editor

create table if not exists public.stiri_cache (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  title text not null,
  excerpt text,
  content text,
  source text not null,
  category text not null default 'administratie',
  author text,
  image_url text,
  published_at timestamptz not null,
  fetched_at timestamptz default now(),
  featured boolean default false
);

create index if not exists idx_stiri_published on public.stiri_cache(published_at desc);
create index if not exists idx_stiri_source on public.stiri_cache(source);
create index if not exists idx_stiri_category on public.stiri_cache(category);

alter table public.stiri_cache enable row level security;

drop policy if exists "stiri_read_all" on public.stiri_cache;
create policy "stiri_read_all" on public.stiri_cache for select using (true);

select 'Migration 002 (stiri_cache) aplicată cu succes.' as status;
