-- Migration Stripe Connect
-- 1. Ajout des colonnes sur les profils
alter table public.profiles add column if not exists stripe_charges_enabled boolean not null default false;
alter table public.profiles add column if not exists stripe_payouts_enabled boolean not null default false;

-- Anti-fraude pour les champs Connect
create or replace function public.protect_connect_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if new.stripe_charges_enabled is distinct from old.stripe_charges_enabled
       or new.stripe_payouts_enabled is distinct from old.stripe_payouts_enabled then
      raise exception 'Les champs Stripe Connect ne peuvent être modifiés que par le système.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_connect_columns_trigger on public.profiles;
create trigger protect_connect_columns_trigger
  before update on public.profiles
  for each row execute function public.protect_connect_columns();

-- 2. Ajout des colonnes sur escrow_transactions
alter table public.escrow_transactions add column if not exists commission_rate numeric;
alter table public.escrow_transactions add column if not exists platform_fee integer;
alter table public.escrow_transactions add column if not exists stripe_transfer_id text;

-- 3. Ajout des colonnes sur purchases
alter table public.purchases add column if not exists platform_fee integer;
alter table public.purchases add column if not exists stripe_transfer_id text;
