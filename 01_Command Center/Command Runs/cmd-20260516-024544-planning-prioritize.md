---
type: command-run
status: routed
command_id: cmd-20260516-024544
domain: planning
intent: prioritize
stage: plan
agent: Atlas
role: CEO
last_updated: 2026-05-16
---

# cmd-20260516-024544 - planning prioritize

## Command

이번 주 Lua 구축 우선순위 정리

## Routing

| Field | Value |
|---|---|
| Domain | planning |
| Intent | prioritize |
| gstack Role | CEO |
| Lua Agent | Atlas |
| Expected Output | Decision or priority draft |

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

Tell Codex: `cmd-20260516-024544 처리해줘`

## Atlas CEO Router Update

| Field | Value |
|---|---|
| Command ID | cmd-20260516-024544 |
| Domain / Intent | planning / prioritize |
| Stage | clarify -> plan |
| gstack Role | CEO |
| Lua Agent | Atlas |

### Clarify

- 목표: "이번 주 Lua 구축 우선순위 정리"를 이번 주 실행 가능한 우선순위와 다음 행동으로 바꾼다.
- 현재 제약: Obsidian이 기본 명령 본부이고, Slack은 보조 입력/알림, Notion은 나중의 팀 공유 정리본으로 둔다.
- 아직 하지 않을 것: Notion DB 자동 발행, Slack 중심 운영, 큰 범위의 사업 실행을 먼저 시작하는 일.

### Design

- 추천 방향: Obsidian Command Center를 먼저 안정화하고, planned/queued run을 Atlas Router가 순서대로 처리하게 만든다.
- 대안 1: Slack 명령 앱을 먼저 키운다. 원격 입력은 좋아지지만 지금의 기본 운영 원칙과 맞지 않는다.
- 대안 2: Notion 공유 DB를 먼저 만든다. 팀 공유에는 좋지만 아직 개인 command flow가 충분히 안정적이지 않다.

### Plan

- [x] 첫 처리 대상: [[01_Command Center/Command Runs/cmd-20260516-024544-planning-prioritize|cmd-20260516-024544]].
- [x] Atlas CEO 방식으로 clarify/design/plan 작성.
- [x] User Action Board를 다음 행동 중심으로 갱신.
- [ ] 다음 run은 `inbox-20260516-031554-01` build/app clarify로 진행.
- [ ] 그 다음 run은 `inbox-20260516-031554-02` research/brief로 진행.

### Next User Action

다음에는 Codex에게 아래처럼 말하면 된다.

```text
다음 command run 진행해줘
```

## Navigation

- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[07_Lua_System/commands/Domain Command Playbook|Domain Command Playbook]]
- [[01_Command Center/Work Ledger|Work Ledger]]
