-- ============================================================
-- Migration 008: Drop unused chat_sessions + chat_messages tables
-- ============================================================
-- These tables had RLS policy `using (true) with check (true)` which let
-- anyone with the anon key read/write anything. They are not referenced
-- by any API route — the AI chat assistant uses sessionStorage client-side.
-- Safe to drop completely.

drop table if exists public.chat_messages cascade;
drop table if exists public.chat_sessions cascade;

-- Remove them from realtime publication if they were added
do $$
begin
  alter publication supabase_realtime drop table public.chat_messages;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime drop table public.chat_sessions;
exception when others then null;
end $$;

select 'Migration 008: chat tables dropped.' as status;
