---
type: operating-guide
status: active
last_updated: 2026-05-16
---

# Command Modes

Lua 명령은 "내가 어디서 명령을 내리는지" 기준으로 오프라인 명령과 온라인 명령을 나눈다.

## Core Rule

- Offline command: 내가 컴퓨터 앞에서 Codex/Claude/Obsidian을 직접 열고 내리는 명령.
- Online command: 내가 밖에 있을 때 Slack 같은 모바일/외부 채널로 Lua에게 내리는 명령.

여기서 online은 "외부로 공개한다"는 뜻이 아니라, "내가 외부에 있을 때 원격으로 명령한다"는 뜻이다.

## Offline Commands

컴퓨터 앞에 있을 때 쓰는 명령이다. Codex, Claude, Obsidian, 터미널에서 실행한다.

| 상황 | 명령 위치 | 예시 |
|---|---|---|
| vault 정리 | Codex | `orphan 연결해줘` |
| 아이디어 분류 | Codex/Obsidian | `/inbox-triage` |
| 도메인 명령 하달 | Obsidian Command Center | `/lua planning prioritize :: 이번 주 우선순위` |
| 앱 만들기 | Codex | `/project-sprint time-app first-demo` |
| 긴 글/기획 | Claude | `이 내용을 팀 공유 초안으로 바꿔줘` |
| 로컬 검사 | 터미널/Codex | `node scripts/check.js` |
| GitHub 반영 | Codex | `올려줘` |

## Online Commands

내가 밖에 있을 때 Slack으로 Lua에게 던지는 명령이다. Slack은 작업 공간이 아니라 "원격 명령 입력창"이다.

| Slack 명령 | 목적 | 기본 처리 |
|---|---|---|
| `/lua inbox {내용}` | 떠오른 생각 저장 | Obsidian Inbox에 capture |
| `/lua todo {내용}` | 할 일 등록 | Backlog 후보로 분류 |
| `/lua brief {내용}` | 팀 공유 초안 만들기 | Team Brief Drafts에 draft |
| `/lua ask {질문}` | 나중에 AI가 답할 질문 저장 | Inbox 또는 Research 후보 |
| `/lua status {프로젝트}` | 프로젝트 상태 요청 | 상태 요약 draft |
| `/lua remind {내용}` | 리마인더 후보 | Automation 후보 |
| `/lua approve {id}` | 승인 표시 | approved 상태로 변경 |

초기 버전에서는 Slack 명령이 바로 실행되지 않고 Obsidian에 "명령 대기열"로 들어간다. Codex가 나중에 대기열을 읽고 처리한다.

## Command Queue

Slack에서 들어온 온라인 명령은 아래 흐름으로 처리한다.

1. Slack message 또는 slash command.
2. Lua Command Inbox에 저장.
3. Codex가 명령을 분류.
4. 안전한 것은 Obsidian에 반영.
5. 외부 전송/게시가 필요한 것은 draft 상태로 멈춤.
6. 사용자가 승인하면 실행.

## Safety Levels

명령 위치와 별개로, 실제 행동의 위험도는 따로 본다.

| Level | 설명 | 예시 |
|---|---|---|
| S0 Capture | 기록만 함 | Slack에서 Inbox 저장 |
| S1 Local Edit | Obsidian/로컬 파일 수정 | 노트 분류, 초안 작성 |
| S2 Local Commit | Git 로컬 커밋 | vault 정리 커밋 |
| S3 Remote Sync | GitHub/Slack/Notion으로 반영 | GitHub push, Slack send |
| S4 Public/Irreversible | 공개 게시, 삭제, 결제 | 웹사이트 공개, 대량 삭제 |

Online command라도 기본은 S0 또는 S1까지만 자동 처리한다. S3 이상은 승인 없이 실행하지 않는다.

## Naming

Slack에서 쓰는 온라인 명령은 `/lua`로 시작한다.

| Prefix | 의미 |
|---|---|
| `/lua inbox` | 생각 캡처 |
| `/lua todo` | 할 일 캡처 |
| `/lua brief` | 공유 초안 |
| `/lua ask` | 질문/조사 요청 |
| `/lua status` | 상태 요청 |
| `/lua approve` | 승인 |

역할별 agent app 명령은 [[09_Automations/Slack Agent App Command System|Slack Agent App Command System]]에서 관리한다.

Codex/Claude에서 쓰는 오프라인 명령은 자연어로 말하거나 기존 `/project-sprint`, `/work-log` 같은 명령을 쓴다.

Obsidian에서 쓰는 기본 명령은 [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]의 `/lua {domain} {intent} :: {payload}` 형식을 따른다.

## Slack Rule

Slack은 online command ingress다.

- Slack으로 들어온 명령은 먼저 [[09_Automations/Slack Command Inbox|Slack Command Inbox]]에 저장한다.
- Slack으로 나가는 메시지는 [[03_Operation/Team Brief Drafts|Team Brief Drafts]]에서 approved 상태가 되어야 한다.
- Slack 전송 스크립트는 `--confirm-send` 없이는 보내지 않는다.

## Git Rule

GitHub push는 online command가 아니라 offline command의 remote sync 단계다.

1. 파일 수정.
2. `node scripts/check.js`.
3. `node scripts/vault_audit.js`.
4. 로컬 commit.
5. 사용자가 "올려줘" 또는 "push 해줘"라고 하면 push.

## Navigation

- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[01_Command Center/Obsidian Writing Rules|Obsidian Writing Rules]]
- [[09_Automations/Slack Command Inbox|Slack Command Inbox]]
- [[09_Automations/Slack Agent App Command System|Slack Agent App Command System]]
- [[09_Automations/Slack Briefs|Slack Briefs]]
- [[01_Command Center/Work Ledger|Work Ledger]]
