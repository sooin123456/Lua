---
type: wiki
status: active
last_updated: 2026-05-28
---

# Vault Folder Structure

This vault is both Lua's memory layer and the local runtime repository. Keep the root small so command and runtime files are easy to find.

## Root

Root is for repository entrypoints and current top-level system docs only.

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
| `00_Inbox` | raw capture before classification |
| `01_Command Center` | dashboards, command channels, operating ledgers |
| `02_Projects` | project notes and generated Lua runtime exports |
| `03_Operation` | business operations, CRM, proposals, team workflow |
| `03_Wiki` | durable explanatory knowledge about Lua and the vault |
| `04_Resources` | reusable references and technical resources |
| `05_Archives` | historical specs, old patch notes, inactive material |
| `06_Personal Studio` | personal notes, ideas, learning, drafts |
| `07_Lua_System` | agent system, runtime docs, commands, vertical skills |
| `08_Artifacts` | reusable outputs and prototypes |
| `09_Automations` | automation docs, queues, scripts interface notes |
| `99_Templates` | note and prompt templates |
| `docs` | development specs, plans, logs, use-case docs |
| `lua_agent` | Python runtime package |
| `scripts` | Node automation scripts |
| `tests` | Node and Python tests |

## Practical Operating View

For daily use, think in three layers:

| Layer | Question | Guide |
|---|---|---|
| Memory | What should Lua remember later? | [[01_Command Center/Lua Memory Classification|Memory Classification]] |
| Command | What kind of instruction is this? | [[01_Command Center/Lua Command Taxonomy|Command Taxonomy]] |
| Summary | What happened and what is next? | [[01_Command Center/Lua Activity Summary System|Activity Summary System]] |

## Secret Rule

`.env` and `.lua_agent/` stay local and ignored by Git. Scripts may use secrets from environment variables, but documentation and command output must never print secret values.

## Navigation

- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Lua Command And Record Channels|Command/Record Channels]]
- [[05_Archives/Archives Hub|Archives Hub]]
- [[03_Wiki/Home|Wiki Home]]
