-- Conformité légale : traçabilité du consentement CGV/CGU et RGPD à l'inscription.
-- On horodate l'acceptation (c'est la date qui fait foi en cas de litige / contrôle CNIL).
-- Le consentement est transmis via les metadata de signUp() et écrit par le trigger
-- server-side handle_new_user (cf. 20260721120000), pour rester cohérent avec le
-- flux d'inscription (pas de session client au moment de la création du profil).

alter table public.profiles add column if not exists accepted_terms_at timestamptz;
alter table public.profiles add column if not exists accepted_privacy_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, role, full_name, portfolio_url, cv_url,
    accepted_terms_at, accepted_privacy_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'portfolio_url',
    null,
    case when (new.raw_user_meta_data ->> 'accepted_terms') = 'true' then now() end,
    case when (new.raw_user_meta_data ->> 'accepted_privacy') = 'true' then now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Le trigger on_auth_user_created existe déjà (migration 20260721120000) et pointe
-- sur cette fonction ; le remplacer via create or replace suffit, pas besoin de le recréer.
