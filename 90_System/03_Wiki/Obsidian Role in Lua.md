---
type: concept
status: active
last_updated: 2026-05-16
---

# Obsidian Role in Lua

Obsidian is Lua's memory and sensemaking layer.

It should answer:

- What are we building?
- Why are we building it?
- What has already been decided?
- Which repo contains the actual implementation?
- What should the next agent do?
- What knowledge should be reused next time?

It should not answer by containing the whole application codebase.

## Practical Split

| Question | Answer lives in |
|---|---|
| What is the product idea? | `00_Lua/02_Projects/` and `90_System/03_Wiki/` |
| What did the user decide? | `00_Lua/01_Command Center/01_Commands/Decision Board.md` |
| What happened in a session? | `00_Lua/01_Command Center/03_Summaries/Work Ledger.md` |
| Where is the code? | `90_System/03_Wiki/Repository Registry.md` |
| What is the reusable concept? | `90_System/03_Wiki/` |
| What is the actual app implementation? | separate Git repo |

## Current Correction

The Money Dust app was moved out of `Lua` and into local repo:

```text
C:\Users\sooin\OneDrive\문서\Lua_money_dust
```

This is the model for future apps.
