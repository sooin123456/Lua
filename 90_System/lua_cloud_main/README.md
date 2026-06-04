# Lua Cloud Main

Always-on Lua runtime for Railway + Supabase + Telegram webhook.

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

Telegram webhook endpoint:

```text
POST /webhooks/telegram
```

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
