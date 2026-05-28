---
ai-index: true
type: dashboard
status: active
last_updated: 2026-05-28
---

# Master Dashboard

Daily operating view for Lua. Keep this page small. Use [[00_Lua/01_Command Center/00_Dashboard/Lua System Map|Lua System Map]] for full navigation.

## Navigation

- [[00_Lua/02_Projects/Projects Hub|Projects]]
- [[90_System/09_Automations/Telegram Command Inbox|Telegram]]
- [[00_Lua/01_Command Center/01_Commands/Obsidian Command Center|Command Center]]
- [[00_Lua/01_Command Center/00_Dashboard/User Action Board|Actions]]
- [[00_Lua/01_Command Center/03_Summaries/Work Ledger|Work Ledger]]
- [[00_Lua/01_Command Center/04_Policies/Lua Operating Layers|Operating Layers]]
- [[90_System/07_Lua_System/runtime/README|Lua Runtime]]
- [[00_Lua/01_Command Center/01_Commands/Lua Command And Record Channels|Command/Record Channels]]
- [[00_Lua/01_Command Center/00_Dashboard/Lua System Map|System Map]]

## Active Lua Runtime Projects

| Project | Status | Next operating command |
|---|---|---|
| [[00_Lua/02_Projects/Lua/Toss Mini App To App|Toss Mini App -> App]] | active follow-up | `uv run lua --db .lua_agent/lua.db tool instruction PROJ-001 TASK-003` |
| [[00_Lua/02_Projects/Lua/Telegram Trading Bot To App|Telegram Trading Bot -> App]] | planned | `uv run lua --db .lua_agent/lua.db approval check PROJ-002 TASK-008` |
| [[00_Lua/02_Projects/Lua/Floating Solar Monitoring System|Floating Solar Monitoring]] | planned | `uv run lua --db .lua_agent/lua.db tool instruction PROJ-003 TASK-011` |

## Current Runtime Queue

```bash
uv run lua --db .lua_agent/lua.db heartbeat
```

Expected current shape: `TASK-003` through `TASK-015` active across the three Lua runtime projects.

## Command And Record Channels

Use [[00_Lua/01_Command Center/01_Commands/Lua Command And Record Channels|Command/Record Channels]] when checking where commands enter and where records should land.

Main command channel: [[90_System/09_Automations/Telegram Command Inbox|Telegram Command Inbox]].

Core operating layers: [[00_Lua/01_Command Center/04_Policies/Lua Operating Layers|Memory / Command / Summary]].

Quick check:

```bash
node 90_System/scripts/process_command_queue.js --dry-run
node 90_System/scripts/promote_inbox_to_commands.js --dry-run
node 90_System/scripts/flow_audit.js
```

## Approval Needed

| Item | Why | Command |
|---|---|---|
| Telegram live trading / API keys | explicit approval required before any live trading or credential handling | `uv run lua --db .lua_agent/lua.db approval check PROJ-002 TASK-008` |
| External vendor contact | ask first before contacting vendors | pending after research task output |
| Deployment / git push / PR | ask first before external publication | pending after implementation task output |

## Today

- [ ] Continue `TASK-003` for the Toss follow-up hardening map.
- [ ] Write a checkpoint after execution.
- [ ] Export the updated project note back to Obsidian.
- [ ] Record meaningful changes in [[00_Lua/01_Command Center/03_Summaries/Work Ledger|Work Ledger]].

## System Status

- Codex entry point: [[AGENTS]]
- Operating loop: [[00_Lua/01_Command Center/01_Commands/Harness Loop|Harness Loop]]
- Runtime 90_System/docs: [[90_System/07_Lua_System/runtime/README|Lua Runtime]]
- Command/record map: [[00_Lua/01_Command Center/01_Commands/Lua Command And Record Channels|Command/Record Channels]]
- Full map: [[00_Lua/01_Command Center/00_Dashboard/Lua System Map|Lua System Map]]
