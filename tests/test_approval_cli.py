from typer.testing import CliRunner

from lua_agent.cli import app


def test_approval_check_reports_explicit_trading_boundary(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"
    runner.invoke(app, ["--db", str(db_path), "seed", "projects"])
    runner.invoke(
        app,
        [
            "--db",
            str(db_path),
            "task",
            "create",
            "PROJ-002",
            "Enable live trading",
            "--goal",
            "Place real exchange orders through an API key.",
            "--next-action",
            "Turn on auto trading.",
        ],
    )

    result = runner.invoke(app, ["--db", str(db_path), "approval", "check", "PROJ-002", "TASK-004"])

    assert result.exit_code == 0
    assert "explicit_approval" in result.stdout
    assert "Trading" in result.stdout
