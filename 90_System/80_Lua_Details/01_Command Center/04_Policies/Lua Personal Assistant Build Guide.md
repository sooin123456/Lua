---
type: operating-guide
status: active
last_updated: 2026-08-01
---

# Lua Personal Assistant Build Guide

## 목적

Lua는 Telegram을 24시간 명령 입구로 사용하고, Claude와 Codex를 적절히 배분하며, Obsidian을 장기 기억과 기록 창고로 사용하는 개인 비서다.

## 핵심 원칙

- Telegram은 명령을 내리고 결과와 승인 요청을 받는 곳이다.
- Railway는 항상 켜져 있는 Lua Cloud Main을 실행한다.
- Supabase는 명령, 상태, 결과, 로그를 보관한다.
- Obsidian은 지식, 결정, 프로젝트 맥락, 완료 기록을 보관한다.
- Claude는 분석, 계획, 글쓰기, 요약을 담당한다.
- Codex는 코드, 파일 수정, 테스트, 자동화, 검증을 담당한다.
- Lua는 요청을 분류하고 적절한 agent에 넘기며 결과를 다시 Telegram으로 보고한다.
- 외부 전송, 배포, 삭제, 결제, 계정 변경은 사용자 승인 없이 실행하지 않는다.

## 현재 상태

- [x] Telegram bot `@Lua_mainbot` 연결
- [x] Railway 상시 실행 서비스 배포
- [x] Telegram webhook 보호
- [x] 사용자 Telegram chat allowlist 적용
- [x] 일반 문장을 todo로 저장하고 즉시 응답
- [x] `/lua status`, `/lua todo`, `/lua next` 기본 명령 처리
- [x] 자연어 요청 의도 분류
- [ ] Claude 실행 연결 (API 또는 실행 endpoint 권한 필요)
- [x] Codex handoff 연결
- [x] 승인 버튼과 승인 대기열
- [ ] Obsidian 기억 검색과 결과 기록
- [ ] 능동형 브리핑과 리마인더

## 목표 흐름

```text
사용자 Telegram 명령
→ Railway Lua Cloud Main
→ 요청 분류와 위험도 판정
→ Claude 또는 Codex에 작업 배정
→ 실행 결과 검증
→ Telegram 결과 보고
→ Supabase 작업 상태 저장
→ 필요한 결과만 Obsidian에 장기 기록
```

## Telegram 명령

| 명령 | 목적 | 현재/목표 처리 |
|---|---|---|
| 일반 문장 | 빠른 할 일 입력 | todo 저장 |
| `/lua status` | Lua 상태 확인 | 현재 지원 |
| `/lua todo {내용}` | 할 일 등록 | 현재 지원 |
| `/lua next` | 다음 행동 추천 | 현재 지원 |
| `/lua ask {질문}` | 질문, 분석, 요약 | Claude로 전달 예정 |
| `/lua do {작업}` | 실제 작업 수행 | 자동 라우팅 예정 |
| `/lua tasks` | 진행 중 작업 확인 | 작업 상태 조회 예정 |
| `/lua approve {id}` | 승인 대기 작업 승인 | 승인 시스템 예정 |
| `/lua reject {id}` | 작업 거절 | 승인 시스템 예정 |
| `/lua remember {내용}` | 장기 기억 요청 | Obsidian 기록 예정 |

## Agent 배분 규칙

| 요청 유형 | 담당 | 예시 |
|---|---|---|
| 계획, 판단, 비교, 요약 | Claude | 이번 주 우선순위 정리 |
| 문서, 제안서, 외부 글 초안 | Claude | 사업계획서 목차 작성 |
| 코드, 파일, 테스트, 저장소 작업 | Codex | 오류 수정 후 테스트 |
| 자동화, 배포 준비, 검증 | Codex | Railway 설정 점검 |
| 복합 작업 | Claude → Codex | Claude가 작업 명세 작성 후 Codex가 구현 |
| 단순 기록과 상태 조회 | Lua Cloud Main | todo 저장, 상태 응답 |

Lua는 Kimi, Grok 또는 다른 agent를 자동 선택하지 않는다. 새 agent를 추가하려면 사용자가 먼저 역할과 권한을 승인해야 한다.

## 승인 규칙

| 등급 | 처리 | 예시 |
|---|---|---|
| Auto | 바로 실행 | 조회, 요약, 초안, 개인 기록 |
| Ask first | Telegram 승인 후 실행 | 파일 수정, Git commit, 배포, GitHub push |
| Explicit approval | 정확한 행동을 확인한 뒤 실행 | 외부 메시지, 공개 게시, 삭제, 결제, 계정 변경 |

승인이 필요한 작업은 실행하지 않고 다음 정보를 Telegram으로 보낸다.

1. 무엇을 하려는지
2. 어떤 데이터나 서비스가 바뀌는지
3. 예상 결과와 위험
4. `승인` 또는 `거절` 버튼

## 작업 상태

모든 실행 요청은 다음 상태 중 하나를 가진다.

```text
captured → classified → awaiting_approval → running → completed
                                               └→ failed
```

- `captured`: Telegram에서 접수됨
- `classified`: 담당 agent와 위험도가 정해짐
- `awaiting_approval`: 사용자 승인을 기다림
- `running`: agent가 실행 중
- `completed`: 결과 검증과 보고 완료
- `failed`: 실패 원인과 재시도 방법 기록

## Obsidian 기록 규칙

모든 대화를 Obsidian에 복사하지 않는다. 다음 내용만 장기 기록한다.

- 사용자가 명시적으로 기억하라고 한 내용
- 프로젝트의 중요한 결정과 이유
- 재사용할 수 있는 조사, 문서, 코드 결과
- 완료된 작업의 결과와 다음 행동
- 시스템 구성과 운영 규칙 변경

임시 대화, 단순 상태 조회, 비밀키, 토큰, 인증 정보는 기록하지 않는다.

## 구현 순서

### 1. 자연어 라우터

- 일반 문장을 `ask`, `do`, `todo`, `remember`로 분류한다.
- 담당을 `claude`, `codex`, `lua` 중 하나로 정한다.
- 위험도를 `auto`, `ask_first`, `explicit_approval`로 판정한다.

완료 기준: 동일한 입력을 반복했을 때 담당과 승인 등급이 일관되게 나온다. **완료: 2026-08-01**

### 2. Codex 실행 연결

- `/lua do` 요청을 Codex 작업 대기열에 넣는다.
- 저장소와 작업 범위를 명시한다.
- 테스트 결과와 변경 파일을 Telegram으로 보고한다.

완료 기준: Telegram에서 요청한 작은 저장소 작업이 Codex에서 실행되고 결과가 돌아온다. 승인된 작업은 `npm run cloud:codex:next`로 handoff note를 만들고 Codex가 처리한다.

### 3. Claude 실행 연결

- `/lua ask` 요청을 Claude에 전달한다.
- 필요한 Obsidian 맥락만 선별해 제공한다.
- 답변과 후속 행동을 Telegram으로 돌려준다.

완료 기준: Telegram 질문에 Claude가 프로젝트 맥락을 반영해 답한다.

### 4. 승인 시스템

- 승인 대기 작업에 고유 ID를 부여한다.
- Telegram 인라인 버튼으로 승인과 거절을 처리한다.
- 승인 전에는 외부 상태를 변경하지 않는다.

완료 기준: 배포 요청이 승인 전에는 멈추고 승인 후에만 실행된다. **완료: 2026-08-01**

### 5. Obsidian 기억 연결

- 관련 노트를 검색해 필요한 부분만 agent에 제공한다.
- 완료 결과를 올바른 프로젝트와 Work Ledger에 기록한다.
- Identity와 `_System` 보호 규칙을 유지한다.

완료 기준: Lua가 이전 결정은 기억하지만 불필요한 vault 전체를 agent에 보내지 않는다.

### 6. 능동형 비서

- 아침 브리핑
- 미완료 작업 알림
- 주간 리뷰
- 프로젝트 상태 요약
- 실패와 비용 이상 알림

완료 기준: 사용자가 요청하지 않아도 정해진 시간에 유용한 보고를 보내며, 전송 빈도와 중단 방법을 사용자가 통제한다.

## 운영 점검

- Railway `/health`가 정상인지 확인한다.
- Telegram webhook 오류와 대기 업데이트를 확인한다.
- Supabase 명령 상태가 멈춰 있지 않은지 확인한다.
- 실패 작업은 원인과 재시도 여부를 남긴다.
- API 비용과 호출량에 일일 상한을 둔다.
- 비밀키와 개인정보를 로그, Git, Obsidian에 남기지 않는다.

## 바로 다음 작업

Claude 실행 endpoint를 연결한다. Claude API 키 또는 사용자가 승인한 실행 endpoint를 Railway에 넣은 뒤, `/lua ask` 작업을 실제 Claude 호출로 바꾼다.

## 관련 문서

- [[90_System/80_Lua_Details/01_Command Center/04_Policies/Lua Usage Guide|Lua Usage Guide]]
- [[90_System/80_Lua_Details/01_Command Center/01_Commands/Command Modes|Command Modes]]
- [[90_System/80_Lua_Details/01_Command Center/01_Commands/Harness Loop|Harness Loop]]
- [[90_System/09_Automations/Telegram Command Inbox|Telegram Command Inbox]]
- [[90_System/07_Lua_System/runtime/Approval Policy Profiles|Approval Policy Profiles]]
