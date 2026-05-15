---
type: cleanup-backlog
last_updated: 2026-05-15
---

# Cleanup Backlog

This file tracks structural cleanup that should not be mixed into feature commits.

## P0: Keep the Harness Resumable

- [x] Add `AGENTS.md` for Codex entry.
- [x] Make `node scripts/check.js` run without npm dependencies.
- [x] Add line-ending rules through `.gitattributes`.
- [x] Add future ignores for Obsidian plugin bundles.
- [x] Add work provenance ledger and `/work-log`.
- [x] Remove Obsidian plugin generated/settings files from Git tracking.

## P1: Repository Weight

Tracked Obsidian plugin bundles are large and probably should not live in Git long term.

Current largest tracked candidates:

- `.obsidian/plugins/obsidian-local-rest-api/main.js`
- `.obsidian/plugins/obsidian-git/main.js`
- `.obsidian/plugins/templater-obsidian/main.js`
- `.obsidian/plugins/obsidian-git/styles.css`
- `.obsidian/plugins/templater-obsidian/styles.css`

Status: removed from Git tracking while keeping local files.

Security note: `obsidian-local-rest-api/data.json` contained API/private key material. Regenerate the Obsidian Local REST API key and purge old GitHub history before treating the repo as clean.

## P1: Legacy Specs

These are useful historical drafts but make the root noisy:

- `Lua-v3-spec.md`
- `Lua-v3-phase2.md`
- `Lua-v3-phase3.md`

Status: moved to `05_Archives/Lua Specs/`.

## P1: Odd Agent Path

This path looks like a misplaced generated artifact:

- `07_Lua_System/agents/verticals/climate-energy/skills/proposal-drafting/references/form-patterns.md`

Status: moved to `07_Lua_System/verticals/climate-energy/skills/proposal-drafting/references/form-patterns.md`.

## P2: Vault Graph Hygiene

`node scripts/vault_audit.js` currently reports many orphan notes. This is expected because project `Backlog`, `Research`, `Metrics`, and `DevLog` pages are often created before dashboards link them.

Next action: update project Home pages and dashboards before deleting anything.

## 2026-05-15 Inspection Notes

Security scan:

- No live secret value was found in currently tracked files by the local scan.
- Matches were documentation references such as `OBSIDIAN_API_KEY`, `TELEGRAM_BOT_TOKEN`, `NOTION_API_TOKEN`, GitHub Actions `${{ secrets.* }}`, and safety rules.
- Historical exposure may still exist because `.obsidian/plugins/obsidian-local-rest-api/data.json` was tracked before cleanup. Treat old keys as burned.

Tracked Obsidian plugin files:

- Only plugin `manifest.json` files remain tracked.
- Plugin `data.json`, `main.js`, and `styles.css` are ignored and untracked.

Empty file cleanup candidates:

- Many project scaffold files are empty: `Backlog.md`, `DevLog.md`, `Metrics.md`, `Research.md`, and some `Home.md`.
- Several template prompt files are empty under `99_Templates/Agent Prompts/`.
- Do not delete yet. Next safe move is to fill core project scaffolds with a minimal template so the vault graph becomes useful.

Recommended next cleanup:

1. [x] Fill `99_Templates/Project Dashboard Template.md`.
2. [x] Apply the template to empty `02_Projects/**/Home.md` files.
3. [x] Add one-line status to empty `Backlog.md`, `DevLog.md`, `Metrics.md`, and `Research.md` instead of deleting them.
4. [x] Re-run `node scripts/vault_audit.js`.

Result:

- Empty file count is now 0.
- `node scripts/check.js` passes.
- `vault_audit.js` still reports orphan notes because dashboards/project hubs need more backlinks.

Next cleanup:

1. Update `02_Projects/Projects Hub.md` to link every project Home.
2. Update each project `Home.md` to link to parent company/domain notes.
3. Fix two broken links reported by `vault_audit.js`.

## 2026-05-15 Audit Rule Update

`vault_audit.js` now distinguishes true orphan notes from normal support files.

Orphan exceptions:

- inbox queue files
- archived files
- drafts
- identity/system files
- hub/readme files
- agent prompts
- skill entrypoints
- skill `references/`
- skill `assets/`
- templates

Result:

- Orphan notes: `60 -> 14`
- Orphan exceptions are counted by reason in the audit report.
- Broken links remain `0`.

Next cleanup should focus only on the remaining true orphan notes, mainly command docs and automation docs.

## Navigation

- [[09_Automations/README|Automations]]
- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Work Ledger|Work Ledger]]
