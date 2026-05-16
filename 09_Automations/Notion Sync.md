---
type: automation-map
system: notion
last_updated: 2026-05-15
---

# Notion Sync

Notion is the team-facing mirror. Obsidian remains the source of truth for private thinking and detailed project memory.

The next workspace structure is defined in [[09_Automations/Notion Workspace Plan|Notion Workspace Plan]].

Notion publishing is Phase 4 in [[Lua End-to-End Flow|Lua End-to-End Flow]]. It is not active by default yet.

The first safe integration step is [[09_Automations/Notion Publish Queue|Notion Publish Queue]]. It creates approval-ready local drafts before any Notion write.

## Current Workspace

- Existing in Notion: `Lua_Home`
- Existing in Notion: `관리하는 프로덕트`
- Existing in Notion: `프로젝트`
- Existing in Notion: `작업`

## Minimum Databases

- Projects / `프로젝트`
- Tasks / `작업`
- Decisions
- Research Briefs
- Artifacts
- Proposals
- Patents
- Team Briefs

## Sync Direction

Default direction is Obsidian to Notion.

Notion to Obsidian is allowed only for team-owned status fields such as owner, deadline, blocker, and review state.

## Publishing Rule

Notion receives durable team records, not raw thinking.

| Obsidian source | Notion target | Publish condition |
|---|---|---|
| `02_Projects/**/Home.md` | Projects | project is active |
| `Backlog.md` / `Urgent List.md` | Tasks | owner or deadline exists |
| `DevLog.md` | Decisions | decision or milestone exists |
| `Research.md` / Industry notes | Research Briefs | summary is useful to team |
| `08_Artifacts/Artifact Ledger.md` | Artifacts | asset can be reused |
| `03_Operation/Team Brief Drafts.md` | Team Briefs | user approved |

## Safety

- Do not sync Identity notes.
- Do not sync raw prompts.
- Do not sync secrets.
- Do not delete Notion rows automatically.
- Draft first, then publish after user approval.

## Current Script

```bash
node scripts/notion_publish_queue.js --dry-run
node scripts/notion_publish_queue.js --apply
```

This script writes only to Obsidian. It does not create or update Notion pages.

## Navigation

- [[09_Automations/README|Automations]]
- [[Lua End-to-End Flow|Lua End-to-End Flow]]
- [[09_Automations/Notion Workspace Plan|Notion Workspace Plan]]
- [[09_Automations/Notion Publish Queue|Notion Publish Queue]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[03_Operation/Team Brief Drafts|Team Brief Drafts]]
- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Work Ledger|Work Ledger]]
