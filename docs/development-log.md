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
