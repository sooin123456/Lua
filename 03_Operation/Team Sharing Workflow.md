---
type: operating-guide
status: active
last_updated: 2026-05-15
---

# Team Sharing Workflow

Obsidian에서 정리한 내용을 Notion과 Slack으로 공유하는 기준을 정한다.

## Principle

- Obsidian: 원본 기록, 개인 사고, 상세 맥락.
- Notion: 팀이 반복해서 확인하는 운영 DB와 정리본.
- Slack: 지금 봐야 하는 알림, 승인 요청, 요약.

Notion과 Slack은 Obsidian을 대체하지 않는다. Obsidian에서 정리한 뒤 필요한 만큼만 팀에게 보낸다.

## Flow

1. Capture: 생각, 회의, 자료를 Obsidian에 기록한다.
2. Classify: 프로젝트, 운영, 리서치, 팀 공유, 아카이브 중 하나로 분류한다.
3. Distill: 팀이 알아야 하는 결론, 결정 요청, 다음 행동만 뽑는다.
4. Publish: Notion에는 구조화된 페이지/DB로, Slack에는 짧은 알림으로 보낸다.
5. Log: 공유한 내용과 출처를 Work Ledger 또는 프로젝트 DevLog에 남긴다.

## What Goes Where

| 내용 | Obsidian | Notion | Slack |
|---|---|---|---|
| 원본 아이디어 | yes | no | no |
| 회의 메모 원문 | yes | summary only | decision/request only |
| 프로젝트 상태 | yes | yes | changed/blocker only |
| 리서치 자료 | yes | summary only | key finding only |
| 결정 사항 | yes | yes | yes |
| 팀 요청 | yes | yes if durable | yes |
| API key/secret | no | no | no |
| 개인 identity/voice | yes private | no | no |

## Notion Databases

| DB | 목적 | Obsidian source |
|---|---|---|
| Projects | 프로젝트 상태판 | `02_Projects/**/Home.md` |
| Tasks | 실행 항목 | `Backlog.md`, `Urgent List.md` |
| Decisions | 결정 기록 | `DevLog.md`, 회의록 |
| Research Briefs | 팀 공유용 리서치 요약 | `Research.md`, Industry notes |
| Artifacts | 재사용 산출물 | `08_Artifacts/Artifact Ledger.md` |
| Team Briefs | Slack/Notion 공유 초안 | `03_Operation/Team Brief Drafts.md` |

## Slack Channels

| Channel | 보내는 내용 | 승인 |
|---|---|---|
| `#ai-briefings` | 주간 요약, 운영 변화, AI 시스템 업데이트 | 필요 |
| `#project-{slug}` | 프로젝트별 blocker, 결정 요청, 완료 보고 | 필요 |
| `#ops-alerts` | 자동화 실패, 긴급 리마인더 | 초기에는 필요 |

## Approval Rule

자동 전송은 아직 하지 않는다.

1. Codex/Claude가 초안을 만든다.
2. Obsidian의 `Team Brief Drafts`에 저장한다.
3. 사용자가 확인한다.
4. 승인된 글만 Notion/Slack에 보낸다.

## Brief Shape

팀 공유 글은 항상 아래 네 항목으로 줄인다.

```markdown
[{project or area}] {status}

Changed:
Decision needed:
Blocker:
Next:
```

## Navigation

- [[03_Operation/Operation Hub|Operation Hub]]
- [[03_Operation/Team Brief Drafts|Team Brief Drafts]]
- [[09_Automations/Notion Sync|Notion Sync]]
- [[09_Automations/Slack Briefs|Slack Briefs]]
- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
