---
type: submission-package
status: draft
project: 돈 먹는 먼지
challenge: Apps in Toss Vibecoding Challenge
last_updated: 2026-05-16
---

# 돈 먹는 먼지 Submission Package

Toss Apps in Toss 제출 전 확인용 패키지다. 실제 제출은 사용자가 승인한 뒤에만 한다.

## Locked Submission Choices

| Item | Choice |
|---|---|
| App name | 돈 먹는 먼지 |
| Demo data | 일반 예시 |
| 대표 스크린샷 | 먼지방 |
| Project | [[02_Projects/TOSS/Home|TOSS]] |

## One-Line Pitch

매달 빠져나가는 구독료와 고정비를 귀여운 3D 먼지 캐릭터로 보여주고, 잠자는 지출을 찾고 재우는 금융 미니앱.

## Short Description

`돈 먹는 먼지`는 사용자의 구독료와 고정비를 작고 귀여운 먼지 캐릭터로 보여준다. 사용자는 오픈뱅킹으로 자동 탐지된 반복 결제를 확인하고, 먼지를 선택해 이번 달 무엇이 돈을 먹고 있는지 볼 수 있다. 줄이고 싶은 먼지는 `재우기`로 비활성화하고, 해지가 필요한 경우 `해지 도우미`가 다음 행동으로 이어준다.

현재 prototype은 금융 연동과 해지 자동화를 mock preview로 보여준다. 실제 제출/상용화 단계에서는 Toss Apps in Toss API, 사용자 동의, 금융 데이터 권한, 서비스별 해지 가능 범위를 확인해야 한다.

## Representative Screenshots

대표 스크린샷: 먼지방

```text
08_Artifacts/Money Eating Dust Prototype/screenshots/dust-room-mobile.png
```

넓은 화면/오픈뱅킹 preview:

```text
08_Artifacts/Money Eating Dust Prototype/screenshots/wide-openbanking-preview.png
```

레퍼런스 스타일 preview:

```text
08_Artifacts/Money Eating Dust Prototype/screenshots/reference-style-preview.png
```

## Demo Data

- 영상 구독
- 통신비
- 커피 멤버십
- 음악 앱
- 쇼핑 멤버십
- 생활 보험

## Submit-Readiness Checklist

- [x] 앱 이름 결정
- [x] 일반 예시 데이터 반영
- [x] 먼지방 대표 스크린샷 생성
- [x] 오픈뱅킹 preview UI 추가
- [x] 해지 도우미 UI 추가
- [x] 카테고리별 3D-like 먼지 형태 추가
- [x] 앱 스토어형 어두운 카드 preview UI 반영
- [x] prototype 테스트 통과
- [ ] 제출 경로 결정: 정적 prototype vs Toss/Lua_template 구조 이전
- [ ] 실제 금융 연동/해지 자동화 가능 범위 확인

## Links

- Prototype: `08_Artifacts/Money Eating Dust Prototype/index.html`
- Prototype README: [[08_Artifacts/Money Eating Dust Prototype/README|Money Eating Dust Prototype]]
- Submission draft: [[06_Personal Studio/_Drafts/Money Eating Dust Toss Submission Draft|Money Eating Dust Toss Submission Draft]]
- Decision Board: [[01_Command Center/Decision Board|Decision Board]]
