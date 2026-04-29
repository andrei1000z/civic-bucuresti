-- ============================================================
-- Migration 021: petitii.target_signatures nullable
-- ============================================================
-- target_signatures = NULL înseamnă „nelimitat / cât mai multe semnături"
-- (petițiile naționale fără cap fix, ex: declic.ro). Default rămâne 1000
-- pentru cele care setează un target explicit.
-- Idempotent — safe to re-run.

alter table public.petitii
  alter column target_signatures drop not null;

notify pgrst, 'reload schema';
