---
name: research-synthesis
description: Synthesize research from multiple sources into structured comparison or report. Use when the user asks for competitor analysis, market scan, technology comparison, literature review, pricing intelligence, or any task requiring 3+ source consolidation. Triggers on "비교 분석", "경쟁자 분석", "조사해줘", "시장 조사", "compare X and Y", "research", "synthesize", "compile".
vertical: _core
applies_to: [lens, atlas]
allowed-tools: [Read, Write, WebFetch, WebSearch]
---

# research-synthesis

## When this skill activates

서로 다른 출처에서 온 정보를 **한 장의 비교표나 짧은 리포트**로 묶어야 할 때 사용한다. 최소 3개의 독립 소스를 전제로 한다.

명시적 트리거: 경쟁사 비교, 시장 스캔, 기술 비교, 문헌 조사, 가격·요금 지표 수집.

암시적 트리거: “누가 더 빠른가”, “규제 차이가 뭔가”, “이 세 가지 옵션 중 무엇이 현실적인가”.

NOT for:

- 단발 사실 확인(그냥 검색 한 번이면 됨)
- 사용자 voice로 외부 발행 글 쓰기(voice-mimicry로 라우팅)
- 코드 작성·리팩터링(Forge)

## Step 1: Define comparison axes

비교 차원은 **최대 5개**로 제한한다. 불명확하면 가장 load-bearing한 질문 **하나만** 묻는다.

## Step 2: Source selection strategy

- Primary: vendor docs, papers, SEC, 정부 공개자료
- Secondary: 신뢰 매체(최근 12개월)
- Avoid: 콘텐츠 팜, 스폰서 “best of” 리스트
- 차원마다 최소 3개 소스. 충돌하면 한쪽을 버리지 말고 둘 다 남긴다.

## Step 3: Build comparison

Markdown 표를 기본 형식으로 쓴다. 셀에는 **숫자 + 단위 + 검증일**을 넣는다. 빈칸은 `—`로 두고 `0`이나 `low` 같은 추측으로 채우지 않는다.

## Step 4: Gap analysis

- 공통 가정(table stakes)
- 스프레드가 가장 큰 차원(실제 결정 포인트)
- 시장/문헌에 비어 있는 영역(기회 또는 리스크)

## Step 5: Output and save

`00_Inbox/{YYYY-MM-DD}-research-{topic}.md`에 저장한다.

Frontmatter 예시 필드: `type: research`, `sources_count`, `confidence`, `last_verified`.

마지막 한 줄: “Research saved. 다음 단계 결정 필요?”

## Never do

- 출처·날짜 없이 숫자를 단정한다
- “대부분의 소스가…”처럼 충돌을 숨긴다
- 검색 12회 이상 cap을 넘기는 폭주(필요하면 범위를 줄인다)
- 추측을 사실처럼 쓴다
- 우리에게 유리한 결론으로 표를 기울인다

## References

- `references/source-evaluation.md`
- `references/comparison-templates.md`
