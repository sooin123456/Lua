---
ai-index: true
type: operating-guide
status: active
last_updated: 2026-05-28
---

# Lua Operating Layers

Lua should stay useful months later. For that, every item should fall into one of three layers:

1. Memory classification: what should Lua remember?
2. Command classification: what kind of instruction did the user give, and how should AI act?
3. Activity summary: what happened, what changed, and what is next?

## Layer Map

| Layer | Main Question | Primary Folder | Main Notes |
|---|---|---|---|
| Memory | 나중에 무엇을 기억해야 하지? | `00_Inbox`, `03_Wiki`, `04_Resources`, project notes | [[01_Command Center/02_Memory/Lua Memory Classification|Lua Memory Classification]] |
| Command | 이 명령은 어떤 종류이고 어떤 AI 행동 방침이 필요하지? | `09_Automations`, `01_Command Center`, runtime DB | [[01_Command Center/01_Commands/Lua Command Taxonomy|Lua Command Taxonomy]] |
| Summary | 오늘/이번 작업에서 무엇을 했고 다음은 무엇이지? | `01_Command Center`, project `DevLog`, `docs/development-log.md` | [[01_Command Center/03_Summaries/Lua Activity Summary System|Lua Activity Summary System]] |

## Default Flow

```text
Telegram/Codex/Obsidian input
→ memory classification if it is context
→ command taxonomy if it asks Lua to act
→ execution or draft
→ activity summary
→ next action
```

## Practical Rule

- If it helps future Lua understand you, save it as memory.
- If it asks Lua to do something, classify it as a command.
- If Lua or you did something meaningful, write a summary.

## Navigation

- [[01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]]
- [[01_Command Center/02_Memory/Lua Memory Classification|Memory Classification]]
- [[01_Command Center/01_Commands/Lua Command Taxonomy|Command Taxonomy]]
- [[01_Command Center/03_Summaries/Lua Activity Summary System|Activity Summary]]
- [[03_Wiki/Vault Folder Structure|Vault Folder Structure]]
