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
domain 선택 -> intent 선택 -> payload 입력 -> Command Preview 확인 -> Queue에 넣기 또는 끝까지 실행
```

현재 localhost 버전은 두 가지 모드를 지원한다. `Command Queue에 쓰기`는 `queued` row만 만들고, `끝까지 실행`은 Queue 저장 뒤 `process_command_queue`와 `atlas_router`를 이어서 실행해 run note까지 만든다. `file://`로 열면 여전히 copy fallback만 동작한다.

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

### 5. Send / Run

현재 prototype은 버튼을 둘로 나눈다.

```text
Command Queue에 초안으로 넣기
끝까지 실행
```

첫 버튼은 `queued` 상태의 command row를 만드는 역할만 한다. 두 번째 버튼은 localhost writer 서버에서만 동작하며, 새 command id 하나만 대상으로 run note 생성과 Atlas Router 라우팅까지 수행한다.

## UX Rules

- 문법보다 선택지를 먼저 보여준다.
- domain과 intent는 가능한 적게 보여준다.
- 사용자가 payload를 쓰기 전에도 예시 문장을 보여준다.
- Command Preview는 항상 보인다.
- 실행 버튼은 Queue 쓰기와 end-to-end 실행을 구분한다.
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

## Next Build Candidate

다음 build command 후보:

```text
/lua build app :: Lua Command UI 첫 화면 프로토타입 만들기. domain 선택, intent 선택, payload 입력, Command Preview, draft send 흐름까지.
```

## Prototype

- [[08_Artifacts/Lua Command UI Prototype/README|Lua Command UI Prototype]]
- HTML: `08_Artifacts/Lua Command UI Prototype/index.html`
- Local writer: `npm run lua-ui`, then open `http://127.0.0.1:8765`

`file://` mode is copy-only. Real Command Queue writes and end-to-end runs require the local writer server.

## App Template Rule

실제 앱으로 발전시키는 단계에서는 [[09_Automations/App Template Standard|App Template Standard]]를 따른다.

즉, 현재 정적 prototype은 화면/흐름 검증용이고, 다음 실제 앱은 `https://github.com/sooin123456/Lua_template` 구조를 변형해서 만든다.

## Navigation

- [[01_Command Center/Command Runs/inbox-20260516-041614-01-design-screen|Command Run]]
- [[08_Artifacts/Artifact Ledger|Artifact Ledger]]
- [[09_Automations/App Template Standard|App Template Standard]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[02_Projects/Projects Hub|Projects Hub]]
