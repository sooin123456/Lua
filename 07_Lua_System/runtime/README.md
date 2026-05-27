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
- seed commands for the first three validation projects
- checkpoint commands that update task `next_action`
- Obsidian export command
- heartbeat command for resumable active tasks

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

## Current Commands

```bash
uv run lua seed projects
uv run lua heartbeat
uv run lua checkpoint add TASK-001 --summary "..." --done "..." --next-action "..."
uv run lua obsidian export PROJ-001 --vault .
uv run lua codex goal PROJ-001 TASK-001
```

## Next Runtime Direction

The next runtime slice should add:

- tool-instruction routing for Claude, Codex, Gemini, Kimi, Grok, Manus, and Canva
- approval policy profiles by project type
- Notion dashboard sync stubs
