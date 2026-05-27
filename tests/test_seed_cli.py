from typer.testing import CliRunner

from lua_agent.cli import app
from lua_agent.storage import SQLiteStore


def test_seed_projects_creates_three_validation_projects_with_workflow_tasks(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"

    result = runner.invoke(app, ["--db", str(db_path), "seed", "projects"])

    assert result.exit_code == 0
    assert "Seeded 3 project(s)" in result.stdout

    store = SQLiteStore(db_path)
    projects = store.list_projects()
    assert [project.id for project in projects] == ["PROJ-001", "PROJ-002", "PROJ-003"]
    assert [project.name for project in projects] == [
        "Toss Mini App To App",
        "Telegram Trading Bot To App",
        "Floating Solar Monitoring System",
    ]

    toss_tasks = store.list_tasks("PROJ-001")
    trading_tasks = store.list_tasks("PROJ-002")
    solar_tasks = store.list_tasks("PROJ-003")

    assert len(toss_tasks) == 5
    assert len(trading_tasks) == 5
    assert len(solar_tasks) == 5
    assert toss_tasks[0].id == "TASK-001"
    assert toss_tasks[-1].id == "TASK-005"
    assert trading_tasks[0].id == "TASK-006"
    assert solar_tasks[0].id == "TASK-011"
    assert toss_tasks[0].next_action == "Research Toss mini app requirements and constraints."
    assert [task.owner_agent for task in toss_tasks] == [
        "lua_Research_Agent",
        "lua_Product_Agent",
        "lua_Dev_Agent",
        "lua_Dev_Agent",
        "lua_Product_Agent",
    ]
    assert trading_tasks[2].approval_required is True
    assert solar_tasks[0].owner_agent == "lua_Research_Agent"


def test_seed_projects_is_idempotent(tmp_path):
    runner = CliRunner()
    db_path = tmp_path / "lua.db"

    first = runner.invoke(app, ["--db", str(db_path), "seed", "projects"])
    second = runner.invoke(app, ["--db", str(db_path), "seed", "projects"])

    assert first.exit_code == 0
    assert second.exit_code == 0
    store = SQLiteStore(db_path)
    assert len(store.list_projects()) == 3
    assert len(store.list_tasks("PROJ-001")) == 5
    assert len(store.list_all_tasks()) == 15
