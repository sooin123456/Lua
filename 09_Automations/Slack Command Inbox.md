---
type: automation-map
system: slack
status: draft
last_updated: 2026-05-16
---

# Slack Command Inbox

내가 외부에 있을 때 Slack으로 Lua에게 명령을 내리는 온라인 명령 수신함이다.

## Purpose

Slack은 개인/팀 작업 공간이 아니라 모바일 원격 조종석이다.

밖에서 떠오른 생각, 할 일, 팀 공유 요청, AI agent app 실행 요청을 Slack에 던지고, Lua가 나중에 Obsidian과 Codex 작업으로 분리한다.

## Command Format

| Command | 예시 | 처리 |
|---|---|---|
| `/lua inbox` | `/lua inbox Toss 미니앱처럼 신경망 UI 실험` | Inbox capture |
| `/lua todo` | `/lua todo RTU 부품 조달 확인` | Backlog 후보 |
| `/lua brief` | `/lua brief 오늘 회의 결과 팀 공유 초안` | Team Brief Draft |
| `/lua ask` | `/lua ask 테크인 수상태양광 실적 조사` | Research 후보 |
| `/lua status` | `/lua status Green Building` | 상태 요약 요청 |
| `/lua approve` | `/lua approve brief-20260516-001` | 승인 후보 |

## Agent App Commands

자세한 역할별 명령 체계는 [[09_Automations/Slack Agent App Command System|Slack Agent App Command System]]을 따른다.

| Command | Agent App | 용도 |
|---|---|---|
| `/lua ceo` | Lua CEO | 우선순위/결정 |
| `/lua pm` | Lua PM | 요구사항/업무 분해 |
| `/lua research` | Lua Research | 조사/비교 |
| `/lua write` | Lua Writer | Slack/Notion/제안서 초안 |
| `/lua build` | Lua Builder | 앱/스크립트/agent app 구현 |
| `/lua qa` | Lua QA | 검사/리뷰/보안 |
| `/lua release` | Lua Release | push/배포/요약 |
| `/lua ops` | Lua Ops | inbox/log/vault 정리 |

## Initial Implementation

처음에는 Slack API 자동 수신보다 수동-반자동으로 시작한다.

1. Slack에서 명령을 적는다.
2. Codex 또는 Claude가 Slack 내용을 가져오거나 사용자가 붙여넣는다.
3. 이 문서의 Queue에 명령을 저장한다.
4. Codex가 Queue를 읽고 Obsidian에 반영한다.

다음 단계에서는 Slack slash command 또는 workflow webhook을 붙인다.

## Local Queue Test

Slack slash command를 붙이기 전에는 아래 명령으로 Queue 동작을 테스트한다.

```bash
node scripts/slack_command_inbox.js "/lua research brief :: 테크인 수상태양광 실적 조사"
node scripts/slack_command_inbox.js --source slack-mobile "/lua inbox 밖에서 떠오른 아이디어"
```

## Queue

| ID | Source | Command | Payload | Status | Result |
|---|---|---|---|---|---|
| example-001 | Slack | `/lua inbox` | 예시 아이디어 | done | [[00_Inbox/AI 분류 대기중...|Inbox]] |
| slack-20260516-023413 | slack-mobile | /lua research | 테크인 수상태양광 실적 조사 | queued |  |

## Routing

| Command | Destination |
|---|---|
| `/lua inbox` | [[00_Inbox/AI 분류 대기중...|AI 분류 대기중]] |
| `/lua todo` | Project Backlog or [[01_Command Center/Urgent List|Urgent List]] |
| `/lua brief` | [[03_Operation/Team Brief Drafts|Team Brief Drafts]] |
| `/lua ask` | Project Research or Industry Intelligence |
| `/lua status` | [[01_Command Center/Agent Dashboard|Agent Dashboard]] command queue |

## Safety

- Slack command는 기본적으로 capture만 한다.
- Slack command가 바로 Slack/Notion/GitHub로 전송하지 않는다.
- 외부 전송은 approved 상태와 별도 confirmation이 필요하다.

## Navigation

- [[01_Command Center/Command Modes|Command Modes]]
- [[09_Automations/Slack Agent App Command System|Slack Agent App Command System]]
- [[09_Automations/Slack Briefs|Slack Briefs]]
- [[03_Operation/Team Brief Drafts|Team Brief Drafts]]
- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
