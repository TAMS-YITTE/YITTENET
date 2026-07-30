do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'profiles_domain_check'
  ) then
    alter table public.profiles drop constraint if exists profiles_domain_check;
  end if;
end $$;

alter table public.profiles
  add constraint profiles_domain_check
  check (domain is null or domain in ('web3', 'genai', 'nocode', 'legaltech'));
