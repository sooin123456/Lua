---
type: work-ledger
status: active
last_updated: 2026-05-28
---

# Work Ledger

이 문서는 작업이 어느 컴퓨터와 어느 AI에서 진행됐는지 추적한다.

## 2026-06-04 KST - fix Telegram invalid command acknowledgement

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Lua Cloud Main Telegram webhook, command parser boundary
- Trigger: user said Telegram replies/alerts were not visible and asked whether commands were coming in
- Changed: found Telegram had a pending update with `500 Internal Server Error`; added invalid `/lua` command handling so malformed commands return 200, send a helpful command-format reply, and log `telegram_command_invalid` instead of leaving Telegram to retry silently
- Verification: reproduced the malformed `/lua` 500 with a failing test; `node --test 90_System/tests/lua_cloud_main.test.js`; `npm run test:node`; `npm run check`; `npm run obsidian:sync`; `node 90_System/scripts/check.js` in the actual Obsidian vault; deployed Railway smoke returned `200 invalid_lua_command`; Telegram webhook pending count cleared to 0; Supabase logs recorded invalid command warnings instead of 500 retries
- Next: continue the Toss miniapp QA handoff, and later add an alias/router for project-style commands like `/lua toss`

## 2026-06-04 KST - add Codex handoff for Telegram todos

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Lua Cloud Main, Telegram todo handoff, Command Runs
- Trigger: user approved connecting task-aware `/lua next` results to actual Codex follow-up work
- Changed: added `npm run cloud:codex:next`, a Supabase latest-todo reader, and a Codex handoff generator that writes Telegram todos into `90_System/80_Lua_Details/Command Runs/`; generated `telegram-todo-12-codex-handoff` for `Toss miniapp QA follow up`
- Verification: `node --test 90_System/tests/lua_cloud_main.test.js`; `npm run cloud:codex:next`; `npm run test:node`; `npm run check`; `npm run obsidian:sync`; `node 90_System/scripts/check.js` in the actual Obsidian vault
- Next: use the generated handoff as the next Codex work item and turn it into a concrete Toss miniapp QA follow-up task

## 2026-06-04 KST - make next and todo task-aware

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Lua Cloud Main command context, `/lua next`, `/lua todo`
- Trigger: user asked to continue after automated processing worked
- Changed: added command context lookup for recent commands, stored todos, and memories; changed `/lua todo` to return a todo capture confirmation; changed `/lua next` to recommend the latest stored todo or recent command instead of a generic routing message
- Verification: `npm run test:node`; `npm run check`; Railway smoke confirmed `/lua todo :: Toss miniapp QA follow up` returns `Todo captured` and `/lua next` recommends todo #12; Supabase rows #12 and #13 are `done`; Telegram webhook has no pending/error
- Next: connect task-aware `/lua next` results to Codex follow-up work so recommended todos can become actual repo tasks

## 2026-06-04 KST - automate Cloud Main command processing

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Lua Cloud Main webhook replies, background processor loop, runtime config
- Trigger: user asked to continue after manual `npm run cloud:process` worked
- Changed: made Telegram webhooks process simple commands inline and reply with the processed result, added a lightweight background processor loop for leftover queued commands, added `LUA_PROCESSOR_LOOP`, `LUA_PROCESS_INTERVAL_MS`, and `LUA_PROCESS_LIMIT` controls, and documented the behavior
- Verification: `npm run test:node`; `npm run check`; `npm run cloud:supabase:check`; deployed Railway smoke request returned `processed: true` with result text; Telegram webhook info had no pending/error; Supabase confirmed command id 7 processed inline and command id 6 processed later by the background loop
- Next: make `/lua next` and `/lua todo` return useful task-aware responses instead of generic routing text

## 2026-06-04 KST - add Cloud Main command processor v1

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Lua Cloud Main command processor, Supabase schema, npm scripts
- Trigger: user approved moving from command capture into a practical command processing loop
- Changed: added `npm run cloud:process`, command processing result builders, Supabase queued-command lookup/update helpers, `status`/`processedAt`/`result` fields for `lua_commands`, a safe `message` field for logs, and tests for queued command processing
- Verification: `npm run test:node`; `npm run check`; `npm run cloud:supabase:check`; `npm run cloud:process`; Supabase REST confirmed command id 5 moved to `done` with a practical status result using real command and memory counts
- Next: wire `cloud:process` into a scheduled worker or Railway cron-like trigger, then make Telegram replies include the processed result instead of only the immediate queued acknowledgement

## 2026-06-04 KST - connect Telegram webhook and harden Cloud Main

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Lua Cloud Main, Telegram webhook, Supabase store
- Trigger: user asked Codex to continue the next system setup
- Changed: confirmed Railway `/health` is live, registered the Telegram webhook to the Railway domain, found Supabase schema was not applied yet, changed Cloud Main so missing Supabase tables or failed Telegram replies do not break webhook acknowledgements, added `npm run cloud:supabase:check`, and verified the user-applied Supabase schema
- Verification: `npm run cloud:webhook:dry-run -- --url https://lua-production-6d18.up.railway.app`; `npm run cloud:webhook:set -- --url https://lua-production-6d18.up.railway.app`; Telegram `getWebhookInfo`; webhook smoke tests reproduced the Supabase table error and reply-failure edge; `npm run cloud:supabase:check`; `/lua status Lua` and `/lua remember` webhook smoke tests; Supabase REST queries confirmed rows in `lua_commands`, `lua_memories`, and `lua_logs`; real user Telegram `/lua status lua` stored as command id 4 with no pending webhook errors; `node --test 90_System/tests/lua_cloud_main.test.js`; `npm run check`
- Next: use the stored user command row to build the first practical Lua status response loop

## 2026-06-04 KST - remove legacy messaging integration surface

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: command intake, automation scripts, operating docs, environment template
- Trigger: user asked to remove remaining legacy messaging code and clean the Lua system around the real command channels
- Changed: deleted the legacy messaging queue/sender scripts and automation docs, removed npm scripts and webhook env examples, rewired command guidance around Telegram as the main remote ingress, Obsidian as durable command/record space, and Notion as optional approved sharing output
- Verification: removed-channel text search confirmed only protected Identity and system permission notes still contain the literal service name; `npm run check`; `npm run test:node`; `npm run obsidian:sync`; `node 90_System/scripts/check.js` in the actual Obsidian vault
- Next: commit the cleanup and keep Telegram as Lua's only remote command ingress

## 2026-06-04 KST - start Lua Cloud Main

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Lua Cloud Main runtime, Railway/Supabase architecture, Telegram webhook server
- Trigger: user decided Lua should become an always-on Hermes-like main agent and approved the Railway + Supabase stack
- Changed: added a dependency-free Node Cloud Main server with `/health` and `/webhooks/telegram`; added Telegram command normalization, status replies, `/lua remember` memory capture, Supabase REST store adapter, Supabase schema, Railway deployment docs, environment template, and tests
- Verification: `node --test 90_System/tests/lua_cloud_main.test.js`; `npm run check`; `npm run test:node`; `PORT=3307 LUA_DEPLOYMENT_TARGET=railway npm run cloud:main` with `/health` smoke test
- Commit: pending
- Next: create Supabase project, run the schema, deploy the Cloud Main service to Railway, and set the Telegram webhook

## 2026-06-04 KST - prepare Lua Cloud Main deployment helpers

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Railway config, Cloud Main setup scripts, Telegram webhook setup, local `.env`
- Trigger: user asked Codex to do everything except the account-side Supabase and Railway project creation
- Changed: added Railway deployment config, safe cloud environment validation, Telegram webhook dry-run/apply setup commands, local webhook secret generation, and deployment helper docs; verified the setup commands do not print Telegram or Supabase secret values
- Verification: `npm run cloud:check-env`; `npm run cloud:webhook:dry-run -- --url https://lua-main.example.railway.app`; `node --test 90_System/tests/lua_cloud_main.test.js`; `npm run check`; `npm run test:node`; `npm run obsidian:sync`; `node 90_System/scripts/check.js` in the actual Obsidian vault
- Commit: pending
- Next: user creates Supabase and Railway projects, then Codex applies the Telegram webhook to the Railway public URL

## 2026-06-04 KST - verify Telegram command intake

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Telegram bot poller, Telegram Command Inbox, local `.env`
- Trigger: user sent a Telegram message and asked whether Lua received it
- Changed: confirmed the bot received `/lua status lua`; corrected the local allowed chat id to the numeric Telegram chat id; restored the valid status command into the Telegram Command Inbox; made the poller skip invalid `/lua` commands without stopping the intake loop
- Verification: `npm run telegram:poll`; `node --test 90_System/tests/telegram_bot_poll.test.js 90_System/tests/telegram_command_inbox.test.js`; `npm run check`; `npm run test:node`
- Commit: pending
- Next: turn queued Telegram status commands into a status response/report flow

## 2026-05-30 KST - add safe Obsidian vault sync

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: repo-to-Obsidian sync script, Node tests, package scripts
- Trigger: user asked to continue the next system setup after the real Obsidian vault and repo structure diverged
- Changed: added a dry-run-first sync command that copies `00_Lua`, `90_System`, and root operating docs into the actual Obsidian vault while excluding secrets, `.obsidian`, `.git`, runtime DBs, backups, and dependency folders; added Obsidian ignore-filter merging so internal folders stay hidden in the app
- Verification: `npm run obsidian:sync:dry-run`; `npm run obsidian:sync`; `npm run check`; `npm run test:node`
- Commit: pending
- Next: run dry-run, apply sync to the actual Obsidian vault, then validate the repo and Node tests

## 2026-05-30 KST - commit actual Obsidian vault baseline

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: `/Users/sooin/Documents/Obsidian Vault`
- Trigger: user approved continuing after the repo-to-vault sync command was added
- Changed: staged the actual Obsidian vault structure so the user-facing `00_Lua` workspace, internal `90_System` support layer, and Obsidian ignore filters are tracked as the current baseline
- Verification: `npm run obsidian:sync`; `node 90_System/scripts/check.js` in `/Users/sooin/Documents/Obsidian Vault`; staged diff checked for excluded cache, backup, secret, and local workspace files
- Commit: pending
- Next: use Telegram as the main command intake and confirm the end-to-end command loop in daily use

## 2026-05-28 KST - promote Lua user workspace to root

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: vault root, `00_Lua`, `90_System`, runtime scripts, tests
- Trigger: user clarified that the top of the vault should show the folders they actually need, with non-user-facing folders nested inside
- Changed: moved active human-facing folders under `00_Lua`; moved wiki, archives, agent system, automations, artifacts, templates, docs, scripts, tests, and Python runtime under `90_System`; updated package scripts, Python packaging, vault links, and hard-coded runtime paths
- Verification: `npm run check`; `npm run flow:audit`; `npm run audit`; `npm run test:node`; `npm run test:python`
- Commit: pending
- Next: use `00_Lua` as the normal Obsidian entry point and treat `90_System` as implementation/internal support

## 2026-05-28 KST - restructure Command Center folders

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: `00_Lua/01_Command Center`, Node command scripts, tests, vault links
- Trigger: user clarified that the folder structure itself needed to change, not only the documentation
- Changed: split Command Center into `00_Dashboard`, `01_Commands`, `02_Memory`, `03_Summaries`, and `04_Policies`; moved dashboards, command runs, identity/memory, summaries, and policy docs into their operating folders; updated scripts, tests, and vault links to the new paths
- Verification: `npm run test:all`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: use the new `01_Commands` and `03_Summaries` folders as the default command and record surfaces for Telegram-driven Lua work

## 2026-05-27 KST - restructure Lua as vault plus runtime

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: GitHub repo `sooin123456/Lua`, Obsidian vault, Python runtime
- Trigger: user clarified that Lua should restart from the existing Obsidian-origin GitHub repo and may be freely restructured
- Changed: re-based the work on `origin/main`, added the `lua_agent` Python runtime, added development specs/plans, rewrote README around Lua as a customizable Agent OS, documented the runtime layer, and added Python validation commands
- Verification: `npm run check`; `npm run test:node`; `uv run --extra dev pytest -v`; `npm run test:all`
- Commit: pending
- Next: run Node vault check and Python runtime tests, then commit the restructured baseline

## 2026-05-27 KST - add runtime continuity commands

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Python runtime, 90_System/docs, CLI
- Trigger: user asked to continue after the vault plus runtime restructure
- Changed: added seed, checkpoint, Obsidian export, and heartbeat CLI commands so the first three projects can be started and resumed locally
- Verification: `uv run --extra dev pytest -v`; `npm run check`; `npm run test:all`
- Commit: pending
- Next: add tool-instruction routing for Claude, Codex, Gemini, Kimi, Grok, Manus, and Canva

## 2026-05-27 KST - add tool routing and Lua_template reference

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Python runtime, tech stack references, 90_System/docs
- Trigger: user asked to continue and make future implementation reference `sooin123456/Lua_template`
- Changed: added runtime tool routing for Codex, Claude, Gemini, Kimi, Grok, Manus, and Canva; added CLI commands for route/instruction; documented `Lua_template` as the app implementation baseline
- Verification: `npm run test:all`; `uv run lua --db /tmp/lua-agent-tool-demo.db tool instruction PROJ-001 TASK-001`
- Commit: pending
- Next: add approval policy profiles for risky tools and project types

## 2026-05-27 KST - add approval policy profiles

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Python runtime, runtime policies, agent permissions
- Trigger: user approved proceeding with approval policy profiles
- Changed: added approval classification for auto, ask-first, and explicit-approval actions; integrated policy into tool instructions and CLI
- Verification: `npm run test:all`; `uv run lua --db /tmp/lua-agent-approval-demo.db approval check PROJ-002 TASK-004`; `uv run lua --db /tmp/lua-agent-approval-demo.db tool instruction PROJ-002 TASK-004`
- Commit: pending
- Next: add workflow templates for Toss mini app, Telegram trading bot, and floating solar monitoring

## 2026-05-27 KST - add workflow templates

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Python runtime, seed data, workflow 90_System/docs
- Trigger: user approved continuing after approval policy profiles
- Changed: expanded `lua seed projects` to create five workflow tasks each for Toss mini app, Telegram trading bot, and floating solar monitoring
- Verification: `uv run --extra dev pytest -v`; `npm run test:all`; `uv run lua --db /tmp/lua-agent-workflow-demo.db seed projects`; `uv run lua --db /tmp/lua-agent-workflow-demo.db heartbeat`
- Commit: pending
- Next: start the first real operating run by exporting seeded projects into Obsidian or add Notion dashboard sync stubs

## 2026-05-27 KST - start first Lua runtime operating run

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: `.lua_agent` runtime DB, `90_System/80_Lua_Details/02_Projects/Lua`, dashboards
- Trigger: user chose to start actual Obsidian operation instead of Notion sync stubs
- Changed: seeded the runtime database with three projects and 15 workflow tasks, exported the three projects into Obsidian markdown, and linked them from Projects Hub and Master Dashboard
- Verification: `npm run test:all`; `uv run lua --db .lua_agent/lua.db heartbeat`
- Commit: pending
- Next: run checks, commit the exported operating baseline, then choose the first task to execute

## 2026-05-27 KST - simplify vault navigation

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Command Center, Projects Hub, Lua System Map
- Trigger: user noticed navigation was too broad and asked whether the shape was right
- Changed: split broad navigation into [[90_System/80_Lua_Details/01_Command Center/00_Dashboard/Lua System Map]], reduced [[90_System/80_Lua_Details/01_Command Center/00_Dashboard/Master Dashboard]] to a daily operating view, and simplified [[90_System/80_Lua_Details/02_Projects/Projects Hub]] into a compact project index
- Verification: `npm run test:all`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: review the new dashboard shape in Obsidian and choose the first runtime task to execute

## 2026-05-27 KST - complete first Toss research task

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Python runtime, Toss use case 90_System/docs, Obsidian project export
- Trigger: user asked Lua to keep building the system unless a decision is required
- Changed: added `lua task status`, researched official Apps in Toss WebView/config/deploy requirements, recorded the findings in `90_System/docs/use-cases/toss-miniapp-to-app.md`, closed `TASK-001`, and exported the updated Toss project note
- Verification: `uv run pytest 90_System/tests/test_task_status_cli.py`; `npm run test:all`; `uv run lua --db .lua_agent/lua.db heartbeat`; `node 90_System/scripts/vault_audit.js` reported 2 orphan notes and 1 existing broken link to review separately
- Commit: pending
- Next: start `TASK-002` and draft Toss target user, core use case, and MVP acceptance criteria

## 2026-05-27 KST - connect Lua_testproject follow-up

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: `/Users/sooin/Documents/Lua_testproject`, Lua runtime project notes
- Trigger: user said they had already progressed a Toss mini app in `Lua_testproject` and wanted follow-up/hardening
- Changed: inspected the existing app, ran local checks, created `90_System/docs/lua-follow-up.md`, updated `90_System/docs/toss-submission.md`, recorded a Lua checkpoint for `TASK-002`, and exported the updated Toss project note
- Verification: `npm test -- --run`; `npm run lint`; `npm run vercel-build`; `npm run build`
- Commit: pending
- Next: map current app screens and data flows against `Lua_template` standards, then create a hardening backlog

## 2026-05-28 KST - audit command and record channels

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Command Center, runtime 90_System/docs, operating guides
- Trigger: user asked whether command entry windows and record windows were properly set up
- Changed: checked Command Center, legacy messaging Inbox design, Markdown queue scripts, runtime heartbeat, Work Ledger, and project-note export path; added a single-page Command/Record Channels map; updated stale dashboard guidance from `TASK-001` to `TASK-003`
- Verification: `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/process_command_queue.js --dry-run`; `node 90_System/scripts/promote_inbox_to_commands.js --dry-run`; `uv run lua --db .lua_agent/lua.db heartbeat`; `npm run check`; `npm run test:all`
- Commit: pending
- Next: consider a runtime `status/report` command that generates this health check automatically

## 2026-05-28 KST - promote Telegram as main command channel

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Telegram command inbox, command 90_System/docs, automation scripts
- Trigger: user clarified that the main command channel should be Telegram
- Changed: added Telegram Command Inbox, added `90_System/scripts/telegram_command_inbox.js`, added `npm run telegram:queue`, updated command mode and usage 90_System/docs to make Telegram the main personal command channel and legacy messaging the secondary/team channel
- Verification: `node --test 90_System/tests/telegram_command_inbox.test.js`; `node 90_System/scripts/telegram_command_inbox.js --source telegram-mobile --now 2026-05-28T04:05:06.000Z "/lua status Lua"`; `npm run check`; `npm run test:all`; `node 90_System/scripts/vault_audit.js` reported existing orphan/broken-link items only
- Commit: pending
- Next: wire Telegram Bot API capture after local queue behavior is stable

## 2026-05-28 KST - add Telegram bot polling bridge

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Telegram bot bridge, automation scripts, env 90_System/docs
- Trigger: user clarified that a real Telegram bot must exist as the command window
- Changed: added `90_System/scripts/telegram_bot_poll.js`, `npm run telegram:poll`, `npm run telegram:watch`, Telegram env vars, and tests for polling, allowlisting, queue writes, offset persistence, and ack sending
- Verification: `node --test 90_System/tests/telegram_bot_poll.test.js 90_System/tests/telegram_command_inbox.test.js`; `node 90_System/scripts/telegram_bot_poll.js --once` without token fails safely with `TELEGRAM_BOT_TOKEN is required.`; `npm run test:all`
- Commit: pending
- Next: create a real Telegram bot token and run `npm run telegram:poll`

## 2026-05-28 KST - clean vault root and verify Telegram env loading

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: vault root, Archives, Government Support, Telegram bot bridge
- Trigger: user added Telegram keys and noticed the folder/file structure needed cleanup
- Changed: removed root legacy Lua v3 spec copies, moved patch notes and welcome note into Archives, moved support-program note into Government Support, added Vault Folder Structure guide, fixed archive/government-support links, fixed a broken Work Ledger wiki link, and taught Telegram poller to load `.env` without printing secrets
- Verification: `node --test 90_System/tests/telegram_bot_poll.test.js 90_System/tests/telegram_command_inbox.test.js`; `npm run telegram:poll`; `node 90_System/scripts/vault_audit.js` reported 0 orphan notes and 0 broken links; `npm run test:all`
- Commit: pending
- Next: send a real `/lua status Lua` message to the Telegram bot and rerun `npm run telegram:poll`

## 2026-05-28 KST - add practical operating layers

- Host: `mac-codex`
- Agent: `Codex`
- Repo/area: Command Center, Wiki, Templates, development 90_System/docs
- Trigger: user clarified practical usage should be organized around memory classification, command classification, and activity summaries
- Changed: added Lua Operating Layers, Memory Classification, Command Taxonomy, Activity Summary System, and matching templates; linked them from Master Dashboard, Lua System Map, Vault Folder Structure, Lua Usage Guide, and Templates Hub
- Verification: `npm run check`; `node 90_System/scripts/vault_audit.js`; `node 90_System/scripts/flow_audit.js`; `npm run test:all`
- Commit: pending
- Next: optionally add a runtime/report command that produces daily activity summaries from checkpoints, Telegram queue, and Work Ledger

## 2026-05-15 23:46 KST - capture actual Obsidian vault baseline

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: actual Obsidian vault
- Trigger: user noticed Codex staging vault and real Obsidian vault were different
- Changed: created local backup, initialized Git in the real OneDrive Obsidian vault, committed the current vault as baseline
- Verification: `.obsidian`, `XX_System`, `node_modules`, and `.env` are ignored by Git
- Commit: `863bddb`
- Next: import selected operating-system files from the Codex staging repo

## 2026-05-15 23:xx KST - import Lua operating system into real vault

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: actual Obsidian vault
- Trigger: user asked to align Codex work with the Obsidian vault they actually use
- Changed: imported AGENTS, Lua Usage Guide, Pi map, audit/check scripts, Artifacts, Automations, v4 architecture, and selected core commands
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js` orphan notes 0, broken links 0
- Commit: pending
- Next: triage the current real Inbox note

## 2026-05-15 23:xx KST - triage real Inbox idea note

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: `00_Lua/00_Inbox`, AI Studio, Industry Intelligence
- Trigger: user asked Codex to classify the actual Obsidian Inbox
- Changed: split the Inbox note into Neural UI business direction and Floating Solar research follow-up
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js` orphan notes 0, broken links 0
- Commit: pending
- Next: run vault audit and fix any broken links

## Navigation

- [[90_System/80_Lua_Details/01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]]
- [[90_System/80_Lua_Details/01_Command Center/04_Policies/Lua Usage Guide|Lua Usage Guide]]
- [[AGENTS]]

## 2026-05-15 23:xx KST - design Notion sharing workflow

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Operation, Automations, Templates
- Trigger: user clarified that sharing architecture should come before business execution
- Changed: added Team Sharing Workflow, Team Brief Drafts, Team Brief Template, and updated Notion publishing rules
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js` orphan notes 0, broken links 0
- Commit: pending
- Next: define Notion database properties and legacy messaging approval steps before enabling API automation

## 2026-05-16 KST - define Obsidian writing rules and Notion workspace plan

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Command Center, Automations
- Trigger: user asked to classify when to write or not write in Obsidian and what to do after creating `Lua_Home` in Notion
- Changed: added Obsidian Writing Rules and Notion Workspace Plan; linked them from Lua Usage Guide, Master Dashboard, Notion Sync, and Automations
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js` orphan notes 0, broken links 0
- Commit: pending
- Next: build the actual Notion DBs under `Lua_Home` or create a manual setup checklist

## 2026-05-16 KST - add legacy messaging webhook brief sender

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: legacy messaging automation, Team Brief Drafts
- Trigger: user chose legacy messaging integration before Notion because Notion is more complex
- Changed: added legacy messaging Incoming Webhook sender, `.env.example`, draft block format, and local dry-run flow
- Verification: `node 90_System/scripts/legacy_brief.js --message "[Lua] legacy messaging dry-run test" --channel "#ai-briefings" --dry-run`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: user creates a legacy messaging Incoming Webhook and fills `.env`, then approve/send the first test brief

## 2026-05-16 KST - connect legacy messaging Incoming Webhook

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: legacy messaging automation
- Trigger: user created legacy messaging Incoming Webhook and saved it in `.env`
- Changed: verified `.env` contains `REMOVED_LEGACY_WEBHOOK`, sent first test message to legacy messaging, and confirmed `.env` is ignored by Git
- Verification: `node 90_System/scripts/legacy_brief.js --message ... --channel "#ai-briefings"`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: convert approved Team Brief Draft blocks into real legacy messaging messages

## 2026-05-16 KST - separate offline and online commands

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: command rules, legacy messaging automation
- Trigger: user asked how to distinguish offline and online commands
- Changed: added Command Modes guide and required `--confirm-send` for legacy messaging sends
- Verification: legacy messaging send without `--confirm-send` is refused; dry-run works; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: apply the same command mode labels to GitHub push, Notion publish, and future email/web actions

## 2026-05-16 KST - reinterpret online commands as remote legacy messaging control

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: command rules, legacy messaging command inbox
- Trigger: user clarified that online commands mean commands issued while away from the computer through legacy messaging, not merely external publishing
- Changed: rewrote Command Modes around offline local commands vs online legacy messaging remote commands; added legacy messaging Command Inbox design for `/lua inbox`, `/lua todo`, `/lua brief`, `/lua ask`, `/lua status`, `/lua approve`
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js` orphan notes 0, broken links 0
- Commit: pending
- Next: implement legacy messaging command intake using slash commands, workflow webhooks, or manual queue capture

## 2026-05-16 KST - design Superpowers/gstack legacy messaging agent commands

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: legacy messaging command inbox, Lua agents
- Trigger: user asked to use `obra/superpowers` and `garrytan/gstack` patterns for legacy messaging agent app commands
- Changed: added legacy messaging Agent App Command System, mapped `/lua ceo/pm/research/write/build/qa/release/ops` to Lua agents, and added local legacy messaging command queue parser
- Verification: `node 90_System/scripts/legacy_command_inbox.js --source legacy-mobile "/lua research brief :: 테크인 수상태양광 실적 조사"`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: choose legacy messaging slash command or workflow webhook as the real intake path

## 2026-05-16 KST - clarify end-to-end Lua flow

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: architecture, Notion flow
- Trigger: user asked whether Obsidian commands are automatically routed by CEO agent and saved to Notion
- Changed: added Lua End-to-End Flow to distinguish target architecture from current implementation; marked Notion publishing as Phase 4, not active by default
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js` orphan notes 0, broken links 0
- Commit: pending
- Next: implement legacy messaging `/lua` intake before Notion publishing

## 2026-05-16 KST - make Obsidian the primary command center

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: command center, domain commands, agent routing
- Trigger: user said legacy messaging was complicating the flow and wanted to issue commands from Obsidian, categorized by planning/marketing/design/service/project domains while following Superpowers and gstack-style workflows
- Changed: added Obsidian Command Center, Domain Command Playbook, and local Obsidian command queue script; updated end-to-end flow to make legacy messaging secondary
- Verification: `node 90_System/scripts/obsidian_command_queue.js "/lua planning prioritize :: 이번 주 Lua 구축 우선순위 정리"`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: process the first queued planning command through Atlas-style clarify/design/plan workflow

## 2026-05-16 KST - clarify Inbox to Command Center flow

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Inbox, Obsidian Command Center, usage rules
- Trigger: user asked whether adding to `00_Lua/00_Inbox` connects to the full flow
- Changed: documented that Inbox is for raw capture and Command Center is for executable commands; added Inbox -> triage -> domain -> Command Queue -> Atlas routing flow
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js` orphan notes 0, broken links 0
- Commit: pending
- Next: implement a script that promotes selected Inbox captures into Command Center queue rows

## 2026-05-16 KST - implement Inbox promotion and command run workflow

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Inbox, Obsidian Command Center, command runs
- Trigger: user asked Codex to decide next user actions and apply Superpowers/gstack-style methods directly
- Changed: added Inbox promotion script, command queue processing script, User Action Board, and generated command run notes with Superpowers stages and gstack roles
- Verification: `node 90_System/scripts/promote_inbox_to_commands.js --apply`; `node 90_System/scripts/process_command_queue.js --apply`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: process `cmd-20260516-024544` first through Atlas CEO clarify/design/plan

## 2026-05-16 KST - add timestamped Inbox capture log

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Inbox, Templates, End-to-End Flow
- Trigger: user asked for dates/timestamps in `00_Lua/00_Inbox` so capture timing is visible
- Changed: added Capture Log table, Inbox Capture Template, `add_inbox_capture.js`, and clarified that Notion is not the only remaining piece
- Verification: `node 90_System/scripts/add_inbox_capture.js --source manual "테스트 캡처: Inbox 날짜 자동 기록 확인"`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: build Atlas Router automation before Notion publishing

## 2026-05-16 KST - add Atlas Router automation

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Command Center, Atlas Router, User Action Board
- Trigger: user asked to process the first command run in non-developer order and build Atlas Router automation
- Changed: added `90_System/scripts/atlas_router.js`, wired npm scripts, routed `cmd-20260516-024544` through Atlas CEO clarify/design/plan, and updated User Action Board
- Verification: `node --test 90_System/tests/atlas_router.test.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: process `inbox-20260516-031554-01` build/app through the next command run

## 2026-05-16 KST - route Neural UI build app command

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Command Runs, Atlas Router, User Action Board
- Trigger: user said "다음 command run 진행해줘"
- Changed: routed `inbox-20260516-031554-01` through Forge/Eng Manager clarify/design/plan and added Neural UI MVP experiment notes
- Verification: `node --test 90_System/tests/atlas_router.test.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: process `inbox-20260516-031554-02` research/brief through Lens

## 2026-05-16 KST - create floating solar research brief

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Energy Policies, Command Runs, User Action Board
- Trigger: user approved research execution for K-water floating solar brief
- Changed: created [[90_System/80_Lua_Details/04_Resources/Energy Policies/K-water 수상태양광 Research Brief]], marked `inbox-20260516-031554-02` as briefed, and updated next user action to verify the exact Techin company name
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: user confirms the exact company name for "테크인" or asks to convert the brief into a meeting-ready one-pager

## 2026-05-16 KST - connect floating solar brief into Obsidian graph

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Resources, Energy Policies, User Action Board
- Trigger: user clarified that the company is `(주)테크윈` and 테크윈에너지, and said Obsidian linkage did not feel connected
- Changed: added Energy Policies Hub, linked it from Resources Hub and Master Dashboard, added Korean aliases to the floating solar brief, and corrected Techin references to Techwin/Techwin Energy
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: verify links and then investigate Techwin/Techwin Energy project references if requested

## 2026-05-16 KST - add command flow audit

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Command Center, scripts, flow verification
- Trigger: user asked to verify and implement missing pieces before continuing the next flow
- Changed: added `90_System/scripts/flow_audit.js`, test coverage for command result/run note/brief/hub linkage, and documented the Flow Audit step
- Verification: `node --test 90_System/tests/flow_audit.test.js`; `node --test 90_System/tests/atlas_router.test.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: use Flow Audit after future Atlas Router runs before treating a command result as connected

## 2026-05-16 KST - add Notion publish queue harness

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Notion sync, Automations, Command Center
- Trigger: user said "다음은 notion이랑 연동해보자"
- Changed: checked the real Notion `Lua_Home`, documented existing Notion databases, added `90_System/scripts/notion_publish_queue.js`, added tests, and queued the K-water floating solar research brief as a draft Notion publish candidate
- Verification: `node --test 90_System/tests/notion_publish_queue.test.js`; `node --test 90_System/tests/flow_audit.test.js`; `node --test 90_System/tests/atlas_router.test.js`; `node 90_System/scripts/notion_publish_queue.js --dry-run`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: user approves the draft or asks to create the missing `Research Briefs` database first

## 2026-05-16 KST - publish K-water brief to Notion

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Notion sync, Energy Policies, Command Center
- Trigger: user said "Notion 발행 승인해줘"
- Changed: published [[90_System/80_Lua_Details/04_Resources/Energy Policies/K-water 수상태양광 Research Brief|K-water 수상태양광 Research Brief]] as a child page under Notion `Lua_Home`, updated the Notion Publish Queue to `published`, and stored the Notion URL in the source note
- Notion: https://www.notion.so/362eb124ae5f81558d1fced71535012d
- Verification: `node --test 90_System/tests/notion_publish_queue.test.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: create a proper `Research Briefs` Notion database or continue deeper Techwin/Techwin Energy research

## 2026-05-16 KST - support file-based Inbox notes

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Inbox, Command Center, scripts
- Trigger: user added a new Inbox note and asked to develop the missing flow
- Changed: updated `add_inbox_capture.js` to create file-based Inbox notes, updated `promote_inbox_to_commands.js` to discover `90_System/80_Lua_Details/00_Inbox/*.md`, classify file-based notes, mark promoted notes, clean tracking URLs, and promoted [[90_System/80_Lua_Details/00_Inbox/Toss 미니앱 만들기|Toss 미니앱 만들기]] into command `inbox-20260516-041614-01`
- Verification: `node --test 90_System/tests/add_inbox_capture.test.js`; `node --test 90_System/tests/promote_inbox_to_commands.test.js`; `node --test 90_System/tests/notion_publish_queue.test.js`; `node --test 90_System/tests/flow_audit.test.js`; `node --test 90_System/tests/atlas_router.test.js`; `node 90_System/scripts/promote_inbox_to_commands.js --dry-run`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: process `inbox-20260516-041614-01` through design/screen clarify/design/plan

## 2026-05-16 KST - route Lua Command UI design command

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Atlas Router, Lucia, Command Center
- Trigger: user said "inbox-20260516-041614-01 처리해줘"
- Changed: added a `design/screen` Atlas Router harness, routed the Toss miniapp Inbox command, fixed BOM frontmatter handling, and created [[90_System/80_Lua_Details/02_Projects/Lucia/Lua Command UI|Lua Command UI]] as the first screen design draft
- Verification: `node --test 90_System/tests/atlas_router.test.js`; `node --test 90_System/tests/promote_inbox_to_commands.test.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: turn the design note into a build/app prototype command

## 2026-05-16 KST - build Lua Command UI prototype

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Artifacts, Lucia, Lua Command UI
- Trigger: user said "Lua Command UI 프로토타입 만들어줘"
- Changed: created a static HTML/CSS/JS prototype for Lua Command UI, added command preview and Obsidian draft row generation, and logged it in Artifact Ledger
- Verification: `node --test 90_System/tests/lua_command_ui_prototype.test.js`; `node --test 90_System/tests/atlas_router.test.js`; `node --test 90_System/tests/promote_inbox_to_commands.test.js`; `node --test 90_System/tests/notion_publish_queue.test.js`; `node --test 90_System/tests/flow_audit.test.js`; `node --test 90_System/tests/add_inbox_capture.test.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`
- Visual check: Playwright/browser screenshot was not available in this environment, so verification used static tests and vault audits
- Commit: pending
- Next: connect the prototype to a safe local command queue write flow

## 2026-05-16 KST - register Lua app template standard

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Automations, Build standards, Lua Command UI
- Trigger: user said every application should reference and modify `https://github.com/sooin123456/Lua_template`
- Changed: inspected `Lua_template` at commit `99b69005bc52a821e9da58fdbc12f1546e4435b3`, documented it as the default app baseline, and linked the rule from Lua Command UI, Domain Command Playbook, Automations, and User Action Board
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`; `node --test 90_System/tests/lua_command_ui_prototype.test.js`
- Commit: pending
- Next: migrate Lua Command UI from static prototype into a `Lua_template`-based app when approved

## 2026-05-16 KST - connect Lua Command UI to Command Queue

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Lua Command UI, scripts, Command Center
- Trigger: user said "Lua Command UI를 실제 Command Queue 쓰기로 연결해줘"
- Changed: added `90_System/scripts/lua_command_ui_server.js`, wired `npm run lua-ui`, connected the prototype button to a localhost API, preserved copy fallback for `file://`, and verified a real Queue write with command `lua-ui-20260516-133839`
- Verification: `node --test 90_System/tests/lua_command_ui_server.test.js`; `node --test 90_System/tests/lua_command_ui_prototype.test.js`; `node --test 90_System/tests/atlas_router.test.js`; `node --test 90_System/tests/promote_inbox_to_commands.test.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`; live API write via `http://127.0.0.1:8765/api/commands`
- Commit: pending
- Next: run `npm run lua-ui` and use `http://127.0.0.1:8765` instead of `file://` for real writes

## 2026-05-16 KST - add Lua Command UI end-to-end run

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Lua Command UI, local writer server, Command Queue, Atlas Router
- Trigger: user asked to add an end-to-end execution button from UI input through Queue, run note creation, and Atlas Router routing
- Changed: added `POST /api/commands/run`, exported targeted queue processing, added targeted Atlas routing by command id, added an `끝까지 실행` button in the prototype, documented the two local modes, and verified real command `lua-ui-20260516-135233`
- Verification: `node --test 90_System/tests/lua_command_ui_server.test.js`; `node --test 90_System/tests/lua_command_ui_prototype.test.js`; `node --test 90_System/tests/atlas_router.test.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/vault_audit.js`; live localhost API run via `POST /api/commands/run` creating `lua-ui-20260516-135233`
- Commit: pending
- Next: build runner phase can connect the routed `execute` stage to actual app implementation, verification, brief, commit, and push

## 2026-05-16 KST - add Build Runner completion path

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Build Runner, Lua Command UI, Command Queue, Artifacts
- Trigger: user asked to make the flow continue from planning/context recovery into a completed deliverable
- Changed: added `90_System/scripts/build_runner.js`, wired `POST /api/commands/build`, added a `완성물 만들기` UI button, added `npm run build:run`, and documented the completion path
- Verification: `node --test 90_System/tests/build_runner.test.js`; `node --test 90_System/tests/lua_command_ui_server.test.js`; `node --test 90_System/tests/lua_command_ui_prototype.test.js`; `node --test 90_System/tests/atlas_router.test.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`; live localhost API build via `POST /api/commands/build` creating `lua-ui-20260516-140255`
- Commit: pending
- Next: replace the deterministic build output artifact with domain-specific app implementation steps for `Lua_template`-based apps

## 2026-05-16 KST - inspect Lua_template SaaS capabilities

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: App Template Standard, Build Runner
- Trigger: user said `Lua_template` already answers DB/login concerns
- Changed: added `90_System/scripts/lua_template_inspector.js`, taught Build Runner artifacts to include a Lua_template capability map, documented existing Supabase auth, Drizzle DB, RLS, signup trigger, e2e, and email template support
- Verification: `node --test 90_System/tests/lua_template_inspector.test.js`; `node --test 90_System/tests/build_runner.test.js`; `node --test 90_System/tests/lua_command_ui_server.test.js`; `node --test 90_System/tests/lua_command_ui_prototype.test.js`; `node 90_System/scripts/lua_template_inspector.js`; `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: upgrade Build Runner from capability-aware artifact output to actual `Lua_template` app workspace editing

## 2026-05-16 KST - plan Easy AI Helper miniapp

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Lucia, Command Center, product planning
- Trigger: user chose `/lua build app :: 60대 이상 사용자를 위한 쉬운말 AI 도우미 미니앱...`
- Changed: added command `easy-ai-helper-20260516-01`, created [[90_System/80_Lua_Details/Command Runs/easy-ai-helper-20260516-01-build-app|command run]], and wrote [[90_System/80_Lua_Details/02_Projects/Lucia/Easy AI Helper Miniapp|Easy AI Helper Miniapp]] product spec
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: design the first screen and result screen for older users with large text and safety-first UX

## 2026-05-16 KST - Build Runner completed lua-ui-20260516-140255

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Build Runner, Command Queue, Artifacts
- Trigger: command `lua-ui-20260516-140255` reached build runner
- Changed: created [[90_System/08_Artifacts/Build Outputs/lua-ui-20260516-140255-build-app-output|build output]], marked the command `done`, and linked the run note for context recovery
- Verification: `node 90_System/scripts/check.js`
- Commit: pending
- Next: replace deterministic artifact output with domain-specific app implementation when the command requires code generation

## 2026-05-16 KST - plan Money Eating Dust miniapp

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Lucia, Command Center, product planning
- Trigger: user chose `돈먹는 먼지` for the Apps in Toss Vibecoding Challenge
- Changed: added command `money-dust-20260516-01`, created [[90_System/80_Lua_Details/Command Runs/money-dust-20260516-01-build-app|command run]], wrote [[90_System/80_Lua_Details/02_Projects/Lucia/Money Eating Dust Miniapp|돈먹는 먼지 Miniapp]] product spec, and updated Projects Hub/User Action Board
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: design the first screen, dust room, and cute fixed-cost reduction loop

## 2026-05-16 KST - build Money Eating Dust prototype

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Artifacts, Lucia, Money Eating Dust
- Trigger: user said Codex should orchestrate other agents until the miniapp is complete
- Changed: spawned product/UX, engineering scout, and challenge/release agents; created an initial Money Eating Dust prototype; added model tests for dust creation, monthly totals, and sleeping dust; updated Artifact Ledger, command run, and User Action Board
- Verification: prototype tests; `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js` after fixing the HTML path note link
- Commit: pending
- Next: visually review the prototype, then migrate the accepted loop into `Lua_template`

## 2026-05-16 KST - polish Money Eating Dust while user away

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Artifacts, Drafts, Money Eating Dust
- Trigger: user said to do everything except decisions while they were away
- Changed: added cuter dust character layers, wallet-room styling, visual regression checks, and [[90_System/80_Lua_Details/05_Personal Studio/_Drafts/Money Eating Dust Toss Submission Draft|Toss submission draft]]; updated command run and User Action Board to isolate the remaining user decisions
- Verification: prototype tests; Chrome headless mobile/desktop screenshots; `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: user decides final submission name, demo-data style, representative screenshot, and whether to migrate before submitting

## 2026-05-16 KST - create idea and decision operating spaces

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Command Center, Personal Studio, TOSS
- Trigger: user said the current command style was uncomfortable and asked for separate spaces for ideas, decisions, and autopilot delegation
- Changed: created [[90_System/80_Lua_Details/05_Personal Studio/Ideas/Home|Ideas]], [[90_System/80_Lua_Details/01_Command Center/01_Commands/Decision Board|Decision Board]], [[90_System/80_Lua_Details/01_Command Center/01_Commands/Autopilot Delegation Guide|Autopilot Delegation Guide]], and [[90_System/80_Lua_Details/02_Projects/TOSS/Home|TOSS]]; moved `돈 먹는 먼지` submission tracking into the TOSS project; applied decisions for app name, generic demo data, and dust-room screenshot
- Verification: prototype tests; `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: decide only the remaining submit path: static prototype or Toss/Lua_template migration

## 2026-05-16 KST - prepare Money Dust submission package

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: TOSS, Artifacts, submission prep
- Trigger: user said to continue
- Changed: generated the selected dust-room mobile screenshot, created [[90_System/80_Lua_Details/02_Projects/TOSS/Submission Package|Submission Package]], and linked it from TOSS project 90_System/docs and the submission draft
- Verification: prototype tests; `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`
- Commit: pending
- Next: decide submit path: static prototype or Toss/Lua_template migration

## 2026-05-16 KST - add Money Dust open banking preview

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: TOSS, Money Eating Dust prototype
- Trigger: user asked for open banking subscription detection, cuter 3D category characters, assisted cancellation, and a wider Toss-like layout
- Changed: added an open banking preview card, auto-detected subscription list, assisted cancellation panel, wider 760px shell, category-specific 3D-like dust shapes, and wide preview screenshot
- Verification: prototype tests; Chrome headless screenshot
- Commit: pending
- Next: decide whether real financial integration stays a mock preview for challenge submission or moves into a verified Toss/Lua_template integration phase

## 2026-05-16 KST - restyle Money Dust like vertical miniapp cards

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: TOSS, Money Eating Dust prototype
- Trigger: user provided a dark card-based miniapp reference and asked to change the UI into that form
- Changed: rebuilt the prototype shell into a dark app preview with app icon, three vertical cards, a large cute dust mascot card, embedded dust room card, and action/cancellation card
- Verification: prototype tests; Chrome headless screenshot
- Commit: pending
- Next: user visually reviews the new form before moving it into the Toss/Lua_template structure

## 2026-05-16 KST - correct Money Dust repository boundary

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Lua, TOSS, Lua_money_dust
- Trigger: user clarified that `Lua` must contain only commands and system records, while real apps should live in new `Lua_template`-based repos
- Changed: cloned `Lua_template` into local `C:\Users\sooin\OneDrive\문서\Lua_money_dust`, changed its origin to `https://github.com/sooin123456/Lua_money_dust.git`, rebuilt the app as a single-screen miniapp in that repo, removed Money Dust app artifacts/tests from `Lua`, and updated TOSS 90_System/docs to point to the app repo
- Verification: `node 90_System/scripts/check.js`; `node 90_System/scripts/flow_audit.js`; `node 90_System/scripts/vault_audit.js`; `Lua_money_dust` static route/screen check
- Commit: `73591dc` in local `Lua_money_dust`; Lua cleanup commit pending
- Next: user creates the GitHub repo `sooin123456/Lua_money_dust`, then push local app repo

## 2026-05-16 KST - define Obsidian as Lua LLM Wiki

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Wiki, Command Center, Automations
- Trigger: user shared a Claude Code x Obsidian x Graphify / LLM Wiki reference and asked to rethink Obsidian's role
- Changed: added `90_System/03_Wiki` as the LLM Wiki layer, documented Source -> Wiki workflow, repository registry, and Obsidian's role as memory/command/project context rather than app source storage
- Verification: pending final checks
- Commit: pending
- Next: use `90_System/03_Wiki/Repository Registry` as the default lookup before creating or editing app repos

## 2026-05-16 KST - make Lua_money_dust runnable locally

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: `Lua_money_dust`
- Trigger: user asked to continue through step 3: create/check app repo and make the app runnable
- Changed: added root React Router/Vite/TypeScript/package config, installed dependencies, reduced active routes to the Money Dust MVP route, removed generated `.react-router` files from git tracking, and documented local run commands
- Verification: local dev server returned `200 OK` at `http://127.0.0.1:5174/`; `npm run typecheck`; `npm run build`; Chrome headless screenshot check
- Commit: `657e85d` in local `Lua_money_dust`
- Blocker: GitHub remote `sooin123456/Lua_money_dust` does not exist yet, so push is still pending
- Next: user creates the empty GitHub repo, then push `Lua_money_dust`

## 2026-05-16 KST - research Apps in Toss launch requirements

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: TOSS, Apps in Toss
- Trigger: user asked for official requirements to actually deploy/launch a Toss Apps in Toss miniapp
- Changed: researched official Apps in Toss developer 90_System/docs for deployment, QR testing, SDK, console registration, review, and web app constraints
- Verification: official documentation URLs reviewed
- Commit: pending
- Next: convert findings into an actionable launch checklist

## 2026-05-16 KST - prepare Money Dust for Apps in Toss build

- Host: `windows-codex`
- Agent: `Codex` with subagent review
- Repo/area: `Lua_money_dust`, TOSS, repository registry
- Trigger: user asked to do everything needed for Toss deployment while delegating review to agents
- Changed: installed `@apps-in-toss/web-framework`, added `granite.config.ts`, switched React Router to CSR for Toss WebView, removed server loader routes from the active MVP route map, added static robots/sitemap files, documented the Toss launch checklist, and changed the UI copy to mark financial data as sample/demo only
- Verification: `npm run typecheck`; clean `npm run toss:build` produced `money-dust.ait`; dev server returned `200`; browser screenshot verified updated sample-data copy
- Commit: `284c1ce` in `Lua_money_dust`; pending in `Lua`
- Blocker: GitHub repo `sooin123456/Lua_money_dust` and Apps in Toss console app still require account-side creation
- Next: commit local app prep, update Lua records, then push Lua records; push app repo after GitHub remote exists

## 2026-05-16 KST - set Money Dust console identity

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: `Lua_money_dust`, TOSS records
- Trigger: user created the GitHub repo, joined Apps in Toss console, and chose Korean/English/appName identity
- Changed: set Toss `appName` to `money-meonji`, kept display name as `돈 먹는 먼지`, updated service/private test URLs, regenerated the Toss `.ait` bundle as `money-meonji.ait`, and pushed the app repo to GitHub
- Verification: `npm run typecheck`; clean `npm run toss:build`; `git push -u origin main`
- Commit: `61d2006` in `Lua_money_dust`; pending in `Lua`
- Next: create logo/icon/thumbnail, open the console upload path, then test the QR/private scheme flow in Toss app

## 2026-05-16 KST - apply fluffy Meonji visual direction

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: `Lua_money_dust`, TOSS records
- Trigger: user approved the B-style fluffy mascot direction and asked for a Toss-compatible background
- Changed: added the generated Meonji concept image to `public/assets`, replaced the flat CSS dust shapes with cropped furry mascot imagery across the header, total card, dust room, and selected dust preview, and documented the visual direction in the submission package
- Verification: `npm run typecheck`; clean `npm run toss:build`; browser screenshot check at `http://127.0.0.1:5174/`
- Commit: `6d97496` in `Lua_money_dust`; pending in `Lua`
- Next: split the concept image into final console icon/logo/thumbnail assets and upload `money-meonji.ait` through Apps in Toss console

## 2026-05-16 KST - draft 2026-2028 certification roadmap

- Host: `windows-codex`
- Agent: `Codex`
- Repo/area: Personal Studio, career planning
- Trigger: user shared a 2026-2028 certification plan and asked to verify exact schedules and rebuild the plan
- Changed: created `90_System/80_Lua_Details/05_Personal Studio/_Drafts/2026-2028 자격증 로드맵` with corrected 2026 exam dates, priority rules, and a 2026 execution checklist
- Verification: `node 90_System/scripts/check.js`
- Next: user confirms whether 2026 산업안전지도사 1차 was already passed; then lock either the 2026 2차 route or the 2027 route
