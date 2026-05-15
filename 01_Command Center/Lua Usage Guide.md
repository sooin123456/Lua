---
type: operating-guide
status: active
last_updated: 2026-05-15
---

# Lua Usage Guide

이 문서는 Obsidian에서 어디에 글을 쓰고, 어디에 명령을 적고, Codex/Claude/Pi를 언제 쓰는지 정하는 사용자 설명서다.

## One Rule

Obsidian은 기록하는 곳이고, AI 앱은 실행하는 곳이다.

- 생각, 회의, 아이디어, 프로젝트 상태는 Obsidian에 쓴다.
- 파일 수정, 앱 제작, 테스트, 정리는 Codex에서 실행한다.
- 긴 글, 관계 정리, Notion/Slack 초안은 Claude에서 다듬는다.
- 가벼운 터미널형 실험, 타입별 프리셋, 컨텍스트 실험은 Pi로 분리한다.

무엇을 Obsidian에 써야 하는지 애매하면 [[01_Command Center/Obsidian Writing Rules|Obsidian Writing Rules]]를 먼저 본다.
명령을 컴퓨터 앞에서 내리는지, 밖에서 Slack으로 내리는지 애매하면 [[01_Command Center/Command Modes|Command Modes]]를 먼저 본다.

## Where To Write

| 상황 | 쓰는 곳 | 이유 |
|---|---|---|
| 갑자기 떠오른 아이디어 | [[00_Inbox/AI 분류 대기중...|AI 분류 대기중]] 또는 새 Inbox 노트 | 아직 프로젝트가 아니므로 임시 보관 |
| 오늘 한 일 | [[06_Personal Studio/Daily Notes|Daily Notes]] | 개인 작업 흐름 기록 |
| 회사/프로젝트 진행 | 각 프로젝트의 `DevLog.md` | 나중에 팀 공유와 회고에 사용 |
| 해야 할 일 | 각 프로젝트의 `Backlog.md` 또는 [[01_Command Center/Urgent List|Urgent List]] | 실행 항목만 모으기 |
| 자료 조사 | 각 프로젝트의 `Research.md` | 출처와 판단 근거 보관 |
| 팀에게 보낼 글 | [[03_Operation/Operation Hub|Operation Hub]] 아래 관련 문서 | Slack/Notion 전 검토 공간 |
| Notion/Slack 공유 초안 | [[03_Operation/Team Brief Drafts|Team Brief Drafts]] | 승인 전 초안 보관 |
| 재사용 가능한 결과물 | [[08_Artifacts/Artifact Ledger|Artifact Ledger]] | 앱, 프롬프트, 템플릿, 자동화 자산화 |
| 시스템 규칙 변경 | [[01_Command Center/Work Ledger|Work Ledger]] | 어디서 누가 바꿨는지 추적 |

## Where To Command

| 하고 싶은 일 | 명령 위치 | 예시 |
|---|---|---|
| Codex에게 실제 수정 요청 | Codex 채팅창 | `지원사업 검토를 Policy Tracker에 연결해줘` |
| Claude에게 긴 글/기획 요청 | Claude 채팅창 | `이 사업계획서 목차를 Notion용으로 정리해줘` |
| Obsidian 안에 다음 실행 예약 | [[01_Command Center/Agent Dashboard|Agent Dashboard]]의 Quick Commands | `/project-sprint time-management-app first-demo` |
| 프로젝트별 실행 큐 작성 | 프로젝트 `Backlog.md` | `/team-brief green-building` |
| 커밋/출처 기록 | [[01_Command Center/Work Ledger|Work Ledger]] | `/work-log windows-codex cleanup` |
| 가벼운 Pi 실험 | 터미널에서 프로젝트 폴더를 열고 Pi 실행 | `pi` 또는 `pnpx my-pi@latest` |

Obsidian에 적는 `/command`는 자동 실행 버튼이 아니라 "AI에게 넘길 작업 지시서"다. 실제 실행은 Codex, Claude, Pi 중 하나에서 한다.

## Offline vs Online

| 타입 | 뜻 | 예시 | 실행 기준 |
|---|---|---|---|
| Offline | 컴퓨터 앞에서 Codex/Claude/Obsidian에 직접 내리는 명령 | `/inbox-triage`, `/work-log`, `/project-sprint` | 바로 처리 가능 |
| Online | 밖에 있을 때 Slack으로 Lua에게 던지는 원격 명령 | `/lua inbox`, `/lua todo`, `/lua brief` | 먼저 Command Inbox에 저장 |

Online command는 기본적으로 capture만 한다. Slack/Notion/GitHub로 실제 반영하는 일은 별도 승인 후 실행한다.

## Daily Flow

1. [[01_Command Center/Master Dashboard|Master Dashboard]]를 연다.
2. 오늘 처리할 프로젝트 Home 또는 Daily Notes를 연다.
3. 생각은 Inbox/Daily Notes에 먼저 적는다.
4. 실행이 필요하면 Codex나 Claude에 말한다.
5. 결과가 나오면 프로젝트 DevLog, Artifact Ledger, Work Ledger 중 맞는 곳에 남긴다.

## Project Flow

1. `Home.md`: 프로젝트의 현재 상태와 목표.
2. `Backlog.md`: 다음에 해야 할 일.
3. `Research.md`: 조사 자료와 링크.
4. `DevLog.md`: 실제 진행 기록.
5. `Metrics.md`: 숫자, 성과, 검증 결과.

새 프로젝트를 시작할 때는 먼저 `Home.md`를 만들고, 그 다음 Backlog와 DevLog를 채운다.

## AI Tool Routing

| 타입 | 우선 도구 | 보조 도구 | 결과 저장 |
|---|---|---|---|
| 앱 만들기 | Codex | Pi | 프로젝트 DevLog, Artifact Ledger |
| 코드 검토/테스트 | Codex | Pi | DevLog, Work Ledger |
| 사업 기획/문서 | Claude | Codex | Operation, Notion 초안 |
| 팀 공유 | Claude | Codex | Slack Briefs, Operation |
| Notion/Slack 공유 설계 | Codex | Claude | Team Sharing Workflow |
| 자료 조사 | Claude | Pi | Research |
| Vault 정리 | Codex | Pi | Work Ledger |
| 짧은 실험 | Pi | Codex | DevLog 또는 Inbox |

## Pi-Based Type Presets

Pi는 Lua의 메인 도구라기보다 "작은 타입별 실행기"로 둔다.

| Preset | 쓰는 상황 | Lua 연결 |
|---|---|---|
| `lua-vault-care` | orphan, broken link, frontmatter 점검 | [[07_Lua_System/verticals/_core/skills/obsidian-vault-care/SKILL|obsidian-vault-care]] |
| `lua-project-sprint` | 작은 앱/기능을 한 사이클로 만들기 | [[07_Lua_System/verticals/_core/commands/project-sprint|project-sprint]] |
| `lua-research-brief` | 자료 조사 후 요약 | [[07_Lua_System/verticals/_core/skills/research-synthesis/SKILL|research-synthesis]] |
| `lua-team-brief` | Notion/Slack 공유 초안 | [[07_Lua_System/verticals/_core/commands/team-brief|team-brief]] |
| `lua-artifact-keeper` | 결과물을 재사용 자산으로 등록 | [[08_Artifacts/Artifact Ledger|Artifact Ledger]] |
| `lua-eval` | 여러 프롬프트/모델 결과 비교 | [[09_Automations/GitHub Actions|GitHub Actions]] |

## Next Implementation

- Pi 설치는 바로 하지 않고, 먼저 Lua 쪽 프리셋 이름과 사용 규칙을 확정한다.
- 이후 `.pi/` 폴더를 만들면 prompt preset, skills, MCP 설정을 프로젝트 단위로 추가한다.
- 외부 Pi package는 설치 전에 소스와 권한을 먼저 검토한다.

## Sources

- https://pi.dev/docs/latest
- https://pi.dev/packages/pi-context
- https://pi.dev/packages/my-pi

## Navigation

- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Obsidian Writing Rules|Obsidian Writing Rules]]
- [[01_Command Center/Command Modes|Command Modes]]
- [[01_Command Center/Agent Dashboard|Agent Dashboard]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[03_Operation/Team Brief Drafts|Team Brief Drafts]]
- [[04_Resources/Tech Stack/Pi Coding Agent|Pi Coding Agent]]
- [[01_Command Center/Work Ledger|Work Ledger]]
