---
type: artifact
status: draft
last_updated: 2026-05-16
---

# Lua Command UI Prototype

Static first-screen prototype for [[02_Projects/Lucia/Lua Command UI|Lua Command UI]].

Open `index.html` directly to try the command composer in copy-only mode.

Run the local writer server to write directly into Obsidian Command Queue.

```bash
npm run lua-ui
```

Then open:

```text
http://127.0.0.1:8765
```

## Scope

- domain selection
- intent selection
- payload input
- `/lua ... :: ...` command preview
- Obsidian Command Queue row preview
- copy draft command and row to clipboard in `file://` mode
- write queued command rows in `localhost` mode

## Navigation

- [[02_Projects/Lucia/Lua Command UI|Lua Command UI]]
- [[08_Artifacts/Artifact Ledger|Artifact Ledger]]
