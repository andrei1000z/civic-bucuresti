-- Migration 017: user-submitted interruption tips
--
-- User-ii pot raporta întreruperi observate direct în stradă (text
-- obligatoriu, foto opțional, email opțional). Admin-ul vede lista
-- în /admin/intreruperi și poate promova în catalogul principal
-- sau marca ca spam/duplicat.

create table if not exists public.interruption_submissions (
  id uuid primary key default gen_random_uuid(),
  -- Conținut introdus de user
  text text not null,
  image_url text,             -- Supabase storage URL
  email text,                 -- opțional, pentru follow-up
  -- Context captat automat
  ip_hash text,               -- sha256(ip) pentru rate-limit
  user_agent text,
  locality_guess text,        -- dacă se poate deduce din IP/context
  -- Moderare
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected', 'duplicate')),
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  -- Dacă admin promovează, aici puteam lega de entry-ul final
  promoted_to_id text,         -- Interruption.id din src/data/intreruperi.ts
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_isub_status on public.interruption_submissions(status);
create index if not exists idx_isub_created on public.interruption_submissions(created_at desc);
create index if not exists idx_isub_iphash on public.interruption_submissions(ip_hash);

comment on table public.interruption_submissions is
  'User-submitted tips despre întreruperi observate. Admin promovează în catalogul static sau marchează ca spam.';

-- RLS: public poate insert (anyone can submit), doar admin poate
-- citi/edita/șterge.
alter table public.interruption_submissions enable row level security;

drop policy if exists isub_insert_public on public.interruption_submissions;
create policy isub_insert_public on public.interruption_submissions
  for insert to anon, authenticated
  with check (true);

drop policy if exists isub_read_admin on public.interruption_submissions;
create policy isub_read_admin on public.interruption_submissions
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists isub_update_admin on public.interruption_submissions;
create policy isub_update_admin on public.interruption_submissions
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists isub_delete_admin on public.interruption_submissions;
create policy isub_delete_admin on public.interruption_submissions
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

select 'Migration 017 (interruption_submissions) aplicată.' as status;
