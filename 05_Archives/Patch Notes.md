# Round 3.1 패치 — Organization 명확화 + 시나리오 확장

## 한 줄

Round 3에서 받은 사용자 확인 사항을 반영한 작은 패치:
1. KGCT 원장 조정훈 = THEKIE CEO (동일 인물 확정)
2. 사람 이름 디테일 최소화 — 업체 capabilities + 활용 방식 중심
3. 시나리오 framework 확장 — 사업 라인 (BEMS/FEMS/HEMS/하드웨어/...) × 시나리오 매트릭스

## 변경 파일 4개

| 파일 | 변경 |
|---|---|
| `01_Command Center/_Organization/theKIE.md` | CEO 명확 (조정훈) + 사업 라인 확장 (BEMS/FEMS/HEMS + 하드웨어 + 인증·정책 대응) |
| `01_Command Center/_Organization/KGCT.md` | 사람 이름 표 제거. capabilities 중심. CEO 동일 인물 명시 |
| `01_Command Center/_Organization/relationship.md` | CEO 명확 + 시나리오 framework 2차원 매트릭스 + 외부 노출 가이드 정리 |
| `07_Lua_System/verticals/climate-energy/skills/proposal-drafting/references/form-patterns.md` | **3차원 분류** (사업 라인 × 시나리오 × 양식) + 시나리오 7종 (A-G) 확장 + 매트릭스 |

## 핵심 변경: 3차원 분류 ⭐

새 제안서 들어오면 이제 3차원으로 분류:

### 차원 1: 사업 라인 (8개)
BEMS / FEMS / HEMS / 신재생 관리 / 하드웨어 장치 / 인증·정책 대응 / 기후테크 / 창업·사업화

### 차원 2: 시나리오 (7개, 확장 가능)
A. THEKIE 단독 / B. KGCT 단독 / C. THEKIE+KGCT 공동 /
D. 외부주관+공동 / E. 지자체주관+수행 / F. 민간발주(보조) / G. KGCT발주+THEKIE공급

### 차원 3: 양식 (7개)
A. 우수제품 / B. 사업조서 / C. R&D 계획서 /
D. 인증·시험 신청 / E. 사업화·창업 지원 / F. 민간 보조 사업 / G. (기타)

⇒ 8 × 7 × 7 = 다양한 조합. 현재 baseline 확보된 건 5개 사례 정도. 나머지는 사용자가 자료 추가하면 채워짐.

## 사례 분류 (현재 시점)

| 사례 | 사업 라인 | 시나리오 | 양식 |
|---|---|---|---|
| CxEMS v2.2 우수제품 | BEMS/FEMS/HEMS | A | A |
| 울산 DPP 사업조서 | 기후테크 | E | B |
| 기후부 커튼월룩 R&D | 하드웨어 + BEMS | D | C |
| 코스메카·잉글우드랩 (스마트생태공장) | FEMS | F | F |
| 인제군 KIE-REMS | 신재생 관리 | G | (확인 필요) |

## 미확보 사례 (사용자 자료 받으면 추가)

- **D. 인증·시험 신청** 양식 — KOLAS / GS / ZEB 신청 사례
- **E. 사업화·창업 지원** 양식 — TIPS / 창업진흥원 / 중기부 사례
- **F. 민간 보조 사업** 양식 — 스마트 생태공장 신청서 (코스메카 사례의 신청 시점 양식)
- 하드웨어 R&D만 별도 양식 — 산업부 / 중기부 HW 사업
- HEMS 단독 사업 사례 — 일반적으로 KGCT 참여 X, THEKIE 단독

## 사람 이름 정리 원칙

이전 Round 3에서 있던 사람 이름 디테일들:
- KGCT 이준 부장, 최현호 대리 등
- 제너텍 조정훈 이사

→ 이제 모두 minimum 표기:
- 양 법인 공식 책임자 정보만 (조정훈 — CEO=원장 fact만)
- 컨소 사례에서 책임자는 "주관 책임자 1인", "공동 책임자 N인" 형태
- 단, 사용자가 자료에서 알아볼 수 있는 정도는 그 사례 파일에 유지

(이 패치에는 past-proposals 파일들의 사람 이름 정리는 포함 안 됨. 큰 변경 아니라 사용자가 vault에서 직접 정리 가능.)

## Migration

이전 Round 3을 vault에 통합한 상태에서:

```bash
cd /path/to/Lua
unzip lua-package-3.1.zip
# 폴더 그대로 덮어쓰기
```

폴더 매핑:
```
lua-package-3.1/01_Command Center/   → Lua/01_Command Center/  (덮어쓰기)
lua-package-3.1/07_Lua_System/        → Lua/07_Lua_System/  (덮어쓰기)
```

검증:
```bash
node scripts/check.js
node scripts/vault_audit.js
```

git commit:
```bash
git commit -m "[round-3.1] Org clarification + scenario framework expansion

- KGCT 원장 조정훈 = THEKIE CEO confirmed
- Remove people-name details, focus on entity capabilities
- Expand scenario framework: 3-dimensional matrix
  (business line × scenario × form pattern)
- Add 4 new scenarios (B/E/F/G) and 4 new form patterns (D/E/F/G)"
```

## 다음 단계

Round 3.1까지 통합되면 Identity/Organization 기반 + proposal-drafting framework 완성. 다음 작업:

- patent-filing skill
- 6개 agents의 system-prompt.md
- scripts/sync_skills.js 확장

또는 사용자가 우선순위 다른 거 있으면 그쪽으로.
