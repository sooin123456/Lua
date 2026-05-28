---
ai-index: true
type: operating-guide
status: active
last_updated: 2026-05-28
---

# Lua Memory Classification

This guide defines how Lua should classify memory so the user can remember important context later.

## Memory Types

| Type | Use For | Store In | AI Behavior |
|---|---|---|---|
| `identity` | values, preferences, working style, voice | `00_Lua/01_Command Center/02_Memory/Identity` | preserve carefully; do not overwrite casually |
| `decision` | user choices, approved direction, rejected options | `00_Lua/01_Command Center/01_Commands/Decision Board`, project notes | cite decision date and reason |
| `project-context` | goals, scope, constraints, current next action | `00_Lua/02_Projects/**/Home.md`, `00_Lua/02_Projects/Lua/*` | update when project state changes |
| `relationship` | people, companies, roles, trust boundaries | `00_Lua/01_Command Center/02_Memory/_Organization`, `00_Lua/03_Operation/Client CRM` | avoid unnecessary personal details |
| `research` | sources, market facts, vendor facts, technical references | `00_Lua/04_Resources`, project `Research.md`, `00_Lua/03_Operation/Industry Intelligence` | keep source and date |
| `idea` | unvalidated concepts, possible products, prompts | `00_Lua/00_Inbox`, `00_Lua/05_Personal Studio/Ideas` | do not treat as commitment |
| `credential-map` | key names, where stored, permission level | `.env.example`, 90_System/docs without values | never record secret values |
| `artifact` | reusable code, prototype, generated asset, prompt | `90_System/08_Artifacts`, app repo 90_System/docs | link to source and verification |
| `archive` | old plans, superseded specs, inactive notes | `90_System/05_Archives` | read-only by default |

## Classification Flow

```text
New information
→ Is it actionable now?
  → yes: classify as command first
  → no: classify as memory
→ Is it stable context, temporary idea, or historical archive?
→ Save to the matching folder
→ Add backlink from a hub/project note when useful
```

## What Lua Should Ask Before Saving

- Will future me need this to resume work?
- Is this a decision or just a thought?
- Does this belong to a project, a person/company, or general knowledge?
- Does this contain secrets or private details that should not be written?
- Is the source/date needed?

## Examples

| Input | Memory Type | Destination |
|---|---|---|
| "Telegram should be the main command channel" | `decision` | Command 90_System/docs + Work Ledger |
| "I prefer Lua_Agent names by purpose" | `identity` / `decision` | Identity or system 90_System/docs |
| Toss mini app official requirements | `research` | `90_System/docs/use-cases`, project note |
| Random app idea | `idea` | `00_Lua/00_Inbox` or Ideas |
| Old Lua v3 spec | `archive` | `90_System/05_Archives/Lua Specs` |

## Navigation

- [[00_Lua/01_Command Center/04_Policies/Lua Operating Layers|Lua Operating Layers]]
- [[90_System/03_Wiki/Vault Folder Structure|Vault Folder Structure]]
- [[00_Lua/01_Command Center/02_Memory/Identity/about-me|About Me]]
- [[90_System/03_Wiki/Repository Registry|Repository Registry]]
