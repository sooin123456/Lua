---
name: work-log
description: Record the origin host and agent for a completed work session. Use before or after commits, Notion mirrors, Slack briefs, and automation runs.
vertical: _core
trigger: "/work-log"
applies_to: [atlas, vault, forge, archivist]
---

# /work-log

작업이 어디서 왔는지 남기는 명령이다. Mac Claude, Windows Codex, 수동 편집, GitHub Action을 구분한다.

## Input

```text
/work-log {short title}
```

## Required Fields

- Host: `mac-claude`, `windows-codex`, `manual`, `github-action`, `external-tool`
- Agent: `Claude`, `Codex`, `human`, `automation`
- Repo/area
- Trigger
- Changed
- Verification
- Commit
- Next

## Where to Write

Append to:

```text
01_Command Center/Work Ledger.md
```

## Commit Message Rule

Use a host prefix:

```text
[host:windows-codex] chore: establish operating harness
[host:mac-claude] docs: draft project brief
[host:github-action] chore: weekly digest
```

## Never do

- Do not write secrets into the ledger.
- Do not paste full API responses.
- Do not claim a host if the actual origin is unknown. Use `external-tool` or `manual`.

## Navigation

- [[07_Lua_System/verticals/_core/README|_core vertical]]
- [[07_Lua_System/agents/README|Lua Agents]]
- [[01_Command Center/Work Ledger|Work Ledger]]
