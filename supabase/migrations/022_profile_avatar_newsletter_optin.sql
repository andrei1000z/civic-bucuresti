-- Migration 022: avatar + newsletter opt-ins on profiles
-- Run in Supabase SQL Editor

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists newsletter_email_optin boolean not null default false,
  add column if not exists newsletter_sms_optin boolean not null default false;

comment on column public.profiles.avatar_url is
  'Profile picture URL (uploaded via /api/upload to Supabase storage). Optional.';
comment on column public.profiles.newsletter_email_optin is
  'Explicit GDPR consent — weekly civic digest by email. Defaults false; user toggles in /cont.';
comment on column public.profiles.newsletter_sms_optin is
  'Explicit GDPR consent — weekly civic digest by SMS. Requires phone column; defaults false.';

select 'Migration 022 (profile avatar + newsletter opt-ins) aplicată.' as status;
