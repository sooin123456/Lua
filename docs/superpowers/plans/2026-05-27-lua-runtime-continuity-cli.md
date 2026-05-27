# lua Runtime Continuity CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the `lua_agent` runtime so the first three projects can be seeded, checkpointed, exported to Obsidian markdown, and resumed through a heartbeat command.

**Architecture:** Keep the runtime local-first and CLI-first. Add small domain helpers for seed data and safe filenames, extend SQLite lookup/update methods, and expose bounded Typer commands that write durable state without contacting external services.

**Tech Stack:** Python 3.11+, Typer, Pydantic, SQLite via stdlib `sqlite3`, pytest.

---

## File Structure

- Create `lua_agent/seeds.py`: canonical seed projects and first tasks for the three validation projects.
- Create `lua_agent/files.py`: safe slug helper for Obsidian export paths.
- Modify `lua_agent/storage.py`: add task lookup, task update through save, and project checkpoint aggregation helpers.
- Modify `lua_agent/cli.py`: add `seed`, `checkpoint`, `obsidian export`, and `heartbeat` commands.
- Add `tests/test_seed_cli.py`: seed command behavior.
- Add `tests/test_checkpoint_cli.py`: checkpoint command behavior and next-action updates.
- Add `tests/test_export_cli.py`: Obsidian markdown export behavior.
- Add `tests/test_heartbeat_cli.py`: heartbeat command behavior.
- Modify `docs/development-log.md`: record continuity CLI implementation.

## Tasks

1. Add seed project definitions and CLI command.
2. Add checkpoint creation and task next-action update.
3. Add Obsidian export command.
4. Add heartbeat command.
5. Update docs and run full validation.

## Acceptance Criteria

- `lua seed projects` creates the three initial validation projects and one first task for each.
- `lua checkpoint add TASK-001 ...` writes a checkpoint and updates the task's `next_action`.
- `lua obsidian export PROJ-001 --vault <dir>` writes a markdown project note.
- `lua heartbeat` lists active tasks with project, owner, status, and next action.
- `npm run test:all` passes.

