---
type: operating-guide
status: active
last_updated: 2026-05-16
---

# Obsidian Writing Rules

Obsidian에 무엇을 써야 하고, 무엇은 쓰지 않아도 되는지 판단하는 규칙이다.

## Core Rule

Obsidian에는 "나중에 다시 써먹을 맥락"만 남긴다.

반대로, 순간적인 채팅, 단순 확인, 이미 다른 시스템이 원본인 정보는 굳이 길게 쓰지 않는다.

## Write In Obsidian

| 상황 | 행동 | 위치 |
|---|---|---|
| 갑자기 아이디어가 떠오름 | 원문 그대로 적기 | [[00_Inbox/AI 분류 대기중...|AI 분류 대기중]] |
| 아이디어가 프로젝트가 될 수 있음 | 왜 필요한지, 첫 결과물, 다음 행동 적기 | 프로젝트 `Home.md` 또는 새 후보 노트 |
| 오늘 한 일/결정 | 짧게 로그 남기기 | [[06_Personal Studio/Daily Notes|Daily Notes]] |
| 프로젝트가 진행됨 | 변경, 결정, 블로커, 다음 행동 기록 | 프로젝트 `DevLog.md` |
| 할 일이 생김 | 실행 가능한 문장으로 적기 | 프로젝트 `Backlog.md` |
| 자료 조사함 | 출처, 핵심 요약, 판단 근거 남기기 | 프로젝트 `Research.md` |
| 팀에게 공유해야 함 | 초안 만들기 | [[03_Operation/Team Brief Drafts|Team Brief Drafts]] |
| 재사용 가능한 결과물이 생김 | artifact로 등록 | [[08_Artifacts/Artifact Ledger|Artifact Ledger]] |
| Codex/Claude가 파일을 바꿈 | 출처와 커밋 남기기 | [[01_Command Center/Work Ledger|Work Ledger]] |

## Do Not Need To Write In Obsidian

| 상황 | 이유 | 대신 할 일 |
|---|---|---|
| 단순 질문/답변 | 다시 쓸 맥락이 아님 | 채팅에서 끝내기 |
| 이미 Notion에 팀용으로 정리된 내용 | Obsidian 중복 기록 방지 | Notion 링크만 필요하면 남기기 |
| Slack에서 끝난 가벼운 확인 | 기록 가치가 낮음 | 중요한 결정만 Decisions/DevLog에 남기기 |
| API key, token, password | 보안 위험 | `.env`, 비밀번호 관리자, Secret Manager 사용 |
| 완전히 확정된 외부 문서 원문 | 원본 중복 저장 | 링크와 요약만 Research에 남기기 |
| 너무 사적인 감정 메모 | 팀/프로젝트 맥락과 분리 필요 | 개인 노트에만 짧게 두기 |
| 파일 자동 생성 로그 전체 | 노이즈가 큼 | 실패/결정/결과만 Work Ledger에 남기기 |

## Situation To Action

| 지금 상황 | 첫 행동 | 다음 분류 |
|---|---|---|
| "이거 나중에 쓸 수도?" | Inbox에 원문 저장 | 나중에 프로젝트/리서치/아카이브 분리 |
| "누가 해야 하지?" | Backlog에 task로 작성 | Notion Tasks 후보 |
| "팀이 알아야 하나?" | Team Brief Drafts에 초안 | Notion Team Briefs 또는 Slack |
| "근거가 필요하다" | Research에 출처 저장 | Notion Research Briefs 후보 |
| "앱/서비스로 만들고 싶다" | Home + Backlog 작성 | Codex project-sprint 후보 |
| "AI가 파일을 바꿨다" | Work Ledger 기록 | Git commit |
| "회의에서 결정났다" | DevLog 또는 Decisions 후보로 기록 | Notion Decisions |

## Three-Line Capture

급할 때는 아래 3줄만 써도 된다.

```markdown
생각:
왜 중요함:
다음 행동:
```

## Navigation

- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
- [[01_Command Center/Command Modes|Command Modes]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[09_Automations/Notion Workspace Plan|Notion Workspace Plan]]
