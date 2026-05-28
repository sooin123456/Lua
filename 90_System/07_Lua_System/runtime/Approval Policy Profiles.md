---
type: runtime-policy
status: active
last_updated: 2026-05-27
---

# Approval Policy Profiles

Lua classifies runtime tasks into three approval levels.

## Levels

### `auto`

The task can proceed inside local/private boundaries.

Examples:

- research
- drafting
- comparison tables
- summaries
- local tests
- Obsidian private notes

### `ask_first`

The task should pause and ask before taking the action.

Examples:

- vendor contact
- Slack or Telegram messages
- deployment
- git push, PR, merge
- paid API usage
- Canva or Notion sharing
- external communication

### `explicit_approval`

The task must not proceed until the user explicitly approves that exact action.

Examples:

- live trading
- auto trading
- real exchange orders
- credentials, secrets, API keys
- payment or subscription changes
- account setting changes
- public posting
- bulk deletion

## Runtime Command

```bash
uv run lua approval check PROJ-002 TASK-004
```

## Design Rule

The goal is not to stop Lua from working. The goal is to let Lua continue safely by knowing when to keep going, when to ask, and when to wait for exact approval.
