-- 1. Ajout de la disponibilité
alter table public.profiles add column if not exists availability_status text not null default 'available';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_availability_check'
  ) then
    alter table public.profiles
      add constraint profiles_availability_check
      check (availability_status in ('available', 'part_time', 'busy'));
  end if;
end $$;

-- 2. Création de la table notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null,
  content text not null,
  read_status boolean not null default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS notifications
alter table public.notifications enable row level security;

drop policy if exists "Users can read their own notifications" on public.notifications;
create policy "Users can read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- 3. Trigger pour le Smart Matching
create or replace function public.notify_freelancers_on_new_job()
returns trigger as $$
begin
  -- Insérer une notification pour chaque freelance dont le domaine correspond
  insert into public.notifications (user_id, type, content, link)
  select 
    p.id, 
    'job_match', 
    'Nouvelle mission correspond à votre domaine : ' || NEW.title, 
    '/jobs'
  from public.profiles p
  where p.role = 'freelancer' and p.domain = NEW.domain;
  
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_job_created_notify on public.jobs;
create trigger on_job_created_notify
  after insert on public.jobs
  for each row execute function public.notify_freelancers_on_new_job();
