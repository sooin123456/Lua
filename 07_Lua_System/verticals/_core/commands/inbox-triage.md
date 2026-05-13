---
name: inbox-triage
description: Triage Inbox items 7+ days old. Categorize, propose destinations, flag for deletion. Run on demand or as part of /weekly-review.
vertical: _core
trigger: "/inbox-triage"
applies_to: [vault, archivist]
---

# /inbox-triage

## 입력

- 옵션: `--days N` (기본 7일+)

## 단계

### 1. 검출

- `00_Inbox/*.md` 중 mtime이 N일 이상 된 항목
- Lens 결과물 (`type: research`) 분류
- 기타

### 2. 분류 제안

각 항목에 대해 1개 추천:

- → `02_Projects/{project}/` — 특정 프로젝트 관련
- → `04_Resources/` — 일반 참고
- → `03_Operation/Industry Intelligence/` — 산업 동향
- → `05_Archives/` — 더 이상 필요 없음
- → 삭제 후보 (반드시 사람 컨펌)

### 3. 사람 컨펌

체크박스 리스트로 출력. 사람이 승인한 것만 실제 이동.

### 4. 적용

- 승인된 이동/삭제 수행
- 모든 변경 `Logs/`에 기록

## Never do

- 사람 컨펌 없이 삭제
- 사람 컨펌 없이 7개 이상 항목 이동
