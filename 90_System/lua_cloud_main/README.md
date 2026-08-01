# Lua Cloud Main

Always-on Lua runtime for Railway + Supabase + Telegram webhook.

## Subscription-based Mac Worker

Lua can use existing Claude and ChatGPT subscriptions without AI API keys. Railway receives and approves work; a paired Mac runs Claude Code or Codex CLI and returns the result through Railway.

1. Confirm subscription logins:

```bash
npm run cloud:worker:check
```

2. If Claude is not logged in, run `claude` once and choose the Claude App subscription login. Codex should report `Logged in using ChatGPT`.

3. Send `/lua pair` to `@Lua_mainbot`, then use the one-time code within ten minutes:

```bash
npm run cloud:worker:pair -- YOUR_PAIR_CODE
```

4. Run one poll safely:

```bash
npm run cloud:worker:once
```

5. Install the 24-hour macOS LaunchAgent after pairing:

```bash
npm run cloud:worker:install
npm run cloud:worker:status
```

The pairing token is stored only in the git-ignored `.env.worker` file with mode `0600`. Telegram, Supabase service-role, Claude, and Codex credentials are never copied into that file. The Mac must be awake, online, and signed into the user session for the LaunchAgent to work.

## Local Run

```bash
npm run cloud:main
```

Health check:

```bash
curl http://localhost:3000/health
```

Check cloud environment without printing secret values:

```bash
npm run cloud:check-env
```

Check whether Supabase tables exist without printing secret values:

```bash
npm run cloud:supabase:check
```

Process queued commands:

```bash
npm run cloud:process
```

Create a local Codex handoff note from the latest Telegram todo or approved Codex task:

```bash
npm run cloud:codex:next
```

This writes a planned handoff into `90_System/80_Lua_Details/Command Runs/` so Codex can pick up the latest Telegram todo as repo work without exposing Supabase or Telegram secrets.

Useful command behavior in v1:

```text
/lua todo :: <next action>  -> captures a todo and confirms it
/lua next                  -> recommends the latest stored todo or recent command
/lua status                  -> returns Railway, Supabase, paired Mac Worker, queue, command, and memory status directly (no AI task)
/lua ask :: <question>      -> classifies and queues a Claude task
/lua do :: <task>           -> asks approval, then queues a Codex task
/lua tasks                  -> lists work awaiting approval or an agent
/lua approve :: <id>        -> approves a queued task
/lua reject :: <id>         -> rejects a queued task
/lua pair                    -> creates a one-time Mac Worker pairing code
```

Plain Telegram text is classified deterministically: coding, tests, deployment, and repository work route to Codex; questions, research, summaries, and drafting route to Claude; memory requests route to Lua; everything else becomes a todo. Claude and Codex tasks remain durable until a paired Mac Worker claims them. The optional direct Claude API adapter remains disabled when `ANTHROPIC_API_KEY` is absent.

Claude receives at most five short excerpts from permitted Markdown folders. It never searches or sends `00_Lua/02_Memory/Identity/`, `_System/`, `.git/`, or `node_modules/`.

Railway also starts a lightweight in-process command loop by default. Use these optional service variables to tune it:

```text
LUA_PROCESSOR_LOOP=true
LUA_PROCESS_INTERVAL_MS=60000
LUA_PROCESS_LIMIT=10
```

Set `LUA_PROCESSOR_LOOP=false` to disable the background processor.

If `cloud:supabase:check` reports missing command processing columns, rerun:

```text
90_System/lua_cloud_main/supabase_schema.sql
```

Telegram webhook endpoint:

```text
POST /webhooks/telegram
```

The webhook stores incoming commands, processes simple commands immediately, and sends the processed result back to Telegram when possible. The background loop catches any queued commands that were not processed inline.

Prepare Telegram webhook setup after Railway gives a public domain:

```bash
npm run cloud:webhook:dry-run -- --url https://YOUR-RAILWAY-DOMAIN
npm run cloud:webhook:set -- --url https://YOUR-RAILWAY-DOMAIN
```

## Environment

Copy `.env.example` to `.env` locally. In Railway, set the same names as service variables.

```text
PORT=3000
LUA_DEPLOYMENT_TARGET=railway
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-sonnet-4-6
CLAUDE_MAX_TOKENS=800
```

## Security

- `TELEGRAM_WEBHOOK_SECRET` protects the webhook endpoint.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- The server never returns token values in health checks or Telegram replies.
- Supabase insert failures are recorded as in-memory warnings instead of failing the Telegram webhook. Apply `supabase_schema.sql` so commands and memories persist durably.

## Railway

This repo includes `railway.json`.

Railway should use:

```bash
npm run cloud:main
```

Health check path:

```text
/health
```
