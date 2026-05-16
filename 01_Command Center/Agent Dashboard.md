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
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[01_Command Center/Lua Usage Guide|Lua Usage Guide]]
- [[01_Command Center/Weekly Review|Weekly Review]]
- [[02_Projects/KIEREMS/RTU Development/Home|RTU Development Home]]
- [[02_Projects/KIEREMS/RTU Development/Backlog|RTU Backlog]]
- [[02_Projects/KIEREMS/RTU Development/DevLog|RTU DevLog]]
- [[00_Inbox/AI 분류 대기중...|Current Inbox]]
- [[02_Projects/Projects Hub|Projects Hub]]
- [[03_Operation/Operation Hub|Operation Hub]]
- [[03_Operation/Paperclip/Paperclip Home|Paperclip Home]]
- [[03_Operation/Paperclip/Paperclip Runbook|Paperclip Runbook]]
- [[04_Resources/Resources Hub|Resources Hub]]
- [[Lua-v4-operating-architecture|Lua v4 Architecture]]
- [[01_Command Center/Work Ledger|Work Ledger]]
- [[08_Artifacts/Artifact Ledger|Artifact Ledger]]
- [[09_Automations/README|Automations]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[03_Operation/Team Brief Drafts|Team Brief Drafts]]
- [[99_Templates/Templates Hub|Templates Hub]]

---

## ✅ Today Runbook

- [ ] Inbox 신규 건 확인: [[01_Command Center/Master Dashboard|Master Dashboard]]
- [ ] Urgent P0 상태 점검: `/status-check kgct_green_building_home`
- [ ] RTU blocker 점검: `/status-check kierems_rtu_home`
- [ ] 결과 반영 후 Git 커밋

---

## 🎯 Quick Commands

여기에 적힌 `/command`는 Obsidian 안에서 자동 실행되지 않는다. 실행은 Codex, Claude, Pi 중 맞는 도구에서 하고, 결과는 관련 프로젝트 노트와 [[01_Command Center/Work Ledger|Work Ledger]]에 남긴다.

도메인별 명령은 [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]에 `/lua {domain} {intent} :: {payload}` 형식으로 적는다.

```claw
/office-hours neural-ui-business
/project-sprint neural-ui-mini-app first-demo
/team-brief floating-solar-research
/artifact-log neural-ui-experiment
/work-log actual-vault-sync
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
