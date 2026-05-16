---
type: command-run
command_id: money-dust-20260516-01
domain: build
intent: app
stage: plan
owner: Forge
status: routed
created: 2026-05-16
---

# money-dust-20260516-01 - build app

## Command

```text
/lua build app :: 돈먹는 먼지 Toss 미니앱 MVP를 만든다. 사용자가 매달 나가는 구독료와 고정비를 직접 입력하면, 각 지출이 귀여운 먼지 캐릭터로 생긴다. 첫 MVP는 먼지 만들기, 이번 달 먹힌 돈 보기, 먼지 재우기 3가지 기능으로 제한한다. 계좌/카드 연동 없이 수동 입력으로 시작하고, Toss 앱인토스 바이브코딩 챌린지 주제인 "귀여운게 최고야"에 맞게 귀여운 캐릭터 중심 UI로 만든다.
```

## Context

- User chose `돈먹는 먼지` after comparing Toss miniapp challenge fit and subscription-management competition.
- Challenge: Apps in Toss Vibecoding Challenge.
- Theme: `귀여운게 최고야`.
- Strategy: avoid a generic subscription tracker; make a cute behavior-change miniapp for fixed-cost reduction.

## Clarify

| Question | Decision |
|---|---|
| Is this a financial utility or a cute mini game? | Cute finance miniapp. The financial calculation is accurate, but the interaction feels like finding and calming small characters. |
| Should it connect to real financial data first? | No. First MVP uses manual input to avoid API, privacy, and review risk. |
| What is the minimum lovable loop? | Create dust -> see monthly money eaten -> put one dust to sleep. |

## Design

The first version should feel like a small room inside the user's wallet. Each recurring expense becomes a dust character. Larger monthly amounts create larger dust. The app should make the user smile first, then notice the money.

Primary screens:

1. Home: ask the user to find money-eating dust.
2. Create: enter a recurring expense and generate a dust.
3. Dust Room: show all dust and total monthly amount.
4. Sleep Dust: choose one expense to pause/cut and show expected savings.
5. Result: celebrate saved money with a cute shareable state.

## Plan

- [x] Create durable product spec: [[02_Projects/Lucia/Money Eating Dust Miniapp|돈먹는 먼지 Miniapp]]
- [x] Register command run.
- [x] Design the first screen and dust room visual system.
- [x] Build Toss-style MVP prototype: [[08_Artifacts/Money Eating Dust Prototype/README|Money Eating Dust Prototype]]
- [x] Verify with local UI test and basic calculation cases.
- [ ] Prepare challenge submission copy.

## Agent Orchestration

Codex acted as lead orchestrator and split the work across three agents:

| Agent role | Output |
|---|---|
| Product/UX | First screen, dust room, empty state, creation flow, sleep loop |
| Engineering scout | Recommended static prototype first, then `Lua_template` migration |
| Challenge/release | Submission pitch, judging strengths, launch-readiness checks |

The merged implementation is the static prototype under `08_Artifacts/Money Eating Dust Prototype/`.

## Prototype Output

- [[08_Artifacts/Money Eating Dust Prototype/README|Prototype README]]
- Prototype HTML: `08_Artifacts/Money Eating Dust Prototype/index.html`
- Test: `tests/money_dust_prototype.test.js`

## Build Notes

Use `Lua_template` as the eventual app baseline. The first implementation can be a small prototype if needed, but the product boundary should map cleanly into `app/features/money-dust/*`.

## Navigation

- [[02_Projects/Lucia/Money Eating Dust Miniapp|돈먹는 먼지 Miniapp]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[09_Automations/App Template Standard|App Template Standard]]
