---
id: master-dashboard-001
type: dashboard
area: Command_Center
project: Master_Control
tags: [dashboard, claw, command-center]
ai-index: true
status: evergreen
created: 2026-04-23
modified: 2026-04-23
source: 내부설계
claw-reviewed: true
---

# 🎯 Command Center — Master Dashboard

> 이 파일은 네 Second Brain의 **중앙 관제탑**이다.  
> OpenClaw는 이 파일을 우선적으로 읽고, 여기에 명령을 기록하면 즉시 실행한다.

---

## 🗺️ 현재 프로젝트 전장 (02_Projects)

| 프로젝트 | 상태 | 최근 업데이트 | 다음 행동 | AI 명령 |
|----------|------|---------------|-----------|---------|
| [[Lucia]] | 🟡 진행 | | | `/summarize project Lucia` |
| [[KGCT]] | 🟡 진행 | | | `/summarize project KGCT` |
| [[KIEREMS]] | 🟡 진행 | | | `/summarize project KIEREMS` |
| [[CxEMS]] | 🟡 진행 | | | `/summarize project CxEMS` |
| [[GX-PASS]] | 🔴 준비 | | | `/execute Project Dashboard` |
| [[H Energy]] | 🔴 준비 | | | `/execute Project Dashboard` |

---

## 📥 Inbox 처리 큐 (00_Inbox)

- [ ] 아이디어 1: 
- [ ] 아이디어 2: 
- [ ] 아이디어 3: 

> **AI Claw 처리 규칙:** 00_Inbox의 `status: seedling` 노트는 매일 09:00에 자동 요약 후 `budding`으로 제안.

---

## 🔗 최근 AI 연결 제안 (Claw Reviewed)

> 아래는 AI가 발굴한 숨은 연결점이다. 수락하면 해당 노트에 `claw-reviewed: true`로 변경하라.

| 제안일 | 연결 A | 연결 B | AI 코멘트 | 수락 |
|--------|--------|--------|-----------|------|
| | | | | [ ] |

---

## 🧠 AI Claw 명령 터미널

> 이 섹션에 명령어를 적으면, Git Push 후 AI가 응답한다.

### 현재 명령
```claw
/search [키워드]
/summarize [project | week | inbox]
/connect [A] + [B]
/execute [템플릿명]
/status-check [프로젝트명]
```

### 실행 대기열
- [ ] `/summarize week`
- [ ] `/connect BIPV + GX-PASS`
- [ ] `/search KOLAS 인력편성`

---

## 📊 영역별 리소스 현황 (04_Resources)

- [[Energy Policies]]: 개 정책 자료
- [[Tech Stack]]: 개 기술 스택 문서
- [[Idea Incubator]]: 개 부화중 아이디어
- [[Industry Intelligence]]: 개 시장/경쟁 정보

---

## 🎯 OKR 2026 진척도

| Objective | KR | 현재 | 목표 | 상태 |
|-----------|-----|------|------|------|
| 사업 다각화 | 신규 사업 3개 론칭 | 1/3 | 3/3 | 🟡 |
| 플랫폼 완성 | Lucia 상용화 | 60% | 100% | 🟡 |
| 인증 확보 | KOLAS + CBAM 대응 | 30% | 100% | 🔴 |
| R&D 실증 | 베트남 BIPV 실증 | 10% | 100% | 🔴 |

---

## 📝 템플릿 바로가기 (99_Templates)

- [[🧠 아이디어 캡처 템플릿]]
- [[📊 프로젝트 대시보드 템플릿]]
- [[📅 주간 리뷰 템플릿]]
- [[📚 리소스 카드 템플릿]]

---

## ⚙️ 시스템 상태

- **Vault 마지막 동기화:** 
- **Git 상태:** 
- **AI Claw 마지막 응답:** 
- **Inbox 처리율:** %

---

> **프로토콜:** 이 파일은 매일 아침 5분, 저녁 5분을 할애해 갱신한다.  
> AI Claw는 이 파일의 `modified` 날짜를 보고 "오늘 업데이트했는가"를 판단한다.
