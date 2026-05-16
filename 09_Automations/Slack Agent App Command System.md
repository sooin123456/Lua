---
type: automation-design
system: slack
status: draft
last_updated: 2026-05-16
---

# Slack Agent App Command System

Slack을 밖에서 Lua AI Agent App들을 호출하는 온라인 명령 인터페이스로 쓴다.

이 설계는 두 가지 패턴을 Lua에 맞게 가져온다.

- Superpowers: 바로 실행하지 않고 질문, 설계, 계획, 실행, 검증을 거치는 방법론.
- gstack: CEO, Designer, Eng Manager, Release Manager, Doc Engineer, QA처럼 역할별 agent command를 나누는 방식.

## Core Idea

Slack에서는 짧고 거칠게 명령한다. Lua는 그 명령을 agent app으로 라우팅하고, 실행 가능한 형태로 정리한다.

```text
밖에서 Slack 입력
→ /lua 명령 수신
→ Atlas가 라우팅
→ 역할별 Agent App 호출
→ Obsidian에 기록/초안/대기열 생성
→ 필요하면 Codex/Claude가 실행
→ 검증 후 Slack으로 요약
```

## Superpowers-Inspired Workflow

모든 중요한 명령은 아래 단계를 따른다.

| Stage | 의미 | Lua 처리 |
|---|---|---|
| 1. Clarify | 무엇을 하려는지 질문 | Atlas가 목적/제약/결과물을 묻는다 |
| 2. Design | 방향과 선택지 정리 | Scribe/Lens/Forge가 설계 초안 작성 |
| 3. Plan | 작은 실행 단위로 쪼개기 | Backlog 또는 Team Brief Drafts 생성 |
| 4. Execute | 구현/작성/정리 | Codex/Claude/Agent App 실행 |
| 5. Verify | 결과 확인 | check, audit, 리뷰, 출처 확인 |
| 6. Brief | 요약 공유 | Slack brief 또는 Obsidian log |

Slack 명령은 기본적으로 Stage 1 또는 Stage 2까지만 자동 처리한다. 실제 실행은 승인 후 진행한다.

## gstack-Inspired Agent Apps

| Slack App | Lua Agent | 역할 | 대표 명령 |
|---|---|---|---|
| Lua CEO | Atlas | 우선순위, 의사결정, 실행 순서 | `/lua ceo` |
| Lua PM | Atlas + Vault | 요구사항 정리, backlog 관리 | `/lua pm` |
| Lua Research | Lens | 조사, 비교, 출처 정리 | `/lua research` |
| Lua Writer | Scribe | 문서, 팀 브리프, 제안서 초안 | `/lua write` |
| Lua Builder | Forge | 앱/스크립트/자동화 구현 요청 | `/lua build` |
| Lua QA | Vault + Forge | 점검, 테스트, 깨진 링크, 회귀 확인 | `/lua qa` |
| Lua Release | Archivist + Vault | GitHub push, 변경 요약, 배포 기록 | `/lua release` |
| Lua Ops | Vault | Obsidian 정리, Inbox, Work Ledger | `/lua ops` |

처음에는 앱을 여러 개 만들지 않고, Slack slash command 하나 `/lua`로 시작한다. 내부 subcommand로 역할을 나눈다.

## Command Grammar

```text
/lua {agent} {intent} :: {payload}
```

예시:

```text
/lua ceo prioritize :: 오늘 해야 할 일 5개 중 뭐부터?
/lua research brief :: 테크인 수상태양광 실적 조사해줘
/lua write slack :: 오늘 회의 내용을 팀 공유용으로 바꿔줘
/lua build app :: 10분 타이머 앱 MVP 만들어줘
/lua qa vault :: orphan/broken link 검사해줘
/lua ops inbox :: 이 아이디어 분리해줘
```

## Command Catalog

### `/lua ceo`

| Intent | 목적 | Output |
|---|---|---|
| `prioritize` | 우선순위 결정 | Daily priority draft |
| `decide` | 선택지 비교 후 결정 요청 | Decision draft |
| `focus` | 오늘 하나만 고르기 | Vibe CEO Journal entry |

### `/lua pm`

| Intent | 목적 | Output |
|---|---|---|
| `scope` | 요구사항 범위 정리 | Project Home/Backlog draft |
| `split` | 일을 작은 task로 분해 | Backlog |
| `status` | 프로젝트 상태 요약 | Status brief |

### `/lua research`

| Intent | 목적 | Output |
|---|---|---|
| `brief` | 주제 조사 요약 | Research note |
| `compare` | 후보 비교 | Comparison table |
| `source` | 출처 검토 | Source evaluation |

### `/lua write`

| Intent | 목적 | Output |
|---|---|---|
| `slack` | Slack 공유 초안 | Team Brief Draft |
| `notion` | Notion 정리 초안 | Team Brief Draft |
| `proposal` | 제안서/지원사업 초안 | Proposal draft |

### `/lua build`

| Intent | 목적 | Output |
|---|---|---|
| `app` | 작은 앱 MVP | Project sprint draft |
| `script` | 자동화 스크립트 | Forge task |
| `agent` | 새 agent app 설계 | Agent spec |

### `/lua qa`

| Intent | 목적 | Output |
|---|---|---|
| `vault` | Obsidian 점검 | Audit result |
| `code` | 코드 점검 | Review notes |
| `security` | secret/API key 점검 | Security checklist |

### `/lua release`

| Intent | 목적 | Output |
|---|---|---|
| `summary` | 변경 요약 | Release note |
| `push` | GitHub 반영 요청 | Push checklist |
| `handoff` | 다음 작업 인계 | Work Ledger |

### `/lua ops`

| Intent | 목적 | Output |
|---|---|---|
| `inbox` | Inbox 분류 | Classified notes |
| `log` | 작업 기록 | Work Ledger |
| `cleanup` | vault 정리 | Audit plan |

## Safety Defaults

| Command Type | Default |
|---|---|
| Capture | 자동 허용 |
| Draft | 자동 허용 |
| Local edit | Codex 확인 후 허용 |
| Git push | 명시적 승인 필요 |
| Slack send | approved + `--confirm-send` 필요 |
| Notion publish | 아직 비활성 |
| Public/paid/destructive action | 항상 중지 |

## MVP Implementation

1. `/lua` slash command를 하나 만든다.
2. 모든 payload를 [[09_Automations/Slack Command Inbox|Slack Command Inbox]] Queue에 저장한다.
3. Codex가 Queue를 읽고 라우팅한다.
4. Slack 응답은 "접수됨 + 다음 처리 위치"까지만 보낸다.
5. 자동 실행은 S0/S1까지만 허용한다.

## Sources

- https://github.com/obra/superpowers
- https://github.com/garrytan/gstack

## Navigation

- [[09_Automations/Slack Command Inbox|Slack Command Inbox]]
- [[01_Command Center/Command Modes|Command Modes]]
- [[07_Lua_System/agents/README|Lua Agents]]
- [[03_Operation/Team Brief Drafts|Team Brief Drafts]]
