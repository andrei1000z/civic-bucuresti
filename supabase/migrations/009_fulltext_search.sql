-- ============================================================
-- Migration 009: Full-text search on sesizari
-- ============================================================
-- Adds pg_trgm extension + GIN indexes for fast fuzzy search.
-- Idempotent — safe to re-run.

create extension if not exists pg_trgm;

-- GIN trigram indexes for fast ILIKE + similarity searches
create index if not exists idx_sesizari_titlu_trgm
  on public.sesizari using gin (titlu gin_trgm_ops);

create index if not exists idx_sesizari_descriere_trgm
  on public.sesizari using gin (descriere gin_trgm_ops);

create index if not exists idx_sesizari_locatie_trgm
  on public.sesizari using gin (locatie gin_trgm_ops);

-- Also add on stiri_cache for news search
create index if not exists idx_stiri_title_trgm
  on public.stiri_cache using gin (title gin_trgm_ops);

select 'Migration 009: full-text search indexes created.' as status;
