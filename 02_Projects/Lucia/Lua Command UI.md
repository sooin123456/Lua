---
type: product-design
status: draft
domain: design
source_command: inbox-20260516-041614-01
last_updated: 2026-05-16
---

# Lua Command UI

Lua Command UI는 Obsidian Command Center의 `/lua {domain} {intent} :: {payload}` 명령 체계를 더 쉽게 입력하기 위한 Toss 미니앱 스타일의 첫 화면이다.

## Product Intent

사용자는 복잡한 명령 문법을 외우지 않고도 아래 흐름으로 명령을 만들 수 있어야 한다.

```text
domain 선택 -> intent 선택 -> payload 입력 -> Command Preview 확인 -> draft로 Queue에 넣기
```

첫 버전은 실행 자동화가 아니라 "명령 작성기"다. 사용자가 직접 확인한 뒤 Command Queue에 초안으로 넣는 것이 핵심이다.

## First Screen

### 1. Quick Command

상단에는 지금 만들 명령의 목적을 고르는 domain 선택 영역을 둔다.

| Domain | UI Label | 설명 |
|---|---|---|
| planning | 우선순위/결정 | 방향, 전략, 이번 주 할 일 |
| design | 화면/흐름 | UI, UX, 서비스 흐름 |
| build | 만들기 | 앱, 자동화, 스크립트 |
| research | 조사 | 자료, 경쟁사, 시장, 출처 |
| marketing | 공유/콘텐츠 | 소개글, 팀 공유, 메시지 |
| ops | 정리/검사 | vault 정리, audit, 운영 |

### 2. Intent Preset

domain을 고르면 intent 후보를 좁혀서 보여준다.

| Domain | Intent 후보 |
|---|---|
| design | screen, flow, prototype |
| build | app, automation, script |
| research | brief, compare, source-check |
| planning | prioritize, validate, decide |
| ops | cleanup, audit, sync |

### 3. Payload Composer

사용자는 자연어로 원하는 일을 쓴다.

예:

```text
토스 미니앱처럼 내 명령 체계를 UI로 표현하는 첫 화면을 설계해줘
```

### 4. Command Preview

입력값을 바탕으로 아래 preview를 즉시 보여준다.

```text
/lua design screen :: 토스 미니앱처럼 내 명령 체계를 UI로 표현하는 첫 화면을 설계해줘
```

Preview 아래에는 라우팅 결과를 같이 보여준다.

| Field | Value |
|---|---|
| Agent | Scribe+Forge |
| Stage | clarify |
| Output | Screen or service flow draft |

### 5. Draft Send

첫 MVP의 버튼은 하나만 둔다.

```text
Command Queue에 초안으로 넣기
```

이 버튼은 자동 실행이 아니라 `queued` 또는 `planned` 상태의 command row를 만드는 역할만 한다.

## UX Rules

- 문법보다 선택지를 먼저 보여준다.
- domain과 intent는 가능한 적게 보여준다.
- 사용자가 payload를 쓰기 전에도 예시 문장을 보여준다.
- Command Preview는 항상 보인다.
- 실행 버튼은 "초안으로 넣기"처럼 위험이 낮은 표현을 쓴다.
- Notion/Slack 발행은 이 화면에서 하지 않는다.

## MVP Boundary

첫 MVP에 포함한다.

- domain 선택
- intent 선택
- payload 입력
- Command Preview 생성
- agent/stage preview
- Obsidian Command Queue 초안 생성

첫 MVP에서 제외한다.

- Toss 실제 배포
- 로그인
- 결제
- 개인정보 연동
- Slack/Notion 직접 발행
- 자동 실행

## Next Build Candidate

다음 build command 후보:

```text
/lua build app :: Lua Command UI 첫 화면 프로토타입 만들기. domain 선택, intent 선택, payload 입력, Command Preview, draft send 흐름까지.
```

## Prototype

- [[08_Artifacts/Lua Command UI Prototype/README|Lua Command UI Prototype]]
- HTML: `08_Artifacts/Lua Command UI Prototype/index.html`

## App Template Rule

실제 앱으로 발전시키는 단계에서는 [[09_Automations/App Template Standard|App Template Standard]]를 따른다.

즉, 현재 정적 prototype은 화면/흐름 검증용이고, 다음 실제 앱은 `https://github.com/sooin123456/Lua_template` 구조를 변형해서 만든다.

## Navigation

- [[01_Command Center/Command Runs/inbox-20260516-041614-01-design-screen|Command Run]]
- [[08_Artifacts/Artifact Ledger|Artifact Ledger]]
- [[09_Automations/App Template Standard|App Template Standard]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[02_Projects/Projects Hub|Projects Hub]]
