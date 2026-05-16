---
type: product-spec
status: planning
domain: build
source_command: easy-ai-helper-20260516-01
last_updated: 2026-05-16
---

# Easy AI Helper Miniapp

60대 이상 사용자를 위한 쉬운말 AI 도우미 미니앱이다. 사용자가 문자, 카톡, 병원 안내문, 고지서 내용을 붙여넣으면 AI가 쉬운 말로 설명하고, 해야 할 일과 사기/위험 여부를 큰 글씨로 알려준다.

## Product Thesis

이 앱은 "AI를 잘 쓰게 해주는 앱"이 아니라 "AI를 직접 쓰기 어려운 사람이 AI 도움을 안전하게 받게 해주는 앱"이다.

60대 이상 사용자는 프롬프트 입력, 긴 답변, 전문용어, 개인정보 노출, 사기 링크 판단에서 부담을 느낀다. 따라서 첫 화면은 자유 입력형 챗봇이 아니라 생활 상황별 버튼과 큰 글씨 결과로 구성한다.

## Target User

- 60대 이상 부모 세대
- 스마트폰은 쓰지만 AI 앱 사용은 부담스러운 사람
- 문자, 카톡, 고지서, 병원 안내문을 보고 "이게 무슨 뜻인지" 확인하고 싶은 사람
- 자녀에게 매번 물어보기 미안하지만 혼자 판단하기 불안한 사람

## Core Job

```text
받은 문장이나 안내문을 붙여넣으면,
쉬운 말로 무슨 뜻인지 알려주고,
내가 해야 할 일과 조심할 점을 바로 보여준다.
```

## First MVP

첫 MVP는 세 가지 기능만 포함한다.

| 기능 | 입력 | 출력 |
|---|---|---|
| 사기 문자 확인 | 문자/카톡 내용 | 위험도, 누르면 안 되는 링크/전화, 안전 행동 |
| 안내문 쉽게 설명 | 병원/공공기관/고지서 안내문 | 쉬운말 요약, 해야 할 일, 기한 |
| 안전 답장 만들기 | 상대방 메시지와 원하는 톤 | 짧고 공손한 답장 초안 |

## First Screen

첫 화면은 아래 네 영역으로 구성한다.

1. 큰 제목: `무엇을 도와드릴까요?`
2. 상황 버튼:
   - `사기 문자인지 확인`
   - `안내문 쉽게 설명`
   - `답장 문장 만들기`
3. 붙여넣기 입력창:
   - placeholder: `문자나 안내문 내용을 여기에 붙여넣으세요`
4. 큰 실행 버튼:
   - `쉽게 설명해줘`

## Result Format

결과는 긴 AI 답변이 아니라 항상 같은 구조로 보여준다.

```text
쉽게 말하면
병원 예약 시간이 바뀌었다는 안내입니다.

해야 할 일
병원 대표번호로 직접 전화해서 예약 시간을 확인하세요.

주의할 점
문자 안의 링크는 누르지 마세요.
```

## Safety Rules

- 금융정보, 주민등록번호, 비밀번호, 인증번호는 입력하지 말라고 안내한다.
- 링크 클릭 여부는 보수적으로 판단한다.
- 위험하거나 애매하면 `가족에게 확인하기`를 권한다.
- 병원/은행/정부기관은 문자 속 번호가 아니라 공식 대표번호로 확인하라고 안내한다.
- AI 답변은 최종 판단이 아니라 1차 설명과 확인 가이드로 표현한다.

## Data Model Draft

`Lua_template`의 Supabase auth, Drizzle, RLS 구조를 재사용한다.

| Table | Purpose |
|---|---|
| `profiles` | template 기본 사용자 프로필 |
| `helper_requests` | 사용자가 붙여넣은 요청의 요약 메타데이터 |
| `helper_results` | AI 설명 결과, 위험도, 사용자 선택 |

초기 MVP에서는 원문 저장을 기본값으로 하지 않는다. 저장 기능을 켤 경우 사용자가 명시적으로 `기록 저장`을 선택해야 한다.

## Auth Boundary

첫 진입은 로그인 없이 사용 가능하게 설계한다.

로그인이 필요한 기능:

- 이전 결과 다시 보기
- 가족 보호 모드
- 자주 쓰는 답장 톤 저장
- 부모/자녀 연결 기능

## MVP Exclusions

- 실제 금융기관 API 연동
- 문자 자동 읽기
- 연락처 자동 접근
- 병원/정부기관 실시간 대표번호 검색
- 가족에게 자동 전송
- Toss 실제 배포

## Build Target

`Lua_template` 기반 실제 앱으로 옮길 때의 매핑:

| Product part | Template target |
|---|---|
| Home screen | `app/features/easy-ai-helper/screens/home.tsx` |
| Analysis action | `app/features/easy-ai-helper/api/analyze.tsx` |
| Constants | `app/features/easy-ai-helper/constants.ts` |
| Schema | `app/features/easy-ai-helper/schema.ts` |
| Queries | `app/features/easy-ai-helper/queries.ts` |
| E2E | `e2e/easy-ai-helper/analyze.spec.ts` |

## Open Questions

- 첫 MVP에서 AI API를 실제로 붙일지, 규칙 기반 mock analyzer로 먼저 검증할지?
- 결과 저장을 기본 off로 둘지, 로그인 사용자에게만 저장할지?
- 자녀에게 확인 요청 기능을 MVP에 포함할지 다음 버전으로 미룰지?

## Next Action

다음 command는 실제 구현 전 한 단계 더 좁힌다.

```text
/lua design screen :: 쉬운말 AI 도우미 미니앱의 첫 화면과 결과 화면을 60대 이상 사용자가 읽기 쉬운 큰 글씨 UI로 설계해줘.
```

## Navigation

- [[01_Command Center/Command Runs/easy-ai-helper-20260516-01-build-app|Command Run]]
- [[09_Automations/App Template Standard|App Template Standard]]
- [[02_Projects/Lucia/Lua Command UI|Lua Command UI]]
- [[02_Projects/Projects Hub|Projects Hub]]
