---
name: obsidian-vault-care
description: Maintain hygiene of the Obsidian vault — fix broken backlinks, detect orphan notes, normalize tags, archive stale Inbox items, verify frontmatter consistency. Triggers on "vault 정리", "obsidian 정리", "vault care", direct invocation by Vault agent, or weekly scheduled run.
vertical: _core
applies_to: [vault, atlas]
allowed-tools: [Read, Write, Bash]
---

# obsidian-vault-care

## When this skill activates

- 사람이 명시: “vault 정리해줘”, “obsidian 정리”
- 주간 루틴: 일요일 21:00 `weekly-review`의 일부
- 한 세션에 노트 20개 이상 추가된 뒤 정리가 필요할 때

## Step 1: Scan, don't write yet

먼저 인벤토리만 만든다. `scripts/vault_audit.js`를 실행하고 결과를 `Logs/{YYYY-MM-DD}-vault-scan.md`에 붙여넣어 기록한다.

## Step 2: Categorize findings

**Auto-fix** (사람 컨펌 불필요):

- 누락된 frontmatter 추가(저위험 필드)
- 일관된 형식의 링크 보정

**Propose** (사람 컨펌 권장):

- orphan에 대한 백링크 제안
- 태그 대소문자·표기 통합 제안(`AI` vs `ai`)

**Ask** (사람 컨펌 필수):

- Inbox 14일 이상 항목 이동·삭제
- 대량 rename/move

## Step 3: Apply changes via Obsidian REST API

- `PATCH /vault/{filepath}` — frontmatter 또는 heading 위치 삽입
- `POST /vault/{filepath}` — 콘텐츠 append
- `DELETE /vault/{filepath}` — **반드시 사람 컨펌 후**

## Step 4: Log everything

`Logs/{YYYY-MM}/{YYYY-MM-DD}-vault-changes.md`에 변경을 남긴다. 각 변경마다 file / change type / reason / before-after diff를 적는다.

## Forbidden zones

- `_meta/` — 절대 금지
- `_System/` — 절대 금지
- `Identity/` — 읽기 OK, 쓰기는 파일마다 사람 컨펌
- `06_Personal Studio/_Drafts/` — 읽기 OK, **삭제 금지**

## Never do

- 다른 노트가 참조 중인 파일을 링크 수정 없이 rename
- 의미 있는 메타데이터(`weight: critical` 등) 임의 변경
- 한 번에 20개 이상의 파괴적 작업

## References

- `references/vault-audit-rules.md`
