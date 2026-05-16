---
type: command-run
status: routed
command_id: easy-ai-helper-20260516-01
domain: build
intent: app
stage: plan
agent: Forge
role: Eng Manager
last_updated: 2026-05-16
---

# easy-ai-helper-20260516-01 - build app

## Command

60대 이상 사용자를 위한 쉬운말 AI 도우미 미니앱을 만든다. 사용자가 문자, 카톡, 병원 안내문, 고지서 내용을 붙여넣으면 AI가 쉬운 말로 요약하고, 해야 할 일과 사기/위험 여부를 큰 글씨로 알려준다. 첫 MVP는 사기 문자 확인, 안내문 쉽게 설명, 안전 답장 만들기 3가지 기능으로 제한한다.

## Routing

| Field | Value |
|---|---|
| Domain | build |
| Intent | app |
| gstack Role | Eng Manager |
| Lua Agent | Forge |
| Expected Output | MVP plan and build task |

## Superpowers Workflow

### 1. Clarify

- What is the exact desired outcome?
- What constraints matter?
- What should not be done yet?

### 2. Design

- What are 2-3 possible approaches?
- Which approach is smallest and safest?

### 3. Plan

- [x] Define first useful output.
- [x] Identify destination note.
- [x] Identify verification method.

### 4. Execute

- [ ] Produce first screen design or implementation.

### 5. Verify

- [ ] Check links, assumptions, and output quality.

### 6. Brief

- [ ] Update Work Ledger.
- [ ] Decide whether Slack/Notion sharing is needed.

## Atlas CEO Router Update

| Field | Value |
|---|---|
| Command ID | easy-ai-helper-20260516-01 |
| Domain / Intent | build / app |
| Stage | clarify -> plan |
| gstack Role | Eng Manager |
| Lua Agent | Forge |

### Clarify

- 목표: 60대 이상 사용자가 AI를 직접 잘 다루지 않아도 문자, 카톡, 병원 안내문, 고지서 내용을 쉽게 이해하도록 돕는다.
- 핵심 문제: 사용자는 무엇을 물어봐야 할지 모르고, 긴 AI 답변과 전문용어를 부담스러워하며, 사기 링크/전화 판단에서 불안하다.
- 첫 MVP 범위: 사기 문자 확인, 안내문 쉽게 설명, 안전 답장 만들기.
- 제외할 것: 문자 자동 읽기, 연락처 접근, 금융기관 API 연동, 가족 자동 전송, Toss 실제 배포.

### Design

- 추천 방향: 자유형 챗봇이 아니라 생활 상황 버튼 중심의 큰 글씨 미니앱.
- 첫 화면: `무엇을 도와드릴까요?` 제목, 3개 상황 버튼, 붙여넣기 입력창, `쉽게 설명해줘` 버튼.
- 결과 화면: `쉽게 말하면`, `해야 할 일`, `주의할 점` 세 블록으로 고정한다.
- 안전 UX: 위험하거나 애매하면 링크 클릭 대신 공식 대표번호 확인과 가족 확인을 안내한다.

### Plan

- [x] command run 생성: [[01_Command Center/Command Runs/easy-ai-helper-20260516-01-build-app|easy-ai-helper-20260516-01]].
- [x] 제품 기획 노트 생성: [[02_Projects/Lucia/Easy AI Helper Miniapp|Easy AI Helper Miniapp]].
- [x] MVP 범위 확정: 사기 문자 확인 / 안내문 쉽게 설명 / 안전 답장 만들기.
- [ ] 첫 화면과 결과 화면을 60대 이상 사용자 기준으로 설계한다.
- [ ] `Lua_template` 기반 실제 feature folder와 DB schema를 설계한다.
- [ ] AI API/env 준비는 구현 직전 마지막 단계로 미룬다.

### Next User Action

```text
/lua design screen :: 쉬운말 AI 도우미 미니앱의 첫 화면과 결과 화면을 60대 이상 사용자가 읽기 쉬운 큰 글씨 UI로 설계해줘.
```

## Product Spec Output

| Field | Value |
|---|---|
| Product spec | [[02_Projects/Lucia/Easy AI Helper Miniapp|Easy AI Helper Miniapp]] |
| MVP scope | 사기 문자 확인, 안내문 쉽게 설명, 안전 답장 만들기 |
| Template baseline | [[09_Automations/App Template Standard|Lua_template]] |

### Implementation Notes

- Use `Lua_template` auth/db baseline rather than designing login and DB from scratch.
- First MVP can start without login for single-use analysis.
- Login becomes necessary for saved history, family protection mode, and reusable reply tone.
- Do not store raw pasted text by default; store only explicit saved records.

## Navigation

- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[07_Lua_System/commands/Domain Command Playbook|Domain Command Playbook]]
- [[01_Command Center/Work Ledger|Work Ledger]]
- [[02_Projects/Lucia/Easy AI Helper Miniapp|Easy AI Helper Miniapp]]
