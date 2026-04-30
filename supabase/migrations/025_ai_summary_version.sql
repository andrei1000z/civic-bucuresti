-- ============================================================
-- Migration 025: ai_summary_version cache invalidation column
-- ============================================================
--
-- CONTEXT:
-- AI summaries on stiri + petitii are cached in `ai_summary`. When we
-- improve the prompt, switch the model, or change the post-processor,
-- the cached output becomes "stale" — quality is below the new bar but
-- still ≥ 20 chars, so the cache check returns it as-is and the
-- improvement never reaches users.
--
-- The fix: stamp every cached summary with the version it was
-- generated at. Code reads `AI_SUMMARY_VERSION` from
-- `src/lib/ai/synthesis-version.ts`; if the row's version is below
-- that, it transparently regenerates.
--
-- Default 0 means "old cache". The first reader after a deploy pays
-- the regeneration cost; subsequent readers see the new content.
-- For stiri with 700+ rows this fan-out is gradual (only popular
-- articles get visited often), keeping the regeneration load shaped
-- like the traffic curve.

alter table public.stiri_cache
  add column if not exists ai_summary_version int not null default 0;

alter table public.petitii
  add column if not exists ai_summary_version int not null default 0;

comment on column public.stiri_cache.ai_summary_version is
  'Stamped by getOrGenerateAiSummary. When < AI_SUMMARY_VERSION constant, the row is treated as cold cache and regenerated.';
comment on column public.petitii.ai_summary_version is
  'Stamped by getOrGeneratePetitieAiSummary. Same gating as stiri.';

-- ─── Recreate the petitii_with_count view ────────────────────────
-- PostgreSQL freezes the column list at view-creation time, so a
-- `select p.*` from a view created BEFORE migration 025 won't expose
-- the new ai_summary_version column. Drop + recreate to force the
-- expansion to pick it up.
drop view if exists public.petitii_with_count;
create view public.petitii_with_count as
  select
    p.*,
    coalesce(s.signature_count, 0)::int as signature_count
  from public.petitii p
  left join (
    select petitie_id, count(*) as signature_count
    from public.petitie_signatures
    group by petitie_id
  ) s on s.petitie_id = p.id;

select 'Migration 025 (ai_summary_version + view refresh) aplicată.' as status;
