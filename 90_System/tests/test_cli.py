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
