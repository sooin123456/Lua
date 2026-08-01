from lua_agent.codex import render_codex_goal
from lua_agent.models import Project, Task, TaskStatus


def test_render_codex_goal_includes_objective_validation_and_approval_boundaries():
    project = Project(
        id="PROJ-001",
        name="Telegram Trading Bot To App",
        goal="Build a Telegram trading bot and later expand it into an app.",
    )
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Implement Telegram bot skeleton",
        goal="Create a minimal Telegram bot skeleton with command handlers.",
        status=TaskStatus.PLANNED,
        owner_agent="lua_Dev_Agent",
        next_action="Create project files and tests for the bot skeleton.",
        approval_required=True,
    )

    goal = render_codex_goal(project, task)

    assert goal.startswith("/goal ")
    assert "Implement Telegram bot skeleton" in goal
    assert "Stop only when:" in goal
    assert "Run the relevant tests" in goal
    assert "Pause before external account writes" in goal
    assert "Trading-related actions require explicit approval" in goal
