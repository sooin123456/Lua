---
type: command-run
status: planned
command_id: example-001
domain: research
intent: compare
stage: clarify
agent: Lens
role: Researcher
last_updated: 2026-05-16
---

# example-001 - research compare

## Command

테크인과 경쟁사 비교

## Routing

| Field | Value |
|---|---|
| Domain | research |
| Intent | compare |
| gstack Role | Researcher |
| Lua Agent | Lens |
| Expected Output | Research note with sources |

## Superpowers Workflow

### 1. Clarify

- What is the exact desired outcome?
- What constraints matter?
- What should not be done yet?

### 2. Design

- What are 2-3 possible approaches?
- Which approach is smallest and safest?

### 3. Plan

- [ ] Define first useful output.
- [ ] Identify destination note.
- [ ] Identify verification method.

### 4. Execute

- [ ] Produce draft or implementation.

### 5. Verify

- [ ] Check links, assumptions, and output quality.

### 6. Brief

- [ ] Update Work Ledger.
- [ ] Decide whether Slack/Notion sharing is needed.

## Next User Action

Tell Codex: `example-001 처리해줘`

## Navigation

- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[07_Lua_System/commands/Domain Command Playbook|Domain Command Playbook]]
- [[01_Command Center/Work Ledger|Work Ledger]]
