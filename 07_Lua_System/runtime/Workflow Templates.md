---
type: runtime-template
status: active
last_updated: 2026-05-27
---

# Workflow Templates

`lua seed projects` creates three validation projects and five workflow tasks for each.

The purpose is to start real work with enough structure to continue, without pretending the whole project is already planned.

## Toss Mini App To App

1. Research Toss mini app requirements
2. Define Toss mini app MVP scope
3. Generate Toss implementation plan
4. Build Toss prototype skeleton
5. Plan Toss app expansion roadmap

## Telegram Trading Bot To App

1. Research exchange and data source options
2. Define trading bot MVP boundaries
3. Draft trading risk and approval policy
4. Build Telegram bot skeleton
5. Plan trading dashboard expansion

Trading risk tasks start with approval flags because live trading, API keys, and real orders require explicit approval.

## Floating Solar Monitoring System

1. Research floating solar monitoring use cases
2. Identify vendor and technology candidates
3. Define vendor selection criteria
4. Draft monitoring system architecture
5. Create first planning report outline

## Runtime Command

```bash
uv run lua seed projects
uv run lua heartbeat
```

The heartbeat should show 15 planned tasks after seeding a fresh database.
