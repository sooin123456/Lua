# Lua

Lua is a personal Agent OS for moving real projects forward without losing context.

It started as an Obsidian-first operating vault. The current direction keeps that vault as the memory and command center, then adds a small executable Python runtime for durable project/task/checkpoint management.

## What Lua Is

Lua is not one generic Jarvis-style chatbot. It is a customizable system for composing purpose-specific agents:

- `lua_Project_Agent` for project continuity
- `lua_Dev_Agent` for Codex-oriented implementation work
- `lua_Research_Agent` for research and vendor comparison
- `lua_Product_Agent` for MVP scope and roadmap work
- `lua_Risk_Agent` for approval boundaries and safety checks
- future custom `_Agent` variants for other users and domains

The first working target is `lua_Project_Agent`.

## Core Idea

Every meaningful command should become durable work:

1. Capture a command.
2. Turn it into a project or task.
3. Store the next action.
4. Route the work to the right agent or tool.
5. Write a checkpoint after each session.
6. Resume from the checkpoint instead of restarting from memory.

## Repository Shape

```text
00_Inbox/                  Raw captures
01_Command Center/         Dashboards, identity, permissions, command runs
02_Projects/               Project spaces
03_Operation/              CRM, proposals, industry intelligence, operations
03_Wiki/                   Lua operating knowledge
04_Resources/              Reference material and tech stack notes
05_Archives/               Archived context
06_Personal Studio/        Personal ideas, drafts, experiments
07_Lua_System/             Agent prompts, skills, verticals, runtime notes
08_Artifacts/              Artifact ledger
09_Automations/            Automation specs and runbooks
99_Templates/              Reusable templates
lua_agent/                 Python runtime for durable project operation
docs/                      Development specs, plans, and customization docs
scripts/                   Node-based vault checks and automations
tests/                     Node and Python tests
```

## Current MVP Runtime

The Python runtime currently supports:

- typed `Project`, `Task`, `Checkpoint`, `Agent`, and `ToolInstruction` models
- SQLite persistence
- active task lookup
- Obsidian-ready project note rendering
- Codex `/goal` generation
- seed commands for the first three validation projects
- checkpoint logging that updates task `next_action`
- Obsidian markdown export
- heartbeat listing for resumable active tasks

Example:

```bash
uv run lua --db .lua_agent/lua.db project create "Toss Mini App To App" \
  --goal "Plan and build a Toss mini app that can expand into a standalone app."

uv run lua --db .lua_agent/lua.db task create PROJ-001 "Implement first prototype" \
  --goal "Create a runnable MVP skeleton." \
  --next-action "Create project files and tests." \
  --owner-agent lua_Dev_Agent

uv run lua --db .lua_agent/lua.db codex goal PROJ-001 TASK-001
```

Start the three validation projects:

```bash
uv run lua --db .lua_agent/lua.db seed projects
uv run lua --db .lua_agent/lua.db heartbeat
```

On a fresh database this creates 15 workflow tasks: five for Toss, five for Telegram trading bot, and five for floating solar monitoring.

Generate a tool-specific work order:

```bash
uv run lua --db .lua_agent/lua.db tool route PROJ-001 TASK-001
uv run lua --db .lua_agent/lua.db tool instruction PROJ-001 TASK-001
```

For app-like implementation tasks, Lua references `Lua_template` as the app baseline:

- https://github.com/sooin123456/Lua_template

## Initial Validation Projects

Lua is being shaped around three real projects:

- Toss mini app that can expand into a standalone app
- Telegram trading bot that can expand into an app/dashboard
- floating solar monitoring system planning, including vendor research and selection

The use-case specs live in `docs/use-cases/`.

## Validation

Run the vault checks:

```bash
npm run check
```

Run the Python runtime tests:

```bash
uv run --extra dev pytest -v
```

Run both:

```bash
npm run test:all
```

## Operating Rules

- Obsidian is the private memory and command center.
- GitHub is the versioned code and change-history ledger.
- Notion is for team-facing dashboards and mirrored operational state.
- Slack and Telegram are command/notification surfaces, not canonical memory.
- Codex handles implementation and deterministic verification.
- Claude handles planning, synthesis, long-context review, and writing.
- External publishing, trading, spending, deletion, account changes, and public communication require explicit approval.

## Development Notes

Important design records:

- `docs/superpowers/specs/2026-05-27-lua-agent-design.md`
- `docs/superpowers/plans/2026-05-27-lua-project-agent-mvp.md`
- `docs/vision.md`
- `Lua-v4-operating-architecture.md`
- `04_Resources/Tech Stack/Lua Template.md`

Meaningful sessions should also be recorded in `01_Command Center/Work Ledger.md`.
