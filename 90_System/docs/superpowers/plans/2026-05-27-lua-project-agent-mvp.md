# lua_Project_Agent MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI-first `lua_Project_Agent` MVP that stores projects/tasks/checkpoints, writes Obsidian-ready logs, and generates Codex `/goal` prompts.

**Architecture:** The MVP is local-first. A small Python package owns typed domain models, a SQLite repository, an Obsidian markdown exporter, a Codex goal generator, and a Typer CLI. External systems such as Notion, Telegram, Claude, Gemini, Kimi, Grok, Manus, and Canva are represented as generated tool instructions, not live integrations.

**Tech Stack:** Python 3.11+, Typer, Pydantic, SQLite via stdlib `sqlite3`, pytest.

---

## File Structure

- Create `pyproject.toml`: project metadata, dependencies, pytest config, CLI entry point.
- Create `90_System/lua_agent/__init__.py`: package version export.
- Create `90_System/lua_agent/models.py`: Pydantic models and enums for projects, tasks, checkpoints, agents, and tool instructions.
- Create `90_System/lua_agent/storage.py`: SQLite schema and repository methods.
- Create `90_System/lua_agent/obsidian.py`: markdown export for project logs.
- Create `90_System/lua_agent/codex.py`: Codex `/goal` prompt generator.
- Create `90_System/lua_agent/cli.py`: Typer CLI commands.
- Create `90_System/tests/test_models.py`: model behavior tests.
- Create `90_System/tests/test_storage.py`: SQLite persistence tests.
- Create `90_System/tests/test_obsidian.py`: Obsidian markdown export tests.
- Create `90_System/tests/test_codex.py`: Codex goal generator tests.
- Create `90_System/tests/test_cli.py`: CLI smoke tests.
- Modify `90_System/docs/development-log.md`: add MVP implementation entry.

## Task 1: Project Skeleton And Domain Models

**Files:**
- Create: `pyproject.toml`
- Create: `90_System/lua_agent/__init__.py`
- Create: `90_System/lua_agent/models.py`
- Test: `90_System/tests/test_models.py`

- [ ] **Step 1: Write the failing model tests**

```python
# 90_System/tests/test_models.py
from lua_agent.models import Project, Task, TaskStatus

def test_task_requires_next_action_for_running_status():
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Create MVP plan",
        goal="Turn the lua_Agent spec into a buildable MVP plan.",
        status=TaskStatus.RUNNING,
        owner_agent="lua_Project_Agent",
        next_action="Write the first implementation task.",
    )

    assert task.status == TaskStatus.RUNNING
    assert task.next_action == "Write the first implementation task."

def test_project_can_hold_initial_context():
    project = Project(
        id="PROJ-001",
        name="Toss Mini App To App",
        goal="Plan and build a Toss mini app that can expand into a standalone app.",
        description="Initial validation project for lua_Project_Agent.",
    )

    assert project.name == "Toss Mini App To App"
    assert "standalone app" in project.goal
```

- [ ] **Step 2: Run model tests to verify they fail**

Run:

```bash
python -m pytest 90_System/tests/test_models.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'lua_agent'`.

- [ ] **Step 3: Create minimal project metadata and models**

```toml
# pyproject.toml
[project]
name = "lua-agent"
version = "0.1.0"
description = "Local-first customizable Agent OS for continuous project work."
requires-python = ">=3.11"
dependencies = [
  "pydantic>=2.7",
  "typer>=0.12",
]

[project.optional-dependencies]
dev = [
  "pytest>=8.0",
]

[project.scripts]
lua = "lua_agent.cli:app"

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
```

```python
# 90_System/lua_agent/__init__.py
__version__ = "0.1.0"
```

```python
# 90_System/lua_agent/models.py
from __future__ import annotations

from datetime import datetime, timezone
from enum import StrEnum

from pydantic import BaseModel, Field, field_validator

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class TaskStatus(StrEnum):
    INBOX = "inbox"
    PLANNED = "planned"
    RUNNING = "running"
    BLOCKED = "blocked"
    REVIEW = "review"
    DONE = "done"
    FAILED = "failed"

class Project(BaseModel):
    id: str
    name: str
    goal: str
    description: str = ""
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

class Task(BaseModel):
    id: str
    project_id: str
    title: str
    goal: str
    status: TaskStatus = TaskStatus.INBOX
    owner_agent: str = "lua_Project_Agent"
    next_action: str
    priority: int = 3
    approval_required: bool = False
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    @field_validator("next_action")
    @classmethod
    def next_action_must_not_be_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("next_action must not be empty")
        return value

class Checkpoint(BaseModel):
    id: str
    task_id: str
    summary: str
    done: str
    next_action: str
    blocked_reason: str = ""
    created_at: datetime = Field(default_factory=utc_now)

class Agent(BaseModel):
    id: str
    name: str
    role: str
    capabilities: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    risk_level: str = "low"

class ToolInstruction(BaseModel):
    id: str
    task_id: str
    tool: str
    title: str
    body: str
    created_at: datetime = Field(default_factory=utc_now)
```

- [ ] **Step 4: Run model tests to verify they pass**

Run:

```bash
python -m pytest 90_System/tests/test_models.py -v
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add pyproject.toml 90_System/lua_agent/__init__.py 90_System/lua_agent/models.py 90_System/tests/test_models.py
git commit -m "Add lua_Agent domain models"
```

## Task 2: SQLite Storage

**Files:**
- Create: `90_System/lua_agent/storage.py`
- Test: `90_System/tests/test_storage.py`

- [ ] **Step 1: Write the failing storage tests**

```python
# 90_System/tests/test_storage.py
from lua_agent.models import Checkpoint, Project, Task, TaskStatus
from lua_agent.storage import SQLiteStore

def test_store_saves_and_loads_project(tmp_path):
    store = SQLiteStore(tmp_path / "lua.db")
    project = Project(
        id="PROJ-001",
        name="Telegram Trading Bot To App",
        goal="Build a Telegram trading bot and later expand it into an app.",
    )

    store.save_project(project)

    loaded = store.get_project("PROJ-001")
    assert loaded == project

def test_store_lists_tasks_by_project(tmp_path):
    store = SQLiteStore(tmp_path / "lua.db")
    project = Project(id="PROJ-001", name="Floating Solar", goal="Plan monitoring system.")
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Research vendors",
        goal="Identify candidate vendors.",
        status=TaskStatus.RUNNING,
        next_action="Search for monitoring vendors.",
    )

    store.save_project(project)
    store.save_task(task)

    assert store.list_tasks("PROJ-001") == [task]

def test_store_returns_active_tasks(tmp_path):
    store = SQLiteStore(tmp_path / "lua.db")
    project = Project(id="PROJ-001", name="Toss Mini App", goal="Build MVP.")
    running = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Create prototype",
        goal="Create first implementation prototype.",
        status=TaskStatus.RUNNING,
        next_action="Generate Codex goal.",
    )
    done = Task(
        id="TASK-002",
        project_id="PROJ-001",
        title="Done task",
        goal="Already complete.",
        status=TaskStatus.DONE,
        next_action="No further action.",
    )

    store.save_project(project)
    store.save_task(running)
    store.save_task(done)

    assert store.list_active_tasks() == [running]

def test_store_appends_checkpoints(tmp_path):
    store = SQLiteStore(tmp_path / "lua.db")
    checkpoint = Checkpoint(
        id="CHK-001",
        task_id="TASK-001",
        summary="Research started.",
        done="Created vendor research outline.",
        next_action="Find five candidate vendors.",
    )

    store.save_checkpoint(checkpoint)

    assert store.list_checkpoints("TASK-001") == [checkpoint]
```

- [ ] **Step 2: Run storage tests to verify they fail**

Run:

```bash
python -m pytest 90_System/tests/test_storage.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'lua_agent.storage'`.

- [ ] **Step 3: Implement SQLiteStore**

```python
# 90_System/lua_agent/storage.py
from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

from pydantic import TypeAdapter

from lua_agent.models import Checkpoint, Project, Task, TaskStatus

class SQLiteStore:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init_schema()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        return connection

    def _init_schema(self) -> None:
        with self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    data TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
                CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
                CREATE TABLE IF NOT EXISTS checkpoints (
                    id TEXT PRIMARY KEY,
                    task_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    data TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_checkpoints_task_id ON checkpoints(task_id);
                """
            )

    def save_project(self, project: Project) -> None:
        self._upsert("projects", project.id, project.model_dump(mode="json"))

    def get_project(self, project_id: str) -> Project | None:
        row = self._get_row("projects", project_id)
        return Project.model_validate_json(row["data"]) if row else None

    def save_task(self, task: Task) -> None:
        data = task.model_dump(mode="json")
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO tasks (id, project_id, status, data)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    project_id=excluded.project_id,
                    status=excluded.status,
                    data=excluded.data
                """,
                (task.id, task.project_id, task.status.value, json.dumps(data)),
            )

    def list_tasks(self, project_id: str) -> list[Task]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT data FROM tasks WHERE project_id = ? ORDER BY id",
                (project_id,),
            ).fetchall()
        return [Task.model_validate_json(row["data"]) for row in rows]

    def list_active_tasks(self) -> list[Task]:
        active = (TaskStatus.INBOX, TaskStatus.PLANNED, TaskStatus.RUNNING, TaskStatus.BLOCKED, TaskStatus.REVIEW)
        placeholders = ",".join("?" for _ in active)
        with self._connect() as connection:
            rows = connection.execute(
                f"SELECT data FROM tasks WHERE status IN ({placeholders}) ORDER BY id",
                tuple(status.value for status in active),
            ).fetchall()
        return [Task.model_validate_json(row["data"]) for row in rows]

    def save_checkpoint(self, checkpoint: Checkpoint) -> None:
        data = checkpoint.model_dump(mode="json")
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO checkpoints (id, task_id, created_at, data)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    task_id=excluded.task_id,
                    created_at=excluded.created_at,
                    data=excluded.data
                """,
                (checkpoint.id, checkpoint.task_id, checkpoint.created_at.isoformat(), json.dumps(data)),
            )

    def list_checkpoints(self, task_id: str) -> list[Checkpoint]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT data FROM checkpoints WHERE task_id = ? ORDER BY created_at, id",
                (task_id,),
            ).fetchall()
        return [Checkpoint.model_validate_json(row["data"]) for row in rows]

    def _upsert(self, table: str, item_id: str, data: dict[str, Any]) -> None:
        TypeAdapter(dict[str, Any]).validate_python(data)
        with self._connect() as connection:
            connection.execute(
                f"""
                INSERT INTO {table} (id, data)
                VALUES (?, ?)
                ON CONFLICT(id) DO UPDATE SET data=excluded.data
                """,
                (item_id, json.dumps(data)),
            )

    def _get_row(self, table: str, item_id: str) -> sqlite3.Row | None:
        with self._connect() as connection:
            return connection.execute(
                f"SELECT data FROM {table} WHERE id = ?",
                (item_id,),
            ).fetchone()
```

- [ ] **Step 4: Run storage tests to verify they pass**

Run:

```bash
python -m pytest 90_System/tests/test_storage.py -v
```

Expected: 4 passed.

- [ ] **Step 5: Run all tests**

Run:

```bash
python -m pytest -v
```

Expected: 6 passed.

- [ ] **Step 6: Commit**

```bash
git add 90_System/lua_agent/storage.py 90_System/tests/test_storage.py
git commit -m "Add SQLite storage for lua projects"
```

## Task 3: Obsidian Markdown Export

**Files:**
- Create: `90_System/lua_agent/obsidian.py`
- Test: `90_System/tests/test_obsidian.py`

- [ ] **Step 1: Write the failing Obsidian export test**

```python
# 90_System/tests/test_obsidian.py
from lua_agent.models import Checkpoint, Project, Task, TaskStatus
from lua_agent.obsidian import render_project_note

def test_render_project_note_contains_tasks_and_checkpoints():
    project = Project(
        id="PROJ-001",
        name="Floating Solar Monitoring System",
        goal="Plan monitoring system direction and vendor selection.",
    )
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Research vendors",
        goal="Find candidate monitoring vendors.",
        status=TaskStatus.RUNNING,
        next_action="Compare five vendors.",
    )
    checkpoint = Checkpoint(
        id="CHK-001",
        task_id="TASK-001",
        summary="Started research.",
        done="Created vendor criteria.",
        next_action="Collect vendor names.",
    )

    note = render_project_note(project, [task], {"TASK-001": [checkpoint]})

    assert "# Floating Solar Monitoring System" in note
    assert "Plan monitoring system direction" in note
    assert "## Tasks" in note
    assert "- [running] TASK-001: Research vendors" in note
    assert "Next action: Compare five vendors." in note
    assert "Created vendor criteria." in note
```

- [ ] **Step 2: Run Obsidian test to verify it fails**

Run:

```bash
python -m pytest 90_System/tests/test_obsidian.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'lua_agent.obsidian'`.

- [ ] **Step 3: Implement markdown renderer**

```python
# 90_System/lua_agent/obsidian.py
from __future__ import annotations

from lua_agent.models import Checkpoint, Project, Task

def render_project_note(
    project: Project,
    tasks: list[Task],
    checkpoints_by_task: dict[str, list[Checkpoint]],
) -> str:
    lines = [
        f"# {project.name}",
        "",
        f"Project ID: `{project.id}`",
        "",
        "## Goal",
        "",
        project.goal,
        "",
    ]
    if project.description:
        lines.extend(["## Description", "", project.description, ""])

    lines.extend(["## Tasks", ""])
    for task in tasks:
        lines.extend(
            [
                f"- [{task.status.value}] {task.id}: {task.title}",
                f"  - Owner: {task.owner_agent}",
                f"  - Goal: {task.goal}",
                f"  - Next action: {task.next_action}",
            ]
        )
        checkpoints = checkpoints_by_task.get(task.id, [])
        if checkpoints:
            lines.append("  - Checkpoints:")
            for checkpoint in checkpoints:
                lines.extend(
                    [
                        f"    - {checkpoint.summary}",
                        f"      - Done: {checkpoint.done}",
                        f"      - Next: {checkpoint.next_action}",
                    ]
                )
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"
```

- [ ] **Step 4: Run Obsidian test to verify it passes**

Run:

```bash
python -m pytest 90_System/tests/test_obsidian.py -v
```

Expected: 1 passed.

- [ ] **Step 5: Run all tests**

Run:

```bash
python -m pytest -v
```

Expected: 7 passed.

- [ ] **Step 6: Commit**

```bash
git add 90_System/lua_agent/obsidian.py 90_System/tests/test_obsidian.py
git commit -m "Add Obsidian project note rendering"
```

## Task 4: Codex Goal Generator

**Files:**
- Create: `90_System/lua_agent/codex.py`
- Test: `90_System/tests/test_codex.py`

- [ ] **Step 1: Write the failing Codex goal test**

```python
# 90_System/tests/test_codex.py
from lua_agent.codex import render_codex_goal
from lua_agent.models import Project, Task, TaskStatus

def test_render_codex_goal_includes_objective_validation_and_approval_boundaries():
    project = Project(
        id="PROJ-001",
        name="Telegram Trading Bot To App",
        goal="Build a Telegram trading bot and later expand it into an app.",
    )
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Implement Telegram bot skeleton",
        goal="Create a minimal Telegram bot skeleton with command handlers.",
        status=TaskStatus.PLANNED,
        owner_agent="lua_Dev_Agent",
        next_action="Create project files and tests for the bot skeleton.",
        approval_required=True,
    )

    goal = render_codex_goal(project, task)

    assert goal.startswith("/goal ")
    assert "Implement Telegram bot skeleton" in goal
    assert "Stop only when:" in goal
    assert "Run the relevant tests" in goal
    assert "Pause before external account writes" in goal
    assert "Trading-related actions require explicit approval" in goal
```

- [ ] **Step 2: Run Codex goal test to verify it fails**

Run:

```bash
python -m pytest 90_System/tests/test_codex.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'lua_agent.codex'`.

- [ ] **Step 3: Implement Codex goal renderer**

```python
# 90_System/lua_agent/codex.py
from __future__ import annotations

from lua_agent.models import Project, Task

def render_codex_goal(project: Project, task: Task) -> str:
    approval_line = (
        "- Trading-related actions require explicit approval.\n"
        if "trading" in project.name.lower() or "trading" in project.goal.lower() or task.approval_required
        else ""
    )
    return (
        f"/goal Complete task {task.id}: {task.title}.\n\n"
        f"Project: {project.name}\n"
        f"Project goal: {project.goal}\n"
        f"Task goal: {task.goal}\n"
        f"Current next action: {task.next_action}\n\n"
        "Stop only when:\n"
        "- The requested task is implemented or a clear blocker is documented.\n"
        "- Run the relevant tests and report the exact command and result.\n"
        "- Update documentation or progress notes when behavior or decisions change.\n"
        "- Leave a concise checkpoint with done, verified, remaining, and next action.\n\n"
        "Approval boundaries:\n"
        "- Pause before external account writes, public posts, paid API calls, deployment, git push, or PR creation.\n"
        f"{approval_line}"
        "- Do not expose credentials or perform bulk deletion.\n"
    )
```

- [ ] **Step 4: Run Codex goal test to verify it passes**

Run:

```bash
python -m pytest 90_System/tests/test_codex.py -v
```

Expected: 1 passed.

- [ ] **Step 5: Run all tests**

Run:

```bash
python -m pytest -v
```

Expected: 8 passed.

- [ ] **Step 6: Commit**

```bash
git add 90_System/lua_agent/codex.py 90_System/tests/test_codex.py
git commit -m "Add Codex goal generation"
```

## Task 5: CLI Smoke Path

**Files:**
- Create: `90_System/lua_agent/cli.py`
- Test: `90_System/tests/test_cli.py`
- Modify: `90_System/docs/development-log.md`

- [ ] **Step 1: Write failing CLI tests**

```python
# 90_System/tests/test_cli.py
from typer.testing import CliRunner

from lua_agent.cli import app

def test_cli_can_create_and_list_project(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"

    create = runner.invoke(
        app,
        [
            "--db",
            str(db_path),
            "project",
            "create",
            "Toss Mini App To App",
            "--goal",
            "Plan and build a Toss mini app that can expand into a standalone app.",
        ],
    )
    assert create.exit_code == 0
    assert "PROJ-001" in create.stdout

    listed = runner.invoke(app, ["--db", str(db_path), "project", "list"])
    assert listed.exit_code == 0
    assert "Toss Mini App To App" in listed.stdout

def test_cli_can_generate_codex_goal(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"

    runner.invoke(
        app,
        [
            "--db",
            str(db_path),
            "project",
            "create",
            "Telegram Trading Bot To App",
            "--goal",
            "Build a Telegram trading bot and later expand it into an app.",
        ],
    )
    runner.invoke(
        app,
        [
            "--db",
            str(db_path),
            "task",
            "create",
            "PROJ-001",
            "Implement Telegram bot skeleton",
            "--goal",
            "Create a minimal Telegram bot skeleton.",
            "--next-action",
            "Create project files and tests.",
            "--owner-agent",
            "lua_Dev_Agent",
            "--approval-required",
        ],
    )

    goal = runner.invoke(app, ["--db", str(db_path), "codex", "goal", "PROJ-001", "TASK-001"])

    assert goal.exit_code == 0
    assert "/goal Complete task TASK-001" in goal.stdout
    assert "Pause before external account writes" in goal.stdout
```

- [ ] **Step 2: Run CLI tests to verify they fail**

Run:

```bash
python -m pytest 90_System/tests/test_cli.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'lua_agent.cli'`.

- [ ] **Step 3: Implement the Typer CLI**

```python
# 90_System/lua_agent/cli.py
from __future__ import annotations

from pathlib import Path

import typer

from lua_agent.codex import render_codex_goal
from lua_agent.models import Project, Task, TaskStatus
from lua_agent.storage import SQLiteStore

app = typer.Typer(help="lua_Agent local project operator.")
project_app = typer.Typer(help="Project commands.")
task_app = typer.Typer(help="Task commands.")
codex_app = typer.Typer(help="Codex helper commands.")
app.add_typer(project_app, name="project")
app.add_typer(task_app, name="task")
app.add_typer(codex_app, name="codex")

def _store(db: Path) -> SQLiteStore:
    return SQLiteStore(db)

def _next_id(prefix: str, existing_count: int) -> str:
    return f"{prefix}-{existing_count + 1:03d}"

@app.callback()
def main(
    ctx: typer.Context,
    db: Path = typer.Option(Path(".lua_agent/lua.db"), "--db", help="SQLite database path."),
) -> None:
    ctx.obj = {"db": db}

@project_app.command("create")
def create_project(
    ctx: typer.Context,
    name: str,
    goal: str = typer.Option(..., "--goal"),
    description: str = typer.Option("", "--description"),
) -> None:
    store = _store(ctx.obj["db"])
    project_id = _next_id("PROJ", len(store.list_projects()))
    project = Project(id=project_id, name=name, goal=goal, description=description)
    store.save_project(project)
    typer.echo(f"{project.id} {project.name}")

@project_app.command("list")
def list_projects(ctx: typer.Context) -> None:
    store = _store(ctx.obj["db"])
    for project in store.list_projects():
        typer.echo(f"{project.id} {project.name}")

@task_app.command("create")
def create_task(
    ctx: typer.Context,
    project_id: str,
    title: str,
    goal: str = typer.Option(..., "--goal"),
    next_action: str = typer.Option(..., "--next-action"),
    owner_agent: str = typer.Option("lua_Project_Agent", "--owner-agent"),
    approval_required: bool = typer.Option(False, "--approval-required"),
) -> None:
    store = _store(ctx.obj["db"])
    task_id = _next_id("TASK", len(store.list_tasks(project_id)))
    task = Task(
        id=task_id,
        project_id=project_id,
        title=title,
        goal=goal,
        status=TaskStatus.PLANNED,
        owner_agent=owner_agent,
        next_action=next_action,
        approval_required=approval_required,
    )
    store.save_task(task)
    typer.echo(f"{task.id} {task.title}")

@codex_app.command("goal")
def codex_goal(ctx: typer.Context, project_id: str, task_id: str) -> None:
    store = _store(ctx.obj["db"])
    project = store.get_project(project_id)
    if project is None:
        raise typer.BadParameter(f"Unknown project: {project_id}")
    tasks = [task for task in store.list_tasks(project_id) if task.id == task_id]
    if not tasks:
        raise typer.BadParameter(f"Unknown task: {task_id}")
    typer.echo(render_codex_goal(project, tasks[0]))
```

- [ ] **Step 4: Add list_projects to SQLiteStore**

```python
# Add this method to 90_System/lua_agent/storage.py inside SQLiteStore.
    def list_projects(self) -> list[Project]:
        with self._connect() as connection:
            rows = connection.execute("SELECT data FROM projects ORDER BY id").fetchall()
        return [Project.model_validate_json(row["data"]) for row in rows]
```

- [ ] **Step 5: Run CLI tests to verify they pass**

Run:

```bash
python -m pytest 90_System/tests/test_cli.py -v
```

Expected: 2 passed.

- [ ] **Step 6: Run all tests**

Run:

```bash
python -m pytest -v
```

Expected: 10 passed.

- [ ] **Step 7: Update development log**

Append to `90_System/docs/development-log.md`:

```markdown
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
```

- [ ] **Step 8: Commit**

```bash
git add 90_System/lua_agent/cli.py 90_System/lua_agent/storage.py 90_System/tests/test_cli.py 90_System/docs/development-log.md
git commit -m "Add lua_Agent CLI smoke path"
```

## Self-Review

Spec coverage:

- Project/task/checkpoint persistence is covered by Tasks 1 and 2.
- Obsidian long-term note output is covered by Task 3.
- Codex `/goal` generation is covered by Task 4.
- CLI-first MVP is covered by Task 5.
- External tools are intentionally represented as generated instructions, matching MVP exclusions.
- Notion, Telegram, Canva, and browser automation are excluded from this first executable slice.

Placeholder scan:

- No placeholder markers or intentionally vague steps are present.

Type consistency:

- `Project`, `Task`, `Checkpoint`, and `TaskStatus` names are consistent across tests and implementation steps.
- `SQLiteStore` method names are consistent except `list_projects`, which is introduced in Task 5 before CLI tests are expected to pass.
