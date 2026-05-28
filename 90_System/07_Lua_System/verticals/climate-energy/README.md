---
type: vertical-readme
vertical: climate-energy
company: 1
domain: 에너지 모니터링·기후테크·탄소 사업
---

# climate-energy vertical

회사 1 도메인 — 에너지 모니터링, 기후테크, 탄소 사업의 R&D·IP·운영 skill 모음.

## Domain context

- 한국 정부 R&D 과제: KEIT, KIAT, KETEP, 한국기후기술원 등 공고·양식 주기가 있다.
- 특허: KIPRIS 중심 조사, 변리사 최종 검토 전제.
- 탄소 MRV: 측정·보고·검증 1차 자료 우선.
- 산업 동향: VPP, ESS, EMS, DR, 탄소중립 정책과 연계해 읽는다.

## Skills

- `[proposal-drafting](skills/proposal-drafting/SKILL.md)` — 정부 R&D 과제 작성 (KEIT/KIAT/기후기술원 양식 분기)
- `[patent-filing](skills/patent-filing/SKILL.md)` — 특허 명세서 작성 (청구항·도면 설명 포함)
- `carbon-mrv` — 탄소 측정·검증·보고 (Phase 4)
- `industry-scan-energy` — 에너지 산업 동향 모니터링 (Phase 4)

## Commands

Phase 4 예정:

- `/proposal {grant-program}` — 양식 선택 + 초안
- `/patent-draft {invention-title}` — 특허 명세서 골격
- `/carbon-mrv {scope}` — MRV 보고서

## MCP connectors

이 폴더의 [`.mcp.json`](.mcp.json)은 `_core`의 obsidian·notion을 상속하는 관례를 두고, Phase 4에 NTIS·KIPRIS 등을 추가한다.

## Used by

- Generic: Lens(산업·선행조사), Scribe(제안서·명세서 본문), Forge(예산표·스크립트, Phase 4 연동)
- Phase 4 workflow: Proposal Agent, Patent Agent, Industry Intel Agent

## Domain principles

- 정부 양식은 자주 바뀐다. `assets/*-template.md`와 `references/grant-programs.md`의 `last_verified`를 분기마다 갱신한다.
- 특허 명세서는 변리사 final check 전제이며 auto-publish는 금지다.
- 탄소 데이터는 1차 자료·측정 로그를 우선하고 벤더 추정 단독 인용은 피한다.
