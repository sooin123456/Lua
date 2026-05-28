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
| `00_Lua/01_Command Center/02_Memory/Identity/` | R | R | R | R | R | R |
| `00_Lua/01_Command Center/04_Policies/_System/` | — | — | — | — | — | — |
| `00_Lua/02_Projects/` | R | R | R+W (code) | R+W (research) | R+W | — |
| `00_Lua/03_Operation/_SOPs/` | R | R | R (coding) | R (research) | R | R+W (ops) |
| `00_Lua/03_Operation/Proposals/` | R | R | — | — | R | — |
| `00_Lua/03_Operation/Patents/` | R | R | — | — | R | — |
| `00_Lua/03_Operation/Industry Intelligence/` | R | — | — | R+W | R+W | R |
| `00_Lua/05_Personal Studio/_Drafts/` | R | R+W | — | — | R+W | — |
| `90_System/07_Lua_System/verticals/*/skills/` | R | R | R | R | R+W | R |
| `00_Lua/00_Inbox/` | R | R | — | R+W | R+W | R |

## 노출 강제 방법

- SKILL.md의 `applies_to` frontmatter로 1차 매칭한다.
- 에이전트 system prompt 상단에 권한을 명시해 모델이 따르도록 유도한다.
- Claude Agent SDK 사용 시 `allowed_tools`와 `permission_mode: "dontAsk"`로 강제한다.
- MCP 서버의 `noteFilter` 옵션으로 vault 전체 노출을 막는다.

## 금지 영역

- `_meta/` (legacy, Phase 1 bootstrap 잔재) — 어떤 agent도 접근하지 않는다.
- `_System/` — 어떤 agent도 접근하지 않는다.
- `Identity/{any}.md` — 읽기는 가능하고, 쓰기는 항상 사람 확인이 파일마다 필요하다.

## Runtime approval levels

Lua runtime 작업은 `90_System/07_Lua_System/runtime/Approval Policy Profiles.md` 기준으로 분류한다.

| Level | 의미 | 예시 |
|---|---|---|
| `auto` | 로컬/비공개 경계 안에서 진행 가능 | 조사, 초안, 요약, 비교표, 테스트, Obsidian 개인 기록 |
| `ask_first` | 실행 전 사용자에게 먼저 확인 | 외부 연락, Slack/Telegram 전송, 배포, git push/PR, 유료 API, Canva/Notion 공유 |
| `explicit_approval` | 정확한 액션에 대한 명시 승인 전까지 금지 | 실거래, 자동매매, 결제/구독 변경, 계정 설정 변경, 비밀키 노출, 공개 게시, 대량 삭제 |

기본 원칙: Lua는 멈추지 않고 계속 진행하되, 위험 액션은 다음 안전한 준비 작업까지만 수행하고 승인 요청으로 전환한다.
