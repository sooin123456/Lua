---
type: automation-map
system: slack
last_updated: 2026-05-15
---

# Slack Briefs

Slack is a signal channel, not the system of record.

## Channels

| Channel | Purpose |
|---|---|
| `#ai-briefings` | weekly summaries and decision requests |
| `#project-{slug}` | project-specific blockers and ship notes |
| `#ops-alerts` | failed automation drafts and urgent reminders |

## Draft Format

```markdown
[{project}] {status}

Changed:
Decision needed:
Blocker:
Next:
```

## Trigger Types

| Trigger | Send to | Example |
|---|---|---|
| decision-needed | `#project-{slug}` | "승인 필요" |
| blocker | `#project-{slug}` or `#ops-alerts` | "일정 지연 가능성" |
| weekly-summary | `#ai-briefings` | "이번 주 변경/결정/다음 행동" |
| automation-failed | `#ops-alerts` | "Notion sync draft failed" |

## Approval Rule

Slack은 초기에 자동 전송하지 않는다. [[03_Operation/Team Brief Drafts|Team Brief Drafts]]에 초안을 만들고 사용자가 승인한 뒤 보낸다.

## Rule

Draft first. Human approval before sending until the format is trusted.

## Navigation

- [[09_Automations/README|Automations]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[03_Operation/Team Brief Drafts|Team Brief Drafts]]
- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Work Ledger|Work Ledger]]
