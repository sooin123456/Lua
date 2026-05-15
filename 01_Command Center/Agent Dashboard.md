---
ai-index: true
type: dashboard
area: Command_Center
---

# 🤖 Agent Dashboard

에이전트 실행 지시와 점검 루틴을 한 화면에서 관리한다.

---

## 🔗 Core Links

- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/Weekly Review|Weekly Review]]
- [[02_Projects/KIEREMS/RTU Development/Home|RTU Development Home]]
- [[02_Projects/KIEREMS/RTU Development/Backlog|RTU Backlog]]
- [[02_Projects/KIEREMS/RTU Development/DevLog|RTU DevLog]]
- [[00_Inbox/Telegram_Capture_20260427_1122|Latest Telegram Capture]]
- [[02_Projects/Projects Hub|Projects Hub]]
- [[03_Operation/Operation Hub|Operation Hub]]
- [[03_Operation/Paperclip/Paperclip Home|Paperclip Home]]
- [[03_Operation/Paperclip/Paperclip Runbook|Paperclip Runbook]]
- [[04_Resources/Resources Hub|Resources Hub]]
- [[99_Templates/Templates Hub|Templates Hub]]

---

## ✅ Today Runbook

- [ ] Inbox 신규 건 확인: [[01_Command Center/Master Dashboard|Master Dashboard]]
- [ ] Urgent P0 상태 점검: `/status-check kgct_green_building_home`
- [ ] RTU blocker 점검: `/status-check kierems_rtu_home`
- [ ] 결과 반영 후 Git 커밋

---

## 🎯 Quick Commands

```claw
/summarize project RTU Development
/status-check kierems_rtu_home
/status-check kgct_green_building_home
/summarize week
```

---

## 📲 Telegram Command Format

- `/urgent <내용>` -> P0 즉시 처리
- `/todo <내용>` -> P1 실행 항목
- `/status-check <프로젝트>` -> P1 상태 점검
- `/summarize <대상>` -> P2 요약 요청
- `/connect <A> + <B>` -> P2 연결 제안

---

## 📨 Telegram Command Queue

<!-- AUTO-COMMAND-START -->
- [ ] (telegram 명령 대기중)
<!-- AUTO-COMMAND-END -->

---

## 📌 Active Focus

- 회사 우선순위: `P0(KOLAS 장비, RTU 공급망)` 먼저 처리
- 개인 우선순위: [[06_Personal Studio/Daily Notes|Daily Notes]] 작성 후 프로젝트 로그 연결
- 운영 원칙: 새 요청은 `00_Inbox`로 캡처 후 분류

---

## 🧾 End-of-Day Checklist

- [ ] Master Dashboard `Urgent List` 업데이트
- [ ] RTU DevLog 갱신
- [ ] Weekly Review 초안 업데이트
