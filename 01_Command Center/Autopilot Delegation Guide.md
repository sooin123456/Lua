---
type: operating-guide
status: active
last_updated: 2026-05-16
---

# Autopilot Delegation Guide

사용자가 아이디어나 방향만 주면 Codex가 나머지 실무를 이어서 처리하는 방식이다.

## User Role

사용자는 아래만 하면 된다.

1. 아이디어를 던진다.
2. Decision Board에 올라온 결정만 고른다.
3. 완성물을 보고 마음에 안 드는 부분을 말한다.

## Codex Role

Codex는 다음을 자동으로 진행한다.

- 아이디어 정리
- 경쟁/시장 조사
- 제품 방향 정리
- UX/UI 설계
- prototype 구현
- 테스트 작성
- 시각 QA
- Work Ledger 기록
- commit/push
- 제출 초안 작성

## Agent Delegation Pattern

필요하면 Codex가 내부 에이전트를 나눠서 병렬 처리한다.

| Agent role | Does |
|---|---|
| Product/UX | 사용자 흐름, 화면 구조, 카피, 리텐션 루프 |
| Engineering | 구현 위치, 테스트, 기술 리스크 |
| Visual QA | 모바일/데스크톱 화면 품질, 잘림/겹침 |
| Release | 제출 문구, 체크리스트, 남은 결정 정리 |

## Stop Conditions

Codex가 멈추고 사용자에게 묻는 경우:

- 외부 제출/공개가 필요한 경우
- API key, 결제, 계정 연결이 필요한 경우
- 브랜드명, 대표 스크린샷, 데모 데이터처럼 취향 결정이 필요한 경우
- 되돌리기 어려운 구조 변경이 필요한 경우

## Current Flow

```text
Ideas
-> project candidate
-> Codex autopilot work
-> Decision Board only when needed
-> prototype / app
-> submission draft
```

## Navigation

- [[06_Personal Studio/Ideas/Home|Ideas]]
- [[01_Command Center/Decision Board|Decision Board]]
- [[01_Command Center/User Action Board|User Action Board]]
- [[01_Command Center/Work Ledger|Work Ledger]]
