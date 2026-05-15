---
type: automation-map
system: github-actions
last_updated: 2026-05-15
---

# GitHub Actions

## Active

- `check.yml`: run `node scripts/check.js` on push and pull request.
- `telegram-capture.yml`: capture Telegram input into the vault.
- `notion-obsidian-digest.yml`: summarize Obsidian/Notion state.

## Next

- `weekly-review.yml`: create weekly review draft.
- `pr-voice-check.yml`: check external-facing drafts for voice rules.
- `artifact-ledger-check.yml`: verify artifact records have owner, status, and location.

## Failure Handling

Failed automations should create a note in `00_Inbox/` and optionally draft a Slack alert. Do not auto-spam Slack on repeated failures.

## Navigation

- [[09_Automations/README|Automations]]
- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Work Ledger|Work Ledger]]
