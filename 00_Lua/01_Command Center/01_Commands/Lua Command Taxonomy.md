---
ai-index: true
type: operating-guide
status: active
last_updated: 2026-05-28
---

# Lua Command Taxonomy

This guide defines command types and the behavior Lua should follow for each type.

## Command Types

| Type | Example | Default AI Behavior | Approval |
|---|---|---|---|
| `capture` | `/lua inbox 새로운 아이디어` | record only, classify later | auto |
| `status` | `/lua status Lua` | summarize current state and next actions | auto |
| `plan` | `/lua pm split :: Toss QA 고도화` | clarify scope, produce task split | auto |
| `research` | `/lua research brief :: 업체 후보 조사` | gather sources, cite dates, separate facts/inference | auto unless contacting external parties |
| `write` | `/lua write brief :: 회의 내용 팀 공유` | draft, do not send | send requires approval |
| `build` | `/lua build app :: 기능 구현` | inspect repo, implement locally, test, record | deploy/push requires approval |
| `qa` | `/lua qa vault :: 구조 점검` | run checks, report findings, fix safe local issues | destructive cleanup requires approval |
| `release` | `/lua release push :: 변경사항 올리기` | prepare summary/checklist | push/deploy requires approval |
| `approve` | `/lua approve item-id` | mark approved item only | requires explicit user intent |

## AI Action Policy

| Situation | Lua Should Do |
|---|---|
| command is vague but safe | classify and create a draft next action |
| command touches files/code | inspect first, then edit, then verify |
| command touches secrets | use env var names only; never print values |
| command sends/publishes/pushes | stop and ask for approval |
| command is trading/payment/destructive | require explicit approval |
| command is only a thought | capture as memory, not execution |

## Routing

| Input Channel | Purpose | Processor |
|---|---|---|
| Telegram | main personal command intake | `telegram_bot_poll.js` -> Telegram Command Inbox |
| Codex chat | local implementation and repo work | Codex |
| Obsidian Command Center | structured durable commands | command queue scripts |
| Inbox | unclassified memory | inbox promotion scripts |
| Slack | team sharing / secondary capture | Slack queue or brief scripts |

## Command Record

Every executed command should leave at least one of:

- runtime checkpoint
- command run note
- project DevLog entry
- Work Ledger entry
- app repo 90_System/docs update

## Navigation

- [[00_Lua/01_Command Center/04_Policies/Lua Operating Layers|Lua Operating Layers]]
- [[00_Lua/01_Command Center/01_Commands/Lua Command And Record Channels|Command And Record Channels]]
- [[00_Lua/01_Command Center/01_Commands/Command Modes|Command Modes]]
- [[90_System/07_Lua_System/runtime/Approval Policy Profiles|Approval Policy Profiles]]
