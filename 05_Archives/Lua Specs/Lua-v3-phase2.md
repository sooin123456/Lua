---
type: build-spec
phase: 2
target_completion: identity-filled-plus-core-complete
last_updated: 2026-05-13
prerequisite: Phase 1 PR merged with Actions green
---

# Lua v3 — Phase 2 Build Specification

> Phase 1이 머지된 다음에 시작. voice-mimicry가 실제로 너의 voice를 흉내내려면 Identity/voice.md가 채워져야 함 — 이게 Phase 2의 핵심.

## Goal

- `01_Command Center/Identity/` 4개 파일 작성 (가장 중요)
- `01_Command Center/_System/agent-permissions.md`
- `verticals/_core/` 완성 (research-synthesis + obsidian-vault-care + 2 commands)
- `scripts/vault_audit.js` 추가
- Phase 1의 voice-mimicry가 진짜로 동작하는 상태

Phase 2가 끝나면:
- 너의 voice가 모든 에이전트에 흐름
- 권한 매트릭스가 단일 출처에 있음
- _core vertical 100% 완성 (skills 3개 + commands 2개)
- vault hygiene이 자동 검증됨

Phase 3 (다음, 별도 응답):
- `verticals/climate-energy/skills/proposal-drafting/` — 회사 1 첫 도메인 skill
- `verticals/personal-venture/` skeleton
- `agents/` — 6명 generic + 4명 workflow agents
- `managed-agents/` headless 배포

---

## Build Order — 체크리스트

순서대로. Identity가 먼저 — voice.md 없이 _core skill 만들어봤자 generic하게만 동작.

- [ ] **Step 1** — `01_Command Center/_System/agent-permissions.md`
- [ ] **Step 2** — `01_Command Center/Identity/about-me.md`
- [ ] **Step 3** — `01_Command Center/Identity/voice.md` ⭐ (가장 중요, 시간 가장 많이)
- [ ] **Step 4** — `01_Command Center/Identity/decision-principles.md`
- [ ] **Step 5** — `01_Command Center/Identity/context.md`
- [ ] **Step 6** — `verticals/_core/skills/research-synthesis/SKILL.md`
- [ ] **Step 7** — `research-synthesis/references/source-evaluation.md`
- [ ] **Step 8** — `research-synthesis/references/comparison-templates.md`
- [ ] **Step 9** — `verticals/_core/skills/obsidian-vault-care/SKILL.md`
- [ ] **Step 10** — `obsidian-vault-care/references/vault-audit-rules.md`
- [ ] **Step 11** — `scripts/vault_audit.js`
- [ ] **Step 12** — `verticals/_core/commands/weekly-review.md`
- [ ] **Step 13** — `verticals/_core/commands/inbox-triage.md`
- [ ] **Step 14** — `scripts/check.js` 확장 (Identity 파일 + commands 검증 추가)

---

## Phase 2 끝났을 때 추가되는 파일들

```
Lua/
├── 01_Command Center/
│   ├── Identity/                                    [Step 2-5 — new]
│   │   ├── about-me.md
│   │   ├── voice.md           ⭐
│   │   ├── decision-principles.md
│   │   └── context.md
│   └── _System/                                     [Step 1 — new]
│       └── agent-permissions.md
├── 07_Lua_System/
│   └── verticals/_core/
│       ├── skills/
│       │   ├── voice-mimicry/                       (Phase 1)
│       │   ├── research-synthesis/                  [Step 6-8 — new]
│       │   │   ├── SKILL.md
│       │   │   └── references/
│       │   │       ├── source-evaluation.md
│       │   │       └── comparison-templates.md
│       │   └── obsidian-vault-care/                 [Step 9-10 — new]
│       │       ├── SKILL.md
│       │       └── references/
│       │           └── vault-audit-rules.md
│       └── commands/                                [Step 12-13 — new]
│           ├── weekly-review.md
│           └── inbox-triage.md
└── scripts/
    ├── check.js                                     [Step 14 — extend]
    └── vault_audit.js                               [Step 11 — new]
```

---

## File Specifications

### Step 1 — _System/agent-permissions.md

**위치**: `/01_Command Center/_System/agent-permissions.md`

**목적**: 권한 매트릭스 단일 출처. CLAUDE.md에서 link로 참조. 이 파일 자체는 agent에 노출 안 됨 (`_System/`은 forbidden zone).

**Frontmatter**:
```yaml
---
type: meta
load: never
visibility: system-only
last_updated: 2026-05-13
---
```

**Body 구조**:

1. `# Agent permissions matrix` (제목)

2. `## 매트릭스` — 표 그대로:

```markdown
| 폴더 | Atlas | Scribe | Forge | Lens | Vault | Archivist |
|---|---|---|---|---|---|---|
| `01_Command Center/Identity/` | R | R | R | R | R | R |
| `01_Command Center/_System/` | — | — | — | — | — | — |
| `02_Projects/` | R | R | R+W (code) | R+W (research) | R+W | — |
| `03_Operation/_SOPs/` | R | R | R (coding) | R (research) | R | R+W (ops) |
| `03_Operation/Proposals/` | R | R | — | — | R | — |
| `03_Operation/Patents/` | R | R | — | — | R | — |
| `03_Operation/Industry Intelligence/` | R | — | — | R+W | R+W | R |
| `06_Personal Studio/_Drafts/` | R | R+W | — | — | R+W | — |
| `07_Lua_System/verticals/*/skills/` | R | R | R | R | R+W | R |
| `00_Inbox/` | R | R | — | R+W | R+W | R |
```

3. `## 노출 강제 방법`:
   - SKILL.md의 `applies_to` frontmatter로 1차 매칭
   - 에이전트 system prompt 상단에 권한 명시 (모델이 따르도록 유도)
   - Claude Agent SDK 사용 시 `allowed_tools` + `permission_mode: "dontAsk"`로 강제
   - MCP 서버의 noteFilter 옵션 사용 (vault 전체 노출 방지)

4. `## 금지 영역`:
   - `_meta/` (legacy, Phase 1 bootstrap 잔재) — 어떤 agent도 접근 X
   - `_System/` — 어떤 agent도 접근 X
   - `Identity/{any}.md` — read OK, write는 항상 사람 확인 per file

**Validation**:
- [ ] 매트릭스에 모든 agent 6명 + Operation 세부 폴더가 들어있음
- [ ] CLAUDE.md의 `## Vault permissions` 섹션이 이 파일로 link됨
- [ ] frontmatter의 `load: never` 명시

---

### Step 2 — Identity/about-me.md

**위치**: `/01_Command Center/Identity/about-me.md`

**목적**: 너의 기본 사실 + 작업 패턴 + 도구 스택. 모든 agent가 첫 번째로 읽음.

**Frontmatter**:
```yaml
---
type: identity
weight: critical
load: always
applies_to: [atlas, scribe, forge, lens, vault, archivist]
last_updated: 2026-05-13
---
```

**Body — 필수 7개 섹션, 500-800자**:

1. `## 기본 사실` — 이름·위치·시간대·언어

2. `## 회사 1 (climate-energy)`:
   - 무엇을 만들고 있는지 (한 줄)
   - 지금 가장 시간 많이 쓰는 것
   - 6개월 내 도달하고 싶은 상태
   - 절대 안 할 일 (예: "B2C는 안 함, B2G·B2B만")

3. `## 회사 2 (personal-venture)`:
   - 탐색 중인 영역 (한 줄)
   - 지금 가설 중인 것
   - 다음 분기 마일스톤

4. `## 일하는 방식`:
   - 최선의 컨디션 시간대
   - 집중 환경 (음악? 정적? 카페?)
   - 피해야 할 트리거 (지치게 만드는 것)
   - 작업 사이클 (스프린트 길이, 휴식 패턴)

5. `## 도구 스택`:
   - IDE: Cursor (+ Kimi K2.6 custom model)
   - 노트: Obsidian (이 vault, Lua/)
   - 협업: Slack, Notion (Business)
   - AI: Claude Opus 4.7, Kimi K2.6, Manus (드물게)
   - 시각화: Tldraw? Excalidraw? Figma? 등 추가

6. `## 강점 / 약점 (자기 인식)`:
   - 강점 3개 (객관적으로 너답게 잘하는 것)
   - 약점 3개 (의식적으로 보완해야 할 것)
   - 이 정보가 있으면 agent가 작업 자동 분배에 활용

7. `## 한 줄 의사결정 원칙`:
   - 예: "속도보다 일관성, 일관성보다 정확성, 정확성보다 진실성"
   - 너만의 한 줄로

**채우는 팁**:
- 너무 길지 마. 500-800자가 최적. 1500자 넘으면 agent가 핵심 못 잡음.
- 1인칭으로 ("나는 X를 한다") — 3인칭은 거리감 생김
- 추상 명사 줄이고 구체 동사 (예: "혁신을 추구" X, "매주 새 가설 1개 검증" O)

**Validation**:
- [ ] 7개 섹션 다 있음
- [ ] 500-800자 범위
- [ ] 회사 1 / 회사 2 명확히 구분됨
- [ ] 도구 스택에 Cursor + Kimi 포함

---

### Step 3 — Identity/voice.md ⭐

**위치**: `/01_Command Center/Identity/voice.md`

**목적**: 너의 voice 정의. **Phase 1의 voice-mimicry skill이 매번 첫 번째로 읽는 파일**. 이게 비면 모든 글이 generic AI 톤으로 나옴. 시간 가장 많이 투자할 가치 있음.

**Frontmatter**:
```yaml
---
type: identity
weight: critical
load: always
applies_to: [scribe, atlas]
last_updated: 2026-05-13
---
```

**Body 구조 — 7개 섹션**:

1. `## 어휘`
   - `### 자주 쓰는 단어/표현` — 너가 자연스럽게 쓰는 5-10개
   - `### 절대 안 쓰는 단어/표현` — 다음에 너만의 것 추가:
     ```
     - "정말", "사실", "결국", "어쨌든" (남발)
     - "혹시 괜찮으시다면", "제가 부족하지만"
     - "AI를 활용한", "혁신적인", "차별화된"
     - [너의 추가 금지어]
     ```

2. `## 톤 기본값`
   - 기본 톤 한 줄 (예: "직설적, 따뜻하지만 단호함")
   - 어떤 상황에서 톤이 바뀌는지 (예: "협상엔 더 직설적으로, 후배엔 더 따뜻하게")
   - 이모지: [사용 안 함 / 가끔 / 자주] 중 선택
   - 반말/존댓말 기본값

3. `## 구조 선호`
   - 결론 우선 vs 빌드업: 너의 선호
   - 단락 길이 평균
   - 불릿 vs 산문 선호
   - 마무리 스타일 (단호 / 열린 / 다음 행동 제시)

4. `## 포맷별 변형` (있다면)
   - 블로그: 톤 + 구조 변형
   - 이메일: 톤 + 구조 변형
   - LinkedIn: 톤 + 구조 변형
   - 트윗/X: 톤 + 구조 변형

5. `## 모범 예시 ⭐` (이게 가장 강력한 학습 데이터)
   - **최소 5개**, 권장 7-10개
   - 각 발췌마다:
     - 컨텍스트 한 줄 (언제·누구에게·무엇을 위해 쓴 글)
     - 발췌 200-500자
   - **소스**: `01_Command Center/Vibe CEO Journal`이 보물창고. 거기서 너답다고 느끼는 발췌 추출
   - 짧은 글 / 중간 글 / 긴 글 / 메일 톤 / 한영 변환 패턴 골고루
   
   **예시 양식**:
   ```markdown
   ### 예시 1 — Vibe CEO Journal 발췌 (2026-04-22)
   상황: 정부 과제 진행 상황 점검 회의 후, 자기 노트
   
   > [실제 발췌 200-500자]
   ```

6. `## 안티 예시`
   - **최소 5개**. 절대 이렇게 쓰지 마.
   - 각 안티 예시마다 **대체 표현** 추가:
     ```markdown
     - "확신은 없지만 제 생각엔..." → "한 가지 방향은..."
     - "혹시 시간 괜찮으시다면..." → "30분 안에 가능?"
     ```

7. `## 자기 검증 체크리스트`
   - voice-mimicry skill이 초안 완성 전 통과해야 할 4개 질문
   - 너의 약점 기반으로 커스터마이즈 가능:
     ```markdown
     1. 첫 2문장에 결론?
     2. 금지 단어 없음?
     3. 불필요 hedging 없음?
     4. 마지막 문장이 단호하게 닫힘?
     ```

**채우는 팁 — 이게 가장 중요**:
- **Vibe CEO Journal 최근 10개 글에서 발췌 추출** — 가장 빠른 방법
- 5개 미만이면 모델이 일반 톤으로 회귀. 7개 이상 권장.
- **발췌마다 컨텍스트 50자** — 모델이 "이 톤이 어떤 상황의 톤"인지 학습
- 한영 양쪽 다 작업한다면 각 언어로 발췌 따로
- 안티 예시도 동등하게 중요 — "이렇게는 절대 X"는 "이렇게 O"만큼 강력
- 작성 후 voice-mimicry로 글 한 편 시켜보고 너답게 나오는지 검증. 안 너다우면 voice.md 보강.

**Validation**:
- [ ] 7개 섹션 다 있음
- [ ] 모범 예시 5개 이상 (컨텍스트 한 줄 + 발췌)
- [ ] 안티 예시 5개 이상 (대체 표현 포함)
- [ ] 자기 검증 4문항 정의됨

---

### Step 4 — Identity/decision-principles.md

**위치**: `/01_Command Center/Identity/decision-principles.md`

**목적**: 트레이드오프 결정 가드레일. agent가 너 대신 결정 내릴 때 따를 룰.

**Frontmatter**:
```yaml
---
type: identity
weight: critical
load: always
applies_to: [atlas, scribe, forge, lens, vault, archivist]
last_updated: 2026-05-13
---
```

**Body 구조 — 5개 섹션**:

1. `## 우선순위 결정 기준`
   - 작업이 들어왔을 때 무엇을 먼저 보는지 (3개 기준)
   - 예: 1) 6개월 OKR 정렬, 2) 회수 불가 비용/시간, 3) 다른 사람 차단 여부

2. `## "No" 거절 신호`
   - 거절해야 할 상황 패턴 5개
   - 예:
     - 6개월 목표와 무관한 일
     - 1시간 미팅 → 30분 비동기로 대체 가능한 일
     - 동의 후 후회할 것 같은 일
     - 본인의 강점이 아닌 영역
     - 다른 사람이 더 잘할 수 있는 일

3. `## 트레이드오프 표`
   ```markdown
   | 축 | 기본 선호 | 예외 |
   |---|---|---|
   | 속도 vs 품질 | 품질 | 외부 발행 마감 있을 때 → 속도 |
   | 가격 vs 정밀도 | 정밀도 (Claude Opus) | 양 많고 단순 작업 → 가격 (Kimi) |
   | 자동화 vs 수동 통제 | 자동화 | 외부 발행·돈·사람 응대 → 수동 |
   | 공개 vs 비공개 | 비공개 (Obsidian) | 팀 공유 필요할 때만 → Notion |
   | 단기 결과 vs 장기 시스템 | 장기 시스템 | 명백한 마감 있을 때 |
   | 회사 1 vs 회사 2 | [너의 분배 비율, 예: 80/20] | 회사 1 막혔을 때 회사 2로 |
   ```

4. `## 위임 원칙`
   - `### 에이전트 단독 결정 OK` — 5-8개 항목
   - `### 항상 사람 컨펌 필요` — 5-8개 항목
   - 예시는 Phase 1 spec 참고

5. `## 예산 한도`
   ```markdown
   - Claude Opus 호출: 한 세션 $2 까지
   - Claude Sonnet/Haiku: 사실상 무제한 (cheap)
   - Kimi swarm: 한 작업 $0.50 까지
   - Manus: 200 크레딧/작업 까지, 그 이상 사람 컨펌
   - Notion credits: 월 500 credits 까지 (= $5)
   - 한도 초과시: 작업 중단 + Logs/에 기록 + 다음 세션 시작 시 사람에게 알림
   ```

**Validation**:
- [ ] 5개 섹션 다 있음
- [ ] 트레이드오프 축 최소 5개
- [ ] 예산 한도가 명시적 숫자로

---

### Step 5 — Identity/context.md

**위치**: `/01_Command Center/Identity/context.md`

**목적**: 단기 컨텍스트. 매주 월요일 5분 갱신.

**Frontmatter**:
```yaml
---
type: identity
weight: high
load: always
applies_to: [atlas, scribe, forge, lens, vault, archivist]
last_updated: 2026-05-13
update_frequency: weekly-monday
---
```

**Body — 5개 섹션, 매우 짧게**:

1. `## 이번 주 우선순위 (Top 3)`
   - 회사 1: 한 줄
   - 회사 2: 한 줄
   - 개인: 한 줄

2. `## 현재 진행 중 프로젝트`
   - 회사 1 액티브: `02_Projects/CxEMS/...`, `02_Projects/KIEREMS/...` 등 link
   - 회사 2 액티브: `02_Projects/Lucia/...` 등 link

3. `## 보류 중 결정`
   - 결정해야 하지만 못 한 것 (3개 이하)

4. `## 이번 주 한정 피해야 할 것`
   - 예: "새 SaaS 구독 X — 비용 정리 중"
   - 예: "CxEMS 외 신규 프로젝트 X — 마감 집중"

5. `## 최근 알게 된 중요한 것`
   - 자료·결정·사람 (3개 이하)

**Validation**:
- [ ] 5개 섹션 다 있음
- [ ] 전체 200-400자 (짧을수록 좋음)
- [ ] last_updated 갱신됨

---

### Step 6 — research-synthesis/SKILL.md

**위치**: `/07_Lua_System/verticals/_core/skills/research-synthesis/SKILL.md`

**목적**: 3+ 소스 비교/통합. Lens agent가 사용.

**Frontmatter**:
```yaml
---
name: research-synthesis
description: Synthesize research from multiple sources into structured comparison or report. Use when the user asks for competitor analysis, market scan, technology comparison, literature review, pricing intelligence, or any task requiring 3+ source consolidation. Triggers on "비교 분석", "경쟁자 분석", "조사해줘", "시장 조사", "compare X and Y", "research", "synthesize", "compile".
vertical: _core
applies_to: [lens, atlas]
allowed-tools: [Read, Write, WebFetch, WebSearch]
---
```

**Body 구조 — 7개 섹션 (voice-mimicry와 같은 양식)**:

1. `## When this skill activates`
   - 3+ 소스 통합 필요할 때
   - NOT for: 단발 사실 확인 (그건 plain web search)
   - NOT for: 너의 voice로 글쓰기 (그건 voice-mimicry)

2. `## Step 1: Define comparison axes`
   - 비교 차원 max 5개
   - 불명확하면 한 가지만 질문

3. `## Step 2: Source selection strategy`
   - Primary: vendor docs, papers, SEC, gov
   - Secondary: established publications (last 12 months)
   - Avoid: 콘텐츠 팜, sponsored "best of" lists
   - 최소 3개 / 차원당
   - 충돌하면 양쪽 다 표시

4. `## Step 3: Build comparison`
   - Markdown 표 형식 우선
   - 셀: 숫자 + 단위 + 날짜
   - 빈칸은 "—" (절대 "0"이나 "low" 추측 X)

5. `## Step 4: Gap analysis` (실제 가치)
   - 공통점 (table stakes)
   - 스프레드 가장 큰 차원 (실제 결정 포인트)
   - 시장에 없는 것 (기회 영역)

6. `## Step 5: Output and save`
   - `00_Inbox/{YYYY-MM-DD}-research-{topic}.md`
   - Frontmatter: type, sources_count, confidence, last_verified
   - 끝맺음: "Research saved. 다음 단계 결정 필요?"

7. `## Never do`
   - 출처/날짜 없이 숫자 인용
   - 충돌 묻기 ("대부분의 소스가...")
   - 50+ 검색 (12 cap)
   - 추측을 사실처럼
   - 우리에게 유리한 결론으로 휘기

8. `## References`
   - `references/source-evaluation.md`
   - `references/comparison-templates.md`

**Validation**:
- [ ] 6개 step + Never do + References (총 8개 섹션)
- [ ] Body 500 lines 이하
- [ ] description에 영어 + 한국어 키워드 다 있음

---

### Step 7 — references/source-evaluation.md

**위치**: `research-synthesis/references/source-evaluation.md`

**Frontmatter**:
```yaml
---
type: reference
parent_skill: research-synthesis
load: on-demand
---
```

**Body**:

1. `## 신뢰도 등급`
   ```markdown
   | 등급 | 출처 유형 | 사용 가능? |
   |---|---|---|
   | A | 1차 자료 (vendor docs, SEC, gov, peer-reviewed) | 단정조 OK |
   | B | 1차 인용한 established 매체 (NYT, FT, IEEE, 한겨레, 매경) | "보도에 따르면" 형태로 |
   | C | 분석가 보고서 (Gartner, McKinsey, 한국에너지경제연구원) | 출처와 주체 명시 필수 |
   | D | 블로그·중간 매체 (분야 전문가) | "한 의견으로" 표지 |
   | E | 익명 / 콘텐츠 팜 / SEO 글 | 사용 X |
   ```

2. `## 시점 검증`
   - 가격/스펙: 6개월 이내
   - 트렌드: 12개월 이내
   - 기본 원리·역사: 시점 무관
   - 정부 정책: 최신 개정 확인 필수
   - 모든 인용에 게시 날짜 명시

3. `## Conflict resolution`
   1. 가장 최신 + 가장 1차 자료 우선
   2. 충돌 그대로 둘 때: "A는 X라 하고 B는 Y라 함" 형태
   3. 절대 한쪽으로 합치지 마

4. `## Red flag 출처`
   - 게시일 없는 글
   - 작성자 정보 없음
   - "AI generated" 라벨 없는 명백한 AI 글
   - affiliate link 잔뜩

**Validation**:
- [ ] 4개 섹션 다 있음
- [ ] 신뢰도 표에 한국 매체 포함 (한겨레/매경/한국에너지경제연구원 등)

---

### Step 8 — references/comparison-templates.md

**위치**: `research-synthesis/references/comparison-templates.md`

**Body**:

1. `## 경쟁자 비교표 양식`
   ```markdown
   | 항목 | A | B | C | 출처 | 검증일 |
   |---|---|---|---|---|---|
   | 가격 ($/M) | 0.75 | 1.50 | 3.00 | [URL] | 2026-05-13 |
   | 핵심 기능 | ... | ... | ... | ... | ... |
   ```

2. `## 시장 사이징 양식`
   - TAM / SAM / SOM 정의
   - 산정 방식 명시 (top-down vs bottom-up)
   - 가정 명시

3. `## 빈틈 분석 양식`
   - 공통 가정 (모두 공유)
   - 균열 가정 (의견 갈리는 곳)
   - 비어있는 영역

4. `## 한국 시장 특화 양식` (climate-energy 도메인)
   - 정부 R&D 과제 대 민간 시장 비교
   - K-energy 산업 컨텍스트

---

### Step 9 — obsidian-vault-care/SKILL.md

**위치**: `/07_Lua_System/verticals/_core/skills/obsidian-vault-care/SKILL.md`

**목적**: Vault hygiene 자동화. Vault agent 사용.

**Frontmatter**:
```yaml
---
name: obsidian-vault-care
description: Maintain hygiene of the Obsidian vault — fix broken backlinks, detect orphan notes, normalize tags, archive stale Inbox items, verify frontmatter consistency. Triggers on "vault 정리", "obsidian 정리", "vault care", direct invocation by Vault agent, or weekly scheduled run.
vertical: _core
applies_to: [vault, atlas]
allowed-tools: [Read, Write, Bash]
---
```

**Body 구조 — 6개 섹션**:

1. `## When this skill activates`
   - 사람 명시: "vault 정리해줘"
   - 스케줄: 매주 일요일 21:00 (weekly-review 일부)
   - 트리거: 한 세션에 20+ 노트 추가됐을 때

2. `## Step 1: Scan, don't write yet`
   - inventory 먼저
   - `scripts/vault_audit.js` 실행
   - 결과를 `Logs/{YYYY-MM-DD}-vault-scan.md`로

3. `## Step 2: Categorize findings`
   - **Auto-fix** (사람 컨펌 불필요):
     - 누락된 frontmatter 추가
     - 일관된 양식의 link 보정
   - **Propose** (사람 컨펌 권장):
     - orphan note에 백링크 제안
     - 일관성 없는 태그 통합 제안 (AI vs ai)
   - **Ask** (사람 컨펌 필수):
     - 14일+ Inbox 항목 이동 또는 삭제
     - 대량 rename/move

4. `## Step 3: Apply changes via Obsidian REST API`
   - `PATCH /vault/{filepath}` — frontmatter 또는 heading 위치 삽입
   - `POST /vault/{filepath}` — 콘텐츠 append
   - `DELETE /vault/{filepath}` — **반드시 사람 컨펌 후**

5. `## Step 4: Log everything`
   - `Logs/{YYYY-MM}/{YYYY-MM-DD}-vault-changes.md`
   - 변경마다: file / change type / reason / before-after diff

6. `## Forbidden zones`
   - `_meta/` — 절대 X
   - `_System/` — 절대 X
   - `Identity/` — read OK, write는 per-file 사람 컨펌
   - `Drafts/` — read OK, **delete 절대 X**

7. `## Never do`
   - 다른 노트가 참조 중인 파일을 link 업데이트 없이 rename
   - 의미 있는 태그 변경 (`weight: critical` 등)
   - 한 번에 20+ 파일 destructive op

8. `## References`
   - `references/vault-audit-rules.md`

**Validation**:
- [ ] 8개 섹션 다 있음
- [ ] Forbidden zones 명시
- [ ] script 호출 명시

---

### Step 10 — references/vault-audit-rules.md

**위치**: `obsidian-vault-care/references/vault-audit-rules.md`

**Body**:

1. `## Frontmatter required fields per folder`
   ```markdown
   | 폴더 | 필수 필드 |
   |---|---|
   | Identity/ | type, weight, load, last_updated |
   | SOPs/ | type, applies_to, trigger |
   | Skills/ | name, description, vertical |
   | Drafts/ | status, type, target_audience, word_count |
   | Inbox/ | (선택) |
   ```

2. `## Tag normalization rules`
   - 모두 lowercase
   - 한국어 태그: `#기후`, `#에너지`, `#특허` 등 일관되게
   - 영어 태그: `#climate-tech`, `#mvp`, `#proposal` 형태 (kebab-case)

3. `## Orphan detection rules`
   - "Orphan" 정의: 다른 노트 어디서도 link 안 됨
   - 예외: Identity/, _System/, README.md, Hub 파일

4. `## Stale Inbox rules`
   - 14일+ → review 후보 표시
   - 30일+ → 삭제 또는 archive 후보 (사람 컨펌 필수)

---

### Step 11 — scripts/vault_audit.js

**위치**: `/scripts/vault_audit.js`

**목적**: vault-care SKILL이 호출하는 결정적 검증.

**기능**:
1. Orphan note 검출 (다른 노트에서 link 안 된 .md)
2. Broken wiki-link 검출 (`[wiki-link example]` 가 실제 파일 없음)
3. Missing frontmatter 검출 (Identity/, SOPs/, Skills/만)
4. Inconsistent tag 검출 (대소문자 다른 태그)
5. Stale Inbox 항목 (14일+)

**Skeleton (Node.js)**:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT = path.resolve(__dirname, '..');
const STALE_DAYS = 14;
const REPORT = { orphans: [], brokenLinks: [], missingFrontmatter: [], staleInbox: [], inconsistentTags: {} };

// Helper: parse all .md files
async function getAllMarkdown() {
  return await glob('**/*.md', {
    cwd: ROOT,
    ignore: ['node_modules/**', '.obsidian/**', '_meta/**', '_System/**']
  });
}

// Helper: extract wiki-links
function extractWikiLinks(content) {
  return [...content.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
}

// Helper: extract tags
function extractTags(content) {
  return [...content.matchAll(/#([\w가-힣\-]+)/g)].map(m => m[1]);
}

async function detectOrphans(allFiles) {
  const linkTargets = new Set();
  for (const f of allFiles) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    extractWikiLinks(content).forEach(l => linkTargets.add(l));
  }
  
  const exceptions = ['README.md', 'CLAUDE.md', 'Hub'];
  for (const f of allFiles) {
    const basename = path.basename(f, '.md');
    if (exceptions.some(e => basename.includes(e))) continue;
    if (f.includes('_System') || f.includes('Identity')) continue;
    if (!linkTargets.has(basename) && !linkTargets.has(f.replace('.md', ''))) {
      REPORT.orphans.push(f);
    }
  }
}

async function detectBrokenLinks(allFiles) {
  const existingNotes = new Set(allFiles.map(f => path.basename(f, '.md')));
  
  for (const f of allFiles) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    const links = extractWikiLinks(content);
    for (const l of links) {
      const target = l.includes('/') ? path.basename(l) : l;
      if (!existingNotes.has(target)) {
        REPORT.brokenLinks.push({ from: f, to: l });
      }
    }
  }
}

async function detectStaleInbox() {
  const inboxFiles = await glob('00_Inbox/**/*.md', { cwd: ROOT });
  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  
  for (const f of inboxFiles) {
    const stat = fs.statSync(path.join(ROOT, f));
    if (stat.mtimeMs < cutoff) {
      const daysAgo = Math.floor((Date.now() - stat.mtimeMs) / (24 * 60 * 60 * 1000));
      REPORT.staleInbox.push({ file: f, daysOld: daysAgo });
    }
  }
}

async function detectInconsistentTags(allFiles) {
  const tagMap = {}; // lowercase → original casings
  
  for (const f of allFiles) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    const tags = extractTags(content);
    for (const t of tags) {
      const key = t.toLowerCase();
      if (!tagMap[key]) tagMap[key] = new Set();
      tagMap[key].add(t);
    }
  }
  
  for (const [key, variants] of Object.entries(tagMap)) {
    if (variants.size > 1) {
      REPORT.inconsistentTags[key] = [...variants];
    }
  }
}

function printReport() {
  console.log('\n=== Vault audit report ===\n');
  
  console.log(`Orphan notes: ${REPORT.orphans.length}`);
  REPORT.orphans.slice(0, 10).forEach(o => console.log('  • ' + o));
  if (REPORT.orphans.length > 10) console.log(`  ... and ${REPORT.orphans.length - 10} more`);
  
  console.log(`\nBroken links: ${REPORT.brokenLinks.length}`);
  REPORT.brokenLinks.slice(0, 10).forEach(b => console.log(`  • ${b.from} → ${b.to}`));
  
  console.log(`\nStale Inbox (${STALE_DAYS}d+): ${REPORT.staleInbox.length}`);
  REPORT.staleInbox.forEach(s => console.log(`  • ${s.file} (${s.daysOld}일 전)`));
  
  console.log(`\nInconsistent tags: ${Object.keys(REPORT.inconsistentTags).length}`);
  Object.entries(REPORT.inconsistentTags).forEach(([key, variants]) => {
    console.log(`  • ${key}: ${variants.join(', ')}`);
  });
  
  console.log('\n=== End ===\n');
  console.log('이건 report만. 실제 수정은 사람 컨펌 후 vault SKILL 통해서.');
}

async function main() {
  const allFiles = await getAllMarkdown();
  await detectOrphans(allFiles);
  await detectBrokenLinks(allFiles);
  await detectStaleInbox();
  await detectInconsistentTags(allFiles);
  printReport();
}

main().catch(err => {
  console.error('Audit script crashed:', err);
  process.exit(1);
});
```

**Validation**:
- [ ] `node scripts/vault_audit.js` 실행됨 (에러 없이)
- [ ] Report 4개 섹션 (orphans / brokenLinks / staleInbox / inconsistentTags) 다 출력
- [ ] 출력이 사람이 읽기 쉽게 formatted

---

### Step 12 — verticals/_core/commands/weekly-review.md

**위치**: `/07_Lua_System/verticals/_core/commands/weekly-review.md`

**목적**: Slash command 정의. financial-services 패턴 차용 — vertical-level command.

**Frontmatter**:
```yaml
---
name: weekly-review
description: Sunday cycle automation — Vault audit, Inbox triage, Notion sync, Context refresh. Run every Sunday evening or on demand.
vertical: _core
trigger: "/weekly-review"
applies_to: [vault, archivist, atlas]
schedule: "Sunday 21:00 KST"
---
```

**Body**:

```markdown
# /weekly-review

매주 일요일 저녁 운영 사이클. 30분 안에 사람이 다음 주 결정 가능한 상태로 만드는 게 목표.

## 실행 순서

### 1. Vault 정리 (Vault agent + obsidian-vault-care)

- `scripts/vault_audit.js` 실행
- Inbox 7일+ 항목 리뷰
- Orphan 노트 검출
- 깨진 백링크 보수

### 2. Notion 정리 (Archivist)

- 이번 주 종료된 프로젝트 → archive
- "in progress" 인데 7일째 무변동 → flag
- 회의록 요약 페이지 묶기

### 3. 사람이 갱신 (5분)

- `Identity/context.md`의 "이번 주 우선순위" 갱신
- "보류 중 결정" 검토
- 다음 주 한정 피해야 할 것

### 4. 비용·시간 감사 (Atlas)

- `git log --since="7 days ago" --grep="\[agent:"` — 에이전트별 활동
- Manus / Notion credits 사용량
- 예산 한도 대비 비율

## 출력

`01_Command Center/Weekly Review/{YYYY}-W{NN}.md` (또는 기존 Weekly Review 페이지에 append):

- 정리된 항목 요약
- 사람이 결정해야 할 것 (체크박스)
- 비용·사용량 요약
- 다음 주 추천 우선순위
```

**Validation**:
- [ ] Frontmatter 5개 필드 다 있음
- [ ] 4단계 실행 순서 명확
- [ ] 출력 위치 명시

---

### Step 13 — verticals/_core/commands/inbox-triage.md

**위치**: `/07_Lua_System/verticals/_core/commands/inbox-triage.md`

**Frontmatter**:
```yaml
---
name: inbox-triage
description: Triage Inbox items 7+ days old. Categorize, propose destinations, flag for deletion. Run on demand or as part of /weekly-review.
vertical: _core
trigger: "/inbox-triage"
applies_to: [vault, archivist]
---
```

**Body**:

```markdown
# /inbox-triage

## 입력
- 옵션: `--days N` (기본 7일+)

## 단계

### 1. 검출
- `00_Inbox/*.md` 중 mtime이 N일 이상 된 항목
- Lens 결과물 (`type: research`) 분류
- 기타

### 2. 분류 제안
각 항목에 대해 1개 추천:
- → `02_Projects/{project}/` — 특정 프로젝트 관련
- → `04_Resources/` — 일반 참고
- → `03_Operation/Industry Intelligence/` — 산업 동향
- → `05_Archives/` — 더 이상 필요 없음
- → 삭제 후보 (반드시 사람 컨펌)

### 3. 사람 컨펌
체크박스 리스트로 출력. 사람이 승인한 것만 실제 이동.

### 4. 적용
- 승인된 이동/삭제 수행
- 모든 변경 `Logs/`에 기록

## Never do
- 사람 컨펌 없이 삭제
- 사람 컨펌 없이 7개 이상 항목 이동
```

---

### Step 14 — scripts/check.js 확장

**위치**: `/scripts/check.js` (Phase 1 파일을 확장)

**추가 검증**:

```javascript
async function checkIdentity() {
  const required = [
    '01_Command Center/Identity/about-me.md',
    '01_Command Center/Identity/voice.md',
    '01_Command Center/Identity/decision-principles.md',
    '01_Command Center/Identity/context.md',
  ];
  for (const f of required) {
    if (!fs.existsSync(path.join(ROOT, f))) {
      errors.push(`Identity file missing: ${f}`);
    }
  }
  
  // voice.md 채워졌는지 (최소 quality check)
  const voicePath = path.join(ROOT, '01_Command Center/Identity/voice.md');
  if (fs.existsSync(voicePath)) {
    const content = fs.readFileSync(voicePath, 'utf-8');
    const bodyLines = content.split('\n').length;
    if (bodyLines < 30) {
      warnings.push('voice.md 너무 짧음 (< 30 lines). 모범 예시 5개 이상 권장.');
    }
  }
}

async function checkAgentPermissions() {
  const p = path.join(ROOT, '01_Command Center/_System/agent-permissions.md');
  if (!fs.existsSync(p)) {
    errors.push('_System/agent-permissions.md missing');
  }
}

async function checkCommands() {
  const commandFiles = await glob('07_Lua_System/verticals/*/commands/*.md', { cwd: ROOT });
  for (const file of commandFiles) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
    const fm = content.match(/^---\n([\s\S]+?)\n---/);
    if (!fm) {
      errors.push(`${file}: missing frontmatter`);
      continue;
    }
    if (!/^trigger:\s*\S/m.test(fm[1])) {
      errors.push(`${file}: missing 'trigger' in frontmatter`);
    }
  }
}

// main() 함수에 추가
async function main() {
  await checkCLAUDEmd();
  await checkIdentity();              // 추가
  await checkAgentPermissions();      // 추가
  await checkSkills();
  await checkCommands();              // 추가
  await checkMCPConfigs();
  // ... (기존 출력 로직)
}
```

**Validation**:
- [ ] check.js 실행 시 Identity 4개 파일 확인됨
- [ ] voice.md 너무 짧으면 warning 출력
- [ ] commands에 trigger 누락 시 error

---

## 막힐 만한 곳 (미리 경고)

### 1. Identity/voice.md를 너무 추상으로 채우면 무용지물

**잘못된 패턴**:
```markdown
## 톤
- 친절하고 명확하게
- 전문적으로
```

**올바른 패턴**:
```markdown
## 톤
- 직설적이지만 공격적이지 않음. "할 수 없습니다" 대신 "이 방향은 어렵고, 대신 X가 가능"
- 결론 먼저, 근거 나중
- "솔직히 말해서" 같은 cliche 없이도 솔직해야 함
```

룰만 적는 게 아니라 **구체 표현**을 적어. 모델이 그대로 흉내냄.

### 2. 발췌가 부족하면 voice-mimicry 안 됨

**최소 5개 필수, 7-10개 권장**. Vibe CEO Journal에서 발췌하면 30분이면 끝.

발췌 추출 빠른 방법:
- Vibe CEO Journal 최근 10개 글 펼침
- 각 글에서 "이 문장은 나답다" 한 단락 골라냄
- 컨텍스트 한 줄 (언제/누구에게/무엇)
- voice.md 모범 예시 섹션에 붙여넣기

### 3. Phase 1 check.js와 충돌

Step 14에서 check.js 확장할 때 기존 함수 깨뜨리지 마. 새 함수 추가하고 main()에서 호출만.

확장 후 반드시 다시 `node scripts/check.js` → "✓ All checks passed".

### 4. vault_audit.js의 한국어 태그

한글 태그 패턴 (`#기후`, `#에너지`)이 영문 정규식에서 안 잡힐 수 있음. spec의 정규식 `[\w가-힣\-]+`로 됨. 만약 다른 한자/유니코드 태그가 있으면 추가 필요.

### 5. command와 SOP의 차이

- **Command** (`/weekly-review`): 명시적 트리거. 사용자가 의식적으로 호출.
- **SKILL** (`voice-mimicry`): 자동 매칭. 설명 보고 Claude가 알아서 발동.

같은 워크플로우라도 두 방식이 있음. weekly-review는 command (정기 호출), voice-mimicry는 skill (자동).

### 6. agent-permissions.md를 노출하지 마

`_System/` 폴더는 forbidden zone. mcp-obsidian의 noteFilter나 Claude system prompt에서 명시적으로 차단. 차단 안 하면 agent가 자기 권한 매트릭스를 읽고 우회하려고 할 수도 있음 (이론상).

---

## Phase 2 완료 기준

1. [ ] `node scripts/check.js` → "✓ All checks passed (0 warning(s))"
2. [ ] `node scripts/vault_audit.js` 실행 — report 출력됨
3. [ ] Identity/voice.md에 본인 발췌 **5개 이상** 채워짐 + 안티 예시 5개 이상
4. [ ] Claude Desktop에서 voice-mimicry 테스트:
   - "다음 주제로 LinkedIn 포스트 100자 써줘: 솔로 CEO가 에이전트 회사를 만드는 첫 한 달 후기"
   - 결과가 너답게 나오는지 확인. 안 너답다면 voice.md 보강 후 재시도.
5. [ ] GitHub Actions에서 PR check 초록

---

## Phase 3 미리보기

Phase 2가 끝나면 다음:

- **`verticals/climate-energy/skills/proposal-drafting/`** — 회사 1 첫 도메인 skill (정부 R&D 과제 작성, KEIT/KIAT/기후기술원 양식 분기). references에 양식별 디테일.
- **`verticals/climate-energy/skills/patent-filing/`** — 특허 명세서 작성 보조
- **`verticals/climate-energy/skills/carbon-mrv/`** — 탄소 측정/검증/보고
- **`verticals/personal-venture/skills/market-validation/`** — 회사 2 첫 skill
- **`agents/`** — 6명 generic agent system prompt 파일 (Atlas, Scribe, Forge, Lens, Vault, Archivist) + 4명 workflow agent (Proposal Agent, Patent Agent, Industry Intel Agent, Validation Agent)
- **`scripts/sync_skills.js`** — vertical skills → agent bundles 자동 동기화 (financial-services 패턴)
- **`managed-agents/<slug>/agent.yaml`** — headless 배포 wrapper
- **`.github/workflows/`** 확장:
  - `industry-scan.yml` — 매주 산업 동향 자동 스캔 (Industry Intel Agent cron)
  - `pr-voice-check.yml` — `06_Personal Studio/_Drafts/` PR 시 voice_check.js 자동 검증
  - `weekly-review.yml` — 매주 일요일 자동 weekly-review 실행

## Archive Navigation

- Hub: [[05_Archives/Archives Hub|Archives Hub]]
- Current architecture: [[Lua-v4-operating-architecture|Lua v4 Operating Architecture]]

