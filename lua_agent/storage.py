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

    def list_projects(self) -> list[Project]:
        with self._connect() as connection:
            rows = connection.execute("SELECT data FROM projects ORDER BY id").fetchall()
        return [Project.model_validate_json(row["data"]) for row in rows]

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

    def get_task(self, task_id: str) -> Task | None:
        row = self._get_row("tasks", task_id)
        return Task.model_validate_json(row["data"]) if row else None

    def list_tasks(self, project_id: str) -> list[Task]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT data FROM tasks WHERE project_id = ? ORDER BY id",
                (project_id,),
            ).fetchall()
        return [Task.model_validate_json(row["data"]) for row in rows]

    def list_all_tasks(self) -> list[Task]:
        with self._connect() as connection:
            rows = connection.execute("SELECT data FROM tasks ORDER BY id").fetchall()
        return [Task.model_validate_json(row["data"]) for row in rows]

    def list_active_tasks(self) -> list[Task]:
        active = (
            TaskStatus.INBOX,
            TaskStatus.PLANNED,
            TaskStatus.RUNNING,
            TaskStatus.BLOCKED,
            TaskStatus.REVIEW,
        )
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
