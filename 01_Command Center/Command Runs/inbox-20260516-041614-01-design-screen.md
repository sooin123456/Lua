---
type: command-run
status: routed
command_id: inbox-20260516-041614-01
domain: design
intent: screen
stage: plan
agent: Scribe+Forge
role: Designer
last_updated: 2026-05-16
---

# inbox-20260516-041614-01 - design screen

## Command

Toss 미니앱 만들기: https://toss.im/apps-in-toss/blog/making-miniapps 토스 미니앱 만들기 주제는 아직 고민중 대신 이번에는 디자인 쪽으로 어제 말한 내용 나의 명령 체계를 ui로 표현해주는 좀 더 쉽게 뭔가 명령할 수 있는 그런 서비스

## Routing

| Field | Value |
|---|---|
| Domain | design |
| Intent | screen |
| gstack Role | Designer |
| Lua Agent | Scribe+Forge |
| Expected Output | Screen or service flow draft |

## Superpowers Workflow

### 1. Clarify

- What is the exact desired outcome?
- What constraints matter?
- What should not be done yet?

### 2. Design

- What are 2-3 possible approaches?
- Which approach is smallest and safest?

### 3. Plan

- [ ] Define first useful output.
- [ ] Identify destination note.
- [ ] Identify verification method.

### 4. Execute

- [ ] Produce draft or implementation.

### 5. Verify

- [ ] Check links, assumptions, and output quality.

### 6. Brief

- [ ] Update Work Ledger.
- [ ] Decide whether Slack/Notion sharing is needed.

## Next User Action

Tell Codex: `inbox-20260516-041614-01 처리해줘`

## Atlas CEO Router Update

| Field | Value |
|---|---|
| Command ID | inbox-20260516-041614-01 |
| Domain / Intent | design / screen |
| Stage | clarify -> plan |
| gstack Role | Designer |
| Lua Agent | Scribe+Forge |

### Clarify

- 목표: "Toss 미니앱 만들기: https://toss.im/apps-in-toss/blog/making-miniapps 토스 미니앱 만들기 주제는 아직 고민중 대신 이번에는 디자인 쪽으로 어제 말한 내용 나의 명령 체계를 ui로 표현해주는 좀 더 쉽게 뭔가 명령할 수 있는 그런 서비스"를 Toss 미니앱 스타일의 Lua 명령 UI 첫 화면 설계로 바꾼다.
- 핵심 문제: 사용자가 `/lua {domain} {intent} :: {payload}` 문법을 외우지 않아도, domain 선택 -> intent 선택 -> payload 입력만으로 정확한 명령을 만들 수 있어야 한다.
- 첫 사용자: 비개발자인 사용자 본인. Obsidian Command Center를 직접 편집하기보다, 더 쉬운 입력 화면에서 명령을 만들고 싶다.
- 아직 하지 않을 것: 실제 Toss 배포, 로그인/결제/개인정보 연동, 완전한 자동 실행. 지금은 화면 구조와 MVP 입력 흐름을 정의한다.

### Design

- 추천 방향: Lua 명령 UI를 "명령 작성기"로 시작한다. 첫 화면은 domain 선택, intent 선택, payload 입력, Command Preview, 실행 전 확인으로 구성한다.
- 화면 1: Quick Command. 사용자는 planning/design/build/research 같은 domain을 카드나 세그먼트로 고른다.
- 화면 2: Intent Preset. 선택한 domain에 맞는 intent 후보를 보여준다. 예: design은 screen/flow/prototype, build는 app/automation/script.
- 화면 3: Payload Composer. 사용자가 자연어로 원하는 일을 쓰면 아래에 `/lua design screen :: ...` Command Preview가 만들어진다.
- 화면 4: Review & Send. Obsidian Command Queue에 넣기 전, agent와 stage를 보여주고 "초안으로 넣기"만 제공한다.
- 대안 1: 채팅형 UI. 자유도는 높지만 command grammar가 흐려지고 검증이 어렵다.
- 대안 2: 대시보드형 UI. 상태 관리는 좋지만 첫 MVP가 무거워진다.
- 추천 이유: 명령 작성기는 작고, 지금 Lua 시스템의 약점인 "입력 난이도"를 바로 줄인다.

### Plan

- [x] 첫 처리 대상: [[01_Command Center/Command Runs/inbox-20260516-041614-01-design-screen|inbox-20260516-041614-01]].
- [x] Toss 미니앱 링크와 Inbox 메모를 기반으로 Lua Command UI 문제를 정의.
- [x] 첫 MVP를 "명령 작성기" 화면으로 제한.
- [x] 화면 설계 노트 생성: [[02_Projects/Lucia/Lua Command UI|Lua Command UI]].
- [x] 첫 화면 와이어프레임을 작성한다: domain 선택 / intent 선택 / payload 입력 / Command Preview.
- [ ] Command Queue로 보내는 동작은 실제 쓰기 전에 draft 상태로 검증한다.
- [ ] 이후 build/app command로 승격해 HTML 또는 미니앱 프로토타입을 만든다.

### Next User Action

다음에는 Codex에게 아래처럼 말하면 된다.

```text
Lua Command UI 화면 설계 승인해줘
```

## Navigation

- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[02_Projects/Lucia/Lua Command UI|Lua Command UI]]
- [[07_Lua_System/commands/Domain Command Playbook|Domain Command Playbook]]
- [[01_Command Center/Work Ledger|Work Ledger]]
