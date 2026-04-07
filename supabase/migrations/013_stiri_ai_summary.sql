-- Migration 013: Add AI summary column to stiri_cache
ALTER TABLE public.stiri_cache ADD COLUMN IF NOT EXISTS ai_summary text;

select 'Migration 013 (stiri ai_summary) aplicată cu succes.' as status;
