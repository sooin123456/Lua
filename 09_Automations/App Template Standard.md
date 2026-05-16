---
type: build-standard
status: active
source: https://github.com/sooin123456/Lua_template
source_commit: 99b69005bc52a821e9da58fdbc12f1546e4435b3
last_updated: 2026-05-16
---

# App Template Standard

새로운 Lua 앱은 기본적으로 `Lua_template`를 변형해서 만든다.

Source:

- https://github.com/sooin123456/Lua_template
- checked commit: `99b69005bc52a821e9da58fdbc12f1546e4435b3`

## Role

`Lua_template`는 아이디어 검증용 정적 HTML이 아니라, 실제 앱으로 발전시킬 때 쓰는 기본 골격이다.

정적 prototype은 빠른 화면 검증에만 쓴다. 사용 흐름이 맞다고 판단되면 다음 단계에서 이 템플릿 기반 앱으로 옮긴다.

## Template Shape

현재 확인한 구조:

| Area | Path | Purpose |
|---|---|---|
| React Router routes | `app/routes.ts` | app route map |
| Root app shell | `app/root.tsx` | theme, i18n, layout, error boundary |
| Feature screens | `app/features/**/screens` | page-level UI |
| Feature APIs | `app/features/**/api` | actions/loaders without UI |
| Core layouts | `app/core/layouts` | public/private/navigation layouts |
| UI components | `app/core/components/ui` | reusable shadcn-style primitives |
| Global styles | `app/app.css` | Tailwind theme tokens and base styles |
| Locales | `app/locales` | ko/en/es translations |
| SQL | `sql` | migrations and functions |
| E2E | `e2e` | Playwright-style user flows |
| Emails | `transactional-emails` | React email templates |

## Current Caveat

The checked repository currently does not expose a root `package.json`, `README.md`, `vite.config`, or `tsconfig` in the cloned tree.

Before using it as a runnable base, Codex should verify whether those files are intentionally omitted, hidden in another branch, or need to be added in the app bootstrap step.

This caveat does not mean auth or database work is missing. The template already contains the core SaaS implementation surface.

## Template Capabilities

Checked from `Lua_template` commit `99b69005bc52a821e9da58fdbc12f1546e4435b3`.

| Area | Existing template answer |
|---|---|
| Auth provider | Supabase SSR client in `app/core/lib/supa-client.server.ts` |
| Admin auth/client | Supabase service role client in `app/core/lib/supa-admin-client.server.ts` |
| Login | Email/password login in `app/features/auth/screens/login.tsx` |
| Signup | Join flow in `app/features/auth/screens/join.tsx` |
| Magic link / OTP | Auth screens under `app/features/auth/screens/magic-link.tsx` and `otp/` |
| Social auth | OAuth flow under `app/features/auth/screens/social/` |
| Route protection | `requireAuthentication` in `app/core/lib/guards.server.ts` |
| DB client | Drizzle + `DATABASE_URL` in `app/core/db/drizzle-client.server.ts` |
| User profile table | `profiles` schema in `app/features/users/schema.ts` |
| Payment table | `payments` schema in `app/features/payments/schema.ts` |
| RLS | SQL migrations enable row-level security and policies |
| Signup automation | SQL function/trigger creates profiles from `auth.users` |
| E2E | Playwright auth/user/settings specs under `e2e/` |
| Emails | React email templates under `transactional-emails/emails/` |

## Build Runner Rule

Build Runner must not treat DB/login as blank work. For SaaS-style apps, it should reuse the template's existing Supabase + Drizzle + RLS + auth screens and add project-specific feature folders, schemas, migrations, and e2e flows on top.

Use:

```bash
npm run template:inspect
```

to inspect the local template capability map before planning a real app build.

## Build Rule

When the user says:

```text
앱 만들어줘
프로토타입을 실제 앱으로 만들어줘
Lua Command UI를 앱으로 만들어줘
```

Codex should:

1. Treat `Lua_template` as the app baseline.
2. Create a project-specific fork/copy rather than hand-writing an unrelated app shell.
3. Keep the template's feature-based structure.
4. Replace or add only the needed feature folder for the app.
5. Use the existing UI primitives where possible.
6. Add e2e coverage for the main user flow when the app becomes interactive.

## Mapping For Lua Command UI

If Lua Command UI graduates from static prototype to app:

| Prototype concept | Template target |
|---|---|
| Static `index.html` | `app/features/lua-command-ui/screens/home.tsx` |
| `app.js` command builder | `app/features/lua-command-ui/lib/command-builder.ts` |
| Domain/intent options | `app/features/lua-command-ui/constants.ts` |
| Draft row copy | local writer API route |
| Visual shell | existing `core/layouts/private.layout.tsx` or a focused public route |
| Tests | `e2e/lua-command-ui/*.spec.ts` |

Current static prototype bridge:

- `npm run lua-ui` starts a local writer server.
- `http://127.0.0.1:8765` can write queued command rows to Obsidian.
- `file://` mode remains copy-only.

## Navigation

- [[02_Projects/Lucia/Lua Command UI|Lua Command UI]]
- [[08_Artifacts/Lua Command UI Prototype/README|Lua Command UI Prototype]]
- [[07_Lua_System/commands/Domain Command Playbook|Domain Command Playbook]]
- [[09_Automations/README|Automations]]
- [[03_Wiki/LLM Wiki Operating Model|LLM Wiki Operating Model]]
- [[03_Wiki/Repository Registry|Repository Registry]]

## Vault Boundary

Obsidian/Lua is the LLM Wiki and command system. It stores product specs, decisions, repo links, run notes, and reusable knowledge.

Actual application source code belongs in a separate `Lua_xxx` repository created from `Lua_template`.

Do not put real app implementation files under `08_Artifacts/` once the app has its own repo.
