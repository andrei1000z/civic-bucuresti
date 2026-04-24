-- Migration 016: add "amanata" lifecycle status + official authority response
--
-- CONTEXT:
-- Autoritățile răspund uneori la sesizări cu un „ne ocupăm mai târziu, e
-- parte dintr-un proiect mai mare" — nici resolved, nici respins. Nevoia
-- unui status intermediar „amânat" (+ textul răspunsului oficial stocat
-- pe rând) reiese din feedback utilizator pe sesizarea 00009 (Novaci,
-- București — răspuns oficial PMB: „intervenții punctuale vor fi
-- analizate în cadrul proiectului de reorganizare urbană").
--
-- CHANGES:
--   - Extinde constraint-ul pe sesizari.status cu 'amanata'
--   - Adaugă sesizari.official_response (text) + sesizari.official_response_at (timestamp)
--   - Nu modifică tipul enum — folosim constraint check (mai ușor de migrat)

-- ─── 1. Relax the status constraint ──────────────────────────────
alter table public.sesizari
  drop constraint if exists sesizari_status_check;

alter table public.sesizari
  add constraint sesizari_status_check
  check (status in ('nou', 'in-lucru', 'rezolvat', 'respins', 'amanata'));

-- ─── 2. Add official response columns ────────────────────────────
alter table public.sesizari
  add column if not exists official_response text,
  add column if not exists official_response_at timestamptz;

comment on column public.sesizari.official_response is
  'Textul răspunsului oficial al autorității, când autorul sau un admin îl primește prin email și îl copiază în sistem. Vizibil pe pagina publică a sesizării.';

comment on column public.sesizari.official_response_at is
  'Timestamp-ul la care răspunsul oficial a fost înregistrat în sistem.';

select 'Migration 016 (status amanata + official_response) aplicată.' as status;
