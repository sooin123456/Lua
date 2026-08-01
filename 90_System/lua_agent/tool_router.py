from __future__ import annotations

from lua_agent.approvals import render_approval_boundary
from lua_agent.codex import render_codex_goal
from lua_agent.models import Project, Task, ToolInstruction

LUA_TEMPLATE_URL = "https://github.com/sooin123456/Lua_template"


def select_tool(project: Project, task: Task) -> str:
    text = " ".join(
        [
            project.name,
            project.goal,
            task.title,
            task.goal,
            task.owner_agent,
            task.next_action,
        ]
    ).lower()
    if any(keyword in text for keyword in ["implement", "build", "code", "prototype", "app", "dashboard", "bot", "codex"]):
        return "codex"
    if any(keyword in text for keyword in ["vendor", "market", "research", "compare", "selection"]):
        return "gemini"
    if any(keyword in text for keyword in ["design", "visual", "slide", "proposal visual", "canva"]):
        return "canva"
    if any(keyword in text for keyword in ["review", "plan", "roadmap", "requirements", "critique"]):
        return "claude"
    return "claude"


def render_tool_instruction(project: Project, task: Task, tool: str | None = None) -> ToolInstruction:
    selected_tool = (tool or select_tool(project, task)).lower()
    renderers = {
        "codex": _render_codex_instruction,
        "claude": _render_claude_instruction,
        "gemini": _render_research_instruction,
        "kimi": _render_research_instruction,
        "grok": _render_research_instruction,
        "manus": _render_manus_instruction,
        "canva": _render_canva_instruction,
    }
    renderer = renderers.get(selected_tool, _render_claude_instruction)
    body = renderer(project, task, selected_tool)
    return ToolInstruction(
        id=f"INST-{task.id}-{selected_tool}",
        task_id=task.id,
        tool=selected_tool,
        title=f"{selected_tool}: {task.title}",
        body=body,
    )


def _is_app_like(project: Project, task: Task) -> bool:
    text = " ".join([project.name, project.goal, task.title, task.goal, task.next_action]).lower()
    return any(keyword in text for keyword in ["app", "dashboard", "mini app", "prototype", "web", "service"])


def _template_reference(project: Project, task: Task) -> str:
    if not _is_app_like(project, task):
        return ""
    return (
        "\nTemplate reference:\n"
        f"- Use Lua_template as the implementation baseline when creating app or dashboard code: {LUA_TEMPLATE_URL}\n"
        "- Reuse its React Router app structure, Supabase auth patterns, Drizzle database layer, SQL migrations, e2e test layout, and transactional email patterns when relevant.\n"
        "- Do not copy secrets or environment-specific values from any template checkout.\n"
    )


def _render_codex_instruction(project: Project, task: Task, tool: str) -> str:
    return render_codex_goal(project, task) + render_approval_boundary(project, task) + _template_reference(project, task)


def _render_claude_instruction(project: Project, task: Task, tool: str) -> str:
    return (
        f"Project: {project.name}\n"
        f"Project goal: {project.goal}\n"
        f"Task: {task.title}\n"
        f"Task goal: {task.goal}\n"
        f"Next action: {task.next_action}\n\n"
        "Use Claude for planning, critique, requirements, roadmap, or long-context review.\n"
        "Return a concise plan, risks, open questions, and a recommended next action.\n"
        f"{render_approval_boundary(project, task)}"
        f"{_template_reference(project, task)}"
    )


def _render_research_instruction(project: Project, task: Task, tool: str) -> str:
    return (
        f"Project: {project.name}\n"
        f"Research task: {task.title}\n"
        f"Goal: {task.goal}\n"
        f"Next action: {task.next_action}\n\n"
        f"Use {tool} to gather an independent research perspective.\n"
        "Return findings as: summary, sources or assumptions, comparison table, risks, and next recommended action.\n"
        f"{render_approval_boundary(project, task)}"
    )


def _render_manus_instruction(project: Project, task: Task, tool: str) -> str:
    return (
        f"Project: {project.name}\n"
        f"Autonomous research task: {task.title}\n"
        f"Goal: {task.goal}\n"
        f"Next action: {task.next_action}\n\n"
        "Use Manus for longer web or vendor research.\n"
        "Collect candidate organizations, product evidence, pricing or capability signals when available, selection criteria, and unresolved questions.\n"
        "Do not submit forms, create accounts, or contact vendors without approval.\n"
        f"{render_approval_boundary(project, task)}"
    )


def _render_canva_instruction(project: Project, task: Task, tool: str) -> str:
    return (
        f"Project: {project.name}\n"
        f"Design task: {task.title}\n"
        f"Goal: {task.goal}\n"
        f"Next action: {task.next_action}\n\n"
        "Use Canva for design drafts, proposal visuals, pitch assets, or social content.\n"
        "Create a design brief first: audience, format, key message, sections, visual references, and approval checkpoint.\n"
        "Do not publish or share externally without approval.\n"
        f"{render_approval_boundary(project, task)}"
    )
