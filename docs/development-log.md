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

Captured Toss WebView, configuration, testing, release, bundle size, and production verification constraints in `docs/use-cases/toss-miniapp-to-app.md`, then exported the updated project note into Obsidian.

Next action:

- Start `TASK-002`: define the target user, core use case, and MVP acceptance criteria for the Toss mini app.
