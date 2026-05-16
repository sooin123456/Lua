---
type: product-spec
status: app-repo
project: TOSS
source_command: money-dust-20260516-01
challenge: Apps in Toss Vibecoding Challenge
last_updated: 2026-05-16
---

# 돈 먹는 먼지

매달 빠져나가는 구독료와 고정비를 귀여운 먼지 캐릭터로 보여주고, 사용자가 잠자는 지출을 `재우기` 하면 절약 행동을 시작하게 만드는 Toss 미니앱.

## Repository Boundary

| Repo | Role |
|---|---|
| `Lua` | 명령 체계, 기획, 결정, Work Ledger |
| `Lua_money_dust` | 실제 앱 개발 |

Local app repo:

```text
C:\Users\sooin\OneDrive\문서\Lua_money_dust
```

Planned GitHub repo:

```text
https://github.com/sooin123456/Lua_money_dust
```

## Locked Decisions

| Topic | Decision |
|---|---|
| App name | `돈 먹는 먼지` |
| Demo data | 일반 예시 사용 |
| Representative screenshot | 먼지방 |
| App repo | `Lua_money_dust` |
| Base template | `Lua_template` commit `99b69005bc52a821e9da58fdbc12f1546e4435b3` |

## MVP

- 먼지방: 구독료/고정비를 캐릭터로 보여준다.
- 오픈뱅킹으로 찾기: 계좌/카드 반복 결제에서 구독료를 자동 탐지하는 형태를 보여준다.
- 재우기: 선택한 먼지를 비활성화하고 절약액을 보여준다.
- 해지 도우미: 실제 자동 해지 전, 해지 화면/안내로 연결하는 보조 흐름을 제공한다.

## Current App Direction

- 앱 안에서는 한 번에 하나의 미니앱 화면만 보여준다.
- 제출용 3장 preview 이미지는 앱 내부 UI가 아니라 홍보/제출용 asset으로만 사용한다.
- 최신 구현은 `Lua_money_dust`의 React Router home screen에 있다.

## Product Assumptions

- 현재 오픈뱅킹 연동은 `mock preview`다.
- 실제 오픈뱅킹/카드 내역 연동은 사용자 동의, Toss Apps in Toss 제공 API, 금융 데이터 권한, 보안 검토가 필요하다.
- 실제 자동 해지는 서비스별 해지 API가 없다면 바로 실행할 수 없다.
- MVP에서는 assisted cancellation으로 시작한다.

## Remaining Decisions

남은 결정은 [[01_Command Center/Decision Board|Decision Board]]에서만 관리한다.

## Next Build Work

- GitHub에 `Lua_money_dust` repo 생성 후 local repo push
- 실제 Toss SDK/API에서 사용 가능한 금융 데이터 범위 확인
- demo mode와 real integration mode 분리
- 제출용 screenshot과 설명 문구 최종 정리
