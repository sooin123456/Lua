---
type: workflow
status: active
last_updated: 2026-05-16
---

# Source to Wiki Workflow

This workflow turns raw material into reusable Lua knowledge.

## 1. Capture

Put raw material in the lightest possible place:

- `00_Inbox/` for quick thoughts, links, and rough notes.
- project notes for project-specific decisions.
- `04_Resources/` for stable external references.
- drafts for external-facing writing.

Raw captures should preserve origin and date. They do not need to be polished.

## 2. Compile

AI turns useful raw material into stable notes:

- one concept per note,
- clear title,
- short definition,
- links to related concepts/projects,
- source references,
- open questions or decisions if needed.

Compiled pages live in `03_Wiki/` unless they are domain-specific resources.

## 3. Link

Every compiled note should link to at least one of:

- a project,
- a decision,
- a command run,
- a source,
- another concept.

This is how the graph becomes useful instead of decorative.

## 4. Use

Before building, researching, or planning, Codex should check whether a relevant Wiki note already exists.

If the answer requires new knowledge, Codex should add or update the Wiki after the task.

## 5. Clean

Run audits after meaningful structure changes:

```bash
node scripts/check.js
node scripts/flow_audit.js
node scripts/vault_audit.js
```

Fix broken links immediately. Leave orphan exceptions only when they are intentional system/template notes.
