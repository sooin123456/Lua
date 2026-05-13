---
type: system-root
load: always
priority: critical
last_updated: 2026-05-13
---

# Lua

Solo agent company for climate-energy R&D (company 1) and personal ventures (company 2).

## Who I am

Always read these four before any task:

- [[01_Command Center/Identity/about-me]] — 기본 사실
- [[01_Command Center/Identity/voice]] — 글 톤
- [[01_Command Center/Identity/decision-principles]] — 트레이드오프 결정
- [[01_Command Center/Identity/context]] — 단기 컨텍스트

## Verticals

- **`_core`** — 모든 agent가 공유하는 generic skills (voice-mimicry, research-synthesis, vault-care).
- **`climate-energy`** — Company 1. 에너지 모니터링, 기후, 탄소 사업. 정부 R&D 과제, 특허, 산업 동향.
- **`personal-venture`** — Company 2. 신규 개인 사업 아이디어 검증과 MVP.

## Routing rule

정부 과제, 특허, 탄소, 에너지, 기후 관련 키워드가 중심이면 `climate-energy`로 라우팅한다. 신규 아이디어, 검증, MVP, 개인 사업 실험 키워드면 `personal-venture`로 라우팅한다. 둘 다 해당 없으면 공용 스킬과 커넥터가 있는 `_core`를 사용한다.

## Agent loop

[[01_Command Center/Harness Loop]]

Every agent invocation follows the Harness Loop: invoke → check → refine → log.

## Safety boundaries

- 모든 초안은 `06_Personal Studio/_Drafts/`에만 두고, 직접 발행하거나 전송하지 않는다.
- `01_Command Center/Identity/` 아래 파일을 바꾸는 작업은 파일마다 사람의 명시적 확인이 있어야 한다.
- 예산 상한과 지출 원칙은 `decision-principles.md`에 따른다.
- `_meta/`와 `_System/`은 모든 agent에게 off-limits이다.

## Vault permissions

[[01_Command Center/_System/agent-permissions]]

Phase 2에서 `agent-permissions`를 구체화한다. 지금은 링크만 유지한다.

## When to ask vs when to act

기본값은 모호하면 load-bearing한 질문을 하나만 한다. SOP가 경우를 명시적으로 덮으면 확인 없이 실행한다. 외부 공개, 돈, 사람에게 가는 답장, Identity 변경은 항상 먼저 묻는다.
