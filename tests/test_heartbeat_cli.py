from typer.testing import CliRunner

from lua_agent.cli import app


def test_heartbeat_lists_active_tasks_with_next_actions(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"
    runner.invoke(app, ["--db", str(db_path), "seed", "projects"])

    result = runner.invoke(app, ["--db", str(db_path), "heartbeat"])

    assert result.exit_code == 0
    assert "TASK-001" in result.stdout
    assert "PROJ-001" in result.stdout
    assert "lua_Project_Agent" in result.stdout
    assert "Research Toss mini app requirements and constraints." in result.stdout
    assert "TASK-002" in result.stdout
    assert "TASK-003" in result.stdout
