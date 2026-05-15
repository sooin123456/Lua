---
type: automation-map
system: notion
status: draft
last_updated: 2026-05-16
---

# Notion Workspace Plan

`Lua_Home`을 팀 운영 화면으로 만들기 위한 다음 구조다.

## Lua_Home Role

`Lua_Home`은 모든 내용을 직접 적는 페이지가 아니라, 팀이 들어와서 현재 상태를 보는 첫 화면이다.

`Lua_Home`에는 아래 세 가지만 보이면 된다.

- 지금 중요한 프로젝트
- 결정/승인이 필요한 것
- 이번 주 공유 요약

## Recommended Layout

1. Today
2. Project Board
3. Decision Queue
4. Team Briefs
5. Research Briefs
6. Artifacts
7. Automation Status

## Databases To Create

### Projects

| Property | Type | Purpose |
|---|---|---|
| Name | title | 프로젝트 이름 |
| Area | select | CxEMS, KGCT, KIEREMS, Lucia, Personal, Operation |
| Status | status | active, waiting, blocked, done |
| Owner | person | 담당자 |
| Priority | select | P0, P1, P2 |
| Next Action | text | 다음 행동 한 줄 |
| Deadline | date | 마감 |
| Obsidian Source | url/text | 원본 노트 경로 |

### Tasks

| Property | Type | Purpose |
|---|---|---|
| Name | title | 할 일 |
| Project | relation | Projects 연결 |
| Owner | person | 담당자 |
| Status | status | todo, doing, review, done |
| Priority | select | P0, P1, P2 |
| Due | date | 마감 |
| Blocker | checkbox/text | 막힌 이유 |
| Source | url/text | Obsidian 원본 |

### Decisions

| Property | Type | Purpose |
|---|---|---|
| Decision | title | 결정 내용 |
| Area | select | 프로젝트/운영 영역 |
| Status | status | proposed, approved, rejected, archived |
| Needed By | date | 결정 필요일 |
| Decider | person | 결정권자 |
| Context | text | 판단 배경 |
| Source | url/text | 원본 DevLog/회의록 |

### Team Briefs

| Property | Type | Purpose |
|---|---|---|
| Title | title | 공유 제목 |
| Channel | select | Notion, Slack, Both |
| Status | status | draft, approved, sent |
| Audience | multi-select | 팀/프로젝트/외부 |
| Changed | text | 변경 사항 |
| Decision Needed | text | 필요한 결정 |
| Blocker | text | 블로커 |
| Next | text | 다음 행동 |
| Source | url/text | Obsidian 초안 |

### Research Briefs

| Property | Type | Purpose |
|---|---|---|
| Topic | title | 조사 주제 |
| Area | select | 사업/기술/정책/경쟁사 |
| Status | status | collecting, summarized, shared |
| Key Finding | text | 핵심 결론 |
| Confidence | select | low, medium, high |
| Sources | url/files | 출처 |
| Source Note | url/text | Obsidian Research |

### Artifacts

| Property | Type | Purpose |
|---|---|---|
| Name | title | 산출물 이름 |
| Type | select | app, prompt, template, script, report |
| Status | status | draft, usable, retired |
| Owner | person | 소유자 |
| Reuse Case | text | 다시 쓰는 상황 |
| Source | url/text | Artifact Ledger |

## Views For Lua_Home

| View | DB | Filter |
|---|---|---|
| Active Projects | Projects | Status is active or blocked |
| Needs Decision | Decisions | Status is proposed |
| This Week Tasks | Tasks | Due within 7 days or Priority is P0 |
| Team Brief Drafts | Team Briefs | Status is draft |
| Recent Research | Research Briefs | Status is summarized or shared |
| Reusable Assets | Artifacts | Status is usable |

## What To Do Next In Notion

1. `Lua_Home` 아래에 위 6개 DB를 만든다.
2. DB 이름은 영어로 고정한다: `Projects`, `Tasks`, `Decisions`, `Team Briefs`, `Research Briefs`, `Artifacts`.
3. 먼저 수동 입력으로 1주일만 운영한다.
4. 자동화는 수동 운영 후 필드가 안정되면 붙인다.
5. Slack 전송은 `Team Briefs`의 Status가 `approved`가 된 것만 보낸다.

## Sync Rule

Obsidian에서 Notion으로 보내는 것은 "정리된 결과"다. 원본 사고 과정은 보내지 않는다.

## Navigation

- [[09_Automations/Notion Sync|Notion Sync]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[01_Command Center/Obsidian Writing Rules|Obsidian Writing Rules]]
