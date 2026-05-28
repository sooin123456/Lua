from __future__ import annotations

from lua_agent.models import Checkpoint, Project, Task


def render_project_note(
    project: Project,
    tasks: list[Task],
    checkpoints_by_task: dict[str, list[Checkpoint]],
) -> str:
    lines = [
        f"# {project.name}",
        "",
        f"Project ID: `{project.id}`",
        "",
        "## Goal",
        "",
        project.goal,
        "",
    ]
    if project.description:
        lines.extend(["## Description", "", project.description, ""])

    lines.extend(["## Tasks", ""])
    for task in tasks:
        lines.extend(
            [
                f"- [{task.status.value}] {task.id}: {task.title}",
                f"  - Owner: {task.owner_agent}",
                f"  - Goal: {task.goal}",
                f"  - Next action: {task.next_action}",
            ]
        )
        checkpoints = checkpoints_by_task.get(task.id, [])
        if checkpoints:
            lines.append("  - Checkpoints:")
            for checkpoint in checkpoints:
                lines.extend(
                    [
                        f"    - {checkpoint.summary}",
                        f"      - Done: {checkpoint.done}",
                        f"      - Next: {checkpoint.next_action}",
                    ]
                )
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"
