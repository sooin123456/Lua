---
type: automation-map
system: telegram
status: active
last_updated: 2026-05-28
---

# Telegram Command Inbox

Telegram is Lua's main remote command channel.

## Purpose

Telegram is the personal command window for Lua. When the user is away from Codex or Obsidian, commands should enter here first, then Lua/Codex can classify, execute, and record them.

Slack remains useful for team sharing and notifications, but Telegram is the primary personal control surface.

## Command Format

| Command | Example | Handling |
|---|---|---|
| `/lua inbox` | `/lua inbox Toss 미니앱처럼 신경망 UI 실험` | Inbox capture |
| `/lua todo` | `/lua todo RTU 부품 조달 확인` | Backlog candidate |
| `/lua brief` | `/lua brief 오늘 회의 결과 팀 공유 초안` | Team Brief Draft |
| `/lua ask` | `/lua ask 테크인 수상태양광 실적 조사` | Research candidate |
| `/lua status` | `/lua status Lua` | Status summary request |
| `/lua approve` | `/lua approve brief-20260516-001` | Approval marker |

## Agent Commands

| Command | Lua Agent | Use |
|---|---|---|
| `/lua ceo` | Atlas | priority, decisions, sequencing |
| `/lua pm` | Atlas + Vault | requirements, task split, backlog |
| `/lua research` | Lens | research and comparison |
| `/lua write` | Scribe | drafts, briefs, proposals |
| `/lua build` | Forge | app/script/agent implementation requests |
| `/lua qa` | Vault + Forge | checks, review, security |
| `/lua release` | Archivist + Vault | release summary and handoff |
| `/lua ops` | Vault | inbox, logs, vault operations |

## Local Queue Test

Use the local queue script when testing command parsing without a live bot:

```bash
node 90_System/scripts/telegram_command_inbox.js "/lua research brief :: 테크인 수상태양광 실적 조사"
node 90_System/scripts/telegram_command_inbox.js --source telegram-mobile "/lua inbox 밖에서 떠오른 아이디어"
```

Or:

```bash
npm run telegram:queue -- "/lua status Lua"
```

## Bot Polling

Create a Telegram bot with BotFather, then add these values to `.env` or the shell environment. The poller reads `.env` automatically and never prints the token value.

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ALLOWED_CHAT_IDS=123456789
```

Poll once:

```bash
npm run telegram:poll
```

Run as a local long-polling process:

```bash
npm run telegram:watch
```

The poller uses Telegram Bot API `getUpdates`, writes `/lua ...` messages into this queue, and stores the next offset in `.lua_agent/telegram_offset.txt`.

Optional acknowledgement:

```bash
TELEGRAM_BOT_TOKEN=... node 90_System/scripts/telegram_bot_poll.js --once --ack
```

## Queue

| ID | Source | Command | Payload | Status | Result |
|---|---|---|---|---|---|
| example-001 | Telegram | `/lua inbox` | 예시 아이디어 | done | [[90_System/80_Lua_Details/00_Inbox/AI 분류 대기중...|Inbox]] |
| telegram-20260604-021717 | telegram:1780466684 | /lua status | lua | queued |  |

## Safety

- Telegram commands are capture-first.
- Telegram can request work, but it should not directly deploy, publish, push, purchase, delete, or send external messages.
- External writes require explicit approval.
- Secrets and API keys must not be pasted into Telegram command payloads.

## Navigation

- [[00_Lua/01_Commands/Command And Record Channels|Command/Record Channels]]
- [[90_System/80_Lua_Details/01_Command Center/01_Commands/Command Modes|Command Modes]]
- [[90_System/09_Automations/Slack Command Inbox|Slack Command Inbox]]
- [[00_Lua/03_Records/Work Ledger|Work Ledger]]
