from typer.testing import CliRunner

from lua_agent.cli import app
from lua_agent.storage import SQLiteStore


def test_checkpoint_add_records_progress_and_updates_task_next_action(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"
    runner.invoke(app, ["--db", str(db_path), "seed", "projects"])

    result = runner.invoke(
        app,
        [
            "--db",
            str(db_path),
            "checkpoint",
            "add",
            "TASK-001",
            "--summary",
            "Toss docs scanned.",
            "--done",
            "Captured initial mini app constraints.",
            "--next-action",
            "Draft Toss MVP acceptance criteria.",
        ],
    )

    assert result.exit_code == 0
    assert "CHK-001" in result.stdout

    store = SQLiteStore(db_path)
    checkpoints = store.list_checkpoints("TASK-001")
    assert len(checkpoints) == 1
    assert checkpoints[0].summary == "Toss docs scanned."

    task = store.get_task("TASK-001")
    assert task is not None
    assert task.next_action == "Draft Toss MVP acceptance criteria."
