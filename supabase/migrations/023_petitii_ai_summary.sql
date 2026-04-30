-- Migration 023: ai_summary column on petitii (mirrors stiri_cache.ai_summary)
-- Run in Supabase SQL Editor

alter table public.petitii
  add column if not exists ai_summary text;

comment on column public.petitii.ai_summary is
  'AI-generated synthesis of the petition body (Groq). Cached to avoid re-billing on every page view. NULL until first /petitii/[slug] visit triggers generation.';

select 'Migration 023 (petitii ai_summary) aplicată.' as status;
