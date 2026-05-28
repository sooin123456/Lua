---
ai-index: true
type: operating-guide
status: active
last_updated: 2026-05-28
---

# Lua Command And Record Channels

This is the one-page map for where Lua receives commands and where Lua records work.

## Rule

Use one command channel for each kind of input, then record every meaningful result in a durable record channel.

## Command Channels

| Channel | Use When | Current Status | Next Processor |
|---|---|---|---|
| Telegram Command Inbox | You are giving Lua a personal remote command from phone or desktop Telegram | main command channel, bot polling ready | `telegram_bot_poll.js`, then Codex/Lua |
| Codex chat | You want code, file edits, tests, repo inspection, or local automation now | active | Codex |
| Obsidian Command Center | You want to write a structured `/lua {domain} {intent} :: {payload}` command for later processing | active | `process_command_queue.js`, `atlas_router.js` |
| Inbox notes | You have an idea, link, meeting note, or unclassified thought | active | `promote_inbox_to_commands.js` |
| Slack Command Inbox | You want team-facing command capture or Slack-specific sharing workflow | secondary/shared channel | `slack_command_inbox.js`, then Codex |
| Lua runtime CLI | A project/task already exists and should continue from stored state | active | `uv run lua --db .lua_agent/lua.db ...` |

## Record Channels

| Record | What Belongs Here | Current Status |
|---|---|---|
| Runtime SQLite DB | Canonical project/task/checkpoint state | active |
| Project notes under `90_System/80_Lua_Details/02_Projects/Lua` | Human-readable task status exported from runtime | active |
| Work Ledger | Who changed what, from which machine/tool, and how it was verified | active |
| Development Log | System implementation history and product decisions | active |
| Command Runs | Structured result notes for Markdown Command Queue items | active for queue-based commands |
| App project 90_System/docs | Implementation-specific handoff, release, QA, and submission notes | active per app repo |

## Current Operating Loop

```text
User request
→ Telegram as default command intake, or choose a local channel when already at the computer
→ route or execute with Lua/Codex/Claude
→ write checkpoint or command run
→ export/update project note
→ update Work Ledger for meaningful changes
→ run verification
```

## Runtime Loop

```bash
node 90_System/scripts/telegram_command_inbox.js --source telegram-mobile "/lua status Lua"
npm run telegram:poll
uv run lua --db .lua_agent/lua.db heartbeat
uv run lua --db .lua_agent/lua.db tool instruction PROJ-001 TASK-003
uv run lua --db .lua_agent/lua.db checkpoint add TASK-003 --summary "..." --done "..." --next-action "..."
uv run lua --db .lua_agent/lua.db task status TASK-003 done --next-action "..."
uv run lua --db .lua_agent/lua.db obsidian export PROJ-001 --vault .
```

## Health Checks

Run these when the command/record system feels uncertain:

```bash
uv run lua --db .lua_agent/lua.db heartbeat
node 90_System/scripts/telegram_command_inbox.js --source telegram-mobile "/lua status Lua"
npm run telegram:poll
node 90_System/scripts/process_command_queue.js --dry-run
node 90_System/scripts/promote_inbox_to_commands.js --dry-run
node 90_System/scripts/flow_audit.js
npm run test:all
```

## Known Boundaries

- Obsidian commands do not execute automatically. They are durable task instructions.
- Telegram commands are capture-first. They should not deploy, post, purchase, or push without approval.
- Slack is secondary: use it for team sharing, notifications, and Slack-specific capture.
- Runtime DB is canonical for Lua project task status.
- Obsidian project notes are readable exports and should be refreshed after runtime task changes.
- Deployments, external account writes, paid API calls, public posts, and git push require user approval.

## Navigation

- [[90_System/80_Lua_Details/01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]]
- [[00_Lua/01_Commands/Command Inbox|Obsidian Command Center]]
- [[90_System/09_Automations/Telegram Command Inbox|Telegram Command Inbox]]
- [[90_System/07_Lua_System/runtime/README|Lua Runtime]]
- [[00_Lua/03_Records/Work Ledger|Work Ledger]]
