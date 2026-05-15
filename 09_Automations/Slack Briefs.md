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
Blocker:
Decision needed:
Next:
```

## Rule

Draft first. Human approval before sending until the format is trusted.

## Navigation

- [[09_Automations/README|Automations]]
- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Work Ledger|Work Ledger]]
