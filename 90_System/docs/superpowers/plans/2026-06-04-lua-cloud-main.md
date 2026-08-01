# Lua Cloud Main Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first always-on Lua main agent runtime for Railway, Supabase, and Telegram webhook intake.

**Architecture:** A small dependency-free Node HTTP service receives Telegram webhooks, normalizes `/lua` commands, writes commands/memories/logs to Supabase through REST, and sends short Telegram acknowledgements. Obsidian remains the human-readable memory and receives synced docs from the repo.

**Tech Stack:** Node.js built-in `http`, Telegram Bot API, Supabase REST API, Railway runtime, Node test runner.

---

### Task 1: Telegram Webhook Contract

**Files:**
- Create: `90_System/tests/lua_cloud_main.test.js`
- Create: `90_System/lua_cloud_main/command.js`
- Create: `90_System/lua_cloud_main/server.js`
- Create: `90_System/lua_cloud_main/store.js`
- Create: `90_System/lua_cloud_main/index.js`

- [x] Write failing tests for webhook normalization, health response, status reply, and invalid secret rejection.
- [x] Run `node --test 90_System/tests/lua_cloud_main.test.js` and confirm it fails because the module does not exist.
- [x] Implement command normalization, in-memory/Supabase store, and HTTP server.
- [x] Run the focused tests and confirm they pass.

### Task 2: Cloud Runtime Documentation

**Files:**
- Create: `90_System/docs/lua-cloud-main-architecture.md`
- Create: `90_System/lua_cloud_main/README.md`
- Create: `90_System/lua_cloud_main/supabase_schema.sql`
- Modify: `.env.example`
- Modify: `package.json`

- [x] Document the Railway + Supabase + Upstash stack choice.
- [x] Add the first Supabase schema for commands, memories, and logs.
- [x] Add local and Railway environment variables.
- [x] Add `npm run cloud:main`.

### Task 3: Verification and Sync

**Files:**
- Modify: `00_Lua/03_Records/Work Ledger.md`

- [x] Run `npm run check`.
- [x] Run `npm run test:node`.
- [x] Run `npm run obsidian:sync`.
- [x] Commit the repo changes.

### Task 4: Deployment Preparation

**Files:**
- Create: `railway.json`
- Create: `90_System/lua_cloud_main/config.js`
- Create: `90_System/lua_cloud_main/setup.js`
- Modify: `90_System/lua_cloud_main/README.md`
- Modify: `90_System/docs/lua-cloud-main-architecture.md`
- Modify: `package.json`

- [x] Add Railway start and health check configuration.
- [x] Add safe cloud environment validation.
- [x] Add Telegram webhook dry-run/apply setup commands.
- [x] Add tests that prove setup commands do not expose tokens.
- [x] Generate local `TELEGRAM_WEBHOOK_SECRET` in ignored `.env` without printing the secret value.
- [x] Run `npm run cloud:check-env` to confirm only Supabase values remain missing locally.
- [x] Run `npm run cloud:webhook:dry-run -- --url https://lua-main.example.railway.app`.
