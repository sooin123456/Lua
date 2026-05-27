from typer.testing import CliRunner

from lua_agent.cli import app
from lua_agent.models import TaskStatus
from lua_agent.storage import SQLiteStore


def test_task_status_updates_status_and_next_action(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"
    runner.invoke(app, ["--db", str(db_path), "seed", "projects"])

    result = runner.invoke(
        app,
        [
            "--db",
            str(db_path),
            "task",
            "status",
            "TASK-001",
            "done",
            "--next-action",
            "Start TASK-002: Draft Toss MVP acceptance criteria.",
        ],
    )

    assert result.exit_code == 0
    assert "TASK-001 done" in result.stdout

    store = SQLiteStore(db_path)
    task = store.get_task("TASK-001")
    assert task is not None
    assert task.status == TaskStatus.DONE
    assert task.next_action == "Start TASK-002: Draft Toss MVP acceptance criteria."

    heartbeat = runner.invoke(app, ["--db", str(db_path), "heartbeat"])
    assert heartbeat.exit_code == 0
    assert "TASK-001" not in heartbeat.stdout


def test_task_status_rejects_unknown_status(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"
    runner.invoke(app, ["--db", str(db_path), "seed", "projects"])

    result = runner.invoke(
        app,
        ["--db", str(db_path), "task", "status", "TASK-001", "sleeping"],
    )

    assert result.exit_code != 0
    assert "Unknown status" in result.stderr
