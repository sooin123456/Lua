---
type: command-run
command_id: money-dust-20260516-01
domain: build
intent: app
stage: build
owner: Forge
status: routed
created: 2026-05-16
---

# money-dust-20260516-01 - build app

## Command

```text
/lua build app :: 돈 먹는 먼지 Toss 미니앱 MVP를 만든다.
```

## Context

- User chose `돈 먹는 먼지` after comparing Toss miniapp challenge fit and subscription-management competition.
- Challenge: Apps in Toss Vibecoding Challenge.
- Strategy: avoid a generic subscription tracker; make a cute behavior-change miniapp for fixed-cost reduction.
- Repository correction: `Lua` is only for command system, planning, and operating records. Real app work lives in `Lua_money_dust`.

## Decisions

| Question | Decision |
|---|---|
| App name | `돈 먹는 먼지` |
| Repo boundary | `Lua` = system/docs, `Lua_money_dust` = app |
| Base template | `Lua_template` commit `99b69005bc52a821e9da58fdbc12f1546e4435b3` |
| UI shape | Real app is a single mobile miniapp screen, not a 3-card preview inside the app |
| Financial data | Mock preview until Toss/API permissions are confirmed |

## App Repo

```text
C:\Users\sooin\OneDrive\문서\Lua_money_dust
```

Planned remote:

```text
https://github.com/sooin123456/Lua_money_dust
```

## Plan

- [x] Create durable product spec: [[02_Projects/TOSS/Money Eating Dust|돈 먹는 먼지]]
- [x] Register command run.
- [x] Create separate TOSS project: [[02_Projects/TOSS/Home|TOSS]].
- [x] Clone `Lua_template` into local `Lua_money_dust`.
- [x] Move actual app implementation out of `Lua`.
- [x] Rebuild UI as a real single-screen miniapp flow.
- [x] Update `Lua` docs so they reference the app repo instead of storing app artifacts.
- [ ] User creates GitHub repo `sooin123456/Lua_money_dust`.
- [ ] Push local app repo to GitHub.
- [ ] Generate fresh submission screenshot from `Lua_money_dust`.

## Navigation

- [[02_Projects/TOSS/Money Eating Dust|돈 먹는 먼지]]
- [[02_Projects/TOSS/Submission Package|Submission Package]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[09_Automations/App Template Standard|App Template Standard]]
