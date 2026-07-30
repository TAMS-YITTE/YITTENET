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
