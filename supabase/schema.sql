-- ============================================================
-- Civic București — Supabase schema
-- ============================================================
-- Run this file in the Supabase SQL Editor.
-- Idempotent: safe to re-run (drop + recreate pattern).

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 2. TABLES
-- ============================================================

-- profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Cetățean',
  created_at timestamptz default now()
);

-- sesizari (citizen complaints)
create table if not exists public.sesizari (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  author_email text,
  tip text not null check (tip in ('groapa','trotuar','iluminat','copac','gunoi','parcare','graffiti','altele')),
  titlu text not null,
  locatie text not null,
  sector text not null check (sector in ('S1','S2','S3','S4','S5','S6')),
  lat double precision not null,
  lng double precision not null,
  descriere text not null,
  formal_text text,
  status text not null default 'nou' check (status in ('nou','in-lucru','rezolvat','respins')),
  imagini text[] default '{}',
  publica boolean default true,
  moderation_status text default 'approved' check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- votes (1 vote per user per sesizare)
create table if not exists public.sesizare_votes (
  sesizare_id uuid references public.sesizari(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz default now(),
  primary key (sesizare_id, user_id)
);

-- comments
create table if not exists public.sesizare_comments (
  id uuid primary key default gen_random_uuid(),
  sesizare_id uuid references public.sesizari(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  body text not null check (length(body) > 0 and length(body) <= 2000),
  created_at timestamptz default now()
);

-- timeline events
create table if not exists public.sesizare_timeline (
  id uuid primary key default gen_random_uuid(),
  sesizare_id uuid references public.sesizari(id) on delete cascade,
  event_type text not null,
  description text,
  created_at timestamptz default now()
);

-- chat sessions (civic assistant)
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
create index if not exists idx_sesizari_publica_data on public.sesizari(publica, created_at desc) where moderation_status = 'approved';
create index if not exists idx_sesizari_sector on public.sesizari(sector);
create index if not exists idx_sesizari_status on public.sesizari(status);
create index if not exists idx_sesizari_code on public.sesizari(code);
create index if not exists idx_votes_sesizare on public.sesizare_votes(sesizare_id);
create index if not exists idx_comments_sesizare on public.sesizare_comments(sesizare_id, created_at);
create index if not exists idx_timeline_sesizare on public.sesizare_timeline(sesizare_id, created_at);
create index if not exists idx_chat_messages_session on public.chat_messages(session_id, created_at);

-- ============================================================
-- 4. VIEWS
-- ============================================================
create or replace view public.sesizari_feed as
  select s.*,
    coalesce(sum(case when v.value = 1 then 1 else 0 end), 0)::int as upvotes,
    coalesce(sum(case when v.value = -1 then 1 else 0 end), 0)::int as downvotes,
    coalesce(sum(v.value), 0)::int as voturi_net,
    (select count(*) from public.sesizare_comments c where c.sesizare_id = s.id)::int as nr_comentarii
  from public.sesizari s
  left join public.sesizare_votes v on v.sesizare_id = s.id
  where s.moderation_status = 'approved' and s.publica = true
  group by s.id;

-- ============================================================
-- 5. TRIGGER: auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 6. TRIGGER: auto-timeline on sesizare insert
-- ============================================================
create or replace function public.handle_new_sesizare()
returns trigger
language plpgsql
as $$
begin
  insert into public.sesizare_timeline (sesizare_id, event_type, description)
  values (new.id, 'depusa', 'Sesizare depusă de cetățean');
  return new;
end;
$$;

drop trigger if exists on_sesizare_created on public.sesizari;
create trigger on_sesizare_created
  after insert on public.sesizari
  for each row execute function public.handle_new_sesizare();

-- ============================================================
-- 7. TRIGGER: updated_at
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_sesizari_updated_at on public.sesizari;
create trigger touch_sesizari_updated_at
  before update on public.sesizari
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.sesizari enable row level security;
alter table public.sesizare_votes enable row level security;
alter table public.sesizare_comments enable row level security;
alter table public.sesizare_timeline enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- profiles
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- sesizari: public can read approved+public, owners read their own
drop policy if exists "sesizari_read_public" on public.sesizari;
create policy "sesizari_read_public" on public.sesizari for select
  using (publica = true and moderation_status = 'approved');

drop policy if exists "sesizari_read_own" on public.sesizari;
create policy "sesizari_read_own" on public.sesizari for select
  using (auth.uid() is not null and auth.uid() = user_id);

-- Anyone can insert (anonymous submission allowed) — moderation handled server-side
drop policy if exists "sesizari_insert_anyone" on public.sesizari;
create policy "sesizari_insert_anyone" on public.sesizari for insert with check (true);

-- Update only by owner within 1h
drop policy if exists "sesizari_update_own" on public.sesizari;
create policy "sesizari_update_own" on public.sesizari for update
  using (auth.uid() = user_id and created_at > now() - interval '1 hour');

-- votes: anyone reads, authenticated insert/update/delete own
drop policy if exists "votes_read_all" on public.sesizare_votes;
create policy "votes_read_all" on public.sesizare_votes for select using (true);

drop policy if exists "votes_insert_auth" on public.sesizare_votes;
create policy "votes_insert_auth" on public.sesizare_votes for insert with check (auth.uid() = user_id);

drop policy if exists "votes_update_own" on public.sesizare_votes;
create policy "votes_update_own" on public.sesizare_votes for update using (auth.uid() = user_id);

drop policy if exists "votes_delete_own" on public.sesizare_votes;
create policy "votes_delete_own" on public.sesizare_votes for delete using (auth.uid() = user_id);

-- comments: anyone reads, authenticated write
drop policy if exists "comments_read_all" on public.sesizare_comments;
create policy "comments_read_all" on public.sesizare_comments for select using (true);

drop policy if exists "comments_insert_auth" on public.sesizare_comments;
create policy "comments_insert_auth" on public.sesizare_comments for insert with check (auth.uid() = user_id);

drop policy if exists "comments_delete_own" on public.sesizare_comments;
create policy "comments_delete_own" on public.sesizare_comments for delete using (auth.uid() = user_id);

-- timeline: anyone reads (inserted via trigger/service role only)
drop policy if exists "timeline_read_all" on public.sesizare_timeline;
create policy "timeline_read_all" on public.sesizare_timeline for select using (true);

-- chat: open access (session-scoped, no user_id)
drop policy if exists "chat_sessions_all" on public.chat_sessions;
create policy "chat_sessions_all" on public.chat_sessions for all using (true) with check (true);

drop policy if exists "chat_messages_all" on public.chat_messages;
create policy "chat_messages_all" on public.chat_messages for all using (true) with check (true);

-- ============================================================
-- 9. STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sesizari-photos',
  'sesizari-photos',
  true,
  5242880,  -- 5 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies
drop policy if exists "photos_read_public" on storage.objects;
create policy "photos_read_public" on storage.objects for select
  using (bucket_id = 'sesizari-photos');

drop policy if exists "photos_upload_anyone" on storage.objects;
create policy "photos_upload_anyone" on storage.objects for insert
  with check (bucket_id = 'sesizari-photos');

-- ============================================================
-- 10. REALTIME
-- ============================================================
-- Enable realtime for sesizari, comments, timeline
alter publication supabase_realtime add table public.sesizari;
alter publication supabase_realtime add table public.sesizare_comments;
alter publication supabase_realtime add table public.sesizare_timeline;
alter publication supabase_realtime add table public.sesizare_votes;

-- Done!
select 'Schema Civic București instalată cu succes.' as status;
