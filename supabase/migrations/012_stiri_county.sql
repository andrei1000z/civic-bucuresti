-- Migration 012: Add counties array to stiri_cache for per-county news filtering
-- Run in Supabase SQL Editor

ALTER TABLE public.stiri_cache ADD COLUMN IF NOT EXISTS counties text[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_stiri_counties ON public.stiri_cache USING GIN(counties);

select 'Migration 012 (stiri counties) aplicată cu succes.' as status;
