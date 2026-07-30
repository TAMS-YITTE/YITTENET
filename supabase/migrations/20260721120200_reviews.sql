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
