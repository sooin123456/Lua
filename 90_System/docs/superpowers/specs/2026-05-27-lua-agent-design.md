# lua_Agent Design

Date: 2026-05-27

## Product Definition

`lua_Agent` is a customizable Agent OS for moving projects forward without losing continuity.

It is not a single "Jarvis" assistant. It is a framework for defining purpose-specific agents such as `lua_Project_Agent`, `lua_Dev_Agent`, `lua_Research_Agent`, `lua_Trading_Agent`, and user-defined custom agents.

The first product focus is `lua_Project_Agent`: an agent that turns a user's project goal into planned work, assigns the right AI/tool workflow, records progress, and keeps the next action ready so work can resume after interruptions.

## Primary Use Case

The first user is a builder using many AI tools and external systems. Their problem is not a lack of AI assistants; it is that work gets scattered across Codex, Claude, Gemini, Kimi, Grok, Manus, Canva, Notion, Telegram, and Obsidian.

`lua_Agent` should act as the operating layer above those tools:

- Capture a command as a project or task.
- Split the work into milestones and next actions.
- Choose the right tool or specialist agent.
- Generate prompts, Codex `/goal` instructions, and work orders.
- Record decisions and checkpoints.
- Resume work from the last known state.
- Ask for approval before risky actions.

## Initial Projects

The MVP will be validated against three real projects.

### Toss Mini App To App

Goal: plan and build a Toss mini app that can later expand into a standalone app.

Needed capabilities:

- Product planning
- Requirements definition
- MVP scoping
- Development task breakdown
- Codex `/goal` generation
- App expansion roadmap
- Launch checklist

### Telegram Trading Bot To App

Goal: plan and build a Telegram trading bot that can later expand into an app or dashboard.

Needed capabilities:

- Trading bot requirements
- Exchange/API research
- Strategy and risk policy documentation
- Telegram bot MVP planning
- Approval gates for trading or paid API actions
- App/dashboard expansion roadmap

### Floating Solar Monitoring System

Goal: plan the direction for a floating solar monitoring system, including company research and vendor selection.

Needed capabilities:

- Market and vendor research
- Selection criteria
- Monitoring requirements
- Sensor/data/dashboard architecture
- Proposal and planning documents
- Implementation roadmap

## Agent Model

The first agent hierarchy should remain small.

`lua_Project_Agent`

- Owns projects and tasks.
- Breaks goals into milestones.
- Chooses specialist agents or tools.
- Maintains next actions and status.

`lua_Research_Agent`

- Performs market, vendor, technology, and competitor research.
- Generates research prompts for Gemini, Kimi, Grok, Manus, Claude, or web search.

`lua_Product_Agent`

- Defines requirements, MVP scope, user scenarios, and roadmaps.

`lua_Dev_Agent`

- Converts implementation tasks into Codex `/goal` prompts.
- Tracks tests, reviews, and engineering checkpoints.

`lua_Doc_Agent`

- Writes Obsidian logs, repo documentation, Notion-ready summaries, and reusable templates.

`lua_Risk_Agent`

- Reviews risky actions such as trading automation, public posting, account changes, paid API calls, data deletion, deployment, and git push/PR actions.

## Core Concepts

### Project

A project is a durable container for a goal, context, tasks, decisions, and logs.

### Task

A task is a resumable unit of work.

Fields:

- id
- project_id
- title
- goal
- status
- owner_agent
- next_action
- priority
- approval_required
- created_at
- updated_at

Statuses:

- inbox
- planned
- running
- blocked
- review
- done
- failed

### Checkpoint

A checkpoint records progress after each work session or heartbeat.

Fields:

- task_id
- summary
- done
- next_action
- blocked_reason
- created_at

### Tool Instruction

A tool instruction is a generated work order for a specific system.

Examples:

- Codex `/goal`
- Claude review prompt
- Manus research task
- Canva design brief
- Gemini/Kimi/Grok comparison prompt
- Notion page update plan
- Obsidian markdown note

### Memory

Memory stores durable user preferences, project context, decisions, reusable prompts, and lessons learned.

Obsidian is the primary long-term knowledge layer. Notion is the operational dashboard layer.

## Tool Roles

Codex:

- Local code execution
- Repository analysis
- Implementation
- Test/debug cycles
- `/goal` based long-running development tasks

Claude:

- Planning
- Review
- Long-context reasoning
- Writing and critique

Gemini, Kimi, Grok:

- Research perspective diversity
- Alternative analysis
- Current web or model-specific viewpoints when useful

Manus:

- Longer autonomous web/research tasks
- Vendor or market research workflows

Canva:

- Design briefs
- Proposal visuals
- Marketing or presentation assets

Telegram:

- Command input
- Notifications
- Approval requests

Notion:

- Project dashboard
- Task state
- Shared operational view

Obsidian:

- Long-term notes
- Development logs
- Decisions
- Project memory
- Reusable templates

## Continuity Design

The system should optimize for continuity rather than constant autonomy.

Each task must always have a `next_action`. After every execution checkpoint, the agent updates:

- what was done
- what was learned
- what remains
- whether anything is blocked
- the next action

The heartbeat runner should periodically inspect active tasks and resume them from the stored `next_action`. It should execute one bounded checkpoint at a time, then write a checkpoint and stop or schedule the next step.

This avoids fragile infinite-agent behavior while still allowing work to continue across interruptions.

## Approval Policy

Allowed automatically:

- Drafting
- Research
- Local read-only inspection
- Test execution
- Obsidian personal notes
- Local task/checkpoint updates
- Prompt and `/goal` generation

Ask first:

- Telegram message sending
- Notion shared page edits
- Git commit, push, PR, or deployment
- Canva publishing or sharing
- Browser actions that submit forms
- Paid API usage
- Trading-related actions
- Large file modifications

Never without explicit approval:

- Account setting changes
- Subscription or payment changes
- Credential exposure
- Public posting
- Live trading
- Bulk deletion

## MVP Scope

The MVP should include:

- CLI-first interface
- SQLite local storage
- Project and task models
- Checkpoint logging
- Obsidian markdown export
- Codex `/goal` generator
- AI tool router that produces tool instructions
- Seed use cases for the three initial projects
- Documentation of design decisions and customization patterns

The MVP should not include:

- Full browser automation
- Full Canva automation
- Automatic live trading
- Automatic public posting
- Complete Telegram automation
- Complete Notion sync
- Autonomous multi-agent delegation loops

## Development Documentation Requirements

The development process must be recorded so other users can later customize `lua_Agent` for their own purposes.

Required documentation:

- Vision document
- Architecture document
- Development log
- Decision records
- Use-case documents
- Agent template
- Project template
- Checkpoint template
- Codex `/goal` template
- Customization guide

## Proposed Repository Structure

```text
lua_Agent/
├─ 90_System/docs/
│  ├─ vision.md
│  ├─ architecture.md
│  ├─ development-log.md
│  ├─ decisions/
│  ├─ use-cases/
│  ├─ templates/
│  └─ customization/
├─ 90_System/lua_agent/
│  ├─ cli.py
│  ├─ models.py
│  ├─ storage.py
│  ├─ heartbeat.py
│  ├─ commander.py
│  ├─ approvals.py
│  ├─ agents/
│  └─ connectors/
└─ 90_System/tests/
```

## Success Criteria

The first version is successful when:

- The three initial projects can be registered.
- Each project can be split into tasks.
- Each task has a durable next action.
- A checkpoint can be written after work.
- Obsidian markdown logs can be generated.
- Codex `/goal` prompts can be generated from development tasks.
- The design and development process are documented well enough for another user to create their own `_Agent`.

