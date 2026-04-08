-- Migration 014: Make sector nullable (national platform, not just București)
-- The CHECK constraint only allows S1-S6. For non-București complaints, sector should be NULL.

ALTER TABLE public.sesizari DROP CONSTRAINT IF EXISTS sesizari_sector_check;
ALTER TABLE public.sesizari ALTER COLUMN sector DROP NOT NULL;
ALTER TABLE public.sesizari ALTER COLUMN sector SET DEFAULT NULL;
ALTER TABLE public.sesizari ADD CONSTRAINT sesizari_sector_check
  CHECK (sector IS NULL OR sector IN ('S1','S2','S3','S4','S5','S6'));

select 'Migration 014 (sector nullable) aplicată.' as status;
