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
| Atlas CEO 자동 분류 | 가능 |
| 각 agent app 하달 | 설계됨, Codex/Claude가 수동 실행 |
| 결과물을 Obsidian에 저장 | 가능 |
| Slack으로 테스트 메시지 전송 | 가능 |
| Notion 발행 큐 생성 | 가능 |
| Notion에 자동 저장 | 아직 안 됨, 승인 후 수동 실행 |

## What Is Left

Notion만 남은 것은 아니다. 남은 큰 조각은 두 가지다.

| 남은 조각 | 의미 | 우선순위 |
|---|---|---|
| Atlas Router 자동화 | Command Queue를 자동으로 읽고 domain/agent/stage를 처리 | 먼저 |
| Flow Audit | Command Queue 결과가 run note, result note, hub까지 연결됐는지 검증 | 먼저 |
| Notion Publish Queue | Obsidian 결과 중 팀 공유용만 승인 후보로 정리 | 지금 |
| Notion Publishing | 승인된 후보만 Notion DB 또는 Lua_Home 하위 페이지로 저장 | 나중 |

이제 Atlas Router와 Flow Audit의 기본 뼈대가 있으므로, Notion은 먼저 발행 큐부터 붙인다. Notion은 팀이 보는 정리본이므로, Obsidian에서 결과물이 안정적으로 만들어진 뒤 승인된 초안만 보낸다.

Flow Audit는 Atlas Router 이후에 반드시 확인한다. 일반 vault audit이 깨진 링크와 고아 노트를 보더라도, Command Queue의 `Result`가 실제 run note와 결과 허브까지 이어졌는지는 별도 검증이 필요하다.

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

- `[[09_Automations/Notion Publish Queue|Notion Publish Queue]]`에 팀 공유 후보를 만든다.
- Notion DB가 있으면 DB로, 없으면 승인 후 `Lua_Home` 하위 페이지로 보낸다.
- 자동 저장은 approved 상태에서만 한다.

## Current Next Step

다음 단계는 Notion Publish Queue를 승인 흐름으로 굴리는 것이다.

1. [[09_Automations/Notion Publish Queue|Notion Publish Queue]]에서 draft를 확인한다.
2. 공유해도 되는 항목만 approved로 바꾼다.
3. Codex가 승인된 항목만 Notion에 만든다.
4. 결과 링크를 Work Ledger와 원본 note에 남긴다.

## Navigation

- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[09_Automations/Slack Command Inbox|Slack Command Inbox]]
- [[09_Automations/Slack Agent App Command System|Slack Agent App Command System]]
- [[09_Automations/Notion Sync|Notion Sync]]
- [[09_Automations/Notion Publish Queue|Notion Publish Queue]]
- [[07_Lua_System/agents/README|Lua Agents]]
