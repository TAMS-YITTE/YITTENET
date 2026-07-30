-- Adds the columns the matching algorithm, public profile page, and future
-- Stripe Connect integration rely on. Guarded so this is safe to run even if
-- some columns were already added manually via the Studio UI.

alter table public.profiles add column if not exists domain text;
alter table public.profiles add column if not exists experience_level text;
alter table public.profiles add column if not exists skills text[] not null default '{}';
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists verified boolean not null default false;
alter table public.profiles add column if not exists stripe_account_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_domain_check'
  ) then
    alter table public.profiles
      add constraint profiles_domain_check
      check (domain is null or domain in ('web3', 'genai', 'nocode'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_experience_level_check'
  ) then
    alter table public.profiles
      add constraint profiles_experience_level_check
      check (experience_level is null or experience_level in ('junior', 'confirme', 'expert'));
  end if;
end $$;
