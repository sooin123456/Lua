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
  "createdAt" timestamptz not null default now()
);

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
  "createdAt" timestamptz not null default now()
);

alter table public.lua_commands enable row level security;
alter table public.lua_memories enable row level security;
alter table public.lua_logs enable row level security;

create policy "service role manages lua_commands"
on public.lua_commands
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manages lua_memories"
on public.lua_memories
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manages lua_logs"
on public.lua_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
