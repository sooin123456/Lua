---
name: office-hours
description: Turn a raw idea into a scoped 7-day project brief before building. Use for new apps, services, automations, and personal/team products.
vertical: _core
trigger: "/office-hours"
applies_to: [atlas, lens, scribe]
---

# /office-hours

새로운 서비스나 앱을 만들기 전에 문제를 날카롭게 만드는 루프다. 바로 구현하지 않고, 먼저 7일 안에 검증할 수 있는 형태로 줄인다.

## Input

```text
/office-hours {idea}
```

## Steps

### 1. User

- 누가 쓰는가?
- 그 사람은 지금 어떤 상황에서 불편한가?
- 팀 내부용인가, 외부 고객용인가, 개인 생산성용인가?

### 2. Pain

- 지금 수동으로 하는 행동은 무엇인가?
- 실패 비용은 시간, 돈, 신뢰, 기회 중 무엇인가?
- 기존 도구로 충분하지 않은 이유는 무엇인가?

### 3. Seven-day proof

- 7일 안에 만들 수 있는 가장 작은 증거는 무엇인가?
- 증거는 데모, 자동화, 리포트, 결제, 팀 사용 중 무엇인가?
- 성공 기준은 숫자나 관찰 가능한 행동으로 적는다.

### 4. First slice

- 첫 화면 또는 첫 자동화 하나만 정한다.
- 만들지 않을 것을 3개 적는다.
- 필요한 데이터와 권한을 적는다.

### 5. Output

Create or update:

```text
02_Projects/{domain}/{project}/Home.md
02_Projects/{domain}/{project}/Backlog.md
02_Projects/{domain}/{project}/DevLog.md
```

## Output Template

```markdown
## Office Hours Brief

User:
Pain:
Seven-day proof:
First slice:
Not building yet:
Data/permissions:
Acceptance criteria:
Next command:
```

## Never do

- Do not start coding before the 7-day proof is clear.
- Do not create a large roadmap.
- Do not add external integrations until the manual version is obvious.

## Navigation

- [[07_Lua_System/verticals/_core/README|_core vertical]]
- [[07_Lua_System/agents/README|Lua Agents]]
- [[01_Command Center/Work Ledger|Work Ledger]]
