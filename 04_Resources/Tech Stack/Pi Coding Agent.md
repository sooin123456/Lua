---
type: resource-note
status: draft
last_updated: 2026-05-15
---

# Pi Coding Agent

Pi는 최소형 터미널 코딩 harness다. Lua에서는 Codex와 Claude를 대체하지 않고, 타입별로 작게 실험하는 보조 실행기로 둔다.

## Why It Matters

pi.dev의 핵심 방향은 작은 본체 위에 extensions, skills, prompt templates, packages를 얹는 구조다. Lua가 이미 `AGENTS.md`, skills, commands, Work Ledger를 갖고 있으므로 잘 맞는다.

## Lua Position

| 도구 | 역할 |
|---|---|
| Codex on Windows | 구현, 파일 수정, 테스트, Git 커밋 |
| Claude on Mac | 기획, 글쓰기, 긴 맥락 정리 |
| Pi | 타입별 프리셋, 터미널 실험, 컨텍스트 관리, eval |
| Obsidian | 기록, 지식 그래프, 작업 지시서 |
| Notion | 팀 공유용 정리본 |
| Slack | 팀에게 전달하는 알림과 브리프 |

## Features To Borrow

| Pi feature | Lua 적용 방식 |
|---|---|
| `AGENTS.md` 기반 프로젝트 지시 | 이미 `AGENTS.md`와 `CLAUDE.md`로 운영 |
| Skills | `07_Lua_System/verticals`와 agents skills로 유지 |
| Prompt templates | core commands를 Pi preset 후보로 사용 |
| Packages | 나중에 `.pi/` 패키지로 묶어 공유 |
| MCP | Notion, Slack, Obsidian 연결 시 도구별 권한 분리 |
| JSON/RPC mode | 자동화나 eval 실행에 사용 |
| Telemetry | 프롬프트/모델 비교 기록에 사용 |
| Context management | 긴 작업을 milestone/summary 단위로 관리 |

## Type Presets

| Preset | 설명 | 기본 결과물 |
|---|---|---|
| `lua-vault-care` | vault 점검과 링크 정리 | audit report, Work Ledger |
| `lua-project-sprint` | 작은 기능 구현 | DevLog, 테스트 결과 |
| `lua-research-brief` | 자료 조사와 비교 | Research note |
| `lua-team-brief` | 팀 공유 초안 | Notion/Slack draft |
| `lua-artifact-keeper` | 재사용 자산 등록 | Artifact Ledger |
| `lua-eval` | prompt/model 비교 | eval log |

## Adoption Rule

지금은 Pi를 바로 운영 핵심에 넣지 않는다. 먼저 Lua의 사용법을 안정화하고, 다음 단계에서 `.pi/` 폴더를 만들어 preset과 skill을 이식한다.

## Security Notes

- Pi packages는 코드를 실행하거나 agent behavior에 영향을 줄 수 있으므로 설치 전 소스를 검토한다.
- API key는 repo에 저장하지 않는다.
- headless/CI 실행은 별도 agent dir과 환경 변수를 쓴다.

## Sources

- https://pi.dev/docs/latest
- https://pi.dev/packages/pi-context
- https://pi.dev/packages/my-pi

## Navigation

- [[04_Resources/Tech Stack/Agent Tools|Agent Tools]]
- [[04_Resources/Tech Stack/Current Stack|Current Stack]]
- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
- [[07_Lua_System/verticals/_core/README|Core Commands]]
