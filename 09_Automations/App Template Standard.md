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
| Draft row copy | action/API route after approval |
| Visual shell | existing `core/layouts/private.layout.tsx` or a focused public route |
| Tests | `e2e/lua-command-ui/*.spec.ts` |

## Navigation

- [[02_Projects/Lucia/Lua Command UI|Lua Command UI]]
- [[08_Artifacts/Lua Command UI Prototype/README|Lua Command UI Prototype]]
- [[07_Lua_System/commands/Domain Command Playbook|Domain Command Playbook]]
- [[09_Automations/README|Automations]]
