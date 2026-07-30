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

-- No update policy on purpose — status transitions to 'deposited' / 'released'
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
