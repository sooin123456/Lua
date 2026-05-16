---
type: operating-model
status: active
last_updated: 2026-05-16
source_reference: https://www.youtube.com/watch?v=cNlvrU-KcRg
---

# LLM Wiki Operating Model

Obsidian is Lua's second brain, not Lua's app repository.

The working model follows the LLM Wiki idea: sources are not repeatedly searched from scratch. Instead, AI reads source material and compiles it into stable, linked Markdown pages that can be reused across future commands.

## Core Idea

The vault should behave like a personal knowledge wiki:

1. Capture raw material.
2. Compile it into clean concept notes.
3. Link concepts to projects, decisions, and repos.
4. Reuse those notes when planning, building, or reviewing.
5. Audit the graph so broken links and stale decisions do not accumulate.

## What Obsidian Is

- Memory layer for Lua.
- Human-readable knowledge graph.
- Command and decision dashboard.
- Project and repo registry.
- Place where AI leaves durable context so work can resume after chat context breaks.

## What Obsidian Is Not

- Not the primary source-code repository for apps.
- Not a dumping ground for generated HTML/CSS/JS prototypes once a real app repo exists.
- Not a replacement for GitHub project repos.
- Not a place for API keys, tokens, or secrets.

## Layer Responsibilities

| Layer | Folder | Rule |
|---|---|---|
| Inbox | `00_Inbox/` | Raw capture only. Do not over-organize at capture time. |
| Command Center | `01_Command Center/` | Active commands, decisions, user actions, work ledger. |
| Projects | `02_Projects/` | Project home, product specs, repo links, status. |
| Wiki | `03_Wiki/` | Concept pages compiled from raw sources and work. |
| Operation | `03_Operation/` | Company operations, CRM, proposals, industry intelligence. |
| Resources | `04_Resources/` | Reference libraries and domain resources. |
| Artifacts | `08_Artifacts/` | Small non-app outputs, screenshots, reports, generated docs. |
| Automations | `09_Automations/` | Rules and scripts for repeatable workflows. |
| App Repos | outside vault | Real product code. Use `Lua_template` as baseline. |

## App Development Rule

When the user asks for a real app:

1. Capture the idea in Obsidian.
2. Clarify decisions in Decision Board only when needed.
3. Create or select a `Lua_xxx` repo based on `Lua_template`.
4. Build the app in that repo.
5. Keep Obsidian updated with product spec, decisions, repo link, and work ledger.
6. Do not store the app implementation in the vault.

## Query Rule

When answering future questions, Codex should prefer the compiled Wiki and project notes before re-reading old chats or scattering new summaries.

## Maintenance Rule

Run graph maintenance after structural changes:

```bash
node scripts/check.js
node scripts/flow_audit.js
node scripts/vault_audit.js
```
