---
type: meta
load: never
visibility: system-only
last_updated: 2026-05-13
---

# Agent permissions matrix

## 매트릭스

| 폴더 | Atlas | Scribe | Forge | Lens | Vault | Archivist |
|---|---|---|---|---|---|---|
| `01_Command Center/Identity/` | R | R | R | R | R | R |
| `01_Command Center/_System/` | — | — | — | — | — | — |
| `02_Projects/` | R | R | R+W (code) | R+W (research) | R+W | — |
| `03_Operation/_SOPs/` | R | R | R (coding) | R (research) | R | R+W (ops) |
| `03_Operation/Proposals/` | R | R | — | — | R | — |
| `03_Operation/Patents/` | R | R | — | — | R | — |
| `03_Operation/Industry Intelligence/` | R | — | — | R+W | R+W | R |
| `06_Personal Studio/_Drafts/` | R | R+W | — | — | R+W | — |
| `07_Lua_System/verticals/*/skills/` | R | R | R | R | R+W | R |
| `00_Inbox/` | R | R | — | R+W | R+W | R |

## 노출 강제 방법

- SKILL.md의 `applies_to` frontmatter로 1차 매칭한다.
- 에이전트 system prompt 상단에 권한을 명시해 모델이 따르도록 유도한다.
- Claude Agent SDK 사용 시 `allowed_tools`와 `permission_mode: "dontAsk"`로 강제한다.
- MCP 서버의 `noteFilter` 옵션으로 vault 전체 노출을 막는다.

## 금지 영역

- `_meta/` (legacy, Phase 1 bootstrap 잔재) — 어떤 agent도 접근하지 않는다.
- `_System/` — 어떤 agent도 접근하지 않는다.
- `Identity/{any}.md` — 읽기는 가능하고, 쓰기는 항상 사람 확인이 파일마다 필요하다.
