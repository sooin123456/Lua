---
type: operating-guide
status: active
last_updated: 2026-05-16
---

# Command Modes

Lua 명령은 오프라인 명령과 온라인 명령으로 나눈다.

## Core Rule

- Offline command: 내 컴퓨터의 Obsidian vault 안에서만 바뀐다.
- Online command: Slack, GitHub, Notion, 이메일, 외부 API처럼 밖으로 나간다.

온라인 명령은 항상 더 조심한다. 초안, dry-run, 승인 중 하나를 거친 뒤 실행한다.

## Offline Commands

| Command | 하는 일 | 안전도 |
|---|---|---|
| `/inbox-triage` | Inbox를 프로젝트/리서치/아카이브로 분류 | safe |
| `/work-log` | 작업 출처와 변경 기록 | safe |
| `/artifact-log` | 재사용 가능한 결과물 등록 | safe |
| `/project-sprint` | 앱/기능 작업 계획과 로컬 구현 | medium |
| `/office-hours` | 아이디어를 문제/가설/다음 행동으로 정리 | safe |
| `/weekly-review` | 주간 회고 초안 생성 | safe |

오프라인 명령은 기본적으로 Obsidian 파일, 로컬 코드, Git 커밋까지만 다룬다.

## Online Commands

| Command | 밖으로 나가는 대상 | 실행 조건 |
|---|---|---|
| `/slack-send` | Slack | draft -> approved -> send |
| `/github-push` | GitHub | check 통과 후 push |
| `/notion-publish` | Notion | 초안 검토 후 publish |
| `/team-brief-send` | Slack/Notion | 사람이 승인한 brief만 |
| `/external-research` | web/API | 출처 확인 후 요약 저장 |
| `/email-send` | email | 작성자 승인 후 전송 |

온라인 명령은 자동 실행하지 않는다. 사용자가 명시적으로 "보내줘", "올려줘", "publish 해줘"라고 말해야 한다.

## Command Naming

명령 이름만 봐도 위험도를 알 수 있게 접미사를 쓴다.

| Suffix | 의미 | 예시 |
|---|---|---|
| `-draft` | 초안 작성, 외부 전송 없음 | `/team-brief-draft` |
| `-dry-run` | 미리보기, 외부 전송 없음 | `/slack-dry-run` |
| `-send` | 외부로 보냄 | `/slack-send` |
| `-publish` | Notion/GitHub 등에 게시 | `/notion-publish` |
| `-push` | GitHub 원격 반영 | `/github-push` |

## Approval Levels

| Level | 설명 | 예시 |
|---|---|---|
| L0 Local | 파일 작성/수정만 | Inbox 분류 |
| L1 Verified | 검사 후 로컬 커밋 | vault 정리, scripts 변경 |
| L2 Remote | GitHub push | GitHub main 업데이트 |
| L3 External Message | Slack/이메일 전송 | 팀 브리프 발송 |
| L4 Public/Irreversible | 공개 게시, 삭제, 결제 | 웹사이트 공개, 대량 삭제 |

L2 이상은 실행 전에 결과 요약을 보여주고, 사용자가 명시적으로 요청한 경우에만 진행한다.

## Slack Rule

Slack은 온라인 명령이다.

1. [[03_Operation/Team Brief Drafts|Team Brief Drafts]]에 초안 작성.
2. `node scripts/slack_brief.js --dry-run`으로 미리보기.
3. `status: approved`로 변경.
4. `node scripts/slack_brief.js --confirm-send`로 전송.

## Git Rule

GitHub push도 온라인 명령이다.

1. 파일 수정.
2. `node scripts/check.js`.
3. `node scripts/vault_audit.js`.
4. 로컬 commit.
5. 사용자가 "올려줘" 또는 "push 해줘"라고 하면 push.

## Navigation

- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
- [[01_Command Center/Obsidian Writing Rules|Obsidian Writing Rules]]
- [[09_Automations/Slack Briefs|Slack Briefs]]
- [[01_Command Center/Work Ledger|Work Ledger]]
