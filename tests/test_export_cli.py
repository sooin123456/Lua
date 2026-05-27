from typer.testing import CliRunner

from lua_agent.cli import app


def test_obsidian_export_writes_project_note(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"
    vault_path = tmp_path / "vault"
    runner.invoke(app, ["--db", str(db_path), "seed", "projects"])
    runner.invoke(
        app,
        [
            "--db",
            str(db_path),
            "checkpoint",
            "add",
            "TASK-001",
            "--summary",
            "Research started.",
            "--done",
            "Captured Toss constraints.",
            "--next-action",
            "Draft MVP scope.",
        ],
    )

    result = runner.invoke(app, ["--db", str(db_path), "obsidian", "export", "PROJ-001", "--vault", str(vault_path)])

    assert result.exit_code == 0
    exported = vault_path / "02_Projects" / "Lua" / "Toss Mini App To App.md"
    assert str(exported) in result.stdout
    assert exported.exists()
    content = exported.read_text()
    assert "# Toss Mini App To App" in content
    assert "Draft MVP scope." in content
    assert "Captured Toss constraints." in content
