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

# patent-filing

## When this skill activates

특허 명세서 초안 또는 청구항 구조화. 트리거:

- "[발명 제목] 특허 명세서 초안"
- "이 발명의 청구항 구조 만들어줘"
- "선행기술 정리해줘"

**비협상 조건**: 모든 출력은 **변리사 final check 전제**다. 이 skill은 변리사를 대체하지 않고 보조만 한다.

NOT for:

- 출원서 제출 자체, 수수료 납부
- 청구항의 법적 유효성 최종 판단
- PCT·해외 출원 전략 단독 결정

## Step 1: Capture invention disclosure

확보할 정보:

- 발명의 명칭(가칭)
- 해결하려는 기술 과제(한 단락)
- 핵심 기술 요소 3–7개
- 종래 기술 대비 차별점
- 실시예 1–3개(형태·환경)

부족하면 **차별점**을 묻는 질문 하나만 한다.

## Step 2: Prior art search

research-synthesis 흐름을 따른다. KIPRIS·USPTO·EPO·학술을 `references/prior-art-search.md` 규칙으로 조사한다.

결과는 `00_Inbox/{YYYY-MM-DD}-prior-art-{slug}.md`에 저장한다.

## Step 3: Structure claims

`references/patent-structure.md`를 따른다.

- **독립항 1**: 한 문장, 본질 요소만, 불필요 한정 최소화
- **종속항 2–N**: 제1항을 단계적으로 한정, 요소 1개씩 추가
- 권장 개수: 대한민국 출원 기준 통상 10–20개(발명 복잡도에 따름)

## Step 4: Write specification body

1. 발명의 명칭 — 독립항과 정합
2. 기술 분야 — IPC 한 단락
3. 배경 기술 — 선행 + 한계
4. 발명의 내용 — 과제, 해결 수단, 효과
5. 도면의 간단한 설명 — 도면번호별 한 줄
6. 발명을 실시하기 위한 구체적인 내용 — 실시예 1–3
7. 도면 — Mermaid/PlantUML/SVG 골격(필요 시)

## Step 5: Apply voice

일반 산문 voice와 달리 **특허 톤**을 적용한다.

- 법적 정확성 우선, 한 문장 한 의미
- 용어 일관(동의어 난립 금지)
- “혁신적” 같은 자평 금지

## Step 6: Self-check

1. 독립항이 차별점만 담는가  
2. 종속항이 단계적으로 한정되는가  
3. 명세서가 모든 청구항을 지지하는가  
4. 용어 일관성  
5. 실시예가 청구항과 매핑되는가  
6. 선행이 인용되고 차별이 드러나는가  
7. 도면 설명과 번호가 일치하는가  

## Step 7: Save and signal

- 경로: `02_Projects/{project}/patents/{YYYY-MM-DD}-{title}.md` 또는 `03_Operation/Patents/{YYYY-MM-DD}-{title}.md`

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

- 마지막 줄: `Draft saved. 변리사 검토 필수. 출원 전 prior art 재검증 권장.`

## Never do

- 권리범위를 지나치게 좁혀 실익을 버리기
- 선행을 무시하고 과도하게 넓은 청구
- “혁신적인”, “획기적인” 같은 자평
- 출원 전 공개(학회·논문·SNS)
- 변리사 없이 최종 출원을 전제로 한 단정
- 동일 발명의 이중출원 시도

## References

- `references/patent-structure.md`
- `references/prior-art-search.md`
- `assets/patent-template.md`
