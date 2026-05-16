---
type: notion-publish-queue
status: active
last_updated: 2026-05-16
---

# Notion Publish Queue

Obsidian 원본에서 Notion으로 보낼 팀 공유 초안을 모은다.

## Draft Queue

<!-- notion-publish
id: k-water-수상태양광-research-brief-2026-05-16
status: draft
target: Research Briefs
source: 04_Resources/Energy Policies/K-water 수상태양광 Research Brief.md
-->
### K-water 수상태양광 Research Brief

| Field | Value |
|---|---|
| Status | draft |
| Target | Research Briefs missing; fallback Lua_Home child page |
| Source | [[04_Resources/Energy Policies/K-water 수상태양광 Research Brief|Obsidian source]] |
| Parent | https://www.notion.so/8cbeb124ae5f839e8c3d010d23a1c7d0 |
| Last updated | 2026-05-16 |

Changed:
- K-water 수상태양광은 단기 단발 프로젝트가 아니라 2030년 재생에너지 확대 전략의 핵심 축으로 보인다. 2026년 5월 보도 기준 K-water는 2030년까지 재생에너지 10GW, 그중 수상태양광 6.5GW를 목표로 언급했다. 기존 설비는 합천댐, 보령댐, 충주댐, 소양강댐 등 다목적댐 수면을 중심으로 확대되어 왔다.

Decision needed:
- Notion에 이 초안을 발행할지 승인해야 합니다.

Blocker:
- 전용 Notion DB가 아직 없으면 `Lua_Home child page`로 먼저 발행합니다.

Next:
- K-water 사전정보공개 XLSX를 내려받아 설비명, 위치, 용량, 준공시점 표로 정리한다.
- 나라장터/공공조달에서 `수상태양광`, `K-water`, `한국수자원공사`, `부유체`, `계류` 키워드 입찰/낙찰 이력을 확인한다.
- 스코트라, ETI E&C, `(주)테크윈`, 테크윈에너지, 한화 Qcells의 국내 수상태양광 실적을 분리한다.
- 테크윈/테크윈에너지를 경쟁사, 협력사, EPC 후보 중 어느 위치로 볼지 입찰 실적 기준으로 재분류한다.
- 다음 회의용으로 `발주 규모 / 주요 업체 / 경쟁사 / 테크윈 확인사항` 1페이지 표를 만든다.
<!-- /notion-publish -->

## Rules

- Obsidian이 원본이고 Notion은 팀 공유용 정리본이다.
- 승인 전에는 Notion에 쓰지 않는다.
- Identity, raw prompts, secrets는 발행하지 않는다.
- Notion 행/페이지는 자동 삭제하지 않는다.

## Navigation

- [[09_Automations/Notion Sync|Notion Sync]]
- [[09_Automations/Notion Workspace Plan|Notion Workspace Plan]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[01_Command Center/Work Ledger|Work Ledger]]
