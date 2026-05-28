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
