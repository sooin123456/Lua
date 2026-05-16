---
type: operating-architecture
status: active
last_updated: 2026-05-16
---

# Lua End-to-End Flow

Lua의 전체 흐름은 "Obsidian에서 명령을 넣고, Atlas CEO가 분류하고, 각 agent app이 결과물을 만들고, 필요한 결과만 Notion/Slack에 공유"하는 구조다. Slack은 외부에 있을 때 쓰는 보조 입력 채널이다.

## Target Flow

```text
00_Inbox 또는 Obsidian Command Center에 입력
→ Inbox 원문은 triage 후 명령/프로젝트/리서치로 분리
→ Atlas CEO가 자동 분류
→ 역할별 agent app에 하달
→ 결과물을 Obsidian에 저장
→ 팀 공유가 필요한 것만 Notion/Slack 초안 생성
→ 승인 후 Notion 저장 또는 Slack 전송
→ Work Ledger에 출처 기록
```

## Current Reality

아직 전체 자동화가 완성된 것은 아니다.

| 단계 | 현재 상태 |
|---|---|
| Obsidian에 명령/기록 작성 | 가능 |
| Inbox에서 Command Center로 승격 | 수동 가능 |
| Slack에서 원격 명령 설계 | 가능, 보조 경로 |
| Slack 명령을 로컬 Queue에 넣기 | 가능 |
| Atlas CEO 자동 분류 | 설계됨, 아직 자동 실행 전 |
| 각 agent app 하달 | 설계됨, Codex/Claude가 수동 실행 |
| 결과물을 Obsidian에 저장 | 가능 |
| Slack으로 테스트 메시지 전송 | 가능 |
| Notion에 자동 저장 | 아직 안 됨 |

## Correct Mental Model

지금은 아래 상태다.

```text
Obsidian 명령 입력
→ Queue/노트에 저장
→ Codex가 읽고 분류/처리
→ Obsidian에 결과 저장
→ 필요하면 Slack으로 보냄
```

목표는 아래 상태다.

```text
Obsidian 명령 입력
→ Atlas CEO 자동 분류
→ Agent App 자동 실행 또는 초안 생성
→ Obsidian 저장
→ Notion/Slack 공유 후보 생성
→ 승인 후 공유
```

## Source Of Truth

| 정보 | 원본 저장 위치 |
|---|---|
| 원본 아이디어 | Obsidian Inbox |
| 프로젝트 진행 | Obsidian Project Home/DevLog/Backlog |
| 리서치 | Obsidian Research |
| agent 실행 기록 | Work Ledger |
| 팀 공유 초안 | Team Brief Drafts |
| 팀이 보는 정리본 | Notion |
| 즉시 알림/승인 요청 | Slack |

Notion은 원본 저장소가 아니다. Notion은 팀이 보는 정리본이다.

## Atlas CEO Routing

Atlas CEO는 명령을 아래처럼 분류한다.

| 들어온 명령 | 라우팅 |
|---|---|
| 아이디어/메모 | Vault/Ops -> Inbox |
| 우선순위/결정 | CEO -> Decision draft |
| 조사 요청 | Lens/Research -> Research note |
| 글쓰기/공유 | Scribe/Writer -> Team Brief Draft |
| 앱/자동화 만들기 | Forge/Builder -> Project sprint |
| 점검/보안/링크 | Vault/QA -> Audit result |
| 배포/푸시/공유 | Release -> Checklist |

## Notion Save Rule

Notion 저장은 자동 기본값이 아니다.

Notion에는 아래 조건을 만족할 때만 저장한다.

- 팀이 반복해서 봐야 한다.
- 담당자, 마감, 상태 같은 운영 필드가 있다.
- 원본 사고 과정이 아니라 정리된 결과다.
- 사용자가 승인했다.

## Phases

### Phase 1: Obsidian Command OS

- Obsidian Command Center에 명령을 남긴다.
- Codex가 Queue를 읽고 처리한다.
- 결과는 Obsidian에 저장한다.

### Phase 2: Slack Command Intake

- `/lua` slash command를 붙인다.
- Slack 명령이 자동으로 Slack Command Inbox에 들어온다.
- 응답은 "접수됨" 정도만 자동 전송한다.

### Phase 3: Agent Router

- Atlas CEO가 명령을 자동 분류한다.
- 적절한 agent app과 결과 위치를 정한다.
- 위험한 작업은 draft/approval로 멈춘다.

### Phase 4: Notion Publishing

- Notion DB를 만든다.
- Obsidian 결과 중 팀 공유용만 Notion에 보낸다.
- 자동 저장은 approved 상태에서만 한다.

## Current Next Step

Notion 자동 저장보다 먼저 해야 할 일은 Obsidian Command Center를 실제로 굴리는 것이다.

1. [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]에 `/lua {domain} {intent} :: {payload}` 명령을 쓴다.
2. Atlas CEO 라우팅 규칙으로 domain/agent/stage를 정한다.
3. Superpowers-style workflow로 clarify/design/plan/execute/verify/brief를 진행한다.
4. 결과를 Obsidian에 저장한다.
5. Slack/Notion은 필요한 것만 승인 후 공유한다.

## Navigation

- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[09_Automations/Slack Command Inbox|Slack Command Inbox]]
- [[09_Automations/Slack Agent App Command System|Slack Agent App Command System]]
- [[09_Automations/Notion Sync|Notion Sync]]
- [[07_Lua_System/agents/README|Lua Agents]]
