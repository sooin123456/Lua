---
type: action-board
status: active
last_updated: 2026-05-16
---

# User Action Board

비개발자 기준으로 사용자가 지금 해야 할 일만 모은다.

## Today

| 순서 | 할 일 | 위치 | 완료 기준 |
|---|---|---|---|
| 1 | 떠오른 생각은 일단 Inbox에 적는다 | [[00_Inbox/AI 분류 대기중...|AI 분류 대기중]] | 원문이 남아 있음 |
| 2 | 새 아이디어는 개별 Inbox 노트로 적어도 된다 | `00_Inbox/*.md` | Inbox 승격 스크립트가 감지 |
| 3 | Codex에게 "Inbox 승격해줘" 또는 "Command Center 처리해줘"라고 말한다 | Codex | Queue가 처리됨 |
| 4 | 결과가 맞는지만 확인한다 | 결과 노트 | 수정 요청 또는 승인 |

## Atlas Router 처리 완료

| 항목 | 내용 |
|---|---|
| 처리한 command | [[01_Command Center/Command Runs/money-dust-20260516-01-build-app|money-dust-20260516-01]] |
| 처리 방식 | Atlas CEO clarify -> design -> plan |
| 현재 상태 | routed / plan |
| 다음 사용자 행동 | `돈먹는 먼지 첫 화면과 먼지 방 UI 설계해줘` |

## Current Tasks For User

| 우선순위 | 해야 할 말 | Codex가 하는 일 |
|---|---|---|
| 1 | `돈먹는 먼지 첫 화면과 먼지 방 UI 설계해줘` | Toss 챌린지 제출용 첫 화면, 먼지 캐릭터, 절약 루프 설계 |
| 2 | `Command Center 상태 보여줘` | 남은 queue와 현재 stage를 보여줌 |
| 3 | `보류해줘` | 현재 command run을 paused로 표시 |

## Current Research Link

- [[04_Resources/Energy Policies/K-water 수상태양광 Research Brief|K-water 수상태양광 Research Brief]]
- [[04_Resources/Energy Policies/Energy Policies Hub|Energy Policies Hub]]
- [[09_Automations/Notion Publish Queue|Notion Publish Queue]]

## Are We Done Except Notion?

아니다. Notion은 마지막 공유/정리본 단계다.

먼저 해야 할 것은:

1. Obsidian Inbox와 Command Center를 계속 사용한다.
2. Atlas Router가 Queue를 읽고 자동으로 처리하게 만든다.
3. 결과물이 안정적으로 쌓이면 Notion DB 저장을 붙인다.

## Recommended Next Order

내가 보기에는 지금은 아래 순서가 좋다.

| 순서 | 먼저 할 것 | 이유 | 연결 노트 |
|---|---|---|---|
| 1 | Lua 구축 우선순위 정리 | 시스템을 더 만들기 전 방향을 고정해야 함 | [[01_Command Center/Command Runs/cmd-20260516-024544-planning-prioritize|planning/prioritize]] |
| 2 | Obsidian 명령 라우터 안정화 | 앞으로 모든 일이 이 흐름을 타야 함 | [[01_Command Center/Obsidian Command Center|Obsidian Command Center]] |
| 3 | Neural UI 앱 아이디어 clarify | 앱 제작 후보지만 아직 질문이 필요함 | [[01_Command Center/Command Runs/inbox-20260516-031554-01-build-app|build/app]] |
| 4 | 수상태양광 리서치 brief | 실제 사업 리서치는 시스템 안정화 후 진행 | [[01_Command Center/Command Runs/inbox-20260516-031554-02-research-brief|research/brief]] |

지금 네가 나에게 말하면 좋은 문장:

```text
npm run lua-ui 실행해줘
```

## What Codex Does

| 상황 | Codex가 하는 일 |
|---|---|
| Inbox가 쌓임 | domain/intent로 분류하고 Command Queue로 승격 |
| Command Queue가 쌓임 | Atlas CEO처럼 clarify/design/plan 순서로 처리 |
| 결과물이 생김 | Obsidian에 저장하고 Work Ledger에 기록 |
| 공유가 필요함 | Team Brief Drafts 또는 Slack draft로 보냄 |

## Current Recommended Commands

```text
/lua planning prioritize :: 이번 주 Lua 구축 우선순위 정리
/lua ops inbox :: 00_Inbox 내용을 Command Center로 승격
/lua build agent :: Obsidian 명령을 처리하는 Atlas Router 만들기
```

## Navigation

- [[00_Inbox/AI 분류 대기중...|AI 분류 대기중]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[09_Automations/Notion Publish Queue|Notion Publish Queue]]
- [[07_Lua_System/commands/Domain Command Playbook|Domain Command Playbook]]
- [[01_Command Center/Work Ledger|Work Ledger]]
