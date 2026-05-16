---
type: repo-registry
status: active
last_updated: 2026-05-16
---

# Repository Registry

This page maps Lua knowledge/projects to their actual code repositories.

## Rule

`Lua` is the command system and knowledge vault repo. Real apps live in separate `Lua_xxx` repositories created from `Lua_template`.

## System Repositories

| Repo | Role | URL | Local Path | Status |
|---|---|---|---|---|
| Lua | Obsidian vault, command system, LLM Wiki, project memory | https://github.com/sooin123456/Lua | `C:\Users\sooin\OneDrive\문서\Obsidian Vault` | active |
| Lua_template | App baseline template | https://github.com/sooin123456/Lua_template | pending local canonical clone | baseline |

## App Repositories

| App | Repo | URL | Local Path | Status | Project |
|---|---|---|---|---|---|
| 돈 먹는 먼지 | Lua_money_dust | https://github.com/sooin123456/Lua_money_dust | `C:\Users\sooin\OneDrive\문서\Lua_money_dust` | runnable local, remote pending | [[02_Projects/TOSS/Money Eating Dust|돈 먹는 먼지]] |

## New App Repo Naming

Use:

```text
Lua_<short_app_name>
```

Examples:

- `Lua_money_dust`
- `Lua_easy_ai_helper`
- `Lua_command_ui`

## New App Repo Checklist

- [ ] Create repo from `Lua_template`.
- [ ] Set remote to the project repo, not `Lua_template`.
- [ ] Add README with project purpose and vault link.
- [ ] Add project entry in this registry.
- [ ] Add project spec under `02_Projects/`.
- [ ] Add Work Ledger entry.
- [ ] Push only after remote exists.
