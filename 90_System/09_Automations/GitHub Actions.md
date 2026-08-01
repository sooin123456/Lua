---
type: automation-map
system: github-actions
last_updated: 2026-05-15
---

# GitHub Actions

## Active

- `check.yml`: run `node 90_System/scripts/check.js` on push and pull request.
- `telegram-capture.yml`: capture Telegram input into the vault.
- `notion-obsidian-digest.yml`: summarize Obsidian/Notion state.

## Next

- `weekly-review.yml`: create weekly review draft.
- `pr-voice-check.yml`: check external-facing drafts for voice rules.
- `artifact-ledger-check.yml`: verify artifact records have owner, status, and location.

## Failure Handling

Failed automations should create a note in `90_System/80_Lua_Details/00_Inbox/` and optionally draft a Notion alert. Do not auto-spam Notion on repeated failures.

## Navigation

- [[90_System/09_Automations/README|Automations]]
- [[90_System/80_Lua_Details/01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]]
- [[00_Lua/03_Records/Work Ledger|Work Ledger]]
