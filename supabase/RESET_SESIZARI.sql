-- ============================================================
-- Reset sesizari (one-time cleanup)
-- ============================================================
-- Run this in Supabase SQL Editor when you want to clear all
-- sesizari + related votes/comments/timeline/verifications/follows.
-- ON DELETE CASCADE handles the dependent tables automatically.
--
-- WARNING: this is irreversible. Backup first if in doubt.

begin;

-- Delete all sesizari (cascade drops votes, comments, timeline, verifications, follows)
delete from public.sesizari;

-- Reset any sequence if needed (codes are generated server-side, no sequence to reset)

commit;

select 'Toate sesizările au fost șterse.' as status,
       (select count(*) from public.sesizari) as remaining_count;
