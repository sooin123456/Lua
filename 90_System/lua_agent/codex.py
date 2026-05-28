from __future__ import annotations

from lua_agent.models import Project, Task


def render_codex_goal(project: Project, task: Task) -> str:
    approval_line = (
        "- Trading-related actions require explicit approval.\n"
        if "trading" in project.name.lower() or "trading" in project.goal.lower() or task.approval_required
        else ""
    )
    return (
        f"/goal Complete task {task.id}: {task.title}.\n\n"
        f"Project: {project.name}\n"
        f"Project goal: {project.goal}\n"
        f"Task goal: {task.goal}\n"
        f"Current next action: {task.next_action}\n\n"
        "Stop only when:\n"
        "- The requested task is implemented or a clear blocker is documented.\n"
        "- Run the relevant tests and report the exact command and result.\n"
        "- Update documentation or progress notes when behavior or decisions change.\n"
        "- Leave a concise checkpoint with done, verified, remaining, and next action.\n\n"
        "Approval boundaries:\n"
        "- Pause before external account writes, public posts, paid API calls, deployment, git push, or PR creation.\n"
        f"{approval_line}"
        "- Do not expose credentials or perform bulk deletion.\n"
    )
