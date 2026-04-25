-- Migration 018: feedback / contact submissions
--
-- User-ii care au întrebări (GDPR, sugestii, raportare bug, contact
-- general) pot scrie direct prin formularul de pe site, fără să fie
-- nevoie de email expus public. Admin vede submisiile în
-- /admin/feedback și răspunde manual la cele cu email opțional.

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  -- Conținut
  text text not null,
  email text,                     -- opțional, pentru follow-up
  topic text,                     -- 'bug' | 'gdpr' | 'idea' | 'altele' | etc.
  page_path text,                 -- pagina de pe care a fost trimis (UX context)
  -- Tehnic (anti-spam)
  ip_hash text,
  user_agent text,
  -- Moderare
  status text not null default 'pending'
    check (status in ('pending', 'replied', 'archived', 'spam')),
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fb_status on public.feedback_submissions(status);
create index if not exists idx_fb_created on public.feedback_submissions(created_at desc);
create index if not exists idx_fb_iphash on public.feedback_submissions(ip_hash);
create index if not exists idx_fb_topic on public.feedback_submissions(topic);

comment on table public.feedback_submissions is
  'Submisii de feedback / contact / raportări de la useri. Înlocuiește expunerea publică a unui email contact@civia.ro.';

-- RLS: anonim poate insert, doar admin poate citi/edita/șterge
alter table public.feedback_submissions enable row level security;

drop policy if exists fb_insert_public on public.feedback_submissions;
create policy fb_insert_public on public.feedback_submissions
  for insert to anon, authenticated
  with check (true);

drop policy if exists fb_read_admin on public.feedback_submissions;
create policy fb_read_admin on public.feedback_submissions
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists fb_update_admin on public.feedback_submissions;
create policy fb_update_admin on public.feedback_submissions
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists fb_delete_admin on public.feedback_submissions;
create policy fb_delete_admin on public.feedback_submissions
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

select 'Migration 018 (feedback_submissions) aplicată.' as status;
