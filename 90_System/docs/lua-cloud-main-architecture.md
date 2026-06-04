---
type: architecture
status: active
last_updated: 2026-06-04
---

# Lua Cloud Main Architecture

Lua Cloud Main is the always-on control plane for Lua. The local Obsidian vault remains the human-readable memory, but the main agent must also run when the user's computer is off.

## Decision

Use this paid stack first:

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Railway Hobby | Simple always-on Node service, deploys from GitHub, good enough under the $50/month budget |
| Database | Supabase Pro | Managed Postgres for commands, memories, task state, and logs |
| Queue/Schedule | Upstash QStash Free/PAYG later | Add retries and scheduled follow-ups after the webhook path is stable |
| Command Channel | Telegram webhook | Lua receives commands without local polling |
| Human Memory | Obsidian sync | The user reads decisions, summaries, and task state in Obsidian |

Target monthly baseline: about $30 before LLM/API usage.

## Runtime Boundary

Lua Main is a router and memory layer, not a model host.

It should:

- accept Telegram webhook commands
- validate webhook secrets
- normalize commands into durable records
- write command, memory, and log rows into Supabase
- send short Telegram acknowledgements
- route expensive or risky work to Codex, Claude, or future workers

It should not:

- execute trades
- publish public content
- push to GitHub
- mutate Notion or Notion externally
- expose tokens or secrets in replies

Those actions still require explicit approval.

## First Command Set

| Command | Meaning | First response |
|---|---|---|
| `/lua status` | Report runtime health and counts | Reply with status text |
| `/lua next` | Ask for next action | Queue command for router |
| `/lua remember` | Store a durable memory | Save to `lua_memories` |
| `/lua work` | Start or continue work | Queue command for router |
| `/lua run TASK-ID` | Continue a known task | Queue command for router |

## Data Flow

```text
Telegram
→ Railway `/webhooks/telegram`
→ Lua Cloud Main command normalizer
→ Supabase `lua_commands`
→ optional Supabase `lua_memories`
→ Supabase `lua_logs`
→ Telegram acknowledgement
→ later: Obsidian sync/export and worker dispatch
```

## Supabase Tables

The first schema lives in `90_System/lua_cloud_main/supabase_schema.sql`.

- `lua_commands`: raw incoming commands and routing metadata
- `lua_memories`: memories captured from `/lua remember`
- `lua_logs`: operational events and errors

## Railway Environment

Required:

```text
PORT=3000
LUA_DEPLOYMENT_TARGET=railway
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` must only live in Railway or local `.env`. It must never be committed.

## Deployment Steps

1. Create Supabase project.
2. Run `90_System/lua_cloud_main/supabase_schema.sql` in Supabase SQL editor.
3. Create Railway project from the Lua GitHub repo.
4. Set Railway start command:

```bash
npm run cloud:main
```

5. Add Railway environment variables.
6. Set Telegram webhook:

```bash
npm run cloud:webhook:dry-run -- --url https://YOUR-RAILWAY-DOMAIN
npm run cloud:webhook:set -- --url https://YOUR-RAILWAY-DOMAIN
```

7. Send `/lua status Lua` to Telegram.
8. Check Railway logs and Supabase `lua_commands`.

## Prepared Local Commands

These can be run before or after deployment:

```bash
npm run cloud:check-env
npm run cloud:main
npm run cloud:webhook:dry-run -- --url https://YOUR-RAILWAY-DOMAIN
npm run cloud:webhook:set -- --url https://YOUR-RAILWAY-DOMAIN
```

`cloud:webhook:dry-run` does not call Telegram and does not print the bot token.

## Evolution Path

Phase 1:

- Telegram webhook
- Supabase command/memory/log storage
- status/remember replies

Phase 2:

- command router for `/lua next`, `/lua work`, `/lua run TASK-ID`
- Obsidian export job
- status report rendering from Supabase

Phase 3:

- Upstash QStash queue and scheduled follow-ups
- Codex/Claude worker dispatch
- web dashboard with Supabase Auth

Phase 4:

- skill registry and workflow learning
- per-user customization package
- hosted Lua template for other users
