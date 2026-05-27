from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SeedProject:
    id: str
    name: str
    goal: str
    description: str
    first_task_title: str
    first_task_goal: str
    first_task_next_action: str
    first_task_owner: str = "lua_Project_Agent"


INITIAL_PROJECTS = [
    SeedProject(
        id="PROJ-001",
        name="Toss Mini App To App",
        goal="Plan and build a Toss mini app that can later expand into a standalone app.",
        description="Initial validation project for product planning, MVP scoping, and app expansion.",
        first_task_title="Research Toss mini app requirements",
        first_task_goal="Identify Toss mini app requirements, constraints, and launch assumptions.",
        first_task_next_action="Research Toss mini app requirements and constraints.",
    ),
    SeedProject(
        id="PROJ-002",
        name="Telegram Trading Bot To App",
        goal="Plan and build a Telegram trading bot that can later expand into an app or dashboard.",
        description="Initial validation project for trading bot planning, risk controls, and app expansion.",
        first_task_title="Define trading bot MVP boundaries",
        first_task_goal="Define the bot scope, exchange/API assumptions, and approval boundaries.",
        first_task_next_action="Identify target exchange and data source options.",
        first_task_owner="lua_Risk_Agent",
    ),
    SeedProject(
        id="PROJ-003",
        name="Floating Solar Monitoring System",
        goal="Plan a floating solar monitoring system, including vendor research and selection criteria.",
        description="Initial validation project for industry research, vendor selection, and system planning.",
        first_task_title="Research floating solar monitoring vendors",
        first_task_goal="Find candidate vendors, monitoring approaches, and selection criteria.",
        first_task_next_action="Research floating solar monitoring use cases.",
        first_task_owner="lua_Research_Agent",
    ),
]
