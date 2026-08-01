---
type: team-brief-drafts
status: active
last_updated: 2026-05-15
---

# Team Brief Drafts

Notion에 보내거나 별도 보고서로 정리하기 전, 사람이 확인할 팀 공유 초안을 모은다.

Notion 반영이나 외부 공유는 승인 후에만 한다. 실행 전 [[90_System/80_Lua_Details/01_Command Center/01_Commands/Command Modes|Command Modes]]를 따른다.

## Draft Queue

<!-- team-brief
target: notion
status: draft
title: Lua Team Brief Draft
-->
[Lua] Team brief draft

Changed:
- 팀 공유 초안 흐름을 테스트합니다.

Decision needed:
- 이 메시지 형식으로 팀 공유를 시작할지 확인합니다.

Blocker:
- Notion 공유 대상과 승인자가 필요합니다.

Next:
- 승인되면 `status: approved`로 바꾸고 Notion Publish Queue로 넘깁니다.
<!-- /team-brief -->

### Template

```markdown
[{project or area}] {status}

Changed:
- 

Decision needed:
- 

Blocker:
- 

Next:
- 
```

## Rules

- 승인 전에는 Notion으로 보내지 않는다.
- 원본 링크는 Obsidian 노트로 남긴다.
- 팀에게 필요 없는 개인 사고 과정은 제거한다.
- 숫자, 일정, 담당자, 결정 요청은 명확히 쓴다.

## Navigation

- [[90_System/80_Lua_Details/03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[90_System/80_Lua_Details/01_Command Center/01_Commands/Command Modes|Command Modes]]
- [[90_System/09_Automations/Notion Sync|Notion Sync]]
- [[00_Lua/03_Records/Work Ledger|Work Ledger]]
