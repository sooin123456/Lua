from __future__ import annotations

from pathlib import Path

import typer

from lua_agent.codex import render_codex_goal
from lua_agent.models import Project, Task, TaskStatus
from lua_agent.storage import SQLiteStore

app = typer.Typer(help="lua_Agent local project operator.")
project_app = typer.Typer(help="Project commands.")
task_app = typer.Typer(help="Task commands.")
codex_app = typer.Typer(help="Codex helper commands.")
app.add_typer(project_app, name="project")
app.add_typer(task_app, name="task")
app.add_typer(codex_app, name="codex")


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
    task_id = _next_id("TASK", len(store.list_tasks(project_id)))
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
