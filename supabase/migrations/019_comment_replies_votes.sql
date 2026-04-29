-- Migration 019: comment threading (replies) + comment votes (like/dislike)
--
-- CONTEXT
-- User-ul a cerut pe comentariile sesizărilor:
--   1. Reply la comentariu (threading 1 nivel — Reddit-style flat replies, NOT nested infinit)
--   2. Like / Dislike pe fiecare comentariu (similar cu vote-ul pe sesizare)
--
-- DESIGN
--   parent_comment_id: nullable FK la același sesizare_comments — null = top-level,
--     non-null = reply la un comentariu top-level. Permite doar 1 nivel adâncime
--     pentru a evita threading complicat (Reddit-style flat replies under top-level).
--   sesizare_comment_votes: 1-row-per-(user, comment) cu value -1 / +1 (like / dislike)
--     similar cu sesizare_votes care există deja pentru sesizări.
--
-- BACKWARDS-COMPAT: parent_comment_id e nullable → comentariile existente
-- rămân top-level (NULL). Nu se șterge nimic.

-- ─── 1. Add parent_comment_id pentru threading ──────────────────
alter table public.sesizare_comments
  add column if not exists parent_comment_id uuid references public.sesizare_comments(id) on delete cascade;

create index if not exists idx_sesizare_comments_parent
  on public.sesizare_comments(parent_comment_id);

comment on column public.sesizare_comments.parent_comment_id is
  'NULL = comentariu top-level. UUID = reply la comentariul cu acest ID. Permite doar 1 nivel adâncime în UI.';

-- ─── 2. Comment votes table ─────────────────────────────────────
create table if not exists public.sesizare_comment_votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.sesizare_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index if not exists idx_comment_votes_comment
  on public.sesizare_comment_votes(comment_id);
create index if not exists idx_comment_votes_user
  on public.sesizare_comment_votes(user_id);

comment on table public.sesizare_comment_votes is
  'Like (+1) / Dislike (-1) pe comentarii. 1 row per (comment, user) — un singur vot per user.';

-- RLS
alter table public.sesizare_comment_votes enable row level security;

create policy "comment_votes select all" on public.sesizare_comment_votes
  for select using (true);

create policy "comment_votes insert authenticated" on public.sesizare_comment_votes
  for insert with check (auth.uid() = user_id);

create policy "comment_votes update own" on public.sesizare_comment_votes
  for update using (auth.uid() = user_id);

create policy "comment_votes delete own" on public.sesizare_comment_votes
  for delete using (auth.uid() = user_id);

select 'Migration 019 (comment replies + votes) aplicată.' as status;
