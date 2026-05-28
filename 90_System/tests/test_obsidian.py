from lua_agent.models import Checkpoint, Project, Task, TaskStatus
from lua_agent.obsidian import render_project_note


def test_render_project_note_contains_tasks_and_checkpoints():
    project = Project(
        id="PROJ-001",
        name="Floating Solar Monitoring System",
        goal="Plan monitoring system direction and vendor selection.",
    )
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Research vendors",
        goal="Find candidate monitoring vendors.",
        status=TaskStatus.RUNNING,
        next_action="Compare five vendors.",
    )
    checkpoint = Checkpoint(
        id="CHK-001",
        task_id="TASK-001",
        summary="Started research.",
        done="Created vendor criteria.",
        next_action="Collect vendor names.",
    )

    note = render_project_note(project, [task], {"TASK-001": [checkpoint]})

    assert "# Floating Solar Monitoring System" in note
    assert "Plan monitoring system direction" in note
    assert "## Tasks" in note
    assert "- [running] TASK-001: Research vendors" in note
    assert "Next action: Compare five vendors." in note
    assert "Created vendor criteria." in note
