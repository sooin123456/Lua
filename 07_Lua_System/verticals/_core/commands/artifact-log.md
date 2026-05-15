---
name: artifact-log
description: Register reusable outputs such as builds, reports, datasets, proposal drafts, patent drafts, screenshots, and skill bundles.
vertical: _core
trigger: "/artifact-log"
applies_to: [vault, archivist, forge]
---

# /artifact-log

재사용 가능한 결과물이 생겼을 때 위치, 상태, 책임자를 잃어버리지 않기 위한 기록 루프다.

## Input

```text
/artifact-log {name}
```

## Artifact Types

- app-build
- demo-url
- report
- dataset
- proposal-draft
- patent-draft
- screenshot
- skill-bundle
- prompt

## Steps

### 1. Identify

- artifact name
- type
- project
- path or URL
- owner
- reviewer
- status

### 2. Record

Append to:

```text
08_Artifacts/Artifact Ledger.md
```

### 3. Link

Add a backlink from the project `Home.md` or `DevLog.md`.

### 4. Mirror

Mirror to Notion only if team members need to retrieve it.

## Template

```markdown
| Date | Artifact | Type | Project | Location | Status | Owner | Reviewer |
|---|---|---|---|---|---|---|---|
| YYYY-MM-DD |  |  |  |  | draft/reviewed/shipped/archived |  |  |
```

## Never do

- Do not store secrets as artifacts.
- Do not put large binaries directly in Obsidian.
- Do not claim reviewed status without a named reviewer.

## Navigation

- [[07_Lua_System/verticals/_core/README|_core vertical]]
- [[07_Lua_System/agents/README|Lua Agents]]
- [[01_Command Center/Work Ledger|Work Ledger]]
