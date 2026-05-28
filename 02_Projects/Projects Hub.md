---
ai-index: true
type: hub
area: Projects
status: active
last_updated: 2026-05-27
---

# Projects Hub

Project index. Use [[01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]] for daily operation and [[01_Command Center/00_Dashboard/Lua System Map|Lua System Map]] for system navigation.

## Active Lua Runtime Projects

These are the first projects managed by the `lua_agent` runtime.

| Project | Runtime ID | Current focus |
|---|---|---|
| [[02_Projects/Lua/Toss Mini App To App|Toss Mini App -> App]] | `PROJ-001` | Toss mini app requirements and MVP scope |
| [[02_Projects/Lua/Telegram Trading Bot To App|Telegram Trading Bot -> App]] | `PROJ-002` | trading bot boundaries, approval policy, bot skeleton |
| [[02_Projects/Lua/Floating Solar Monitoring System|Floating Solar Monitoring]] | `PROJ-003` | use cases, vendors, selection criteria, system architecture |

## Company Projects

| Group | Project |
|---|---|
| CxEMS | [[02_Projects/CxEMS/CxEMS SaaS/Home|CxEMS SaaS]] |
| CxEMS | [[02_Projects/CxEMS/Smart Meter/Home|CxEMS Smart Meter]] |
| KGCT | [[02_Projects/KGCT/Green Building/Home|Green Building]] |
| KGCT | [[02_Projects/KGCT/THEKIE Homepage/Home|THEKIE Homepage]] |
| KIEREMS | [[02_Projects/KIEREMS/RTU Development/Home|RTU Development]] |
| KIEREMS | [[02_Projects/KIEREMS/VPP Development/Home|VPP Development]] |
| Lucia | [[02_Projects/Lucia/AI Carbon Data Management/Home|AI Carbon Data Management]] |
| Lucia | [[02_Projects/Lucia/Blockchain/Home|Blockchain]] |
| Lucia | [[02_Projects/Lucia/ESG Data Crawling/Home|ESG Data Crawling]] |
| TOSS | [[02_Projects/TOSS/Home|TOSS]] |

## Product Experiments

- [[02_Projects/Lucia/Easy AI Helper Miniapp|Easy AI Helper Miniapp]]
- [[02_Projects/Lucia/Lua Command UI|Lua Command UI]]
- [[02_Projects/Lucia/Money Eating Dust Miniapp|Money Eating Dust Miniapp]]

## Personal Studio Projects

- [[06_Personal Studio/Ideas/Home|Ideas]]
- [[06_Personal Studio/AI Studio/Home|AI Studio]]
- [[06_Personal Studio/CS50/Home|CS50]]
- [[06_Personal Studio/Hacking/Home|Hacking]]
- [[06_Personal Studio/Multi-Agent Trading/Home|Multi-Agent Trading]]

## When You Need Detail

Each standard project folder uses:

- `Home.md`
- `Backlog.md`
- `Research.md`
- `DevLog.md`
- `Metrics.md`

Lua runtime project notes are generated from `.lua_agent/lua.db` and exported with:

```bash
uv run lua --db .lua_agent/lua.db obsidian export PROJ-001 --vault .
```
