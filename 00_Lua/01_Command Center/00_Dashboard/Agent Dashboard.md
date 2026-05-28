---
ai-index: true
type: dashboard
area: Command_Center
last_updated: 2026-05-28
---

# 🤖 Agent Dashboard

에이전트 실행 지시와 점검 루틴을 한 화면에서 관리한다.

---

## 🔗 Core Links

- [[00_Lua/01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]]
- [[00_Lua/01_Command Center/01_Commands/Obsidian Command Center|Obsidian Command Center]]
- [[00_Lua/01_Command Center/04_Policies/Lua Usage Guide|Lua Usage Guide]]
- [[00_Lua/01_Command Center/03_Summaries/Weekly Review|Weekly Review]]
- [[00_Lua/02_Projects/KIEREMS/RTU Development/Home|RTU Development Home]]
- [[00_Lua/02_Projects/KIEREMS/RTU Development/Backlog|RTU Backlog]]
- [[00_Lua/02_Projects/KIEREMS/RTU Development/DevLog|RTU DevLog]]
- [[00_Lua/00_Inbox/AI 분류 대기중...|Current Inbox]]
- [[00_Lua/02_Projects/Projects Hub|Projects Hub]]
- [[00_Lua/03_Operation/Operation Hub|Operation Hub]]
- [[00_Lua/03_Operation/Paperclip/Paperclip Home|Paperclip Home]]
- [[00_Lua/03_Operation/Paperclip/Paperclip Runbook|Paperclip Runbook]]
- [[00_Lua/04_Resources/Resources Hub|Resources Hub]]
- [[Lua-v4-operating-architecture|Lua v4 Architecture]]
- [[00_Lua/01_Command Center/03_Summaries/Work Ledger|Work Ledger]]
- [[90_System/08_Artifacts/Artifact Ledger|Artifact Ledger]]
- [[90_System/09_Automations/README|Automations]]
- [[90_System/09_Automations/Telegram Command Inbox|Telegram Command Inbox]]
- [[00_Lua/03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[00_Lua/03_Operation/Team Brief Drafts|Team Brief Drafts]]
- [[90_System/99_Templates/Templates Hub|Templates Hub]]

---

## ✅ Today Runbook

- [ ] Inbox 신규 건 확인: [[00_Lua/01_Command Center/00_Dashboard/Master Dashboard|Master Dashboard]]
- [ ] Urgent P0 상태 점검: `/status-check kgct_green_building_home`
- [ ] RTU blocker 점검: `/status-check kierems_rtu_home`
- [ ] 결과 반영 후 Git 커밋

---

## 🎯 Quick Commands

여기에 적힌 `/command`는 Obsidian 안에서 자동 실행되지 않는다. 실행은 Codex, Claude, Pi 중 맞는 도구에서 하고, 결과는 관련 프로젝트 노트와 [[00_Lua/01_Command Center/03_Summaries/Work Ledger|Work Ledger]]에 남긴다.

도메인별 명령은 [[00_Lua/01_Command Center/01_Commands/Obsidian Command Center|Obsidian Command Center]]에 `/lua {domain} {intent} :: {payload}` 형식으로 적는다.

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

- `/lua inbox <내용>` -> 생각/메모 capture
- `/lua todo <내용>` -> 실행 항목 후보
- `/lua status <프로젝트>` -> 상태 점검
- `/lua research brief :: <내용>` -> 조사 브리프 후보
- `/lua build app :: <내용>` -> 앱/기능 구현 후보

Local queue test:

```bash
npm run telegram:queue -- "/lua status Lua"
```

---

## 📨 Telegram Command Queue

Telegram 명령의 canonical queue는 [[90_System/09_Automations/Telegram Command Inbox|Telegram Command Inbox]]다.

---

## 📌 Active Focus

- 회사 우선순위: `P0(KOLAS 장비, RTU 공급망)` 먼저 처리
- 개인 우선순위: [[00_Lua/05_Personal Studio/Daily Notes|Daily Notes]] 작성 후 프로젝트 로그 연결
- 운영 원칙: 새 요청은 `00_Lua/00_Inbox`로 캡처 후 분류

---

## 🧾 End-of-Day Checklist

- [ ] Master Dashboard `Urgent List` 업데이트
- [ ] RTU DevLog 갱신
- [ ] Weekly Review 초안 업데이트
