---
type: inbox-index
status: active
last_updated: 2026-05-16
---

# AI 분류 대기중

Inbox는 아직 domain이나 project가 정해지지 않은 생각을 임시로 두는 곳이다. 이 파일은 Inbox 안내/목록 허브이고, 실제 새 아이디어는 개별 `.md` 파일로 만든다.

## Current Inbox Notes

- [[00_Inbox/Toss 미니앱 만들기|Toss 미니앱 만들기]] - promoted

## How It Works

새 아이디어는 `00_Inbox` 폴더에 새 `.md` 파일로 만든다.

파일형 Inbox 메모는 아래 스크립트가 자동으로 찾아서 Command Queue 후보로 승격한다.

```bash
node scripts/add_inbox_capture.js "새 아이디어"
node scripts/promote_inbox_to_commands.js --dry-run
node scripts/promote_inbox_to_commands.js --apply
```

## Capture Log

| ID | Created | Source | Status | Raw Capture |
|---|---|---|---|---|

## Navigation

- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[01_Command Center/User Action Board|User Action Board]]
- [[01_Command Center/Work Ledger|Work Ledger]]
