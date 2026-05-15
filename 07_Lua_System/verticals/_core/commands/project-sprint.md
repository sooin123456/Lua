---
name: project-sprint
description: Run a small Codex/Forge build sprint with planning, implementation, checks, security review, and DevLog handoff.
vertical: _core
trigger: "/project-sprint"
applies_to: [forge, atlas, vault]
---

# /project-sprint

Codex 또는 Forge가 실제 구현에 들어갈 때 쓰는 하네스다. 한 번에 큰 제품을 만들지 않고, 검증 가능한 한 조각을 만든다.

## Input

```text
/project-sprint {project} {goal}
```

## Steps

### 1. Load context

- `CLAUDE.md`
- `AGENTS.md`
- project `Home.md`
- project `Backlog.md`
- project `DevLog.md`
- 관련 repo의 `README`, `AGENTS.md`, 테스트 설정

### 2. Plan

- 목표를 한 문장으로 재작성한다.
- acceptance criteria를 3-5개로 정한다.
- 파일 수정 범위를 정한다.
- 위험한 권한, 비용, 외부 전송 여부를 확인한다.

### 3. Build

- 작은 diff로 구현한다.
- 기존 패턴을 우선한다.
- 새 추상화는 중복이나 복잡도를 실제로 줄일 때만 만든다.

### 4. Verify

순서대로 가능한 만큼 실행한다.

```bash
node scripts/check.js
npm test
npm run lint
npm run build
```

프로젝트별 명령이 다르면 해당 repo의 지침을 따른다.

### 5. Security review

- secret이 출력되거나 커밋되지 않았는가?
- Notion, Slack, Obsidian, GitHub 토큰이 파일에 들어가지 않았는가?
- 외부 전송은 사람 승인을 받았는가?
- 팀이 보아도 되는 데이터만 Notion/Slack으로 나가는가?

### 6. Log

Append to project `DevLog.md`:

```markdown
## YYYY-MM-DD - Sprint

Goal:
Changed:
Verification:
Risks:
Next:
```

## Never do

- Do not skip verification because the change is small.
- Do not mutate Identity files.
- Do not send Slack or Notion updates directly unless explicitly approved.

## Navigation

- [[07_Lua_System/verticals/_core/README|_core vertical]]
- [[07_Lua_System/agents/README|Lua Agents]]
- [[01_Command Center/Work Ledger|Work Ledger]]
