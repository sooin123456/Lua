from typer.testing import CliRunner

from lua_agent.cli import app


def test_tool_route_outputs_selected_tool(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"
    runner.invoke(app, ["--db", str(db_path), "seed", "projects"])

    result = runner.invoke(app, ["--db", str(db_path), "tool", "route", "PROJ-001", "TASK-001"])

    assert result.exit_code == 0
    assert "codex" in result.stdout


def test_tool_instruction_outputs_lua_template_reference_for_app_tasks(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"
    runner.invoke(app, ["--db", str(db_path), "seed", "projects"])

    result = runner.invoke(app, ["--db", str(db_path), "tool", "instruction", "PROJ-001", "TASK-001"])

    assert result.exit_code == 0
    assert "Tool: codex" in result.stdout
    assert "Lua_template" in result.stdout
    assert "https://github.com/sooin123456/Lua_template" in result.stdout
