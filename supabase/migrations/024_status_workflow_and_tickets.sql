-- ============================================================
-- Migration 024: granular status workflow + community status tickets
-- ============================================================
--
-- CONTEXT:
-- Until now sesizari.status was a 5-value enum (nou / in-lucru / amanata
-- / rezolvat / respins). In practice the journey is much richer — the
-- authority registers the request (gets a registration nr.), forwards
-- it to a different department / institution, the police runs a check,
-- the city installs bollards, etc. We want each of those steps to be
-- a first-class status, both so the admin can mark them and so the
-- citizen sees a meaningful timeline.
--
-- Additionally, we want any logged-in citizen to be able to PROPOSE
-- a status update (with photo / receipt / registration nr) so the
-- admin doesn't have to discover updates manually. Admin reviews the
-- proposal and, on approve, the status flips + a timeline row is
-- written automatically.
--
-- CHANGES:
--   1. Extend sesizari.status check constraint with the new values:
--      'inregistrata', 'redirectionata', 'actiune-autoritate',
--      'interventie'. Old values stay valid (in-lucru / amanata) so
--      existing data isn't broken.
--   2. New table public.sesizare_status_tickets — citizen-submitted
--      proposals for a status change.
--   3. RLS: insert by any authenticated user, read by admin or by the
--      proposer themselves, decide (update) by admin only.
--   4. Index on (decision, created_at) for the admin queue.
--   5. Realtime publication so the admin queue lights up live.

-- ─── 1. Relax the status constraint to include the new values ──────
alter table public.sesizari
  drop constraint if exists sesizari_status_check;

alter table public.sesizari
  add constraint sesizari_status_check
  check (status in (
    'nou',
    'inregistrata',
    'redirectionata',
    'in-lucru',
    'actiune-autoritate',
    'interventie',
    'amanata',
    'rezolvat',
    'respins'
  ));

-- ─── 2. Tickets table ──────────────────────────────────────────────
create table if not exists public.sesizare_status_tickets (
  id uuid primary key default gen_random_uuid(),
  sesizare_id uuid not null references public.sesizari(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  proposed_status text not null check (proposed_status in (
    'inregistrata',
    'redirectionata',
    'in-lucru',
    'actiune-autoritate',
    'interventie',
    'amanata',
    'rezolvat',
    'respins'
  )),
  note text not null check (length(trim(note)) > 0 and length(note) <= 1000),
  proof_url text,
  decision text not null default 'pending'
    check (decision in ('pending', 'approved', 'rejected')),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now()
);

comment on table public.sesizare_status_tickets is
  'Citizen-proposed status updates pe o sesizare. Admin aprobă/respinge — la aprobare se aplică automat status + timeline event.';

create index if not exists idx_status_tickets_pending
  on public.sesizare_status_tickets(decision, created_at desc)
  where decision = 'pending';
create index if not exists idx_status_tickets_sesizare
  on public.sesizare_status_tickets(sesizare_id, created_at desc);
create index if not exists idx_status_tickets_user
  on public.sesizare_status_tickets(user_id, created_at desc);

-- ─── 3. RLS ────────────────────────────────────────────────────────
alter table public.sesizare_status_tickets enable row level security;

-- Read: admin sees everything; the proposer sees their own.
drop policy if exists "tickets_read_admin_or_owner" on public.sesizare_status_tickets;
create policy "tickets_read_admin_or_owner"
  on public.sesizare_status_tickets for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Insert: any authenticated user, scoped to their own user_id.
drop policy if exists "tickets_insert_auth" on public.sesizare_status_tickets;
create policy "tickets_insert_auth"
  on public.sesizare_status_tickets for insert
  with check (auth.uid() = user_id);

-- Update: admin only (decide / annotate).
drop policy if exists "tickets_update_admin" on public.sesizare_status_tickets;
create policy "tickets_update_admin"
  on public.sesizare_status_tickets for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Delete: admin only (rare — e.g. spam cleanup).
drop policy if exists "tickets_delete_admin" on public.sesizare_status_tickets;
create policy "tickets_delete_admin"
  on public.sesizare_status_tickets for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── 4. Realtime ───────────────────────────────────────────────────
do $$
begin
  alter publication supabase_realtime add table public.sesizare_status_tickets;
exception when duplicate_object then null;
end $$;

select 'Migration 024 (status workflow + tickets) aplicată cu succes.' as status;
