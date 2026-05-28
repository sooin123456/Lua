---
ai-index: true
type: operating-guide
status: active
last_updated: 2026-05-28
---

# Lua Activity Summary System

This guide defines how Lua records what happened so the user can remember actions later.

## Summary Levels

| Level | Purpose | Destination | Frequency |
|---|---|---|---|
| `checkpoint` | task-level progress and next action | runtime DB, exported project note | every meaningful task step |
| `work-ledger` | who changed what, where, and verification | [[00_Lua/01_Command Center/03_Summaries/Work Ledger|Work Ledger]] | every system/repo change |
| `project-devlog` | project-specific implementation history | project `DevLog.md` or app repo 90_System/docs | every project change |
| `daily-summary` | what happened today across areas | [[00_Lua/05_Personal Studio/Daily Notes|Daily Notes]] or Weekly Review | daily or on demand |
| `weekly-review` | decisions, shipped work, open loops | [[00_Lua/01_Command Center/03_Summaries/Weekly Review|Weekly Review]] | weekly |

## Summary Shape

Use this shape when summarizing:

```text
Context:
What changed:
Why it matters:
Verification:
Open loops:
Next action:
```

## What To Summarize

- Files moved or reorganized
- Code implemented or tests added
- External 90_System/docs researched
- Decisions made by the user
- Commands received through Telegram
- Approvals granted or withheld
- Errors, blockers, and fixes

## What Not To Summarize

- secret values
- raw API keys
- temporary command output with no future value
- unrelated local noise

## Daily Prompt

```text
/lua status today :: 오늘 Lua가 한 일, 남은 일, 내가 결정해야 할 것 요약
```

## Navigation

- [[00_Lua/01_Command Center/04_Policies/Lua Operating Layers|Lua Operating Layers]]
- [[00_Lua/01_Command Center/03_Summaries/Work Ledger|Work Ledger]]
- [[00_Lua/01_Command Center/03_Summaries/Weekly Review|Weekly Review]]
- [[00_Lua/05_Personal Studio/Daily Notes|Daily Notes]]
