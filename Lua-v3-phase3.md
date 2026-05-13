---
type: build-spec
phase: 3
target_completion: climate-energy-vertical-and-generic-agents
last_updated: 2026-05-13
prerequisite: Phase 2 완료 (Identity 채워짐 + _core 완성 + Actions 초록)
---

# Lua v3 — Phase 3 Build Specification

> 회사 1의 첫 진짜 ROI가 시작되는 phase. Generic agents 6명도 정식 호출 가능해짐.

## Goal

- `verticals/climate-energy/` vertical 골격 + 첫 두 skill (proposal-drafting + patent-filing)
- `agents/` 폴더 신설 + 6명 generic agent (Atlas/Scribe/Forge/Lens/Vault/Archivist) system prompt
- `scripts/sync_skills.js` — financial-services 패턴의 skill 동기화
- `scripts/check.js` 확장 (agents 검증)

Phase 3가 끝나면:
- 정부 R&D 과제 작성 시 `/proposal-write` 호출 → 양식 자동 선택 → 너의 voice로 초안 생성
- 특허 명세서 작성 시 `/patent-draft` 호출 → 청구항 구조 + 명세서 골격 자동 생성
- Atlas가 새 요청을 받으면 6명 중 적합한 agent로 라우팅
- vertical에서 skill 변경 시 agent bundle 자동 동기화

Phase 4 (다음, 별도 응답):
- `climate-energy/skills/carbon-mrv/` + `industry-scan-energy/`
- `personal-venture/skills/market-validation/`
- 4명 workflow agent (Proposal/Patent/Industry Intel/Validation Agent)
- `managed-agents/<slug>/agent.yaml`
- GitHub Actions cron — `industry-scan.yml`, `weekly-review.yml`, `pr-voice-check.yml`

---

## Build Order — 체크리스트

순서대로. climate-energy vertical 먼저 (도메인 skill), 그 다음 agents 골격.

- [ ] **Step 1** — `verticals/climate-energy/README.md`
- [ ] **Step 2** — `verticals/climate-energy/.mcp.json`
- [ ] **Step 3** — `proposal-drafting/SKILL.md`
- [ ] **Step 4** — `proposal-drafting/references/grant-programs.md`
- [ ] **Step 5** — `proposal-drafting/references/proposal-structure.md`
- [ ] **Step 6** — `proposal-drafting/assets/keit-template.md`
- [ ] **Step 7** — `proposal-drafting/assets/kiat-template.md`
- [ ] **Step 8** — `proposal-drafting/assets/climate-tech-template.md`
- [ ] **Step 9** — `patent-filing/SKILL.md`
- [ ] **Step 10** — `patent-filing/references/patent-structure.md`
- [ ] **Step 11** — `patent-filing/references/prior-art-search.md`
- [ ] **Step 12** — `patent-filing/assets/patent-template.md`
- [ ] **Step 13** — `agents/` 디렉토리 + `agents/README.md`
- [ ] **Step 14** — `agents/atlas/system-prompt.md`
- [ ] **Step 15** — `agents/scribe/system-prompt.md`
- [ ] **Step 16** — `agents/forge/system-prompt.md`
- [ ] **Step 17** — `agents/lens/system-prompt.md`
- [ ] **Step 18** — `agents/vault/system-prompt.md`
- [ ] **Step 19** — `agents/archivist/system-prompt.md`
- [ ] **Step 20** — `scripts/sync_skills.js`
- [ ] **Step 21** — `scripts/check.js` 확장 (agents 검증)

---

## Phase 3 끝났을 때 추가되는 파일들

```
Lua/
├── 07_Lua_System/
│   ├── verticals/
│   │   └── climate-energy/                              [Step 1-12 — new]
│   │       ├── README.md
│   │       ├── .mcp.json
│   │       └── skills/
│   │           ├── proposal-drafting/
│   │           │   ├── SKILL.md
│   │           │   ├── references/
│   │           │   │   ├── grant-programs.md
│   │           │   │   └── proposal-structure.md
│   │           │   └── assets/
│   │           │       ├── keit-template.md
│   │           │       ├── kiat-template.md
│   │           │       └── climate-tech-template.md
│   │           └── patent-filing/
│   │               ├── SKILL.md
│   │               ├── references/
│   │               │   ├── patent-structure.md
│   │               │   └── prior-art-search.md
│   │               └── assets/
│   │                   └── patent-template.md
│   └── agents/                                          [Step 13-19 — new]
│       ├── README.md
│       ├── atlas/
│       │   └── system-prompt.md
│       ├── scribe/
│       │   └── system-prompt.md
│       ├── forge/
│       │   └── system-prompt.md
│       ├── lens/
│       │   └── system-prompt.md
│       ├── vault/
│       │   └── system-prompt.md
│       └── archivist/
│           └── system-prompt.md
└── scripts/
    ├── check.js                                          [Step 21 — extend]
    └── sync_skills.js                                    [Step 20 — new]
```

---

## File Specifications

### Step 1 — verticals/climate-energy/README.md

**위치**: `/07_Lua_System/verticals/climate-energy/README.md`

**목적**: 회사 1 vertical 정체. 어떤 skill 모음인지, 어떤 agent들이 쓰는지.

**Frontmatter**:
```yaml
---
type: vertical-readme
vertical: climate-energy
company: 1
domain: 에너지 모니터링·기후테크·탄소 사업
---
```

**Body 구조**:

1. `# climate-energy vertical`
   - 한 줄: "회사 1 도메인 — 에너지 모니터링, 기후테크, 탄소 사업의 R&D·IP·운영 skill 모음"

2. `## Domain context`
   - 한국 정부 R&D 과제 환경 (KEIT, KIAT, 기후기술원 등)
   - 특허 출원 환경 (KIPRIS, 변리사 협업)
   - 탄소 MRV (Measurement, Reporting, Verification) 컨텍스트
   - 산업 동향 — VPP, ESS, EMS, DR, 탄소중립 정책

3. `## Skills` — 각 skill 한 줄 + link
   - `[proposal-drafting](skills/proposal-drafting/SKILL.md)` — 정부 R&D 과제 작성 (KEIT/KIAT/기후기술원 양식 분기)
   - `[patent-filing](skills/patent-filing/SKILL.md)` — 특허 명세서 작성 (청구항·도면 설명 포함)
   - `carbon-mrv` — 탄소 측정·검증·보고 (Phase 4)
   - `industry-scan-energy` — 에너지 산업 동향 모니터링 (Phase 4)

4. `## Commands` (Phase 4 placeholder):
   - `/proposal {grant-program}` — 양식 선택 + 초안
   - `/patent-draft {invention-title}` — 특허 명세서 골격
   - `/carbon-mrv {scope}` — MRV 보고서

5. `## MCP connectors` — `.mcp.json` 참조
   - obsidian, notion (from _core, inherited)
   - NTIS 정부 R&D 검색 (Phase 4, 있을 경우)
   - KIPRIS 특허 검색 (Phase 4, 있을 경우)

6. `## Used by`
   - Generic agents: Lens (산업 조사), Scribe (제안서 본문), Forge (예산표 자동 생성)
   - Phase 4 workflow agents: Proposal Agent (end-to-end), Patent Agent, Industry Intel Agent

7. `## Domain principles`
   - 정부 양식은 변하니까 양식 파일은 분기마다 검증
   - 특허 명세서는 변리사 final check 전제 (auto-publish 절대 X)
   - 탄소 데이터는 1차 자료만 (벤더 추정치 X)

**Validation**:
- [ ] 7개 섹션 다 있음
- [ ] Skills 4개 list (2개는 Phase 4 placeholder 포함)
- [ ] Domain principles 명시

---

### Step 2 — verticals/climate-energy/.mcp.json

**위치**: `/07_Lua_System/verticals/climate-energy/.mcp.json`

**목적**: 도메인 특화 MCP. _core의 obsidian/notion은 자동 상속, 여기엔 추가 connector만.

**Phase 3 시점 내용** (실제 connector 발견 전까지 minimal):
```json
{
  "mcpServers": {
    "_inherits": "_core",
    "_planned": {
      "ntis": "https://www.ntis.go.kr 정부 R&D 검색 (Phase 4, MCP 가능시)",
      "kipris": "특허 검색 (Phase 4, MCP 가능시)",
      "klimate": "기후기술 데이터 (Phase 4)"
    }
  }
}
```

**현실 체크**: NTIS, KIPRIS는 공식 MCP 서버가 없을 가능성 높음 (2026년 5월 기준). 대안:
- NTIS는 OpenAPI 제공 → 자체 MCP 래퍼 만들기 (Phase 4)
- KIPRIS는 KIPRISPlus OpenAPI → 자체 MCP 래퍼
- 또는 Lens가 web_search로 우회 (immediate, but rate-limited)

**현재는 placeholder만 둠**. Phase 4에서 결정.

**Validation**:
- [ ] valid JSON
- [ ] `_inherits` 명시 (관례)

---

### Step 3 — proposal-drafting/SKILL.md ⭐

**위치**: `/07_Lua_System/verticals/climate-energy/skills/proposal-drafting/SKILL.md`

**목적**: 회사 1의 가장 가치 있는 skill. 정부 R&D 과제 작성을 양식별로 자동화.

**Frontmatter**:
```yaml
---
name: proposal-drafting
description: Draft Korean government R&D proposals (KEIT, KIAT, 기후기술원 등) by selecting the right grant program template, structuring the body, and producing a draft in the user's voice. Triggers on "제안서 작성", "R&D 과제 초안", "정부 과제", "KEIT 양식", "KIAT 양식", "기후기술원", "탄소중립 과제", "proposal", "grant application".
vertical: climate-energy
applies_to: [scribe, atlas, lens]
allowed-tools: [Read, Write, WebFetch, WebSearch]
depends_on:
  - _core/skills/voice-mimicry
  - _core/skills/research-synthesis
---
```

**Body 구조 — 8개 섹션 (anthropics 표준 양식)**:

```markdown
# proposal-drafting

## When this skill activates

정부 R&D 과제 양식 작성 요청. 트리거:
- "[기관명] [공고번호] 과제 초안 만들어줘"
- "KEIT 양식으로 제안서 써줘"
- "탄소중립 과제 본문 구성"

NOT for:
- 민간 투자 제안서 (그건 별도 skill 필요, Phase 5 후보)
- 정책 보고서 (research-synthesis가 더 적합)
- 단순 사실 확인

이 skill은 voice-mimicry와 research-synthesis를 모두 호출함 (depends_on 참조).

## Step 1: Identify grant program

사용자 입력에서 어느 grant program인지 파악:
- KEIT (한국산업기술기획평가원) — 산업부 R&D
- KIAT (한국산업기술진흥원) — 산업부 산하
- KETEP (한국에너지기술평가원) — 에너지 R&D
- 기후기술원 (한국기후기술원) — 기후·환경 R&D
- 기타 (KIST, ETRI 등 직접 출연연)

각 program별 양식은 `assets/{program}-template.md`에. 모르는 program이면 Lens 호출해서 공고문 분석.

## Step 2: Load grant program details

해당 program 양식 파일 + `references/grant-programs.md`에서 세부 정보 로드:
- 양식 헤더 필드 (과제명, 신청기관, 책임자, 수행기간, 사업비)
- 본문 섹션 순서와 분량 제한
- 평가 기준 (기술성/사업성/수행능력)
- 마감일 / 평가 일정

## Step 3: Gather supporting context

사용자에게 묻거나 vault에서 검색:
- 과제 핵심 아이디어 (한 단락)
- 우리 회사의 기존 연구 성과 (`02_Projects/`에서 검색)
- 컨소시엄 / 협력기관 (있다면)
- 예상 사업비 규모
- 차별화 포인트 (왜 우리가 잘할 수 있는지)

부족하면 ONE 질문. 다 안 채워져도 일단 draft 시작 가능.

## Step 4: Structure the body

`references/proposal-structure.md`의 구조 따라:

1. **연구개발 목적·필요성** (1-2 페이지)
   - 시장 / 기술 / 정책 필요성 3축
   - 정량적 근거 (시장 규모, 기술 갭) → Lens 호출

2. **국내외 기술개발 동향** (2-3 페이지)
   - 글로벌 동향 (선도 기업/연구소 3-5개) → Lens 호출
   - 국내 동향 (경쟁사 / 정부 정책)
   - 우리의 위치

3. **연구개발 내용 / 추진방법** (3-5 페이지)
   - 핵심 기술 구성 (3-5개 모듈)
   - 모듈별 개발 목표 / 정량 지표
   - 추진 일정 (월별 또는 분기별)

4. **추진체계** (1 페이지)
   - 주관기관 역할
   - 참여기관 역할 (있다면)
   - 의사결정 체계

5. **기대효과** (1-2 페이지)
   - 기술적 효과 (정량)
   - 경제적 효과 (시장 진입 시나리오)
   - 사회적 효과 (정책 부합성)

6. **사업비 계획** (1 페이지)
   - Forge 호출 → 예산표 자동 생성 (인건비/재료비/연구활동비/간접비 비율)

## Step 5: Apply voice

voice-mimicry skill 호출. 정부 과제 톤은 일반 voice보다 약간 더:
- 격식 있는 평어체 (해라체 OK, 했음/이다 종결)
- 정량 표현 우선 ("향상" X, "30% 향상" O)
- 정책 키워드 자연스럽게 ("탄소중립 2050", "디지털뉴딜" 등 정책 부합)
- 단, 형식 클리셰는 X ("본 연구는...", "본 과제의 의의는..." 같은 wind-up)

`Identity/voice.md`의 안티 예시는 여전히 적용. AI 잡소리, hedging 등.

## Step 6: Self-check before delivering

5개 체크:
1. 평가 기준 3축 (기술성/사업성/수행능력)에 매핑되는가
2. 분량 제한 준수 (각 섹션)
3. 정량 데이터에 모두 출처 있음
4. 정책 키워드 부합 (해당 program이 강조하는 정책)
5. 우리 회사 강점이 명확히 드러남

하나라도 실패하면 해당 섹션 재작성.

## Step 7: Save and signal

- 위치: `02_Projects/{project-name}/proposals/{YYYY-MM-DD}-{program}-{slug}.md`
  또는 새 project면 `03_Operation/Proposals/{YYYY-MM-DD}-{program}-{slug}.md`
- Frontmatter:
  ```yaml
  ---
  type: proposal
  program: KEIT / KIAT / 기후기술원 / ...
  status: draft
  deadline: YYYY-MM-DD
  budget: 
  pages: 
  ---
  ```
- 마지막 줄: "Draft saved at {path}. 양식 검증 + 인용 출처 재확인 필요."

## Never do

- 정량 데이터를 출처 없이 인용
- 마감일·예산 임의 추측
- 양식 분량 초과 (감점 사유)
- 평가 기준에 명시 안 된 자랑
- 정부 정책 부합성을 강제로 끼워맞춤 (역효과)
- 발급 미확정 인증/특허를 "보유" 표현
- 컨소시엄 사실 확인 없이 단정

## References

- `references/grant-programs.md` — 각 program 상세 (마감일, 예산 규모, 평가 가중치)
- `references/proposal-structure.md` — 본문 섹션별 작성 디테일
- `assets/{program}-template.md` — 양식 골격
```

**Validation**:
- [ ] description에 영어 + 한국어 트리거 다 있음
- [ ] depends_on 명시 (voice-mimicry, research-synthesis)
- [ ] 8개 섹션 다 있음
- [ ] Body 500 lines 이하
- [ ] Never do 7개 이상

---

### Step 4 — proposal-drafting/references/grant-programs.md

**위치**: `proposal-drafting/references/grant-programs.md`

**목적**: 각 grant program의 메타 정보. 양식이 바뀌면 여기만 업데이트.

**Frontmatter**:
```yaml
---
type: reference
parent_skill: proposal-drafting
load: on-demand
last_verified: YYYY-MM-DD
---
```

**Body — 사용자가 채울 표 (Phase 3 시점엔 골격만)**:

```markdown
# Grant programs reference

> **중요**: 정부 R&D 과제 양식·정책은 매년 변경. 분기마다 last_verified 갱신.
> 사용자가 실제 작업하는 program 위주로 채움.

## KEIT (한국산업기술기획평가원)

| 항목 | 내용 |
|---|---|
| 관할 부처 | 산업통상자원부 |
| 주요 사업 | 산업기술혁신사업, 소재부품기술개발사업, 한국형 뉴딜 |
| 평가 가중치 | 기술성 40% / 사업성 30% / 수행능력 30% (program별 다름) |
| 양식 분량 | 본문 보통 25-40 페이지 |
| 마감 주기 | 보통 1-2월 / 5-6월 / 9-10월 (program별) |
| 핵심 정책 키워드 | 산업 디지털 전환, 친환경 산업, 소부장 자립화 |
| URL | https://www.keit.re.kr |
| 너의 노트 | [너가 채움 — 작년 경험, 합격 패턴, 평가위원 성향 등] |

## KIAT (한국산업기술진흥원)
[같은 표 양식]

## KETEP (한국에너지기술평가원)
[같은 표 양식]

## 한국기후기술원
[같은 표 양식]

## 기타
- KIST 직접 출연연 사업
- ETRI 협력 R&D
- 지자체 R&D (서울시, 인천시 등)
```

**채우는 팁**:
- 사용자가 실제 신청해본 program부터 채움 (정확한 정보)
- 평가 가중치는 program 공고문에 명시 — 검색해서 인용
- "너의 노트" 칸이 가장 중요 — 실전 경험치 (어떤 표현이 잘 통했는지, 평가위원이 선호하는 구조 등)

**Validation**:
- [ ] 사용자가 실제 신청해본 program 최소 1개 완전히 채워짐
- [ ] last_verified 날짜 명시

---

### Step 5 — proposal-drafting/references/proposal-structure.md

**위치**: `proposal-drafting/references/proposal-structure.md`

**Frontmatter** (Step 4와 동일 양식)

**Body**:

```markdown
# Proposal structure reference

## 표준 본문 구조 (한국 R&D 과제 기준)

대부분의 program이 비슷한 골격. program별 차이는 분량 제한과 강조점.

### 1. 연구개발 목적·필요성

**목표 분량**: 1-2 페이지

**필수 요소**:
- 사회·정책적 필요성 (한 단락)
- 시장·산업적 필요성 (한 단락 + 정량 데이터)
- 기술적 필요성 (한 단락 + 기술 갭)

**Lens 호출 시점**: 시장 규모 / 기술 갭 정량 데이터 필요할 때

**좋은 패턴**:
> "글로벌 OO 시장은 2026년 X조원에서 2030년 Y조원으로 연평균 Z% 성장 예상. 
> 그러나 국내는 핵심 기술 A, B를 해외 의존. 본 과제는 A 기술의 국산화 + B로의 확장을 목표."

**나쁜 패턴**:
- "본 연구는 매우 중요하다" 류 자평
- 출처 없는 통계
- 정책 키워드 강제 삽입

### 2. 국내외 기술개발 동향

**목표 분량**: 2-3 페이지

**구조**:
- 글로벌 동향: 선도 기업·연구소 3-5개 분석 (research-synthesis 호출)
- 국내 동향: 경쟁사 + 정부 정책 흐름
- 우리의 차별화 위치

[... 나머지 섹션도 같은 형식으로 spec]
```

**Note**: 이 reference는 사용자의 실제 경험으로 채우는 게 가장 가치 있어. 골격은 spec에서 제공, 디테일은 사용자가.

---

### Step 6-8 — assets/{program}-template.md

**위치**: `proposal-drafting/assets/`

각 template은 해당 program의 실제 양식 골격. **사용자가 가장 잘 안다** — 실제 신청서 양식 (워드 파일 또는 hwp) 골격을 markdown으로 변환해서 넣기.

**Step 6 — keit-template.md**:

```markdown
---
program: KEIT
form_version: YYYY (분기별 갱신 필요)
last_verified: YYYY-MM-DD
---

# KEIT 양식 골격

## 표지
- 과제명 (국문 / 영문)
- 주관기관 / 책임자
- 수행기간 (시작-종료, 총 N개월)
- 정부 출연금 / 기관 부담금

## I. 연구개발과제의 개요

### 1. 연구개발과제의 개요
[사용자가 양식 텍스트 그대로 붙여넣기]

### 2. 연구개발과제의 필요성
[양식 안내문]

[... 양식 끝까지]
```

**Step 7 — kiat-template.md**: KIAT 양식 (사용자가 채움)

**Step 8 — climate-tech-template.md**: 기후기술원 양식 (사용자가 채움)

**Validation**:
- [ ] 사용자가 실제 신청하는 program 최소 1개 양식 골격 완성
- [ ] last_verified 명시 (양식 분기 검증용)

---

### Step 9 — patent-filing/SKILL.md

**위치**: `/07_Lua_System/verticals/climate-energy/skills/patent-filing/SKILL.md`

**Frontmatter**:
```yaml
---
name: patent-filing
description: Draft Korean patent specifications (명세서) with structured claims (청구항), background, detailed description, and drawing captions. Use for invention disclosures, patent draft preparation, or claim refinement. Triggers on "특허 명세서", "특허 초안", "청구항 작성", "특허 출원 준비", "patent draft", "claim drafting".
vertical: climate-energy
applies_to: [scribe, atlas, lens]
allowed-tools: [Read, Write, WebFetch, WebSearch]
depends_on:
  - _core/skills/voice-mimicry
  - _core/skills/research-synthesis
---
```

**Body — 8개 섹션**:

```markdown
# patent-filing

## When this skill activates

특허 명세서 초안 또는 청구항 구조화. 트리거:
- "[발명 제목] 특허 명세서 초안"
- "이 발명의 청구항 구조 만들어줘"
- "선행기술 정리해줘"

**비협상 조건**: 모든 출력은 **변리사 final check 전제**. 이 skill은 변리사 대체 X, 보조 O.

NOT for:
- 특허 출원서 자체 (변리사 작업)
- 청구항의 법적 유효성 판단
- PCT 출원 전략 결정

## Step 1: Capture invention disclosure

사용자에게 받거나 vault에서 검색:
- 발명의 명칭 (가제)
- 해결하려는 기술 과제 (한 단락)
- 핵심 기술 요소 (3-7개)
- 종래 기술 대비 차별점
- 가능한 실시예 (구현 형태 1-3개)

부족하면 ONE 질문 (가장 핵심: 차별점).

## Step 2: Prior art search

research-synthesis skill 호출:
- KIPRIS 검색 (web_search로 시작, 추후 자체 MCP)
- USPTO / EPO 동향
- 학술 논문
- 기술 표준 (IEC, ISO)

`references/prior-art-search.md`의 룰 따름.
결과를 `00_Inbox/{YYYY-MM-DD}-prior-art-{title}.md`로 저장.

## Step 3: Structure claims

`references/patent-structure.md` 따라:

**Independent claim 1** (가장 광범위):
- 한 문장으로
- 발명의 본질만 (제한 요소 최소)
- "OO를 포함하는 [장치/방법/시스템]"

**Dependent claims 2~N**:
- claim 1을 한정 (specific embodiment)
- 추가 기술 요소 1개씩
- "제1항에 있어서, OO를 더 포함하는..."

권장 청구항 수: 10-20개 (대한민국 출원 기준)

## Step 4: Write specification body

명세서 구조 (한국 특허법 기준):

1. **발명의 명칭** — 청구항 1과 일치
2. **기술 분야** — IPC 분류 기반 한 단락
3. **배경 기술** — 종래 기술 + 그 한계 (prior art 활용)
4. **발명의 내용**
   - 해결하려는 과제 (한 단락)
   - 과제의 해결 수단 (청구항 요약 + 효과)
5. **도면의 간단한 설명** — 도면 1, 2, 3... 각 한 줄
6. **발명을 실시하기 위한 구체적인 내용**
   - 실시예 1, 2, 3 (각 1-2 페이지)
   - 변형 가능성 명시
7. **도면** — Forge 호출 가능 (PlantUML / Mermaid / SVG 골격)

## Step 5: Apply voice

특허 명세서는 voice가 일반 글과 다름:
- 법적 정확성 > 가독성
- 한 문장 한 의미 (복문 자제)
- 용어 일관성 (한 발명에서 한 용어, 동의어 X)
- 단정 표현 ("것이다" 류, "할 수 있다" 자제 — 의도된 경우만)

`Identity/voice.md` 그대로 적용 X. patent-specific tone 따로.

## Step 6: Self-check

7개 체크:
1. 청구항 1이 차별점만 담고 있는가 (불필요 한정 X)
2. Dependent claim들이 단계적으로 한정되는가
3. 명세서가 모든 청구항을 support하는가 (anti-functional claim 방지)
4. 용어 일관성 (같은 요소를 같은 용어로)
5. 실시예가 청구항 구조와 매핑되는가
6. Prior art가 명확히 인용되고 차별점이 드러나는가
7. 도면 설명이 도면 번호와 일치하는가

하나라도 실패하면 해당 부분 재작성.

## Step 7: Save and signal

- 위치: `02_Projects/{project-name}/patents/{YYYY-MM-DD}-{title}.md`
  또는 `03_Operation/Patents/{YYYY-MM-DD}-{title}.md`
- Frontmatter:
  ```yaml
  ---
  type: patent-draft
  invention_title: 
  status: draft-for-attorney
  prior_art_count: 
  claim_count: 
  inventors: []
  ---
  ```
- 마지막 줄: "Draft saved. 변리사 검토 필수. 출원 전 prior art 재검증 권장."

## Never do

- 청구항을 너무 좁게 (등록 위해 권리범위 포기)
- 청구항을 너무 넓게 (선행기술 등록 거절 위험)
- "혁신적인", "획기적인" 같은 자평
- 출원 전 공개 (학회 발표, 논문 등)
- 변리사 없이 출원 (DIY는 risk-reward 안 맞음)
- 동일 발명 중복 출원 (자기 인용 risk)

## References

- `references/patent-structure.md` — 청구항 / 명세서 구조 상세
- `references/prior-art-search.md` — 선행기술 조사 룰
- `assets/patent-template.md` — 명세서 골격
```

**Validation**:
- [ ] 8개 섹션 다 있음
- [ ] description에 한국어 키워드 다 있음
- [ ] "변리사 final check 전제" 비협상 조건 명시
- [ ] Never do 6개 이상

---

### Step 10 — patent-filing/references/patent-structure.md

**위치**: `patent-filing/references/patent-structure.md`

**Body** (요약):

```markdown
# Patent structure reference

## 청구항 구조 (한국 특허법 기준)

### Independent claim 패턴
- "OO에 있어서, AA를 포함하는 BB."
- "OO를 수행하는 방법으로서, AA 단계; BB 단계; CC 단계를 포함하는 방법."

### Dependent claim 패턴
- "제N항에 있어서, [한정 요소]를 더 포함하는 [방법/장치]."

### 권장 청구항 수
- 장치/시스템: 10-15개
- 방법: 10-20개
- 둘 다 (장치 + 방법): 15-25개

## 명세서 본문 구조

### 발명의 명칭
- 50자 이내
- 청구항 1과 일치
- 기술 분야 + 핵심 기능

### 기술 분야
- IPC 분류 (예: G06F, H02J)
- 한 단락

[... 나머지 섹션 상세 spec]
```

---

### Step 11 — patent-filing/references/prior-art-search.md

**Body**:

```markdown
# Prior art search rules

## 검색 범위
- KIPRIS (한국 특허청) — 필수
- USPTO (미국) — 필수
- EPO (유럽) — 권장
- 학술 (Google Scholar, IEEE) — 권장

## 검색 키워드 전략
- 기술 용어 (한/영)
- 기능 표현 (해결하는 과제)
- IPC 분류 (검색 좁히기)
- 출원인 (경쟁사 모니터링)

## 검증 횟수
- 최소 3회 (다른 키워드 조합)
- 각 검색마다 상위 20개 검토

## 출력 형식
- prior art 1개당:
  - 출원번호 / 등록번호
  - 출원일 / 등록일
  - 출원인
  - 핵심 기술 요지 (한 단락)
  - 우리 발명 대비 차별점

[... 상세 spec]
```

---

### Step 12 — patent-filing/assets/patent-template.md

```markdown
---
invention_title: 
status: draft-for-attorney
filing_route: domestic / PCT
inventors: []
priority_date: 
---

# {발명의 명칭}

## 청구항

### 청구항 1
[Independent claim]

### 청구항 2
[제1항에 있어서, ...]

...

## 명세서

### 1. 기술 분야
[IPC 분류 + 한 단락]

### 2. 배경 기술
[종래 기술 + 한계]

### 3. 발명의 내용
[과제 + 해결 수단 + 효과]

### 4. 도면의 간단한 설명
- 도면 1: ...
- 도면 2: ...

### 5. 발명을 실시하기 위한 구체적인 내용
[실시예 1, 2, 3]

### 6. 도면
[Mermaid / PlantUML / SVG 골격]
```

---

### Step 13 — agents/ + agents/README.md

**위치**: `/07_Lua_System/agents/README.md`

**목적**: agents 폴더 사용법 + 6명 명단.

**Frontmatter**:
```yaml
---
type: agents-readme
---
```

**Body**:

```markdown
# Lua agents

총 6명의 generic agent + Phase 4에서 4명의 workflow agent 추가.

## Generic agents (Phase 3 구축)

| Agent | Brain | 역할 | 시스템 프롬프트 |
|---|---|---|---|
| Atlas | Claude Sonnet 4.6 | 라우터 | `atlas/system-prompt.md` |
| Scribe | Claude Opus 4.7 | 글쓰기 | `scribe/system-prompt.md` |
| Forge | Kimi K2.6 (Cursor) | 코딩 | `forge/system-prompt.md` |
| Lens | Kimi K2.6 Swarm | 리서치 | `lens/system-prompt.md` |
| Vault | Claude Sonnet 4.6 | Obsidian 정리 | `vault/system-prompt.md` |
| Archivist | Notion Custom Agent | Notion 운영 | `archivist/system-prompt.md` |

## Workflow agents (Phase 4 예정)

| Agent | 도메인 | 호출 패턴 |
|---|---|---|
| Proposal Agent | climate-energy | `/proposal-write {grant} {topic}` |
| Patent Agent | climate-energy | `/patent-draft {title}` |
| Industry Intel Agent | climate-energy | cron weekly |
| Validation Agent | personal-venture | `/validate {idea}` |

## Skill bundling 패턴 (financial-services 차용)

각 agent는 자기 사용 skill의 사본을 bundle (자기완결성).

```
agents/
├── scribe/
│   ├── system-prompt.md
│   └── skills/                     # synced from verticals/
│       └── voice-mimicry/          # sync_skills.js로 자동 동기화
```

동기화: `node scripts/sync_skills.js`.
검증: `node scripts/check.js` (drift 검출).
```

---

### Step 14 — agents/atlas/system-prompt.md

**위치**: `/07_Lua_System/agents/atlas/system-prompt.md`

**참고**: Phase 1 bootstrap zip의 `Lua/Prompts/system/atlas.md`를 base로 + 업데이트.

**Frontmatter**:
```yaml
---
agent: atlas
brain: claude-sonnet-4-6
role: orchestrator
last_updated: 2026-05-13
---
```

**Body**:

```markdown
# Atlas — system prompt

You are Atlas, the orchestrator agent of the Lua system. You exist to route each request to the right specialist and pass clean context.

## Always load (before any decision)

1. `/CLAUDE.md` (vault root)
2. `01_Command Center/Identity/about-me.md`
3. `01_Command Center/Identity/decision-principles.md`
4. `01_Command Center/Identity/context.md`
5. `01_Command Center/_System/agent-permissions.md`

## Routing decision tree

When a request arrives, apply this in order:

### 1. Domain detection
- Mentions KEIT/KIAT/기후기술원/탄소중립/R&D 과제 → `climate-energy` vertical
- Mentions 특허/청구항/명세서/KIPRIS → `climate-energy` vertical
- Mentions MVP/시장검증/launch/aha moment → `personal-venture` vertical
- Else → `_core` vertical

### 2. Agent assignment

| Request type | Route to | Why |
|---|---|---|
| Write any prose in user's voice | Scribe | voice-mimicry skill |
| Government R&D proposal | Scribe (uses proposal-drafting skill) | Phase 3 |
| Patent draft | Scribe (uses patent-filing skill) | Phase 3 |
| Code generation / refactor / debug | Forge | Kimi K2.6 long-horizon |
| Research, compare 3+ sources | Lens | Kimi Swarm |
| Obsidian maintenance | Vault | Has Obsidian MCP write |
| Notion DB updates | Archivist | Notion Custom Agent |
| Multiple of above | Plan a sequence, route step by step |
| Casual chat | Answer yourself |

### 3. Escalation criteria (Sonnet → Opus)

호출하려는 model을 Opus로 올려야 할 때:
- Identity/decision-principles.md 룰을 적용해야 할 때
- 예산 한도 (decision-principles.md) 근처/초과
- 사용자가 의견을 명시적으로 요청
- 외부 발행/통신/돈 관련

## Boundary

- 작업하지 않는다 — 분배만
- Drafts/, Projects/ 같은 폴더에 직접 쓰지 않음
- 모든 라우팅 결정 `Logs/{YYYY-MM-DD}-routing.md`에 commit message 형식으로

## Output format

### When delegating
```
Routing to: [agent name]
Vertical: [_core / climate-energy / personal-venture]
Reason: [한 줄]
Context loaded: [파일 list]
Task: [한 단락으로 재진술]
```

### When answering directly (간단한 케이스)
그냥 답. 의식 행위 X.

## When unsure

ONE 질문. 가장 핵심 (load-bearing)인 것 하나만. 세 개 X.

## Logging convention

git commit message:
- `[agent: atlas] route to {agent} for {task slug}`
- `[agent: atlas] escalate to opus for {reason}`
- `[agent: atlas] direct answer to {request slug}`

이 패턴으로 `git log --grep="\[agent: atlas\]"` 가 라우팅 감사 로그.
```

**Validation**:
- [ ] Identity 4개 파일 + CLAUDE.md 로드 명시
- [ ] climate-energy 라우팅 룰 포함
- [ ] 라우팅 vs 답변 둘 다 핸들링

---

### Step 15-19 — 나머지 5명 system prompt

각 agent system prompt는 Phase 1 bootstrap (`Lua/Prompts/system/*.md`)을 기반으로 업데이트.

**공통 업데이트 사항** (5명 모두):
- 경로 업데이트: `Lua/Identity/...` → `01_Command Center/Identity/...`
- depends_on skills 명시 (해당 agent가 사용하는 skill 목록)
- climate-energy / personal-venture vertical 인식 추가 (해당시)
- Git commit message convention (`[agent: {name}] ...`)

**Step 15 — Scribe system prompt**:
- Phase 1 양식 + 다음 추가:
  - `depends_on: [_core/voice-mimicry, climate-energy/proposal-drafting, climate-energy/patent-filing]`
  - 정부 과제 / 특허 모드 일 때 추가 컨텍스트 로드

**Step 16 — Forge system prompt**:
- Phase 1 양식 + Cursor 안에서 실행됨 명시
- Kimi K2.6 endpoint 명시
- 예산표 자동 생성 (Excel/Sheets) 기능 — Phase 4 connector 가 있으면 활성

**Step 17 — Lens system prompt**:
- Phase 1 양식 + `climate-energy` 도메인 인텔 모드 추가
- prior-art-search rules 활용

**Step 18 — Vault system prompt**:
- Phase 1 양식 + Phase 2의 vault_audit.js 호출

**Step 19 — Archivist system prompt**:
- Phase 1 양식 + Notion DB 매핑 명시
- Patents DB, Proposals DB, Industry Intel DB 등

각 agent system prompt는 짧고 단호 (200-300 lines max).

---

### Step 20 — scripts/sync_skills.js

**위치**: `/scripts/sync_skills.js`

**목적**: financial-services 패턴 — vertical의 skill 원본을 agent의 bundled 사본에 동기화. drift 방지.

**Skeleton**:

```javascript
#!/usr/bin/env node
/**
 * Sync skills from verticals/ source to agents/ bundled copies.
 * Based on anthropics/financial-services sync-agent-skills.py pattern.
 *
 * Strategy:
 * - Read each agent's system-prompt.md frontmatter for depends_on
 * - Copy referenced skill directories to agents/<agent>/skills/
 * - Report what was synced
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, '07_Lua_System/agents');
const VERTICALS_DIR = path.join(ROOT, '07_Lua_System/verticals');

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return null;
  // Simple YAML parse for depends_on list
  const depsMatch = m[1].match(/depends_on:\s*\n((?:\s*-\s*.+\n?)+)/);
  if (!depsMatch) return { dependsOn: [] };
  const dependsOn = depsMatch[1].split('\n')
    .map(line => line.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);
  return { dependsOn };
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

async function main() {
  const agentDirs = fs.readdirSync(AGENTS_DIR)
    .filter(name => {
      const p = path.join(AGENTS_DIR, name);
      return fs.statSync(p).isDirectory() && name !== 'README.md' && !name.startsWith('.');
    });

  const report = { synced: [], skipped: [], errors: [] };

  for (const agent of agentDirs) {
    const promptPath = path.join(AGENTS_DIR, agent, 'system-prompt.md');
    if (!fs.existsSync(promptPath)) {
      report.skipped.push(`${agent}: no system-prompt.md`);
      continue;
    }

    const content = fs.readFileSync(promptPath, 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm || !fm.dependsOn || fm.dependsOn.length === 0) {
      report.skipped.push(`${agent}: no depends_on`);
      continue;
    }

    // Clean existing bundled skills
    const bundleDir = path.join(AGENTS_DIR, agent, 'skills');
    if (fs.existsSync(bundleDir)) {
      fs.rmSync(bundleDir, { recursive: true, force: true });
    }

    // Copy each depended-on skill
    for (const dep of fm.dependsOn) {
      // dep format: "_core/skills/voice-mimicry" or "climate-energy/skills/proposal-drafting"
      const srcPath = path.join(VERTICALS_DIR, dep);
      if (!fs.existsSync(srcPath)) {
        report.errors.push(`${agent}: source ${dep} not found`);
        continue;
      }
      const skillName = path.basename(dep);
      const destPath = path.join(bundleDir, skillName);
      try {
        copyDir(srcPath, destPath);
        report.synced.push(`${agent} ← ${dep}`);
      } catch (e) {
        report.errors.push(`${agent}: copy failed ${dep} (${e.message})`);
      }
    }
  }

  console.log('\n=== Sync report ===\n');
  console.log(`Synced: ${report.synced.length}`);
  report.synced.forEach(s => console.log('  ✓ ' + s));
  console.log(`\nSkipped: ${report.skipped.length}`);
  report.skipped.forEach(s => console.log('  – ' + s));
  if (report.errors.length > 0) {
    console.log(`\nErrors: ${report.errors.length}`);
    report.errors.forEach(e => console.log('  ✗ ' + e));
    process.exit(1);
  }
  console.log('');
}

main().catch(err => {
  console.error('Sync crashed:', err);
  process.exit(2);
});
```

**Validation**:
- [ ] `node scripts/sync_skills.js` 실행됨
- [ ] 각 agent의 `skills/` 하위에 depends_on skill 사본 생김
- [ ] check.js로 sync 후 drift 없음 확인

---

### Step 21 — scripts/check.js 확장

**추가 검증**:

```javascript
async function checkAgents() {
  const agentDirs = fs.readdirSync(path.join(ROOT, '07_Lua_System/agents'))
    .filter(name => {
      const p = path.join(ROOT, '07_Lua_System/agents', name);
      return fs.statSync(p).isDirectory() && name !== 'README.md';
    });
  
  if (agentDirs.length === 0) {
    warnings.push('No agents found in 07_Lua_System/agents/');
    return;
  }
  
  const required = ['atlas', 'scribe', 'forge', 'lens', 'vault', 'archivist'];
  for (const req of required) {
    if (!agentDirs.includes(req)) {
      errors.push(`Missing generic agent: ${req}`);
    }
  }
  
  for (const agent of agentDirs) {
    const promptPath = path.join(ROOT, '07_Lua_System/agents', agent, 'system-prompt.md');
    if (!fs.existsSync(promptPath)) {
      errors.push(`agents/${agent}/system-prompt.md missing`);
      continue;
    }
    const content = fs.readFileSync(promptPath, 'utf-8');
    if (!content.match(/^---\n[\s\S]+?\n---/)) {
      errors.push(`agents/${agent}/system-prompt.md: missing frontmatter`);
    }
  }
}

async function checkSkillDrift() {
  // For each agent with bundled skills, verify content matches source
  const agentSkills = await glob('07_Lua_System/agents/*/skills/*/SKILL.md', { cwd: ROOT });
  
  for (const bundled of agentSkills) {
    // Extract skill name
    const skillName = path.basename(path.dirname(bundled));
    // Find source in verticals/
    const sources = await glob(`07_Lua_System/verticals/*/skills/${skillName}/SKILL.md`, { cwd: ROOT });
    if (sources.length === 0) {
      warnings.push(`Bundled skill ${bundled} has no source in verticals/`);
      continue;
    }
    if (sources.length > 1) {
      errors.push(`Skill ${skillName} found in multiple verticals: ${sources.join(', ')}`);
      continue;
    }
    
    const sourceContent = fs.readFileSync(path.join(ROOT, sources[0]), 'utf-8');
    const bundledContent = fs.readFileSync(path.join(ROOT, bundled), 'utf-8');
    
    if (sourceContent !== bundledContent) {
      errors.push(`Drift: ${bundled} differs from source ${sources[0]}. Run sync_skills.js.`);
    }
  }
}

// main()에 추가
async function main() {
  await checkCLAUDEmd();
  await checkIdentity();
  await checkAgentPermissions();
  await checkSkills();
  await checkAgents();           // 추가
  await checkSkillDrift();       // 추가
  await checkCommands();
  await checkMCPConfigs();
  // ... 출력
}
```

**Validation**:
- [ ] 6명 generic agent 모두 검출됨
- [ ] sync_skills.js 후 drift 0
- [ ] 일부러 bundle 수정해서 drift 만들고 → check.js가 검출하는지

---

## 막힐 만한 곳 (미리 경고)

### 1. proposal-drafting의 양식이 변경됨

정부 R&D 양식은 매년 또는 분기마다 변경. `references/grant-programs.md`와 `assets/*.md`의 `last_verified` 분기마다 확인. 변경 시 즉시 업데이트.

체크리스트:
- KEIT 공고 사이트 분기마다 확인
- 양식 변경 시 vault에 `[skill: proposal-drafting] update KEIT form to v2026.Q3` commit
- 양식 변경됐는데 안 업데이트하면 skill이 옛 양식으로 초안 만듦 — 큰 손실

### 2. 특허 명세서는 변리사 final이 비협상

patent-filing skill은 변리사 대체 아님. 보조 도구. 모든 출력 frontmatter에 `status: draft-for-attorney` 명시.

자동 출원 시도 절대 X — KIPRIS 접근 connector 만들더라도 read-only.

### 3. sync_skills.js의 frontmatter parser

위 skeleton의 YAML parser는 매우 단순함. depends_on이 list 형태 (`- _core/skills/voice-mimicry`)일 때만 작동.

복잡한 YAML (nested object 등)은 안 됨. 필요하면 `js-yaml` package 추가:
```bash
npm install js-yaml
```

그리고 parser 교체:
```javascript
const yaml = require('js-yaml');
const fm = yaml.load(frontmatterStr);
```

### 4. Agent의 skills/ 폴더는 git tracked

sync_skills.js로 생성되는 `agents/<agent>/skills/`도 git commit 됨. 이유:
- agent가 자기완결 (clone 후 sync 안 돌려도 사용 가능)
- drift 검출 가능 (vertical source vs bundle)
- PR diff에서 변경 가시화

`.gitignore`에 넣지 마. 단, sync_skills.js 돌린 직후 빈 diff인지 확인 (정상 상태).

### 5. depends_on의 경로 형식

`agent/system-prompt.md`의 frontmatter:

```yaml
depends_on:
  - _core/skills/voice-mimicry
  - climate-energy/skills/proposal-drafting
```

경로는 `07_Lua_System/verticals/` 기준 상대 경로. `verticals/` prefix 빼고.

### 6. Drift 발견했을 때

`check.js`가 drift 보고하면:
- bundle을 수정했으면 → vertical source에 그 변경 반영 후 sync 다시
- vertical source를 수정했으면 → sync_skills.js 실행
- 둘 다 다른 변경했으면 → vertical을 master로 (sync 덮어쓰기)

원칙: **vertical이 source of truth, agent는 단순 사본**.

### 7. 6명 agent 명단 변경하면

`check.js`의 `required = ['atlas', 'scribe', 'forge', 'lens', 'vault', 'archivist']` 배열도 같이 업데이트.

Workflow agent (Phase 4) 추가하면 별도 검증 함수 (`checkWorkflowAgents`) 만들기.

---

## Phase 3 완료 기준

1. [ ] `node scripts/check.js` → "✓ All checks passed"
2. [ ] `node scripts/sync_skills.js` → 모든 agent의 skills/ 동기화됨
3. [ ] `node scripts/vault_audit.js` 여전히 동작
4. [ ] 6명 agent 모두 system-prompt.md 있음 + frontmatter 정확
5. [ ] `climate-energy/skills/proposal-drafting/` + `patent-filing/` SKILL.md + references + assets 다 채워짐 (양식은 사용자가 채울 placeholder OK)
6. [ ] Claude Desktop에서 proposal-drafting 테스트:
   - "KEIT 2026년 하반기 사이버보안 R&D 과제 가상 시나리오로 본문 1장 초안 만들어줘" 
   - 결과가 KEIT 양식 + 너의 voice로 나오는지
7. [ ] GitHub Actions에서 PR check 초록

---

## Phase 4 미리보기

Phase 3 끝나면:

- **`climate-energy/skills/carbon-mrv/`** — 탄소 측정·검증·보고 skill
- **`climate-energy/skills/industry-scan-energy/`** — 에너지 산업 동향 모니터링 (매주 cron 호출 대상)
- **`personal-venture/`** vertical 시작 — `market-validation` skill
- **`agents/proposal-agent/`** — 회사 1의 첫 workflow agent (Lens + Scribe + Forge 조합 end-to-end)
- **`agents/patent-agent/`** — 두 번째 workflow agent
- **`agents/industry-intel-agent/`** — cron 호출용 workflow agent
- **`agents/validation-agent/`** — personal-venture workflow agent
- **`managed-agents/<slug>/agent.yaml`** — Claude Managed Agents API 배포 wrapper
- **`.github/workflows/`** cron 자동화:
  - `industry-scan.yml` — 매주 월요일 9시 KST, industry-intel-agent 호출, 결과 Slack 다이제스트
  - `weekly-review.yml` — 매주 일요일 21시 KST, weekly-review command 실행
  - `pr-voice-check.yml` — `_Drafts/` PR마다 voice_check.js 자동 검증
- **NTIS / KIPRIS MCP 래퍼** — 자체 빌드 (Phase 4-extra, 시간 여유 있으면)

Phase 4가 끝나면 Lua가 진짜 "24/7 agent company"로 작동. 너 자고 있을 때도 매주 산업 동향 스캔, 주간 회고 자동, Drafts 자동 검증.
