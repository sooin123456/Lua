from lua_agent.models import Project, Task, TaskStatus


def test_task_requires_next_action_for_running_status():
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Create MVP plan",
        goal="Turn the lua_Agent spec into a buildable MVP plan.",
        status=TaskStatus.RUNNING,
        owner_agent="lua_Project_Agent",
        next_action="Write the first implementation task.",
    )

    assert task.status == TaskStatus.RUNNING
    assert task.next_action == "Write the first implementation task."


def test_project_can_hold_initial_context():
    project = Project(
        id="PROJ-001",
        name="Toss Mini App To App",
        goal="Plan and build a Toss mini app that can expand into a standalone app.",
        description="Initial validation project for lua_Project_Agent.",
    )

    assert project.name == "Toss Mini App To App"
    assert "standalone app" in project.goal
