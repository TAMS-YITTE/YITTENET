-- Fixes signup failing with "new row violates row-level security policy for table profiles".
--
-- Root cause: Signup.jsx inserted into public.profiles from the client right after
-- supabase.auth.signUp(). If email confirmation is enabled on this project, signUp()
-- does not return an active session, so the insert runs as the anon role and is
-- rejected by RLS (auth.uid() is null, can never equal the new user's id).
--
-- Fix: create the profile row server-side via a SECURITY DEFINER trigger on
-- auth.users, fed by signUp's `options.data` metadata. This works regardless of
-- whether a client session exists yet.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, portfolio_url, cv_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'portfolio_url',
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Client-side insert is no longer used for signup, but keep a narrow policy in
-- case a profile ever needs to be created directly by its owner (e.g. backfill).
alter table public.profiles enable row level security;

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
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
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  freelancer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (job_id)
);

alter table public.reviews enable row level security;

drop policy if exists "Reviews are publicly readable" on public.reviews;
create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

-- A client can only review a job they own, and only once it's completed.
-- This is enforced at the database level, not just in the UI, so a client
-- can't fabricate a 5-star review for a mission that never happened.
drop policy if exists "Clients can review their own completed jobs" on public.reviews;
create policy "Clients can review their own completed jobs"
  on public.reviews for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.jobs
      where jobs.id = job_id
        and jobs.client_id = auth.uid()
        and jobs.status = 'completed'
    )
  );

create index if not exists reviews_freelancer_id_idx on public.reviews (freelancer_id);
-- escrow_transactions already existed (created by an earlier session) with a
-- minimal shape: id, job_id, amount, status, stripe_payment_id, created_at.
-- This migration adds the columns the accept-and-pay / release flow needs,
-- instead of `create table if not exists` (which is a no-op against an
-- already-existing table and silently skips these columns).

alter table public.escrow_transactions add column if not exists proposal_id uuid references public.proposals(id) on delete cascade;
alter table public.escrow_transactions add column if not exists client_id uuid references public.profiles(id);
alter table public.escrow_transactions add column if not exists freelancer_id uuid references public.profiles(id);
alter table public.escrow_transactions add column if not exists stripe_checkout_session_id text;
alter table public.escrow_transactions add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'escrow_transactions_status_check'
  ) then
    alter table public.escrow_transactions
      add constraint escrow_transactions_status_check
      check (status in ('pending', 'deposited', 'released', 'refunded'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'escrow_transactions_job_id_key'
  ) then
    alter table public.escrow_transactions
      add constraint escrow_transactions_job_id_key unique (job_id);
  end if;
end $$;

alter table public.escrow_transactions enable row level security;

drop policy if exists "Parties can view their escrow transactions" on public.escrow_transactions;
create policy "Parties can view their escrow transactions"
  on public.escrow_transactions for select
  using (auth.uid() = client_id or auth.uid() = freelancer_id);

-- No update policy on purpose ÔÇö status transitions to 'deposited' / 'released'
-- only happen server-side (Edge Functions using the service role, after
-- verifying payment / ownership). See supabase/functions/README.md.
drop policy if exists "Clients can open escrow for their own jobs" on public.escrow_transactions;
create policy "Clients can open escrow for their own jobs"
  on public.escrow_transactions for insert
  with check (
    auth.uid() = client_id
    and exists (select 1 from public.jobs where jobs.id = job_id and jobs.client_id = auth.uid())
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists escrow_transactions_set_updated_at on public.escrow_transactions;
create trigger escrow_transactions_set_updated_at
  before update on public.escrow_transactions
  for each row execute function public.set_updated_at();

create index if not exists escrow_transactions_job_id_idx on public.escrow_transactions (job_id);
-- Chat interne : messagerie temps r├®el client <-> freelance autour d'une mission.
-- Une conversation = un couple (job, freelance). Elle peut d├®marrer d├¿s qu'un
-- freelance s'int├®resse ├á une mission (avant m├¬me l'acceptation d'un devis).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  freelancer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (job_id, freelancer_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists conversations_client_idx on public.conversations (client_id);
create index if not exists conversations_freelancer_idx on public.conversations (freelancer_id);

-- ---------------------------------------------------------------------------
-- RLS  (s'applique AUSSI au temps r├®el : sans policy SELECT, aucun event re├ºu)
-- ---------------------------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Conversations : visibles par ses deux participants uniquement
drop policy if exists "Participants can view conversation" on public.conversations;
create policy "Participants can view conversation"
  on public.conversations for select
  using (auth.uid() = client_id or auth.uid() = freelancer_id);

-- Cr├®ation : le freelance ouvre la conv sur une mission dont le client_id
-- correspond bien au propri├®taire r├®el du job (emp├¬che de forger un client_id).
drop policy if exists "Freelancer can open conversation" on public.conversations;
create policy "Freelancer can open conversation"
  on public.conversations for insert
  with check (
    auth.uid() = freelancer_id
    and exists (
      select 1 from public.jobs
      where jobs.id = conversations.job_id
        and jobs.client_id = conversations.client_id
    )
  );

-- Le client peut lui aussi initier (ex: inviter un freelance depuis les matches)
drop policy if exists "Client can open conversation" on public.conversations;
create policy "Client can open conversation"
  on public.conversations for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.jobs
      where jobs.id = conversations.job_id
        and jobs.client_id = auth.uid()
    )
  );

-- Messages : lisibles par les participants de la conversation
drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.client_id or auth.uid() = c.freelancer_id)
    )
  );

-- Envoi : sender = soi-m├¬me ET participant de la conversation
drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.client_id or auth.uid() = c.freelancer_id)
    )
  );

-- Marquer comme lu : un participant peut mettre ├á jour read_at sur les
-- messages de ses conversations (l'UI ne touche que ceux qu'il re├ºoit).
drop policy if exists "Participants can mark messages read" on public.messages;
create policy "Participants can mark messages read"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.client_id or auth.uid() = c.freelancer_id)
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.client_id or auth.uid() = c.freelancer_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Trigger : maintenir conversations.last_message_at ├á jour (tri de la liste)
-- ---------------------------------------------------------------------------
create or replace function public.bump_conversation_timestamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.bump_conversation_timestamp();

-- ---------------------------------------------------------------------------
-- Realtime : diffuser les inserts de messages (idempotent : ne casse pas si
-- la table est d├®j├á membre de la publication)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
-- Conformit├® l├®gale : tra├ºabilit├® du consentement CGV/CGU et RGPD ├á l'inscription.
-- On horodate l'acceptation (c'est la date qui fait foi en cas de litige / contr├┤le CNIL).
-- Le consentement est transmis via les metadata de signUp() et ├®crit par le trigger
-- server-side handle_new_user (cf. 20260721120000), pour rester coh├®rent avec le
-- flux d'inscription (pas de session client au moment de la cr├®ation du profil).

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

-- Le trigger on_auth_user_created existe d├®j├á (migration 20260721120000) et pointe
-- sur cette fonction ; le remplacer via create or replace suffit, pas besoin de le recr├®er.
-- Abonnement Premium freelance (Stripe Billing).
-- Le badge "V├®rifi├® Premium" et le boost de visibilit├® dans l'annuaire reposent
-- sur ces colonnes, mises ├á jour EXCLUSIVEMENT par le webhook Stripe (service role).

alter table public.profiles add column if not exists is_premium boolean not null default false;
alter table public.profiles add column if not exists premium_status text;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists premium_current_period_end timestamptz;

-- ---------------------------------------------------------------------------
-- Anti-fraude : la policy existante "Users can update their own profile" laisse
-- un utilisateur modifier toutes ses colonnes. Sans garde-fou, il pourrait se
-- d├®clarer premium lui-m├¬me (is_premium = true). Ce trigger bloque toute
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
  -- utilisant la cl├® service (webhook). Sinon on interdit tout changement.
  if coalesce(auth.role(), '') <> 'service_role' then
    if new.is_premium is distinct from old.is_premium
       or new.premium_status is distinct from old.premium_status
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id
       or new.premium_current_period_end is distinct from old.premium_current_period_end then
      raise exception 'Les champs Premium ne peuvent ├¬tre modifi├®s que par le syst├¿me de facturation.';
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
-- Avis publics sur les produits digitaux de la Boutique.
-- Sym├®trique de la table reviews (missions) : un avis n'est possible que si
-- l'utilisateur a r├®ellement achet├® le produit (achat 'completed').

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.digital_products(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (product_id, client_id)
);

alter table public.product_reviews enable row level security;

drop policy if exists "Product reviews are publicly readable" on public.product_reviews;
create policy "Product reviews are publicly readable"
  on public.product_reviews for select
  using (true);

-- Un client ne peut noter qu'un produit qu'il a effectivement achet├® (achat
-- 'completed'). V├®rifi├® au niveau base, pas seulement dans l'UI.
drop policy if exists "Buyers can review purchased products" on public.product_reviews;
create policy "Buyers can review purchased products"
  on public.product_reviews for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.purchases
      where purchases.product_id = product_reviews.product_id
        and purchases.client_id = auth.uid()
        and purchases.status = 'completed'
    )
  );

create index if not exists product_reviews_product_idx on public.product_reviews (product_id);
