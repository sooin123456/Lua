---
type: inbox
status: triaged
source: manual
last_updated: 2026-05-16
---

# AI 분류 대기중

## Capture Log

| ID | Created | Source | Status | Raw Capture |
|---|---|---|---|---|
| cap-20260516121950 | 2026-05-16 12:19:50 KST | manual | test | 테스트 캡처: Inbox 날짜 자동 기록 확인 |
| cap-20260515-manual-001 | 2026-05-15 KST | manual | promoted | 카파시 인터뷰 기반 신경망 UI/AI 앱 아이디어 |
| cap-20260515-manual-002 | 2026-05-15 KST | meeting | promoted | 수상태양광 미팅 후 K-water, 협력사, 경쟁사, 테크인 조사 필요 |

## Original Capture

카파시의 인터뷰를 보면 앞으로는 매 순간 신경망이 그려내는 화면  
미리 짜둔 화면이 아니고 코드가 사라지고 신경망이 거의 모든일을 하는 형태  
그렇다면 내가 앞으로 새로운 사업 아이템 신규 사업들을 얘기할때는 이런 형태를 염두해두고 하나씩 만들어 보는게 좋을듯 예를 들어서 toss 미니앱 같은 경우

그리고 수상태양광 관련해서 오늘 미팅을 진행함  
K water 발주 사이즈  
우리가 협력할수있는 업체들  
우리 경쟁사들에 대한 조사가 필요할듯  
제일 중요한건 테크인에 대한 조사가 필요할듯

## Triage Result

| 분류 | 이동/연결 위치 | 다음 행동 |
|---|---|---|
| AI 앱/사업 아이디어 | [[06_Personal Studio/AI Studio/Neural UI Business Ideas]] | 작은 AI 앱 후보 3개 도출 |
| 수상태양광 리서치 | [[03_Operation/Industry Intelligence/Floating Solar Research]] | K-water, 협력사, 경쟁사, 테크인 조사 |

## Command

`/inbox-triage`

## Command Promotion

| ID | Domain | Intent | Payload |
|---|---|---|---|
| inbox-20260516-031554-01 | build | app | 카파시의 인터뷰를 보면 앞으로는 매 순간 신경망이 그려내는 화면 미리 짜둔 화면이 아니고 코드가 사라지고 신경망이 거의 모든일을 하는 형태 그렇다면 내가 앞으로 새로운 사업 아이템 신규 사업들을 얘기할때는 이런 형태를 염두해두고 하나씩 만들어 보는게 좋을듯 예를 들어서 toss 미니앱 같은 경우 |
| inbox-20260516-031554-02 | research | brief | 그리고 수상태양광 관련해서 오늘 미팅을 진행함 K water 발주 사이즈 우리가 협력할수있는 업체들 우리 경쟁사들에 대한 조사가 필요할듯 제일 중요한건 테크인에 대한 조사가 필요할듯 |
