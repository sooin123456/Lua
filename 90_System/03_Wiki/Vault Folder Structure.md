---
type: wiki
status: active
last_updated: 2026-05-28
---

# Vault Folder Structure

This vault is both Lua's memory layer and the local runtime repository. Keep the root small so command and runtime files are easy to find.

## Root

Root is for repository entrypoints and current top-level system documents only.

Keep:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `Lua End-to-End Flow.md`
- `Lua-v4-operating-architecture.md`
- package/config files

Do not keep old specs, temporary patch notes, project notes, or inbox items at root.

## Main Areas

| Folder | Purpose |
|---|---|
| `00_Lua/00_Inbox` | raw capture before classification |
| `00_Lua/01_Command Center` | dashboards, command channels, operating ledgers |
| `00_Lua/02_Projects` | project notes and generated Lua runtime exports |
| `00_Lua/03_Operation` | business operations, CRM, proposals, team workflow |
| `90_System/03_Wiki` | durable explanatory knowledge about Lua and the vault |
| `00_Lua/04_Resources` | reusable references and technical resources |
| `90_System/05_Archives` | historical specs, old patch notes, inactive material |
| `00_Lua/05_Personal Studio` | personal notes, ideas, learning, drafts |
| `90_System/07_Lua_System` | agent system, runtime docs, commands, vertical skills |
| `90_System/08_Artifacts` | reusable outputs and prototypes |
| `90_System/09_Automations` | automation docs, queues, scripts interface notes |
| `90_System/99_Templates` | note and prompt templates |
| `90_System/docs` | development specs, plans, logs, use-case docs |
| `90_System/lua_agent` | Python runtime package |
| `90_System/scripts` | Node automation scripts |
| `90_System/tests` | Node and Python tests |

## Command Center Structure

`00_Lua/01_Command Center` is organized by operating responsibility:

| Folder | Purpose |
|---|---|
| `00_Dashboard` | daily navigation, system map, action board |
| `01_Commands` | command intake, command runs, command modes, decisions, urgent tasks |
| `02_Memory` | identity, organization memory, durable user/business context |
| `03_Summaries` | Work Ledger, weekly review, activity summary rules |
| `04_Policies` | usage guide, operating layers, writing rules, system permissions |

## Practical Operating View

For daily use, think in three layers:

| Layer | Question | Guide |
|---|---|---|
| Memory | What should Lua remember later? | [[00_Lua/02_Memory/Memory Classification|Memory Classification]] |
| Command | What kind of instruction is this? | [[00_Lua/01_Commands/Command Types|Command Taxonomy]] |
| Summary | What happened and what is next? | [[00_Lua/03_Records/Activity Summary System|Activity Summary System]] |

## Secret Rule

`.env` and `.lua_agent/` stay local and ignored by Git. Scripts may use secrets from environment variables, but documentation and command output must never print secret values.

## Navigation

- [[90_System/80_Lua_Details/01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]]
- [[00_Lua/01_Commands/Command And Record Channels|Command/Record Channels]]
- [[90_System/05_Archives/Archives Hub|Archives Hub]]
- [[90_System/03_Wiki/Home|Wiki Home]]
