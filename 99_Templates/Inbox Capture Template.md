---
type: template
status: active
last_updated: 2026-05-16
---

# Inbox Capture Template

```markdown
| ID | Created | Source | Status | Raw Capture |
|---|---|---|---|---|
| cap-YYYYMMDDHHMMSS | YYYY-MM-DD HH:mm:ss KST | manual | captured | 생각 원문 |
```

## Fields

| Field | Meaning |
|---|---|
| ID | 자동 생성되는 capture id |
| Created | 작성 시각 |
| Source | manual, meeting, slack, mobile, web |
| Status | captured, triaged, promoted, archived |
| Raw Capture | 원문 |

## Script

```bash
node scripts/add_inbox_capture.js --source manual "떠오른 생각"
```

## Navigation

- [[00_Inbox/AI 분류 대기중...|AI 분류 대기중]]
- [[99_Templates/Templates Hub|Templates Hub]]
