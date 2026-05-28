---
type: automation-map
system: slack
last_updated: 2026-05-16
---

# Slack Briefs

Slack is a signal channel, not the system of record.

Slack has two secondary roles in Lua.

- Inbound: Slack-specific team command capture through [[90_System/09_Automations/Slack Command Inbox|Slack Command Inbox]].
- Outbound: approved brief sending through this document.

Lua's main personal remote command channel is [[90_System/09_Automations/Telegram Command Inbox|Telegram Command Inbox]].

Slack sending is a remote sync action. Follow [[90_System/80_Lua_Details/01_Command Center/01_Commands/Command Modes|Command Modes]] before sending.

## Channels

| Channel | Purpose |
|---|---|
| `#ai-briefings` | weekly summaries and decision requests |
| `#project-{slug}` | project-specific blockers and ship notes |
| `#ops-alerts` | failed automation drafts and urgent reminders |

## Draft Format

```markdown
[{project}] {status}

Changed:
Decision needed:
Blocker:
Next:
```

## Trigger Types

| Trigger | Send to | Example |
|---|---|---|
| decision-needed | `#project-{slug}` | "승인 필요" |
| blocker | `#project-{slug}` or `#ops-alerts` | "일정 지연 가능성" |
| weekly-summary | `#ai-briefings` | "이번 주 변경/결정/다음 행동" |
| automation-failed | `#ops-alerts` | "Notion sync draft failed" |

## Approval Rule

Slack은 초기에 자동 전송하지 않는다. [[90_System/80_Lua_Details/03_Operation/Team Brief Drafts|Team Brief Drafts]]에 초안을 만들고 사용자가 승인한 뒤 보낸다.

## Local Webhook Flow

Slack 플러그인 직접 전송 도구가 없을 때는 Incoming Webhook으로 먼저 연결한다.

1. Slack에서 Incoming Webhook을 만든다.
2. 이 vault의 `.env.example`을 `.env`로 복사한다.
3. 채널에 맞는 값을 채운다.
   - `#ai-briefings` -> `SLACK_WEBHOOK_AI_BRIEFINGS`
   - `#ops-alerts` -> `SLACK_WEBHOOK_OPS_ALERTS`
   - 테스트용 기본값 -> `SLACK_WEBHOOK_URL`
4. [[90_System/80_Lua_Details/03_Operation/Team Brief Drafts|Team Brief Drafts]]에 `slack-brief` 블록을 만든다.
5. 먼저 `node 90_System/scripts/slack_brief.js --dry-run`으로 확인한다.
6. 사람이 승인하면 `status: approved`로 바꾼다.
7. `node 90_System/scripts/slack_brief.js --confirm-send`로 보낸다.

`.env`는 Git에 올라가지 않는다.

## Connection Status

- 2026-05-16: `#ai-briefings` Incoming Webhook connected.
- Test message sent successfully from Windows Codex using `90_System/scripts/slack_brief.js`.

## Draft Block

```markdown
<!-- slack-brief
channel: #ai-briefings
status: approved
title: Weekly update
-->
보낼 메시지
<!-- /slack-brief -->
```

## Test Commands

```bash
node 90_System/scripts/slack_brief.js --message "[Lua] Slack dry-run test" --channel "#ai-briefings" --dry-run
node 90_System/scripts/slack_brief.js --dry-run
node 90_System/scripts/slack_brief.js --confirm-send
```

## Rule

Draft first. Human approval before sending until the format is trusted.

## Navigation

- [[90_System/09_Automations/README|Automations]]
- [[90_System/80_Lua_Details/01_Command Center/01_Commands/Command Modes|Command Modes]]
- [[90_System/09_Automations/Telegram Command Inbox|Telegram Command Inbox]]
- [[90_System/09_Automations/Slack Command Inbox|Slack Command Inbox]]
- [[90_System/80_Lua_Details/03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[90_System/80_Lua_Details/03_Operation/Team Brief Drafts|Team Brief Drafts]]
- [[90_System/80_Lua_Details/01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]]
- [[00_Lua/03_Records/Work Ledger|Work Ledger]]
