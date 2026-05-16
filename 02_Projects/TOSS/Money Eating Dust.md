---
type: product-spec
status: prototype
project: TOSS
source_command: money-dust-20260516-01
challenge: Apps in Toss Vibecoding Challenge
last_updated: 2026-05-16
---

# 돈 먹는 먼지

매달 빠져나가는 구독료와 고정비를 귀여운 먼지 캐릭터로 보여주고, 사용자가 잠자는 지출을 `재우기` 하면 절약 행동을 시작하게 만드는 Toss 미니앱.

## Locked Decisions

| Topic | Decision |
|---|---|
| App name | `돈 먹는 먼지` |
| Demo data | 일반 예시 사용 |
| Representative screenshot | 먼지방 |
| Project home | 제출 전에는 `02_Projects/TOSS/`에서 별도 관리 |

## MVP

- 먼지방: 구독료/고정비를 캐릭터로 보여준다.
- 오픈뱅킹으로 찾기: 계좌/카드 반복 결제에서 구독료를 자동 탐지하는 형태를 보여준다.
- 재우기: 선택한 먼지를 잠시 비활성화하고 절약액을 보여준다.
- 해지 도우미: 실제 해지 버튼을 직접 누르기 전, 해당 결제/가맹점의 해지 화면으로 이동하는 보조 흐름을 제공한다.

## Current Prototype

- Prototype: `08_Artifacts/Money Eating Dust Prototype/index.html`
- README: [[08_Artifacts/Money Eating Dust Prototype/README|Money Eating Dust Prototype]]
- Submission package: [[02_Projects/TOSS/Submission Package|Submission Package]]
- Submission draft: [[06_Personal Studio/_Drafts/Money Eating Dust Toss Submission Draft|Money Eating Dust Toss Submission Draft]]
- Wide preview: `08_Artifacts/Money Eating Dust Prototype/screenshots/wide-openbanking-preview.png`

## Product Assumptions

- 현재 prototype의 오픈뱅킹 연동은 `mock preview`다.
- 실제 오픈뱅킹/카드 내역 연동은 사용자 동의, Toss Apps in Toss 제공 API, 금융/전자금융 관련 권한, 보안 검토가 필요하다.
- 실제 자동 해지는 서비스별 해지 API가 없다면 바로 실행할 수 없다. MVP에서는 `해지하러 가기`, 해지 안내 복사, 해지 체크리스트 같은 assisted cancellation으로 시작한다.
- 카테고리별 먼지는 서로 다른 3D-like 형태를 가진다: OTT cube, 쇼핑 gem, 통신 capsule, 보험 shield, 앱 star, 멤버십 coin.

## Remaining Decisions

남은 결정은 [[01_Command Center/Decision Board|Decision Board]]에서만 관리한다.

## Next Build Work

- Toss/Lua_template 구조로 옮길지, 정적 prototype으로 제출할지 최종 결정
- 실제 Toss SDK/API에서 사용 가능한 금융 데이터 범위 확인
- 오픈뱅킹/해지 도우미를 demo mode와 real integration mode로 분리
- 제출용 screenshot과 설명 문구 최종 정리
