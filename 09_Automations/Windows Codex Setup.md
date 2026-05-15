---
type: setup-checklist
system: windows-codex
last_updated: 2026-05-15
---

# Windows Codex Setup

This PC is the implementation machine for Lua. The goal is not to install every tool at once. The goal is to make the machine resumable: clone, check, build, log, and hand off.

## Current Verified State

| Tool | Status | Note |
|---|---|---|
| Git | installed | global user configured |
| Node | installed through Codex | enough for `node scripts/check.js` |
| npm | missing from PATH | avoid npm-dependent checks for now |
| VS Code | installed | `code` command available |
| Codex | installed | Windows implementation host |
| Claude CLI | missing | use Claude on Mac or browser until needed |

## One-time Git Fix

This workspace needed a safe-directory entry because Windows reported different owner SIDs.

```bash
git config --global --add safe.directory C:/Users/sooin/Documents/Codex/2026-05-15/https-www-youtube-com-watch-v/Lua
```

## Daily Resume Checklist

Run these from the Lua repo root:

```bash
git status --short
node scripts/check.js
node scripts/vault_audit.js
```

If `check.js` passes, the harness is usable. If `vault_audit.js` reports orphan notes or broken links, treat them as cleanup backlog, not as a blocked build.

## Provenance Setup

Use host-prefixed commits from this PC:

```bash
git config commit.template .gitmessage
```

Recommended commit prefix:

```text
[host:windows-codex]
```

After meaningful sessions, append an entry to `01_Command Center/Work Ledger.md`.

## Required Later

- Install Node.js LTS so `npm` is available outside Codex.
- Decide whether Obsidian plugin bundles should remain tracked.
- Configure Obsidian Local REST API key in `.env` only. Never commit it.
- Connect Notion and Slack only after the brief format is stable.

## Rule

Do not keep rebuilding the PC from scratch. Add missing setup here, then continue the loop.

## Navigation

- [[09_Automations/README|Automations]]
- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Work Ledger|Work Ledger]]
