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

Telegram webhook endpoint:

```text
POST /webhooks/telegram
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
