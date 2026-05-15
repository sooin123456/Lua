---
name: team-brief
description: Draft a Notion and Slack-ready project brief from Obsidian project notes. Use after meaningful status changes or before team updates.
vertical: _core
trigger: "/team-brief"
applies_to: [archivist, scribe, atlas]
---

# /team-brief

Obsidian의 깊은 맥락을 팀이 바로 읽을 수 있는 Notion/Slack 브리프로 줄인다.

## Input

```text
/team-brief {project}
```

## Steps

### 1. Load

- project `Home.md`
- project `DevLog.md`
- project `Backlog.md`
- linked decision notes
- latest artifact records

### 2. Extract

- 현재 상태
- 이번 주 변화
- 막힌 것
- 필요한 결정
- 다음 행동

### 3. Notion mirror

Update proposal only:

```markdown
Project:
Status:
Owner:
Next action:
Deadline:
Blocker:
Latest artifact:
```

### 4. Slack draft

Draft only:

```markdown
[{project}] {status}

Changed:
Blocker:
Decision needed:
Next:
```

## Approval

Slack 전송은 사람 승인 후에만 한다. 처음 2주 동안은 자동 전송하지 않고 초안만 만든다.

## Never do

- Do not expose private Identity notes.
- Do not include raw prompts or secrets.
- Do not over-explain. Team brief is for decisions, not memory storage.

## Navigation

- [[07_Lua_System/verticals/_core/README|_core vertical]]
- [[07_Lua_System/agents/README|Lua Agents]]
- [[01_Command Center/Work Ledger|Work Ledger]]
