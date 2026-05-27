# Toss Mini App To App

Project ID: `PROJ-001`

## Goal

Plan and build a Toss mini app that can later expand into a standalone app.

## Description

Initial validation project for product planning, MVP scoping, and app expansion.

## Tasks

- [done] TASK-001: Research Toss mini app requirements
  - Owner: lua_Research_Agent
  - Goal: Identify Toss mini app requirements, constraints, and launch assumptions.
  - Next action: Start TASK-002: Define Toss target user, core use case, and MVP acceptance criteria.
  - Checkpoints:
    - Toss mini app requirements researched.
      - Done: Reviewed official Apps in Toss WebView, common config, and deploy docs. Key constraints: use Apps in Toss WebView SDK for web-based MVP; do not rely on iframe/external URL as the app shell; frontend bundle must deploy through Toss infrastructure; granite.config.ts must match console appName/displayName/icon/permissions; intoss deep links use appName; device testing needs Sandbox app and accessible dev host; release requires Toss app test, .ait bundle upload, review approval, bundle size under 100MB uncompressed, and production checks for CORS, permissions, session, auth/payment behavior, monitoring. Sources captured in docs/use-cases/toss-miniapp-to-app.md.
      - Next: Start TASK-002: Define Toss target user, core use case, and MVP acceptance criteria.

- [planned] TASK-002: Define Toss mini app MVP scope
  - Owner: lua_Product_Agent
  - Goal: Turn research into a narrow MVP with user scenario, core flow, and refusal list.
  - Next action: Draft MVP user scenario and acceptance criteria.

- [planned] TASK-003: Generate Toss implementation plan
  - Owner: lua_Dev_Agent
  - Goal: Create an implementation plan that can be executed with Codex and Lua_template.
  - Next action: Map MVP screens and data needs to Lua_template structure.

- [planned] TASK-004: Build Toss prototype skeleton
  - Owner: lua_Dev_Agent
  - Goal: Create the first runnable prototype skeleton using Lua_template as a reference.
  - Next action: Generate Codex goal for prototype skeleton.

- [planned] TASK-005: Plan Toss app expansion roadmap
  - Owner: lua_Product_Agent
  - Goal: Define how the mini app can expand into a standalone app after MVP validation.
  - Next action: Draft expansion milestones and launch checklist.
