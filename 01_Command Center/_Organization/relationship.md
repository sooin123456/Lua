---
type: organization-relationship
entities:
  - THEKIE (주식회사 더키)
  - KGCT (한국녹색기후기술원)
relationship_type: sister-entities-with-common-ceo
common_ceo: 조정훈 (THEKIE CEO = KGCT 원장)
imported: 2026-05-13
last_updated: 2026-05-13 (Round 3.1)
note: |
  ⚠️ 이 문서는 외부 노출 금지. 내부 의사결정·skill 운영용.
  외부 자료는 "협력 기관" / "공동연구개발기관" 등 일반 용어 사용.
---

# THEKIE ↔ KGCT 관계

## 한 줄

> **THEKIE CEO 조정훈이 KGCT 원장도 겸함**. 두 법인은 동일 CEO를 공유하는 자매 관계.

## 정체 매핑

```
              CEO = 원장 (조정훈)
                    │
       ┌────────────┴────────────┐
       ▼                          ▼
    THEKIE                     KGCT
  (주식회사 더키)           (한국녹색기후기술원)
       │                          │
  sooin = CTO                  
       │                          │
  주력 분야:                   주력 분야:
  - 모니터링                   - 정부 지정 인증기관
    (BEMS/FEMS/HEMS)            (ZEB/BF/KOLAS/탄소중립건축)
  - 신재생 관리                - KOLAS 국제공인시험기관
    (KIE-REMS 등)              - 그린리모델링 사업
  - 기후테크 (Lucia)           - 시설안전 점검
  - 하드웨어 장치 개발          - 디지털플랫폼센터
                                (CxEMS 등 운영)
```

## 역할 분담 (확인된 패턴)

| 활동 | 주체 | 비고 |
|---|---|---|
| **모니터링 SW 개발·판매** | THEKIE | CxEMS, KIE-REMS 등 |
| **하드웨어 장치 개발** | THEKIE | 신재생 PV, IoT 등 |
| **CxEMS KOLAS 시험** | KGCT 발급 → THEKIE 의뢰 | 시험성적서 25-056699-01-1 |
| **CxEMS ZEB 데이터 운영** | KGCT 디지털플랫폼센터 | |
| **CxEMS 시범 운영 사이트** | KGCT 세종지사 | |
| **인제군 KIE-REMS 발주** | KGCT | THEKIE가 기술 공급 |
| **기후부 커튼월룩 R&D** | KGCT 공동 (비영리) | THEKIE 참여 미확인 |
| **인증·자격 보유** | KGCT (정부 지정 인증기관) | ZEB/BF/KOLAS/탄소중립건축 |
| **벤처·Inno-Biz** | THEKIE | 사업 자격 |

## 자원 공유 / 시너지

### 1. 시험·인증 비용·일정 통제 ⭐

- THEKIE 제품의 GS/KOLAS 시험을 KGCT가 발급
- 외부 시험기관 대비 비용 절감 + 일정 통제
- 가격 경쟁력 (CxEMS 19.8M / 타사 36-40M ≈ 50%) 의 일부 비밀

### 2. 실증 사이트 확보

- KGCT 지사 (세종·부산)를 THEKIE 제품 시범 운영에 활용
- 실증 데이터·사진·운영 보고서 → 우수제품 신청서·R&D 계획서 인용

### 3. 컨소시엄 매트릭스 강화

| 단일 법인 한계 | 양 법인 활용 |
|---|---|
| 중소기업만 | 중소(THEKIE) + 비영리(KGCT) 동시 |
| 시험·인증 외주 | 자체 인증기관 활용 |
| 단일 실증 사이트 | 다지점 실증 (KGCT 지사) |

### 4. 정부 발주 시장 접근

- KGCT의 발주 사업 → THEKIE가 기술 공급
- THEKIE의 솔루션 → KGCT 인증 받아 정부 시장 진입
- 양측 자생적 수익 흐름 + 공동 사업

## proposal-drafting / 외부 노출 가이드

### 절대 사용 금지 표현 (외부 자료에서)

❌ "자매 법인"
❌ "동일 CEO"
❌ "그룹 관계"
❌ "비용 절감을 위해 자체 시험기관"
❌ "내부 시너지"

### 일반 용어로 대체

✅ "공동연구개발기관"
✅ "협력 기관"
✅ "위탁 시험기관"
✅ "수요 기관"
✅ "기술 개발 단계에서부터 인증 기관과 협력"

### 인용 방식

KOLAS 시험성적서 25-056699-01-1 인용 시:
- 발급 기관: "한국녹색기후기술원 (KOLAS 국제공인시험기관)"
- THEKIE와의 관계는 명시 안 함

## Lua 시스템 운영 함의

### Atlas (router agent)

새 작업 들어오면 어느 법인 컨텍스트인지 판별:
- 모니터링 SW / 하드웨어 / 신재생 관리 → THEKIE
- 인증·시험·점검·진단 → KGCT
- 정부 R&D / 인증 신청 → 컨소 표기 가이드 적용

### Scribe (voice agent)

사용자 voice = **THEKIE CTO 관점**. KGCT 관점 글쓰기 X.

### Lens (research-synthesis)

양 법인 모두 영향받는 토픽 (ZEB / 탄소중립 / DPP / 신재생 / BEMS 시장 등) 우선순위.

### Vault (Obsidian 관리)

- Identity/ ↔ _Organization/ 일관성
- 02_Projects/ 사업이 어느 법인 사업인지 명시 (project frontmatter에 `owner_entity` 또는 `consortium_pattern`)

### Archivist (Notion 관리)

Notion에 저장할 정보 분류:
- 내부 only — Organization 관계, 시너지 분석, 가격 정책
- 외부 가능 — 제품 스펙, 공개 인증, 공식 컨소 정보

## 시나리오 framework (확장 가능) ⭐

기존 4종 시나리오는 climate-energy 사업 중심의 **초기 카탈로그**. 사업 라인이 다양해서 더 확장 가능.

### 2차원 매트릭스

```
                    [사업 라인]
[시나리오]       BEMS  FEMS  HEMS  신재생  하드웨어  인증·정책  창업·사업화
─────────────────────────────────────────────────────────────────
A. THEKIE 단독    ✓    ✓    ✓    ✓     ✓        -          ✓
B. KGCT 단독      -    -    -    -     -        ✓          -
C. THEKIE+KGCT    ✓    ✓    ✓    ✓     ✓        ✓          ✓
D. 외부주관+공동   ✓    ✓    -    ✓     ✓        -          -
E. 지자체주관     ✓    ✓    -    ✓     -        -          ✓
F. 민간발주(보조) ✓    ✓    ✓    -     -        -          ✓
G. KGCT발주       ✓    ✓    -    ✓     ✓        ✓          -
```

(✓ = 가능 / - = 일반적으로 안 함 / 빈칸 = 확인 필요)

### 새 제안서 들어오면

1. 어느 사업 라인? (BEMS / FEMS / HEMS / 신재생 / 하드웨어 / 인증 / 창업)
2. 어느 시나리오? (A-G 중 또는 신규)
3. 어느 양식? (A 우수제품 / B 사업조서 / C R&D / 기타)
4. baseline 사례 있나? (past-cases-index.md 검색)
5. 없으면 새 사례 + 새 패턴으로 등록

## 미해결 / 사용자 확인 필요

- 사업 라인별 자원·매출 분배 비중
- 양 법인의 사업 영역 중복 시 우선순위 결정 권한
- 인적 자원 공유 범위 (직원 양쪽 동시 소속? 또는 분리?)
- 회계·법무 처리 방식 (특수관계자 거래 등록 여부)

## Related

- THEKIE 본체: `theKIE.md`
- KGCT 정체: `KGCT.md`
- proposal-drafting (이 컨텍스트 사용): `07_Lua_System/verticals/climate-energy/skills/proposal-drafting/SKILL.md`
- 사업 라인 × 양식 × 시나리오 매트릭스 상세: `proposal-drafting/references/form-patterns.md`
## Navigation

- [[01_Command Center/Master Dashboard|Master Dashboard]]
- [[01_Command Center/_Organization/theKIE|theKIE]]
- [[01_Command Center/_Organization/KGCT|KGCT]]
