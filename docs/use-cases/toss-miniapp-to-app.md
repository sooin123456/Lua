# Toss Mini App To App

## Goal

Plan and build a Toss mini app that can later expand into a standalone app.

## Expected lua_Agent Support

- Define the product concept.
- Scope the MVP.
- Identify Toss mini app constraints.
- Break development into tasks.
- Generate Codex `/goal` prompts.
- Track implementation checkpoints.
- Document an app expansion roadmap.

## Initial Tasks

- Research Toss mini app requirements and constraints.
- Define target user and core use case.
- Draft MVP feature list.
- Create development milestones.
- Generate first Codex `/goal` for setup or prototype implementation.

## TASK-001 Research Findings

Sources:

- Apps in Toss WebView getting started: https://developers-apps-in-toss.toss.im/tutorials/webview.html
- Apps in Toss common configuration: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/Config.html
- Apps in Toss deploy guide: https://developers-apps-in-toss.toss.im/development/deploy.html

Key constraints:

- WebView is a good first path because it lets Lua reuse normal web development patterns while keeping a fast update cycle.
- Existing web projects can add `@apps-in-toss/web-framework`, but policy limits simply loading an external service in an iframe or moving users out to an external URL.
- The frontend bundle must be deployed through Toss infrastructure; backend services can still communicate over HTTPS when needed.
- `granite.config.ts` must align with the Apps in Toss console values: `appName`, display name, brand color, icon URL, host, port, build command, permissions, and output directory.
- `appName` is the stable app identifier and is used in deep links such as `intoss://{appName}`.
- Local device testing needs the dev server exposed with an accessible host and the Sandbox app configured against that host.
- Production review requires at least one Toss app test, a submitted `.ait` bundle, and review approval before release.
- Uploaded app bundles must stay under the 100MB uncompressed bundle policy, so large assets should move to CDN or lazy loading.
- Production verification must include CORS origin allowlists for the live and private QR test domains, permissions, login/session persistence, and any payment or authentication features.

Product implication:

- The first MVP should avoid regulated or payment-heavy flows and start with a lightweight utility that can prove WebView setup, console configuration, navigation, analytics/error monitoring, and a later standalone app migration path.

Next action:

- Draft the target user, one core use case, and MVP acceptance criteria before creating the implementation project from `Lua_template`.
