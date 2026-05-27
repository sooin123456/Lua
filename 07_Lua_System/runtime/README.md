---
type: runtime-readme
status: active
last_updated: 2026-05-27
---

# Lua Runtime

The Lua runtime is the executable layer beneath the Obsidian vault.

The vault remains the memory, command center, and human-readable operating system. The runtime handles durable state and repeatable commands that should not depend on chat history.

## Current Runtime

Root package:

- `lua_agent/`

Current responsibilities:

- project and task models
- checkpoint records
- SQLite persistence
- active task lookup
- Obsidian markdown rendering
- Codex `/goal` prompt generation
- CLI smoke path

## Why This Exists

The original Lua system began as an Obsidian-first vault. That is still useful for memory and planning, but long-running agent work needs executable state:

- every task needs a stored `next_action`
- every work session needs a checkpoint
- Codex needs clean `/goal` instructions
- future Telegram, Slack, Notion, and Obsidian integrations need one stable core

## Validation

```bash
uv run --extra dev pytest -v
```

## Next Runtime Direction

The next runtime slice should add:

- project seeding for the three initial validation projects
- checkpoint creation from the CLI
- Obsidian file export command
- heartbeat command that lists resumable tasks
- tool-instruction routing for Claude, Codex, Gemini, Kimi, Grok, Manus, and Canva
