-- Migration 003: expand SESIZARE_TIPURI with more categories
-- Run in Supabase SQL Editor

alter table public.sesizari drop constraint if exists sesizari_tip_check;
alter table public.sesizari add constraint sesizari_tip_check
  check (tip in (
    'groapa','trotuar','iluminat','copac','gunoi','parcare',
    'stalpisori','canalizare','semafor','pietonal',
    'graffiti','mobilier','zgomot','animale','transport',
    'altele'
  ));

select 'Migration 003 (expanded tipuri) aplicată.' as status;
