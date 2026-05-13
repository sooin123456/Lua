---
name: weekly-review
description: Sunday cycle automation — Vault audit, Inbox triage, Notion sync, Context refresh. Run every Sunday evening or on demand.
vertical: _core
trigger: "/weekly-review"
applies_to: [vault, archivist, atlas]
schedule: "Sunday 21:00 KST"
---

# /weekly-review

매주 일요일 저녁 운영 사이클. 30분 안에 사람이 다음 주 결정 가능한 상태로 만드는 게 목표.

## 실행 순서

### 1. Vault 정리 (Vault agent + obsidian-vault-care)

- `scripts/vault_audit.js` 실행
- Inbox 7일+ 항목 리뷰
- Orphan 노트 검출
- 깨진 백링크 보수

### 2. Notion 정리 (Archivist)

- 이번 주 종료된 프로젝트 → archive
- "in progress" 인데 7일째 무변동 → flag
- 회의록 요약 페이지 묶기

### 3. 사람이 갱신 (5분)

- `Identity/context.md`의 "이번 주 우선순위" 갱신
- "보류 중 결정" 검토
- 다음 주 한정 피해야 할 것

### 4. 비용·시간 감사 (Atlas)

- `git log --since="7 days ago" --grep="\[agent:"` — 에이전트별 활동
- Manus / Notion credits 사용량
- 예산 한도 대비 비율

## 출력

`01_Command Center/Weekly Review/{YYYY}-W{NN}.md` (또는 기존 Weekly Review 페이지에 append):

- 정리된 항목 요약
- 사람이 결정해야 할 것 (체크박스)
- 비용·사용량 요약
- 다음 주 추천 우선순위
