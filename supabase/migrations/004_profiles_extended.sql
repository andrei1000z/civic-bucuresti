-- Migration 004: extend profiles with full_name, address, phone
-- Run in Supabase SQL Editor

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists address text,
  add column if not exists phone text;

-- Update trigger to use auth metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

select 'Migration 004 (profiles extended) aplicată.' as status;
