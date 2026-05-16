---
type: command-center
status: active
last_updated: 2026-05-16
---

# Obsidian Command Center

Lua의 기본 명령 하달 장소다. Slack은 보조 입력 채널이고, 기본 운영은 Obsidian에서 한다.

## Inbox vs Command Center

| 위치 | 쓰는 상황 | 다음 단계 |
|---|---|---|
| [[00_Inbox/AI 분류 대기중...|00_Inbox]] | 아직 분류 전인 생각, 회의 메모, 자료, 링크, 감 | Codex가 domain/task로 분류 |
| Obsidian Command Center | 바로 실행하고 싶은 명령, 이미 목적이 있는 task | Atlas CEO가 agent/stage로 라우팅 |

즉, "생각을 넣는 곳"은 Inbox이고, "명령을 내리는 곳"은 Command Center다.

Inbox에 넣어도 플로우는 이어진다. 다만 한 단계가 추가된다.

```text
00_Inbox에 원문 추가
→ /inbox-triage
→ domain 분류
→ 필요한 경우 Command Queue로 승격
→ Atlas CEO 라우팅
→ agent workflow 실행
```

## Command Rule

명령은 먼저 task domain으로 분류하고, 그 다음 agent role과 workflow stage를 정한다.

```text
명령 작성
→ Domain 분류
→ Atlas CEO 라우팅
→ gstack-style role 선택
→ Superpowers-style workflow 진행
→ 결과물을 Obsidian에 저장
→ 필요한 것만 Slack/Notion 공유 후보로 이동
```

## Task Domains

| Domain | 설명 | 기본 저장 위치 | Primary Agent |
|---|---|---|---|
| `planning` | 전략, 우선순위, 사업 아이디어, 의사결정 | Vibe CEO Journal, Decision draft | Atlas |
| `marketing` | 콘텐츠, 캠페인, 고객 메시지, 세일즈 자료 | Operation, Team Brief Drafts | Scribe |
| `design` | UX, 화면, 브랜드, 서비스 경험 | Project Research/Design note | Scribe + Forge |
| `service` | 고객 대응, 운영 프로세스, CS, CRM | Client CRM, Operation | Vault + Scribe |
| `project` | 프로젝트 실행, 일정, backlog, milestone | Project Home/Backlog/DevLog | Atlas + Vault |
| `research` | 조사, 비교, 출처 검토, 시장/경쟁사 | Research notes | Lens |
| `build` | 앱, 자동화, 스크립트, agent app 구현 | Project DevLog, Artifact Ledger | Forge |
| `ops` | vault 정리, 시스템 규칙, 자동화 운영 | Work Ledger, Automations | Vault |

## Command Grammar

Obsidian에서는 아래 형식을 권장한다.

```text
/lua {domain} {intent} :: {payload}
```

예시:

```text
/lua planning prioritize :: 이번 주 해야 할 일 정리
/lua marketing brief :: 신제품 소개 Slack 초안
/lua design screen :: 타이머 앱 첫 화면 설계
/lua service flow :: 고객 문의 처리 흐름 정리
/lua project split :: 수상태양광 조사 일을 task로 쪼개기
/lua research compare :: 테크인과 경쟁사 비교
/lua build app :: 10분 타이머 MVP 만들기
/lua ops cleanup :: vault audit 후 정리
```

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| example-001 | research | compare | 테크인과 경쟁사 비교 | clarify | Lens | planned | [[01_Command Center/Command Runs/example-001-research-compare|run]] |
| cmd-20260516-024544 | planning | prioritize | 이번 주 Lua 구축 우선순위 정리 | plan | Atlas | routed | [[01_Command Center/Command Runs/cmd-20260516-024544-planning-prioritize|run]] |
| inbox-20260516-031554-01 | build | app | 카파시의 인터뷰를 보면 앞으로는 매 순간 신경망이 그려내는 화면 미리 짜둔 화면이 아니고 코드가 사라지고 신경망이 거의 모든일을 하는 형태 그렇다면 내가 앞으로 새로운 사업 아이템 신규 사업들을 얘기할때는 이런 형태를 염두해두고 하나씩 만들어 보는게 좋을듯 예를 들어서 toss 미니앱 같은 경우 | plan | Forge | routed | [[01_Command Center/Command Runs/inbox-20260516-031554-01-build-app|run]] |
| inbox-20260516-031554-02 | research | brief | 그리고 수상태양광 관련해서 오늘 미팅을 진행함 K water 발주 사이즈 우리가 협력할수있는 업체들 우리 경쟁사들에 대한 조사가 필요할듯 제일 중요한건 테크인에 대한 조사가 필요할듯 | brief | Lens | briefed | [[04_Resources/Energy Policies/K-water 수상태양광 Research Brief|brief]] |

## Superpowers Workflow

각 명령은 아래 단계를 따른다.

| Stage | 질문 | 결과물 |
|---|---|---|
| `clarify` | 정확히 무엇을 하려는가? | 문제/목표/제약 |
| `design` | 어떤 방식이 좋은가? | 방향/선택지 |
| `plan` | 어떤 작은 일로 쪼갤까? | task list |
| `execute` | 실제로 무엇을 만들까? | draft/code/note |
| `verify` | 제대로 됐나? | check/audit/review |
| `brief` | 누구에게 어떻게 공유할까? | Slack/Notion/Work Ledger |

중요한 일은 `clarify`와 `design` 없이 바로 `execute`하지 않는다.

## gstack Role Routing

| Role | Lua Agent | 쓰는 상황 |
|---|---|---|
| CEO | Atlas | 우선순위, 의사결정, focus |
| PM | Atlas + Vault | 요구사항, scope, task split |
| Designer | Scribe + Forge | 화면, UX, service flow |
| Eng Manager | Forge | 구현 계획, 기술 선택 |
| Release Manager | Archivist + Vault | push, release, handoff |
| Doc Engineer | Scribe | 문서, Notion/Slack 초안 |
| QA | Vault + Forge | 검사, 보안, 회귀 확인 |
| Researcher | Lens | 조사, 비교, 출처 |

## How To Use

1. 이 문서의 Command Queue에 명령을 한 줄 추가한다.
2. Codex에게 "Obsidian Command Center 처리해줘"라고 말한다.
3. Codex가 domain/stage/agent를 확인한다.
4. 결과물을 각 저장 위치에 반영한다.
5. Work Ledger에 기록한다.

## Promote Inbox Automatically

Inbox에 막 적은 원문은 아래 스크립트로 Command Queue 후보로 승격할 수 있다.

```bash
node scripts/promote_inbox_to_commands.js --dry-run
node scripts/promote_inbox_to_commands.js --apply
```

Codex에게는 "Inbox 승격해줘"라고 말하면 된다.

## Process Command Queue

Queue에 들어온 명령은 아래 스크립트로 command run note를 만든다.

```bash
node scripts/process_command_queue.js --dry-run
node scripts/process_command_queue.js --apply
```

Codex에게는 "Command Center 처리해줘"라고 말하면 된다.

## Atlas Router

planned/queued command run을 Atlas CEO 방식으로 다음 단계까지 라우팅하려면 아래 스크립트를 쓴다.

```bash
node scripts/atlas_router.js --dry-run
node scripts/atlas_router.js --apply
```

Codex에게는 "다음 command run 진행해줘"라고 말하면 된다.

## Flow Audit

Command Queue 결과가 run note, brief, hub까지 실제로 이어졌는지 확인하려면 아래 스크립트를 쓴다.

```bash
node scripts/flow_audit.js
```

Codex에게는 "다음 플로우 검증해줘"라고 말하면 된다.

## Notion Publish Queue

Notion은 팀 공유용 정리본이다. 승인 전에는 Notion에 직접 쓰지 않고, 먼저 발행 후보를 Obsidian 큐에 만든다.

```bash
node scripts/notion_publish_queue.js --dry-run
node scripts/notion_publish_queue.js --apply
```

Codex에게는 "Notion 발행 큐 만들어줘"라고 말하면 된다.

## When To Start From Inbox

아래 경우에는 Command Center보다 Inbox에 먼저 쓴다.

- 아직 기획/마케팅/디자인/서비스/프로젝트 중 어디인지 모르겠다.
- 그냥 생각이 떠올랐다.
- 회의 내용을 일단 받아 적는다.
- 링크나 자료를 저장만 해두고 싶다.
- 나중에 정리할 가능성이 있다.

## When To Start From Command Center

아래 경우에는 바로 Command Center에 쓴다.

- 이미 실행하고 싶은 일이 명확하다.
- 어떤 domain인지 안다.
- Codex/Claude/agent에게 하달할 명령이다.
- 결과물이 필요하다.

예:

```text
/lua research compare :: 테크인과 경쟁사 비교
/lua marketing brief :: 오늘 회의 내용을 팀 공유 초안으로 정리
/lua build app :: 10분 타이머 앱 MVP 만들기
```

## Navigation

- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/User Action Board|User Action Board]]
- [[01_Command Center/Command Modes|Command Modes]]
- [[Lua End-to-End Flow|Lua End-to-End Flow]]
- [[09_Automations/Notion Publish Queue|Notion Publish Queue]]
- [[07_Lua_System/agents/README|Lua Agents]]
- [[01_Command Center/Work Ledger|Work Ledger]]
