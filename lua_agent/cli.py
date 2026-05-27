from __future__ import annotations

from pathlib import Path

import typer

from lua_agent.approvals import classify_approval
from lua_agent.codex import render_codex_goal
from lua_agent.files import safe_markdown_filename
from lua_agent.models import Checkpoint, Project, Task, TaskStatus
from lua_agent.obsidian import render_project_note
from lua_agent.seeds import INITIAL_PROJECTS
from lua_agent.storage import SQLiteStore
from lua_agent.tool_router import render_tool_instruction, select_tool

app = typer.Typer(help="lua_Agent local project operator.")
project_app = typer.Typer(help="Project commands.")
task_app = typer.Typer(help="Task commands.")
codex_app = typer.Typer(help="Codex helper commands.")
seed_app = typer.Typer(help="Seed initial Lua projects.")
checkpoint_app = typer.Typer(help="Checkpoint commands.")
obsidian_app = typer.Typer(help="Obsidian export commands.")
tool_app = typer.Typer(help="Tool routing commands.")
approval_app = typer.Typer(help="Approval policy commands.")
app.add_typer(project_app, name="project")
app.add_typer(task_app, name="task")
app.add_typer(codex_app, name="codex")
app.add_typer(seed_app, name="seed")
app.add_typer(checkpoint_app, name="checkpoint")
app.add_typer(obsidian_app, name="obsidian")
app.add_typer(tool_app, name="tool")
app.add_typer(approval_app, name="approval")


def _store(db: Path) -> SQLiteStore:
    return SQLiteStore(db)


def _next_id(prefix: str, existing_count: int) -> str:
    return f"{prefix}-{existing_count + 1:03d}"


@app.callback()
def main(
    ctx: typer.Context,
    db: Path = typer.Option(Path(".lua_agent/lua.db"), "--db", help="SQLite database path."),
) -> None:
    ctx.obj = {"db": db}


@app.command("heartbeat")
def heartbeat(ctx: typer.Context) -> None:
    store = _store(ctx.obj["db"])
    active_tasks = store.list_active_tasks()
    if not active_tasks:
        typer.echo("No active tasks.")
        return
    for task in active_tasks:
        typer.echo(
            f"{task.id} | {task.project_id} | {task.status.value} | "
            f"{task.owner_agent} | next: {task.next_action}"
        )


@project_app.command("create")
def create_project(
    ctx: typer.Context,
    name: str,
    goal: str = typer.Option(..., "--goal"),
    description: str = typer.Option("", "--description"),
) -> None:
    store = _store(ctx.obj["db"])
    project_id = _next_id("PROJ", len(store.list_projects()))
    project = Project(id=project_id, name=name, goal=goal, description=description)
    store.save_project(project)
    typer.echo(f"{project.id} {project.name}")


@project_app.command("list")
def list_projects(ctx: typer.Context) -> None:
    store = _store(ctx.obj["db"])
    for project in store.list_projects():
        typer.echo(f"{project.id} {project.name}")


@seed_app.command("projects")
def seed_projects(ctx: typer.Context) -> None:
    store = _store(ctx.obj["db"])
    created = 0
    for seed in INITIAL_PROJECTS:
        if store.get_project(seed.id) is None:
            store.save_project(
                Project(
                    id=seed.id,
                    name=seed.name,
                    goal=seed.goal,
                    description=seed.description,
                )
            )
            created += 1
        if not store.list_tasks(seed.id):
            for workflow_task in seed.tasks:
                task_id = _next_id("TASK", len(store.list_all_tasks()))
                store.save_task(
                    Task(
                        id=task_id,
                        project_id=seed.id,
                        title=workflow_task.title,
                        goal=workflow_task.goal,
                        status=TaskStatus.PLANNED,
                        owner_agent=workflow_task.owner_agent,
                        next_action=workflow_task.next_action,
                        approval_required=workflow_task.approval_required,
                    )
                )
    typer.echo(f"Seeded {len(INITIAL_PROJECTS)} project(s); created {created} new project(s).")


@task_app.command("create")
def create_task(
    ctx: typer.Context,
    project_id: str,
    title: str,
    goal: str = typer.Option(..., "--goal"),
    next_action: str = typer.Option(..., "--next-action"),
    owner_agent: str = typer.Option("lua_Project_Agent", "--owner-agent"),
    approval_required: bool = typer.Option(False, "--approval-required"),
) -> None:
    store = _store(ctx.obj["db"])
    task_id = _next_id("TASK", len(store.list_all_tasks()))
    task = Task(
        id=task_id,
        project_id=project_id,
        title=title,
        goal=goal,
        status=TaskStatus.PLANNED,
        owner_agent=owner_agent,
        next_action=next_action,
        approval_required=approval_required,
    )
    store.save_task(task)
    typer.echo(f"{task.id} {task.title}")


@task_app.command("status")
def update_task_status(
    ctx: typer.Context,
    task_id: str,
    status: str,
    next_action: str | None = typer.Option(None, "--next-action"),
) -> None:
    store = _store(ctx.obj["db"])
    task = store.get_task(task_id)
    if task is None:
        raise typer.BadParameter(f"Unknown task: {task_id}")
    try:
        task.status = TaskStatus(status)
    except ValueError as exc:
        allowed = ", ".join(status.value for status in TaskStatus)
        raise typer.BadParameter(f"Unknown status: {status}. Allowed: {allowed}") from exc
    if next_action is not None:
        task.next_action = next_action
    store.save_task(task)
    typer.echo(f"{task.id} {task.status.value} next: {task.next_action}")


@checkpoint_app.command("add")
def add_checkpoint(
    ctx: typer.Context,
    task_id: str,
    summary: str = typer.Option(..., "--summary"),
    done: str = typer.Option(..., "--done"),
    next_action: str = typer.Option(..., "--next-action"),
    blocked_reason: str = typer.Option("", "--blocked-reason"),
) -> None:
    store = _store(ctx.obj["db"])
    task = store.get_task(task_id)
    if task is None:
        raise typer.BadParameter(f"Unknown task: {task_id}")
    checkpoint_id = _next_id("CHK", len(store.list_checkpoints(task_id)))
    checkpoint = Checkpoint(
        id=checkpoint_id,
        task_id=task_id,
        summary=summary,
        done=done,
        next_action=next_action,
        blocked_reason=blocked_reason,
    )
    store.save_checkpoint(checkpoint)
    task.next_action = next_action
    if blocked_reason:
        task.status = TaskStatus.BLOCKED
    else:
        task.status = TaskStatus.RUNNING
    store.save_task(task)
    typer.echo(f"{checkpoint.id} {task.id} next: {task.next_action}")


@obsidian_app.command("export")
def export_obsidian_project(
    ctx: typer.Context,
    project_id: str,
    vault: Path = typer.Option(Path("."), "--vault", help="Obsidian vault root."),
) -> None:
    store = _store(ctx.obj["db"])
    project = store.get_project(project_id)
    if project is None:
        raise typer.BadParameter(f"Unknown project: {project_id}")
    tasks = store.list_tasks(project_id)
    checkpoints_by_task = {task.id: store.list_checkpoints(task.id) for task in tasks}
    note = render_project_note(project, tasks, checkpoints_by_task)
    target_dir = vault / "02_Projects" / "Lua"
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / safe_markdown_filename(project.name)
    target_path.write_text(note)
    typer.echo(str(target_path))


def _project_and_task(store: SQLiteStore, project_id: str, task_id: str) -> tuple[Project, Task]:
    project = store.get_project(project_id)
    if project is None:
        raise typer.BadParameter(f"Unknown project: {project_id}")
    task = store.get_task(task_id)
    if task is None:
        raise typer.BadParameter(f"Unknown task: {task_id}")
    if task.project_id != project_id:
        raise typer.BadParameter(f"Task {task_id} does not belong to project {project_id}")
    return project, task


@tool_app.command("route")
def route_tool(ctx: typer.Context, project_id: str, task_id: str) -> None:
    store = _store(ctx.obj["db"])
    project, task = _project_and_task(store, project_id, task_id)
    typer.echo(select_tool(project, task))


@tool_app.command("instruction")
def tool_instruction(
    ctx: typer.Context,
    project_id: str,
    task_id: str,
    tool: str | None = typer.Option(None, "--tool"),
) -> None:
    store = _store(ctx.obj["db"])
    project, task = _project_and_task(store, project_id, task_id)
    instruction = render_tool_instruction(project, task, tool=tool)
    typer.echo(f"Tool: {instruction.tool}")
    typer.echo(f"Title: {instruction.title}")
    typer.echo("")
    typer.echo(instruction.body)


@approval_app.command("check")
def approval_check(ctx: typer.Context, project_id: str, task_id: str) -> None:
    store = _store(ctx.obj["db"])
    project, task = _project_and_task(store, project_id, task_id)
    policy = classify_approval(project, task)
    typer.echo(f"Level: {policy.level.value}")
    typer.echo(f"Reason: {policy.reason}")
    typer.echo(f"Matched terms: {', '.join(policy.matched_terms) if policy.matched_terms else 'none'}")


@codex_app.command("goal")
def codex_goal(ctx: typer.Context, project_id: str, task_id: str) -> None:
    store = _store(ctx.obj["db"])
    project = store.get_project(project_id)
    if project is None:
        raise typer.BadParameter(f"Unknown project: {project_id}")
    tasks = [task for task in store.list_tasks(project_id) if task.id == task_id]
    if not tasks:
        raise typer.BadParameter(f"Unknown task: {task_id}")
    typer.echo(render_codex_goal(project, tasks[0]))
