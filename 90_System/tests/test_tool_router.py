from lua_agent.models import Project, Task, TaskStatus
from lua_agent.tool_router import render_tool_instruction, select_tool


def test_select_tool_routes_app_implementation_to_codex():
    project = Project(
        id="PROJ-001",
        name="Toss Mini App To App",
        goal="Plan and build a Toss mini app that can expand into a standalone app.",
    )
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Implement first app prototype",
        goal="Create a runnable app prototype.",
        status=TaskStatus.PLANNED,
        owner_agent="lua_Dev_Agent",
        next_action="Use the app template and create the first screen.",
    )

    assert select_tool(project, task) == "codex"


def test_codex_instruction_references_lua_template_for_app_tasks():
    project = Project(
        id="PROJ-001",
        name="Telegram Trading Bot To App",
        goal="Build a Telegram trading bot that can expand into an app dashboard.",
    )
    task = Task(
        id="TASK-001",
        project_id="PROJ-001",
        title="Implement dashboard skeleton",
        goal="Create a dashboard app skeleton for bot monitoring.",
        status=TaskStatus.PLANNED,
        owner_agent="lua_Dev_Agent",
        next_action="Start from the shared app template.",
    )

    instruction = render_tool_instruction(project, task)

    assert instruction.tool == "codex"
    assert "Lua_template" in instruction.body
    assert "https://github.com/sooin123456/Lua_template" in instruction.body
    assert "React Router" in instruction.body
    assert "Supabase" in instruction.body
    assert "Drizzle" in instruction.body


def test_research_instruction_can_target_manus_for_vendor_research():
    project = Project(
        id="PROJ-003",
        name="Floating Solar Monitoring System",
        goal="Plan a monitoring system including vendor research and selection.",
    )
    task = Task(
        id="TASK-003",
        project_id="PROJ-003",
        title="Research floating solar monitoring vendors",
        goal="Find candidate vendors and compare monitoring approaches.",
        status=TaskStatus.PLANNED,
        owner_agent="lua_Research_Agent",
        next_action="Research vendor websites and collect selection criteria.",
    )

    instruction = render_tool_instruction(project, task, tool="manus")

    assert instruction.tool == "manus"
    assert "vendor" in instruction.body.lower()
    assert "selection criteria" in instruction.body.lower()
