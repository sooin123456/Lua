# Development Log

## 2026-05-27

Initial product direction defined.

Key decisions:

- The system is named `lua_Agent`, not Jarvis.
- The first agent is `lua_Project_Agent`.
- The system focuses on project continuity before full service automation.
- Initial validation projects are Toss mini app to app, Telegram trading bot to app, and floating solar monitoring system planning.
- Development must be documented so other users can customize the system for their own `_Agent` variants.

Next action:

- Review and approve the design spec.
- After approval, create an implementation plan for the MVP.

## 2026-05-27 MVP Implementation Plan

Planned the first executable MVP for `lua_Project_Agent`.

Scope:

- Python CLI
- SQLite project/task/checkpoint storage
- Obsidian markdown rendering
- Codex `/goal` generation
- Test-first implementation

Next action:

- Implement the plan task by task and keep commits small.

## 2026-05-27 Runtime Continuity CLI

Extended the runtime from a smoke-path MVP into a usable local project loop.

Added:

- `lua seed projects`
- `lua checkpoint add`
- `lua obsidian export`
- `lua heartbeat`

These commands let Lua seed the first three validation projects, record progress, update next actions, export project notes into the Obsidian vault, and show active resumable work.

Next action:

- Add tool-instruction routing for Claude, Codex, Gemini, Kimi, Grok, Manus, and Canva.

## 2026-05-27 Tool Routing And Lua_template Reference

Added runtime tool routing for Codex, Claude, Gemini, Kimi, Grok, Manus, and Canva.

Added `Lua_template` as the reference baseline for app-like implementation tasks:

- https://github.com/sooin123456/Lua_template

When Lua generates a Codex instruction for app/dashboard/prototype work, it now points to `Lua_template` and names the relevant reusable patterns: React Router, Supabase, Drizzle, SQL migrations, e2e tests, and transactional email structure.

Next action:

- Add approval policy profiles so trading, public posting, paid API calls, deployment, and external communications are classified consistently.

## 2026-05-27 Approval Policy Profiles

Added `lua_Risk_Agent` runtime behavior through approval policy classification.

Levels:

- `auto`
- `ask_first`
- `explicit_approval`

The runtime can now classify trading, external communication, deployment, git remote actions, paid API usage, secrets, payments, account changes, public posting, and destructive actions.

Next action:

- Add workflow templates for the three initial projects so `seed projects` can generate milestones, not just one first task.

## 2026-05-27 Workflow Templates

Expanded `lua seed projects` from one first task per project to five workflow tasks per project.

Projects:

- Toss mini app to app
- Telegram trading bot to app
- Floating solar monitoring system

The runtime now seeds 15 planned tasks on a fresh database, giving Lua enough structure to start heartbeat-driven continuation.

Next action:

- Add Notion dashboard sync stubs or export the seeded projects into the real Obsidian vault for the first operating run.

## 2026-05-27 Task Status And First Toss Research Run

Added `lua task status` so Lua can close, review, block, or fail tasks after recording checkpoints.

Completed the first operating task:

- `TASK-001`: Research Toss mini app requirements

Captured Toss WebView, configuration, testing, release, bundle size, and production verification constraints in `90_System/docs/use-cases/toss-miniapp-to-app.md`, then exported the updated project note into Obsidian.

Next action:

- Start `TASK-002`: define the target user, core use case, and MVP acceptance criteria for the Toss mini app.

## 2026-05-27 Lua_testproject Follow-Up

Connected the Toss project plan to the existing local app at `/Users/sooin/Documents/Lua_testproject`.

Findings:

- The app already exists as `누가 잘못 AI`.
- The Toss appName is `lua-nooga-ai`.
- It is a feature-rich Apps in Toss WebView MVP, not a greenfield prototype.
- Local validation passed with tests, lint, Vercel build, and AIT build.

Added a follow-up work plan inside the app project and updated the Toss submission draft with the latest local build status.

Next action:

- Start `TASK-003`: map the existing app against `Lua_template` standards and produce the hardening backlog.

## 2026-05-28 Command And Record Channels Audit

Audited Lua's command intake and durable record channels.

Findings:

- Markdown Command Queue flow is healthy: `node 90_System/scripts/flow_audit.js` passed.
- No queued Markdown commands were waiting.
- No promotable Inbox signals were waiting.
- Runtime queue is active and currently starts at `TASK-003` for the Toss follow-up.
- Master Dashboard had stale `TASK-001` guidance and needed to point to `TASK-003`.

Added `00_Lua/01_Commands/Command And Record Channels.md` as the single-page map for command intake and record destinations.

Next action:

- Add a runtime `status/report` command later so this audit can be generated automatically.

## 2026-05-28 Telegram Main Command Channel

Promoted Telegram to Lua's main remote command channel.

Added:

- `90_System/09_Automations/Telegram Command Inbox.md`
- `90_System/scripts/telegram_command_inbox.js`
- `npm run telegram:queue`
- Node tests for Telegram command parsing and queue writing

Updated operating 90_System/docs so Slack is treated as a secondary/team-sharing channel, while Telegram is the personal command surface for Lua.

Next action:

- Wire the local Telegram queue to a Telegram Bot API capture path when credentials and hosting are ready.

## 2026-05-28 Telegram Bot Polling Bridge

Added the actual Telegram Bot API polling bridge for Lua's main command channel.

Added:

- `90_System/scripts/telegram_bot_poll.js`
- `npm run telegram:poll`
- `npm run telegram:watch`
- `.env.example` entries for `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ALLOWED_CHAT_IDS`
- tests for update extraction, chat allowlisting, offset persistence, queue writing, and acknowledgement sending

The poller reads `.env`, calls Telegram `getUpdates`, captures `/lua ...` messages into `90_System/09_Automations/Telegram Command Inbox.md`, and stores the next update offset in `.lua_agent/telegram_offset.txt`.

Next action:

- Create the real Telegram bot with BotFather, set `TELEGRAM_BOT_TOKEN`, send `/lua status Lua`, and run `npm run telegram:poll`.

## 2026-05-28 Vault Root Cleanup And Secret-Friendly Polling

Cleaned the vault root so it only contains repo entrypoints, current top-level architecture 90_System/docs, and package/config files.

Moved or removed:

- Removed root `Lua-v3-*` legacy spec copies; canonical versions remain under `90_System/05_Archives/Lua Specs/`.
- Moved `_PATCH-notes.md` to `90_System/05_Archives/Patch Notes.md`.
- Moved `지원사업 검토.md` to `90_System/80_Lua_Details/03_Operation/Government Support/지원사업 검토.md`.
- Moved `환영합니다!.md` to `90_System/05_Archives/Welcome.md`.
- Added `90_System/03_Wiki/Vault Folder Structure.md`.

Also updated Telegram polling so it reads `.env` automatically without printing secret values.

Result:

- `node 90_System/scripts/vault_audit.js` reports 0 orphan notes and 0 broken links.
- `npm run telegram:poll` reads `.env` and found no pending `/lua` commands.

## 2026-05-28 Practical Operating Layers

Reframed the vault around real usage instead of only folder hygiene.

Added three operating layers:

- memory classification: what Lua should remember later
- command taxonomy: what kind of instruction the user gave and how AI should behave
- activity summary: what happened, what changed, and what is next

Added guides and templates so future Obsidian organization can follow these layers without moving every existing folder at once.

## 2026-05-28 Command Center Folder Restructure

Changed `00_Lua/01_Command Center` from a flat collection of notes into operating folders:

- `00_Dashboard`
- `01_Commands`
- `02_Memory`
- `03_Summaries`
- `04_Policies`

Updated all command scripts, tests, and vault links to use the new paths. This makes Telegram and Obsidian command intake land under `01_Commands`, long-term context under `02_Memory`, and session/provenance records under `03_Summaries`.

## 2026-05-28 User-Facing Root Restructure

Promoted the actual Lua workspace to `00_Lua` and moved non-user-facing support material to `90_System`.

Visible daily workspace:

- `00_Lua/00_Inbox`
- `00_Lua/01_Command Center`
- `00_Lua/02_Projects`
- `00_Lua/03_Operation`
- `00_Lua/04_Resources`
- `00_Lua/05_Personal Studio`

Internal/support workspace:

- `90_System/03_Wiki`
- `90_System/05_Archives`
- `90_System/07_Lua_System`
- `90_System/08_Artifacts`
- `90_System/09_Automations`
- `90_System/99_Templates`
- `90_System/docs`
- `90_System/scripts`
- `90_System/tests`
- `90_System/lua_agent`
