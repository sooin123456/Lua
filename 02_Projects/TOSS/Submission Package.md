---
type: submission-package
status: draft
project: 돈 먹는 먼지
challenge: Apps in Toss Vibecoding Challenge
last_updated: 2026-05-16
---

# 돈 먹는 먼지 Submission Package

Toss Apps in Toss 제출 전 확인용 패키지다. 실제 제출은 사용자가 승인한 뒤에만 한다.

## Repository

실제 앱 개발은 `Lua`가 아니라 별도 repo에서 진행한다.

```text
C:\Users\sooin\OneDrive\문서\Lua_money_dust
```

Planned remote:

```text
https://github.com/sooin123456/Lua_money_dust
```

## Locked Submission Choices

| Item | Choice |
|---|---|
| App name KR | 돈 먹는 먼지 |
| App name EN | Meonji |
| Toss appName | `money-meonji` |
| Demo data | 일반 예시 |
| 대표 스크린샷 | 먼지방 |
| Visual direction | Toss dark navy background + fluffy beige Meonji mascot |
| Project | [[02_Projects/TOSS/Home|TOSS]] |
| App repo | `Lua_money_dust` |

## One-Line Pitch

매달 빠져나가는 구독료와 고정비를 귀여운 먼지 캐릭터로 보여주고, 잠자는 지출을 찾고 재우는 금융 미니앱.

## Short Description

`돈 먹는 먼지`는 사용자의 구독료와 고정비를 작고 귀여운 먼지 캐릭터로 보여준다. 사용자는 오픈뱅킹으로 자동 탐지된 반복 결제를 확인하고, 먼지를 선택해 이번 달 무엇이 돈을 먹고 있는지 볼 수 있다. 줄이고 싶은 먼지는 `재우기`로 비활성화하고, 해지가 필요한 경우 `해지 도우미`가 다음 행동으로 이어준다.

현재 앱 구현은 금융 연동과 해지 자동화를 mock preview로 보여준다. 실제 제출/상용화 단계에서는 Toss Apps in Toss API, 사용자 동의, 금융 데이터 권한, 서비스별 해지 가능 범위를 확인해야 한다.

## Submit-Readiness Checklist

- [x] 앱 이름 결정
- [x] 일반 예시 데이터 반영
- [x] `Lua_template` 기반 local app repo 생성
- [x] 실제 앱 UI를 `Lua_money_dust`로 분리
- [x] `Lua` repo에서 앱 artifact 제거
- [x] `Lua_money_dust` 로컬 실행 가능 상태 확인
- [x] Apps in Toss WebView SDK 설치
- [x] `granite.config.ts` 추가
- [x] React Router를 Toss WebView용 CSR 빌드로 전환
- [x] `.ait` 번들 로컬 생성 확인
- [x] mock 금융 데이터 고지 문구 반영
- [x] GitHub repo `sooin123456/Lua_money_dust` 생성
- [x] `Lua_money_dust` push
- [x] Apps in Toss 콘솔 가입
- [x] 콘솔의 최종 `appName`을 `granite.config.ts`와 일치
- [x] 털먼지형 Meonji visual direction 반영
- [ ] 최종 icon/logo/thumbnail 등록
- [ ] TDS 적용/접근 가능성 확인
- [ ] 제출용 screenshot 재생성
- [ ] 실제 금융 연동/해지 자동화 가능 범위 확인
- [ ] Toss app QR/private scheme 테스트 1회 이상 완료
- [ ] 검토 요청

## Launch Readiness Notes

Official Apps in Toss docs require a WebView/RN bundle path, not a plain public web URL. For this repo the local path is now:

```text
npm run toss:build -> money-meonji.ait
```

The current app uses sample financial data only. The UI says it does not query real financial data yet. Real open-banking or cancellation automation should wait until the approved Toss/partner integration path is confirmed.

Visual direction is now locked around a soft beige-gray fluffy mascot on Toss-like dark navy/blue surfaces. The app currently uses `public/assets/meonji-concept.png` as a concept asset and crops it into the header icon, total card, dust room, and selected dust preview. Final console upload still needs separated icon/logo/thumbnail files.

Official docs reviewed:

- https://developers-apps-in-toss.toss.im/tutorials/webview.html
- https://developers-apps-in-toss.toss.im/development/deploy.html
- https://developers-apps-in-toss.toss.im/checklist/app-nongame.html

## Links

- Product spec: [[02_Projects/TOSS/Money Eating Dust|돈 먹는 먼지]]
- Submission draft: [[06_Personal Studio/_Drafts/Money Eating Dust Toss Submission Draft|Money Eating Dust Toss Submission Draft]]
- Decision Board: [[01_Command Center/Decision Board|Decision Board]]
