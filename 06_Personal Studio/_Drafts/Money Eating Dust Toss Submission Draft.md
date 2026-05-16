---
type: draft
status: working
project: 돈 먹는 먼지
challenge: Apps in Toss Vibecoding Challenge
last_updated: 2026-05-16
---

# 돈 먹는 먼지 Toss Submission Draft

승인 전 내부 제출 초안이다. 실제 제출은 사용자가 승인한 뒤에만 한다.

## App Name

돈 먹는 먼지

## One-Line Pitch

매달 빠져나가는 구독료와 고정비를 귀여운 먼지 캐릭터로 보여주고, 잠자는 지출을 찾고 재우는 금융 미니앱.

## Short Description

`돈 먹는 먼지`는 사용자의 구독료와 고정비를 작고 귀여운 먼지 캐릭터로 보여준다. 사용자는 오픈뱅킹으로 자동 탐지된 반복 결제를 확인하고, 먼지를 선택해 이번 달 무엇이 돈을 먹고 있는지 볼 수 있다. 줄이고 싶은 먼지는 `재우기`로 비활성화하고, 해지가 필요한 경우 `해지 도우미`가 다음 행동으로 이어준다.

## Repository

실제 앱 개발은 `Lua`가 아니라 `Lua_template` 기반의 별도 repo에서 진행한다.

```text
C:\Users\sooin\OneDrive\문서\Lua_money_dust
```

Planned remote:

```text
https://github.com/sooin123456/Lua_money_dust
```

## Core Features

- 구독료/고정비를 먼지 캐릭터로 보여준다.
- 반복 결제를 자동 탐지하는 오픈뱅킹 preview를 제공한다.
- 선택한 먼지를 재우면 이번 달 활성 지출에서 빠진다.
- 해지 도우미는 실제 해지 실행 전 보조 흐름으로 시작한다.

## Screenshot Plan

대표 스크린샷은 `Lua_money_dust` 앱 화면에서 새로 생성한다.

체크할 것:

- 앱 이름 `돈 먹는 먼지`
- 이번 달 총액
- 먼지방
- 선택한 먼지 상세
- 재우기/해지 도우미 버튼
- 모바일 미니앱 단일 화면 형태

## Remaining User Decision

- GitHub에 `sooin123456/Lua_money_dust` repo 생성
- 실제 금융 연동은 제출 범위에 넣을지, mock preview로만 둘지 결정

## Links

- Product spec: [[02_Projects/TOSS/Money Eating Dust|돈 먹는 먼지]]
- Command run: [[01_Command Center/Command Runs/money-dust-20260516-01-build-app|money-dust-20260516-01]]
