create table if not exists public.lua_commands (
  id bigint generated always as identity primary key,
  "updateId" bigint,
  "messageId" bigint,
  "chatId" text not null,
  "userId" text,
  username text,
  text text not null,
  command text not null,
  agent text not null,
  intent text,
  payload text,
  source text not null default 'telegram:webhook',
  "receivedAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  status text not null default 'queued',
  "routeAgent" text not null default 'lua',
  approval text not null default 'auto',
  "approvedAt" timestamptz,
  "processedAt" timestamptz,
  result text
);

alter table public.lua_commands
add column if not exists status text not null default 'queued';

alter table public.lua_commands
add column if not exists "routeAgent" text not null default 'lua';

alter table public.lua_commands
add column if not exists approval text not null default 'auto';

alter table public.lua_commands
add column if not exists "approvedAt" timestamptz;

alter table public.lua_commands
add column if not exists "processedAt" timestamptz;

alter table public.lua_commands
add column if not exists result text;

create table if not exists public.lua_memories (
  id bigint generated always as identity primary key,
  source text not null,
  "chatId" text,
  text text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.lua_logs (
  id bigint generated always as identity primary key,
  level text not null default 'info',
  event text not null,
  command text,
  "chatId" text,
  message text,
  "createdAt" timestamptz not null default now()
);

alter table public.lua_logs
add column if not exists message text;

alter table public.lua_commands enable row level security;
alter table public.lua_memories enable row level security;
alter table public.lua_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lua_commands'
      and policyname = 'service role manages lua_commands'
  ) then
    create policy "service role manages lua_commands"
    on public.lua_commands
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lua_memories'
      and policyname = 'service role manages lua_memories'
  ) then
    create policy "service role manages lua_memories"
    on public.lua_memories
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lua_logs'
      and policyname = 'service role manages lua_logs'
  ) then
    create policy "service role manages lua_logs"
    on public.lua_logs
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');
  end if;
end $$;
