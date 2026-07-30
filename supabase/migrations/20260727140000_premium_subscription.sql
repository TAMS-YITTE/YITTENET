-- Abonnement Premium freelance (Stripe Billing).
-- Le badge "Vérifié Premium" et le boost de visibilité dans l'annuaire reposent
-- sur ces colonnes, mises à jour EXCLUSIVEMENT par le webhook Stripe (service role).

alter table public.profiles add column if not exists is_premium boolean not null default false;
alter table public.profiles add column if not exists premium_status text;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists premium_current_period_end timestamptz;

-- ---------------------------------------------------------------------------
-- Anti-fraude : la policy existante "Users can update their own profile" laisse
-- un utilisateur modifier toutes ses colonnes. Sans garde-fou, il pourrait se
-- déclarer premium lui-même (is_premium = true). Ce trigger bloque toute
-- modification des colonnes premium sauf par le service role (webhook Stripe).
-- ---------------------------------------------------------------------------
create or replace function public.protect_premium_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.role() vaut 'service_role' quand l'appel vient d'une Edge Function
  -- utilisant la clé service (webhook). Sinon on interdit tout changement.
  if coalesce(auth.role(), '') <> 'service_role' then
    if new.is_premium is distinct from old.is_premium
       or new.premium_status is distinct from old.premium_status
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id
       or new.premium_current_period_end is distinct from old.premium_current_period_end then
      raise exception 'Les champs Premium ne peuvent être modifiés que par le système de facturation.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_premium_columns_trigger on public.profiles;
create trigger protect_premium_columns_trigger
  before update on public.profiles
  for each row execute function public.protect_premium_columns();

create index if not exists profiles_is_premium_idx on public.profiles (is_premium);
create index if not exists profiles_stripe_customer_idx on public.profiles (stripe_customer_id);
