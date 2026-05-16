---
type: automation-map
system: notion
status: draft
last_updated: 2026-05-16
---

# Notion Workspace Plan

`Lua_Home` is the team-facing front page for Lua. Obsidian remains the source of truth, and Notion receives only cleaned-up records that are useful for sharing.

## Actual Workspace State

Read-only Notion check on 2026-05-16 found an existing `Lua_Home` page.

| Notion object | Status | Purpose |
|---|---|---|
| `Lua_Home` | exists | Main Notion entry point |
| `관리하는 프로덕트` | exists | Product gallery |
| `프로젝트` | exists | Project database |
| `작업` | exists | Task database |
| `Research Briefs` | missing | Needed for team-facing research summaries |
| `Team Briefs` | missing | Needed for approved team updates |
| `Decisions` | missing | Needed for decision records |
| `Artifacts` | missing | Needed for reusable deliverables |

## Existing Databases

### 관리하는 프로덕트

| Property | Type | Purpose |
|---|---|---|
| 제목 | title | Product name |
| 설명 | text | Product description |
| 사진 | file | Visual reference |
| 프로젝트 | relation | Related projects |

### 프로젝트

| Property | Type | Purpose |
|---|---|---|
| 프로젝트 | title | Project name |
| 진행 상태 | status | 시작 전, 진행 중, 완료 |
| 우선순위 | select | P0, P1, P2 |
| 타임라인 | date | Schedule |
| 작업 시간 | number | Effort |
| 작업 | relation | Related tasks |
| 프로덕트 | relation | Related product |

### 작업

| Property | Type | Purpose |
|---|---|---|
| 제목 | title | Task title |
| 진행 상태 | status | 시작 전, 진행 중, 완료 |
| 담당자 | person | Owner |
| 프로젝트 | relation | Related project |

## Missing Databases To Add Later

Do not create these automatically yet. Use `[[09_Automations/Notion Publish Queue|Notion Publish Queue]]` first, then create databases once the fields stabilize.

### Research Briefs

| Property | Type | Purpose |
|---|---|---|
| Topic | title | Research topic |
| Area | select | Market, technology, policy, competitor, project |
| Status | status | collecting, summarized, shared |
| Key Finding | text | Main conclusion |
| Confidence | select | low, medium, high |
| Source Note | text/url | Obsidian source |

### Team Briefs

| Property | Type | Purpose |
|---|---|---|
| Title | title | Shared update title |
| Channel | select | Notion, Slack, Both |
| Status | status | draft, approved, sent |
| Audience | multi-select | Team, project, external |
| Changed | text | What changed |
| Decision Needed | text | What needs approval |
| Blocker | text | Current blocker |
| Next | text | Next action |
| Source | text/url | Obsidian source |

### Decisions

| Property | Type | Purpose |
|---|---|---|
| Decision | title | Decision statement |
| Area | select | Project or operating area |
| Status | status | proposed, approved, rejected, archived |
| Needed By | date | Decision deadline |
| Decider | person | Decision owner |
| Context | text | Decision background |
| Source | text/url | Obsidian source |

### Artifacts

| Property | Type | Purpose |
|---|---|---|
| Name | title | Artifact name |
| Type | select | app, prompt, template, script, report |
| Status | status | draft, usable, retired |
| Owner | person | Owner |
| Reuse Case | text | When to reuse |
| Source | text/url | Artifact Ledger source |

## Publishing Rule

1. Obsidian note becomes a local draft in `[[09_Automations/Notion Publish Queue|Notion Publish Queue]]`.
2. User approves the draft.
3. Codex publishes to the matching Notion DB if it exists.
4. If a matching DB does not exist yet, Codex may publish a draft child page under `Lua_Home` only after approval.
5. Work Ledger records what was published and where.

## Commands

```bash
node scripts/notion_publish_queue.js --dry-run
node scripts/notion_publish_queue.js --apply
```

NPM shortcuts:

```bash
npm run notion:dry-run
npm run notion:queue
```

## Navigation

- [[09_Automations/Notion Sync|Notion Sync]]
- [[09_Automations/Notion Publish Queue|Notion Publish Queue]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[01_Command Center/Obsidian Writing Rules|Obsidian Writing Rules]]
