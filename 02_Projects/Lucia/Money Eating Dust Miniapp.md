---
type: product-spec
status: planning
domain: build
source_command: money-dust-20260516-01
challenge: Apps in Toss Vibecoding Challenge
last_updated: 2026-05-16
---

# 돈먹는 먼지 Miniapp

`돈먹는 먼지`는 매달 빠져나가는 구독료와 고정비를 귀여운 먼지 캐릭터로 보여주고, 사용자가 안 쓰는 지출을 "재우기" 하면서 절약 행동을 하게 만드는 Toss 미니앱이다.

## Product Thesis

구독 관리 앱은 이미 많다. 하지만 대부분은 표, 그래프, 알림 중심이라 사용자가 "아껴야겠다"는 감정을 바로 느끼기 어렵다.

`돈먹는 먼지`는 고정비를 회계 항목이 아니라 내 지갑 안에서 돈을 먹는 작은 캐릭터로 바꾼다. 사용자는 분석을 읽는 대신 먼지를 발견하고, 이름 붙이고, 재우면서 지출을 줄인다.

이번 Toss 앱인토스 바이브코딩 챌린지의 주제는 "귀여운게 최고야"다. 그래서 금융 앱처럼 보이기보다, 귀여운 절약 놀이처럼 보여야 한다.

## Target User

- 20~30대 Toss 사용자
- OTT, 쇼핑, 통신, 앱 구독, 보험, 멤버십 등 고정비가 조금씩 늘어난 사람
- 가계부를 꾸준히 쓰지는 않지만 "이번 달 돈이 왜 없지?"를 자주 느끼는 사람
- 귀여운 캐릭터, 수집, 작은 성취감을 좋아하는 사용자

## Core Job

```text
매달 나가는 돈을 귀엽게 눈앞에 보여주고,
안 쓰는 고정비를 하나씩 줄이게 만든다.
```

## First MVP

첫 MVP는 계좌/카드 연동 없이 수동 입력으로 시작한다. 금융 데이터 연동보다 챌린지 제출, 사용성, 귀여운 경험을 우선한다.

| 기능 | 입력 | 출력 |
|---|---|---|
| 먼지 찾기 | 고정비 이름, 금액, 결제 주기 | 먼지 캐릭터 생성 |
| 먹힌 돈 보기 | 등록된 먼지 목록 | 이번 달 총액, 하루당 사라지는 돈 |
| 먼지 재우기 | 줄이고 싶은 고정비 선택 | 절약 예상액, 잠든 먼지 상태 |

## Core Screens

### 1. Home

- 큰 문구: `내 돈을 몰래 먹는 먼지를 찾아보세요`
- 메인 CTA: `먼지 찾기`
- 보조 CTA: `샘플로 보기`
- 등록된 먼지가 있으면 총 먹힌 돈과 먼지 캐릭터들을 보여준다.

### 2. Dust Create

- 사용자가 고정비를 직접 입력한다.
- 빠른 선택 칩:
  - OTT
  - 쇼핑
  - 통신비
  - 보험
  - 앱 구독
  - 커피/멤버십
- 입력값:
  - 이름
  - 월 금액
  - 아이콘/먼지 색상

### 3. Dust Room

- 먼지들이 방 안에 모여 있다.
- 금액이 클수록 먼지가 더 통통하다.
- 각 먼지 카드에는 `월 14,900원`, `하루 497원`처럼 작게 표시한다.

### 4. Sleep Dust

- 사용자가 먼지를 선택하면 `재우기` 화면으로 이동한다.
- 문구 예시:
  - `이 먼지를 재우면 한 달에 14,900원을 지켜요`
  - `일주일에 커피 3잔 정도예요`
- CTA:
  - `재우기`
  - `이번 달은 지켜보기`

### 5. Result

- 잠든 먼지와 절약 금액을 보여준다.
- 공유 문구:
  - `이번 달 14,900원을 지켰어요`
  - `내 지갑 먼지 1마리 재웠어요`

## Cute Finance Rules

- "절약 실패", "낭비", "과소비" 같은 죄책감 단어를 쓰지 않는다.
- 금융 전문용어보다 쉬운 생활 단위로 바꾼다.
- 숫자는 크게, 설명은 짧게 보여준다.
- 사용자가 줄이지 않기로 해도 비난하지 않는다.
- 앱의 톤은 귀엽지만 돈 계산은 정확해야 한다.

## Differentiation

| 일반 구독관리 앱 | 돈먹는 먼지 |
|---|---|
| 구독 목록 관리 | 먼지 캐릭터 수집/재우기 |
| 지출 분석 중심 | 행동 유도 중심 |
| 생산성 도구 느낌 | 귀여운 절약 놀이 느낌 |
| 금융 앱 경쟁 | 챌린지 테마형 미니앱 |

## Build Target

`Lua_template` 기반 실제 앱으로 옮길 때의 1차 매핑이다.

| Product part | Template target |
|---|---|
| Home screen | `app/features/money-dust/screens/home.tsx` |
| Dust create screen | `app/features/money-dust/screens/dust-create.tsx` |
| Dust room screen | `app/features/money-dust/screens/dust-room.tsx` |
| Result screen | `app/features/money-dust/screens/result.tsx` |
| Constants | `app/features/money-dust/constants.ts` |
| Local state/schema | `app/features/money-dust/schema.ts` |
| E2E | `e2e/money-dust/mvp.spec.ts` |

## MVP Exclusions

- Toss 금융 데이터 자동 연동
- 카드/계좌 실시간 조회
- 실제 구독 해지 대행
- 투자, 보험, 대출 추천
- 자동 알림
- 유료 결제

## Next Command

```text
/lua build app :: 돈먹는 먼지 Toss 미니앱 MVP를 만든다. 사용자가 매달 나가는 구독료와 고정비를 직접 입력하면, 각 지출이 귀여운 먼지 캐릭터로 생긴다. 첫 MVP는 먼지 만들기, 이번 달 먹힌 돈 보기, 먼지 재우기 3가지 기능으로 제한한다. 계좌/카드 연동 없이 수동 입력으로 시작하고, Toss 앱인토스 바이브코딩 챌린지 주제인 "귀여운게 최고야"에 맞게 귀여운 캐릭터 중심 UI로 만든다.
```

## Navigation

- [[01_Command Center/Command Runs/money-dust-20260516-01-build-app|Command Run]]
- [[09_Automations/App Template Standard|App Template Standard]]
- [[02_Projects/Lucia/Lua Command UI|Lua Command UI]]
- [[02_Projects/Projects Hub|Projects Hub]]
