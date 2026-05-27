from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WorkflowTask:
    title: str
    goal: str
    next_action: str
    owner_agent: str
    approval_required: bool = False


@dataclass(frozen=True)
class SeedProject:
    id: str
    name: str
    goal: str
    description: str
    tasks: list[WorkflowTask]


INITIAL_PROJECTS = [
    SeedProject(
        id="PROJ-001",
        name="Toss Mini App To App",
        goal="Plan and build a Toss mini app that can later expand into a standalone app.",
        description="Initial validation project for product planning, MVP scoping, and app expansion.",
        tasks=[
            WorkflowTask(
                title="Research Toss mini app requirements",
                goal="Identify Toss mini app requirements, constraints, and launch assumptions.",
                next_action="Research Toss mini app requirements and constraints.",
                owner_agent="lua_Research_Agent",
            ),
            WorkflowTask(
                title="Define Toss mini app MVP scope",
                goal="Turn research into a narrow MVP with user scenario, core flow, and refusal list.",
                next_action="Draft MVP user scenario and acceptance criteria.",
                owner_agent="lua_Product_Agent",
            ),
            WorkflowTask(
                title="Generate Toss implementation plan",
                goal="Create an implementation plan that can be executed with Codex and Lua_template.",
                next_action="Map MVP screens and data needs to Lua_template structure.",
                owner_agent="lua_Dev_Agent",
            ),
            WorkflowTask(
                title="Build Toss prototype skeleton",
                goal="Create the first runnable prototype skeleton using Lua_template as a reference.",
                next_action="Generate Codex goal for prototype skeleton.",
                owner_agent="lua_Dev_Agent",
            ),
            WorkflowTask(
                title="Plan Toss app expansion roadmap",
                goal="Define how the mini app can expand into a standalone app after MVP validation.",
                next_action="Draft expansion milestones and launch checklist.",
                owner_agent="lua_Product_Agent",
            ),
        ],
    ),
    SeedProject(
        id="PROJ-002",
        name="Telegram Trading Bot To App",
        goal="Plan and build a Telegram trading bot that can later expand into an app or dashboard.",
        description="Initial validation project for trading bot planning, risk controls, and app expansion.",
        tasks=[
            WorkflowTask(
                title="Research exchange and data source options",
                goal="Identify exchange APIs, market data sources, and Telegram bot constraints.",
                next_action="Identify target exchange and data source options.",
                owner_agent="lua_Research_Agent",
            ),
            WorkflowTask(
                title="Define trading bot MVP boundaries",
                goal="Define what the bot can and cannot do before any real trading is allowed.",
                next_action="Draft MVP command list and non-goals.",
                owner_agent="lua_Risk_Agent",
                approval_required=True,
            ),
            WorkflowTask(
                title="Draft trading risk and approval policy",
                goal="Create safety rules for API keys, paper trading, live trading, and user confirmations.",
                next_action="Write explicit approval gates for live trading and API keys.",
                owner_agent="lua_Risk_Agent",
                approval_required=True,
            ),
            WorkflowTask(
                title="Build Telegram bot skeleton",
                goal="Create a minimal Telegram bot skeleton with command handlers and no live trading.",
                next_action="Generate Codex goal for Telegram bot skeleton.",
                owner_agent="lua_Dev_Agent",
            ),
            WorkflowTask(
                title="Plan trading dashboard expansion",
                goal="Define how the bot can expand into an app or dashboard using Lua_template.",
                next_action="Map bot state, logs, and controls to dashboard screens.",
                owner_agent="lua_Product_Agent",
            ),
        ],
    ),
    SeedProject(
        id="PROJ-003",
        name="Floating Solar Monitoring System",
        goal="Plan a floating solar monitoring system, including vendor research and selection criteria.",
        description="Initial validation project for industry research, vendor selection, and system planning.",
        tasks=[
            WorkflowTask(
                title="Research floating solar monitoring use cases",
                goal="Understand monitoring needs, users, and operational risks for floating solar.",
                next_action="Research floating solar monitoring use cases.",
                owner_agent="lua_Research_Agent",
            ),
            WorkflowTask(
                title="Identify vendor and technology candidates",
                goal="List candidate vendors, sensor approaches, dashboard products, and integration options.",
                next_action="Collect candidate vendor names and evidence.",
                owner_agent="lua_Research_Agent",
            ),
            WorkflowTask(
                title="Define vendor selection criteria",
                goal="Create a scoring rubric for vendor fit, data quality, reliability, cost, and support.",
                next_action="Draft vendor selection criteria table.",
                owner_agent="lua_Product_Agent",
            ),
            WorkflowTask(
                title="Draft monitoring system architecture",
                goal="Define sensors, ingestion, storage, alerting, dashboard, and reporting assumptions.",
                next_action="Sketch sensor-data-dashboard architecture.",
                owner_agent="lua_Dev_Agent",
            ),
            WorkflowTask(
                title="Create first planning report outline",
                goal="Prepare a report outline for direction, vendors, requirements, and implementation roadmap.",
                next_action="Draft report sections and required evidence.",
                owner_agent="lua_Doc_Agent",
            ),
        ],
    ),
]
