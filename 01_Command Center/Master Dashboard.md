---
ai-index: true
type: dashboard
status: active
last_updated: 2026-05-27
---

# Master Dashboard

Daily operating view for Lua. Keep this page small. Use [[01_Command Center/Lua System Map|Lua System Map]] for full navigation.

## Navigation

- [[02_Projects/Projects Hub|Projects]]
- [[01_Command Center/Obsidian Command Center|Command Center]]
- [[01_Command Center/User Action Board|Actions]]
- [[01_Command Center/Work Ledger|Work Ledger]]
- [[07_Lua_System/runtime/README|Lua Runtime]]
- [[01_Command Center/Lua System Map|System Map]]

## Active Lua Runtime Projects

| Project | Status | Next operating command |
|---|---|---|
| [[02_Projects/Lua/Toss Mini App To App|Toss Mini App -> App]] | planned | `uv run lua --db .lua_agent/lua.db tool instruction PROJ-001 TASK-001` |
| [[02_Projects/Lua/Telegram Trading Bot To App|Telegram Trading Bot -> App]] | planned | `uv run lua --db .lua_agent/lua.db approval check PROJ-002 TASK-008` |
| [[02_Projects/Lua/Floating Solar Monitoring System|Floating Solar Monitoring]] | planned | `uv run lua --db .lua_agent/lua.db tool instruction PROJ-003 TASK-011` |

## Current Runtime Queue

```bash
uv run lua --db .lua_agent/lua.db heartbeat
```

Expected current shape: 15 planned tasks across the three Lua runtime projects.

## Approval Needed

| Item | Why | Command |
|---|---|---|
| Telegram live trading / API keys | explicit approval required before any live trading or credential handling | `uv run lua --db .lua_agent/lua.db approval check PROJ-002 TASK-008` |
| External vendor contact | ask first before contacting vendors | pending after research task output |
| Deployment / git push / PR | ask first before external publication | pending after implementation task output |

## Today

- [ ] Pick one runtime task to execute.
- [ ] Write a checkpoint after execution.
- [ ] Export the updated project note back to Obsidian.
- [ ] Record meaningful changes in [[01_Command Center/Work Ledger|Work Ledger]].

## System Status

- Codex entry point: [[AGENTS]]
- Operating loop: [[01_Command Center/Harness Loop|Harness Loop]]
- Runtime docs: [[07_Lua_System/runtime/README|Lua Runtime]]
- Full map: [[01_Command Center/Lua System Map|Lua System Map]]
