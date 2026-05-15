---
type: team-brief-drafts
status: active
last_updated: 2026-05-15
---

# Team Brief Drafts

Notion 또는 Slack에 보내기 전, 사람이 확인할 팀 공유 초안을 모은다.

Slack 전송은 온라인 명령이다. 실행 전 [[01_Command Center/Command Modes|Command Modes]]를 따른다.

## Draft Queue

<!-- slack-brief
channel: #ai-briefings
status: draft
title: Lua Slack Integration Test
-->
[Lua] Slack integration draft

Changed:
- Slack 연동 초안 흐름을 테스트합니다.

Decision needed:
- 이 메시지 형식으로 팀 공유를 시작할지 확인합니다.

Blocker:
- Slack Incoming Webhook URL 설정 필요.

Next:
- 승인되면 `status: approved`로 바꾸고 `node scripts/slack_brief.js --confirm-send`를 실행합니다.
<!-- /slack-brief -->

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

- 승인 전에는 Slack으로 보내지 않는다.
- 원본 링크는 Obsidian 노트로 남긴다.
- 팀에게 필요 없는 개인 사고 과정은 제거한다.
- 숫자, 일정, 담당자, 결정 요청은 명확히 쓴다.

## Navigation

- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[01_Command Center/Command Modes|Command Modes]]
- [[09_Automations/Slack Briefs|Slack Briefs]]
- [[09_Automations/Notion Sync|Notion Sync]]
- [[01_Command Center/Work Ledger|Work Ledger]]
