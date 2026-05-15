# Lua 패키지 #5 — scripts 확장 (Round 1-4 통합 구조 인식)

## 한 줄

vault 검증·관리 script 3개를 갱신/신규해서 Round 1-4 통합 구조 (`_Organization/`, `agents/`, `past-proposals/` 등)를 정상 인식하게 함.

## 파일 4개

```
scripts/
├── check.js          ← 갱신 (v3.0)
├── vault_audit.js    ← 갱신 (v3.0)
├── sync_skills.js    ← 신규
└── README.md         ← 신규 (사용 가이드)
```

## 핵심 기능

### `check.js` v3.0

새 검사 항목:
- ✅ `_Organization/` 폴더 + 필수 3 파일 (theKIE / KGCT / relationship)
- ✅ `agents/` 폴더 + 6 agent system_prompt
- ✅ `past-proposals/` baseline 사례 수
- ✅ `climate-energy/skills/` skill 디렉토리 수
- ✅ **외부 노출 폴더(03_Operation, 05_Archives)의 자매 법인 키워드 누출 검출** ⭐

3단계 출력: ERROR (필수 누락) / WARNING (권장 누락) / INFO (참고).

### `vault_audit.js` v3.0

통계 항목 추가:
- agent 수 + 각 agent의 sync된 skill 수
- vertical 별 skill 수
- past-proposals 분류 (form_pattern + consortium_scenario)
- frontmatter coverage 비율

### `sync_skills.js` (신규)

verticals → agents/skills 자동 sync:
- 각 agent의 system_prompt.md에서 `07_Lua_System/verticals/...` 패턴 자동 추출
- 추출된 skill을 agent 폴더로 복사 (clean sync, 기존 덮어쓰기)
- `--dry-run`, `--agent=X` 옵션
- packaging (Claude.ai Custom Agents / Cowork / Claude Code) 준비용

## Migration

기존 Phase 1 check.js / Phase 2 vault_audit.js가 있다면 백업 후 덮어쓰기:

```bash
cd /path/to/Lua
mv scripts/check.js scripts/check.js.v1.bak  # 백업 (선택)
mv scripts/vault_audit.js scripts/vault_audit.js.v1.bak  # 백업 (선택)
unzip /path/to/lua-package-5.zip
```

폴더 매핑:
```
lua-package-5/scripts/  → Lua/scripts/  (덮어쓰기 / 신규)
```

검증:
```bash
# 새 check 실행
node scripts/check.js

# 통계
node scripts/vault_audit.js

# sync (현재는 scribe → proposal-drafting만 sync 가능)
node scripts/sync_skills.js --dry-run
```

기대 결과 (Round 1-4 + 5 모두 통합 후):
- check.js: 0 error / 약간의 warning (agent-permissions.md 같은 Phase 2 파일)
- vault_audit: 통계 + insights 출력
- sync_skills: scribe의 proposal-drafting sync 가능

## sensitive keyword 검출 ⭐

`check.js`가 외부 노출 폴더 (03_Operation, 05_Archives)에서 다음 키워드 검출:
- "자매 법인"
- "동일 CEO"
- "sister entity"
- "same CEO"

검출되면 warning + 파일 경로 출력. 사용자가 확인 후 표현 수정.

키워드 추가 / 수정은 `check.js`의 `SENSITIVE_KEYWORDS` 배열 직접 수정 (또는 향후 외부 config 분리 — TODO).

## 다음 단계

이제 인프라 기반 완료:
- Round 1: 초기 골격 (CLAUDE.md, plugin.json, voice-mimicry skill 등)
- Round 2: 컨텍스트 통합 (사업 문서·과거 사례·DPP 정책)
- Round 3 + 3.1: Organization 기반 (THEKIE/KGCT 자매 법인)
- Round 4: agents 6개 system_prompt
- **Round 5: scripts 확장 (검증·통계·sync)** ← 이번 패키지

남은 옵션:

### A. skeleton 4개 본격화
forge / lens / vault / archivist의 system_prompt를 atlas/scribe 수준으로. 각 agent별 skill (verticals/_core/skills/) 정의.

### B. patent-filing skill
특허 자료 받아서 신규 출원 / OA 응답 보조 skill 작성.

### C. managed-agents (Phase 4)
실제 배포 — Claude.ai Custom Agents / Cowork plugin / Claude Code 형태. 동작 시작.

### D. GitHub Actions cron
- industry-scan.yml (Lens 정기 실행)
- weekly-review.yml (Vault 주간 리뷰 자동 생성)
- pr-voice-check.yml (PR 시 voice 일관성 검사)

### E. Phase 2 잔여 작업
- Identity/voice.md
- Identity/decision-principles.md
- _System/agent-permissions.md
- verticals/_core/skills/ (research-synthesis, obsidian-vault-care)

추천: **E → A → C → B → D** 순서.

E가 가장 시급 — Atlas / Scribe가 always-load 하는 voice.md / decision-principles.md / agent-permissions.md가 아직 placeholder. 이것들이 채워져야 agent가 정상 동작.

또는 너 우선순위 다른 거 있으면 그쪽.
