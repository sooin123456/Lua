---
type: wiki-hub
status: active
last_updated: 2026-05-16
---

# Wiki

- [[90_System/03_Wiki/Vault Folder Structure|Vault Folder Structure]]

This is the LLM Wiki layer of the vault.

Obsidian is not the place where app source code lives. Obsidian is the durable thinking layer: raw sources come in, Codex/Claude compile them into linked knowledge notes, and projects/repos point back to those notes.

## Role

| Layer | Purpose | Owner |
|---|---|---|
| Raw Sources | Unedited captures, links, notes, transcripts, meeting notes | Human first, AI can append metadata |
| Wiki | Stable concept pages created from sources | AI maintains, human reviews |
| Command Center | Decisions, active commands, user actions, ledgers | Human + AI |
| Projects | Project maps, status, repo links, specs | Human + AI |
| App Repos | Actual product source code | Git repos outside the vault |

## Navigation

- [[90_System/03_Wiki/LLM Wiki Operating Model|LLM Wiki Operating Model]]
- [[90_System/03_Wiki/Repository Registry|Repository Registry]]
- [[90_System/03_Wiki/Source to Wiki Workflow|Source to Wiki Workflow]]
- [[90_System/03_Wiki/Obsidian Role in Lua|Obsidian Role in Lua]]
- [[00_Lua/01_Commands/Command Inbox|Obsidian Command Center]]
- [[90_System/80_Lua_Details/01_Command Center/01_Commands/Decision Board|Decision Board]]
- [[90_System/80_Lua_Details/02_Projects/Projects Hub|Projects Hub]]
- [[90_System/09_Automations/App Template Standard|App Template Standard]]

## Rule

Every real app must have a separate repo. The vault stores why the app exists, what was decided, what the repo is, and what knowledge it depends on.
