---
ai-index: true
type: dashboard
---

# 🎯 Master Dashboard

CTO 중앙 관제탑. 모든 프로젝트 현황과 AI 명령을 한눈에 본다.

---

## 🏢 Company Projects

| 프로젝트        | 하위프로젝트                                                     | 상태  | AI 명령                                    |
| ----------- | ---------------------------------------------------------- | --- | ---------------------------------------- |
| **CxEMS**   | [[02_Projects/CxEMS/CxEMS SaaS/Home\|Home]]                | 🟡  | `/status-check cxems_saas_home`          |
| **CxEMS**   | [[02_Projects/CxEMS/Smart Meter/Home\|Home]]               | 🟡  | `/status-check cxems_smart_meter_home`   |
| **KGCT**    | [[02_Projects/KGCT/Green Building/Home\|Home]]             | 🟡  | `/status-check kgct_green_building_home` |
| **KIEREMS** | [[02_Projects/KIEREMS/RTU Development/Home\|Home]]         | 🟡  | `/status-check kierems_rtu_home`         |
| **KIEREMS** | [[02_Projects/KIEREMS/VPP Development/Home\|Home]]         | 🟡  | `/status-check kierems_vpp_home`         |
| **Lucia**   | [[02_Projects/Lucia/AI Carbon Data Management/Home\|Home]] | 🟡  | `/status-check lucia_ai_carbon_home`     |
| **Lucia**   | [[02_Projects/Lucia/Blockchain/Home\|Home]]                | 🟡  | `/status-check lucia_blockchain_home`    |
| **Lucia**   | [[02_Projects/Lucia/ESG Data Crawling/Home\|Home]]         | 🟡  | `/status-check lucia_esg_crawling_home`  |
| **KGCT**    | [[02_Projects/KGCT/THEKIE Homepage/Home\|Home]]            | 🟡  | `/status-check kgct_THEKIE Homepage`     |

> 🟡 = 진행중 / 🟢 = 정상 / 🔴 = 블로커 있음 / ⚪ = 대기

---

## 👤 Personal Projects

| 프로젝트 | 상태 | AI 명령 |
|----------|------|---------|
| **AI Studio** | 🟡 | `/status-check AI Studio` |
| **CS50** | 🟡 | `/status-check CS50` |
| **Hacking** | 🟡 | `/status-check Hacking` |
| **Multi-Agent Trading** | 🟡 | `/status-check Multi-Agent Trading` |


---

## 📥 Inbox 처리 큐

<!-- AUTO-INBOX-START -->
- [ ] [[00_Inbox/Telegram_Capture_20260427_1122|Telegram_Capture_20260427_1122]] - `source: telegram`
- [ ] (다음 telegram 캡처 대기중)
<!-- AUTO-INBOX-END -->

---

## 🚨 Urgent List

| 우선순위 | 내용  | 프로젝트 | Blocker | Deadline   |
| ---- | --- | ---- | ------- | ---------- |
| P0   | KOLAS 시험장비 구매 확정 | KGCT / Green Building | 장비 미구매로 인증 일정 리스크 | 2026-05-15 |
| P0   | RTU 핵심 부품 조달 플랜 확정 | KIEREMS / RTU Development | 부품 공급망 지연 | 2026-05-20 |
| P1   | GX-PASS 인력편성 완료 | KGCT / Green Building | 인력편성 미완료 | 2026-05-30 |
| P1   | CBAM 대응 검인증 포맷 동결 | KGCT / Green Building | 포맷 확정 지연 | 2026-06-15 |

---

## 🤖 AI Claw Command Terminal

이 구역에 명령을 적고 저장 → Git push → AI가 응답

```claw
/status-check lucia_ai_carbon_home
/summarize project cxems_saas_home
/status-check kgct_green_building_home
/status-check kierems_rtu_home
```

### 실행 대기열 (Urgent 연동)

- [ ] `/status-check kgct_green_building_home` (KOLAS 장비 구매 리스크 재확인)
- [ ] `/status-check kierems_rtu_home` (RTU 부품 공급망 지연 추적)
- [ ] `/search GX-PASS 인력편성` (인력편성 완료 근거 수집)
- [ ] `/summarize project Green Building` (CBAM 검인증 포맷 동결 이슈 요약)

---

## ⚙️ 시스템 상태

- Vault 마지막 점검: 2026-04-27
- MCP 연결 상태: obsidian 서버 등록 완료 (API 키 반영)
- Git 상태: 수동 커밋 대기
- Urgent List 반영 상태: 최신 동기화 완료

---

## 📝 Today Log

- [x] Master Dashboard 표/코드블록 문법 정리
- [x] Urgent List를 프로젝트 Home 기준으로 업데이트
- [x] AI Claw 실행 대기열을 Urgent 연동으로 재구성
- [x] 오늘 변경분 커밋 및 푸시