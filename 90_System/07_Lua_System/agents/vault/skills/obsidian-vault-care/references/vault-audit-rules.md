---
type: reference
parent_skill: obsidian-vault-care
load: on-demand
---

## Frontmatter required fields per folder

| 폴더 | 필수 필드 |
|---|---|
| Identity/ | type, weight, load, last_updated |
| SOPs/ | type, applies_to, trigger |
| Skills/ | name, description, vertical |
| Drafts/ | status, type, target_audience, word_count |
| Inbox/ | (선택) |

## Tag normalization rules

- 모두 lowercase로 통일한다.
- 한국어 태그: `#기후`, `#에너지`, `#특허` 등 고정 맞춤법을 쓴다.
- 영어 태그: `#climate-tech`, `#mvp`, `#proposal` 형태(kebab-case).

## Orphan detection rules

- Orphan 정의: 다른 어떤 노트에서도 wiki-link로 가리키지 않는다.
- 예외: `Identity/`, `_System/`, `README.md`, 이름에 `Hub`가 들어가는 허브 노트.

## Stale Inbox rules

- 14일 이상: review 후보로 표시
- 30일 이상: 삭제 또는 archive 후보(사람 컨펌 필수)
