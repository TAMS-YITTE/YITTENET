-- Chat interne : messagerie temps réel client <-> freelance autour d'une mission.
-- Une conversation = un couple (job, freelance). Elle peut démarrer dès qu'un
-- freelance s'intéresse à une mission (avant même l'acceptation d'un devis).

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
-- RLS  (s'applique AUSSI au temps réel : sans policy SELECT, aucun event reçu)
-- ---------------------------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Conversations : visibles par ses deux participants uniquement
drop policy if exists "Participants can view conversation" on public.conversations;
create policy "Participants can view conversation"
  on public.conversations for select
  using (auth.uid() = client_id or auth.uid() = freelancer_id);

-- Création : le freelance ouvre la conv sur une mission dont le client_id
-- correspond bien au propriétaire réel du job (empêche de forger un client_id).
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

-- Envoi : sender = soi-même ET participant de la conversation
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

-- Marquer comme lu : un participant peut mettre à jour read_at sur les
-- messages de ses conversations (l'UI ne touche que ceux qu'il reçoit).
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
-- Trigger : maintenir conversations.last_message_at à jour (tri de la liste)
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
-- la table est déjà membre de la publication)
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
