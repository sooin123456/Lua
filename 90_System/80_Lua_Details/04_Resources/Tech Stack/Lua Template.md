---
type: tech-reference
status: active
last_updated: 2026-05-27
---

# Lua Template

GitHub: https://github.com/sooin123456/Lua_template

`Lua_template` is the reference implementation baseline for app-like Lua projects.

Use it when a task asks Lua to build or expand:

- Toss mini app to app
- Telegram trading bot dashboard
- web app prototype
- authenticated dashboard
- app with database-backed users or payments

## Detected Capabilities

The existing inspector `90_System/scripts/lua_template_inspector.js` treats the template as a source for:

- React Router app structure
- Supabase server/auth clients
- route guards
- Drizzle database layer
- SQL migrations and RLS patterns
- auth e2e tests
- user/settings e2e tests
- transactional email templates

## Runtime Usage

The Python runtime uses this template as a reference in generated tool instructions.

When a `lua_Dev_Agent` task looks app-like, `lua tool instruction` should include:

- the `Lua_template` GitHub URL
- relevant implementation areas to inspect
- a warning not to copy secrets or environment-specific values

Example:

```bash
uv run lua tool instruction PROJ-001 TASK-001
```

## Rule

Do not copy the template blindly. Use it as a known-good structure, then adapt it to the specific product's scope, data model, auth needs, and deployment target.
