---
type: system-root
load: always
priority: critical
host: codex
last_updated: 2026-05-15
---

# AGENTS.md

This is the Codex entry point for the Lua system. Treat `CLAUDE.md` as the shared source of truth, then apply the Windows Codex operating rules below.

## Always Load

1. `CLAUDE.md`
2. `07_Lua_System/agents/README.md`
3. `01_Command Center/Harness Loop.md`
4. `01_Command Center/Identity/context.md`
5. `01_Command Center/_System/agent-permissions.md`

## Windows Codex Role

Codex is the implementation and verification harness.

- Edit repositories, scripts, tests, and local apps.
- Run `node scripts/check.js` before handing work back.
- Keep design decisions in Markdown close to the Obsidian vault.
- Do not send Slack messages, publish drafts, or mutate Notion records unless the user explicitly approves that action.

## Mac Claude Role

Claude is the thinking, writing, and relationship harness.

- Use it for long-form planning, synthesis, Notion curation, and external-facing prose.
- Use Codex when the next step needs repo edits, deterministic scripts, tests, or browser verification.

## Pi Role

Pi is the lightweight terminal harness for typed experiments.

- Use Pi for small prompt presets, context experiments, eval runs, and package experiments.
- Keep Pi optional until `.pi/` presets are explicitly added to this repo.
- Review third-party Pi packages before installing them because packages can execute code and influence agent behavior.
- Store Pi decisions in `04_Resources/Tech Stack/Pi Coding Agent.md` and user-facing usage rules in `01_Command Center/Lua Usage Guide.md`.

## Default Build Loop

Use the loop in `01_Command Center/Harness Loop.md`:

1. Capture the request.
2. Load the smallest useful context.
3. Make or update the plan.
4. Implement in a small patch.
5. Verify with scripts or tests.
6. Log the decision and next action.

## Local Validation

Run this after structural changes:

```bash
node scripts/check.js
```

Run this before bulk vault cleanup:

```bash
node scripts/vault_audit.js
```

## Provenance

Every meaningful session needs an origin record.

- Append to `01_Command Center/Work Ledger.md`.
- Use `/work-log {short title}` when the work crosses tools or hosts.
- Commit messages should start with a host prefix, for example `[host:windows-codex]`.
- Mac Claude work should use `[host:mac-claude]`.
- Automation work should use `[host:github-action]`.

## Safety

- `01_Command Center/Identity/` is read-only unless the user approves the exact file edit.
- `01_Command Center/_System/` is read-only unless the user asks for permission changes.
- Never commit secrets, API keys, Slack tokens, Notion tokens, or Obsidian Local REST API keys.
- Stage external communications in drafts first.
