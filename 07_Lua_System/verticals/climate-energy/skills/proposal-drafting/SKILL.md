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

# proposal-drafting

## When this skill activates

정부 R&D 과제 양식 작성 요청. 트리거:

- "[기관명] [공고번호] 과제 초안 만들어줘"
- "KEIT 양식으로 제안서 써줘"
- "탄소중립 과제 본문 구성"

NOT for:

- 민간 투자 제안서 (별도 skill, 이후 단계)
- 정책 보고서 전체 (research-synthesis가 더 적합)
- 단순 사실 확인

이 skill은 **voice-mimicry**와 **research-synthesis**를 함께 전제로 한다 (`depends_on`).

## Step 1: Identify grant program

사용자 입력에서 grant program을 특정한다.

- KEIT (한국산업기술기획평가원) — 산업부 R&D
- KIAT (한국산업기술진흥원) — 산업부 산하
- KETEP (한국에너지기술평가원) — 에너지 R&D
- 한국기후기술원 — 기후·환경 R&D
- 기타 (KIST, ETRI 등 직접 출연연)

각 program별 양식은 `assets/{program}-template.md`에 맞춘다. (`keit-template.md`, `kiat-template.md`, `climate-tech-template.md` 등.) 모르는 program이면 Lens로 공고문을 먼저 요약한다.

## Step 2: Load grant program details

해당 program의 template 파일과 `references/grant-programs.md`를 읽는다.

- 표지·헤더 필드(과제명, 주관, 책임자, 기간, 사업비)
- 본문 섹션 순서와 분량 제한
- 평가 기준(기술성/사업성/수행능력 가중)
- 마감·평가 일정(불명확하면 사용자에게 한 질문)

## Step 3: Gather supporting context

Vault `02_Projects/` 검색 또는 사용자 질문으로 채운다.

- 과제 핵심 아이디어(한 단락)
- 기존 연구 성과·실증
- 컨소시엄/협력기관(확인된 사실만)
- 예상 사업비 규모
- 차별화 포인트

부족하면 **질문 하나**만 한다. 비어 있어도 초안은 시작한다.

## Step 4: Structure the body

`references/proposal-structure.md` 순서를 따른다.

1. **연구개발 목적·필요성** (1–2p) — 시장·기술·정책 3축, 정량 근거는 Lens
2. **국내외 기술개발 동향** (2–3p) — 글로벌 3–5주체, 국내 경쟁·정책, 우리 위치
3. **연구개발 내용/추진방법** (3–5p) — 모듈·지표·일정
4. **추진체계** (1p) — 주관/참여 역할, 의사결정
5. **기대효과** (1–2p) — 기술·경제·사회(정책 부합)
6. **사업비 계획** (1p) — 인건비/재료비/활동비/간접비 비율(Forge·스프레드시트는 Phase 4 연동)

## Step 5: Apply voice

voice-mimicry를 적용하되 정부 과제 톤은 다음을 추가한다.

- 격식 있는 평어체(해라체/이다체) 허용
- 정량 표현 우선(“30% 향상” 등)
- 정책 키워드는 자연스럽게 배치
- 형식 wind-up 금지(“본 연구는…” 남발 X)

`Identity/voice.md`의 금지어·안티 예시는 그대로 적용한다.

## Step 6: Self-check before delivering

1. 평가 3축에 맵핑되는가  
2. 섹션 분량 제한 준수  
3. 정량 수치에 출처·날짜  
4. 해당 program이 강조하는 정책 키워드와 충돌 없는가  
5. 우리 강점이 한눈에 드는가  

하나라도 실패하면 해당 섹션만 다시 쓴다.

## Step 7: Save and signal

- 경로: `02_Projects/{project-name}/proposals/{YYYY-MM-DD}-{program}-{slug}.md`  
  또는 신규 프로젝트면 `03_Operation/Proposals/{YYYY-MM-DD}-{program}-{slug}.md`
- Frontmatter 예시:

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

- 마지막 줄: `Draft saved at {path}. 양식 검증 + 인용 출처 재확인 필요.`

## Never do

- 정량 데이터를 출처 없이 인용
- 마감일·예산 임의 추측
- 양식 분량 초과
- 평가 기준에 없는 자랑으로 점수를 노림
- 정책 부합을 억지로 끼워 맞춤
- 미확인 인증·특허를 “보유”로 표현
- 컨소시엄 사실 확인 없이 단정

## References

- `references/grant-programs.md` — program 메타
- `references/proposal-structure.md` — 섹션별 작성 디테일
- `assets/keit-template.md`, `assets/kiat-template.md`, `assets/climate-tech-template.md` — 양식 골격
