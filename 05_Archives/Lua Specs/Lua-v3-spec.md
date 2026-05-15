---
type: build-spec
phase: 1
target_completion: skeleton-with-first-skill
last_updated: 2026-05-13
---

# Lua v3 — Phase 1 Build Specification

> Cursor에서 옆에 띄워놓고 step별로 따라가. 파일 생성은 너가, 명세는 이 문서가 담당.

## Goal

`07_Lua_System/` 골격 + `CLAUDE.md` + `verticals/_core/skills/voice-mimicry/` 완전 구현.

이 phase가 끝나면:
- `anthropics/skills`의 progressive disclosure 패턴 적용 완료
- `anthropics/financial-services`의 verticals + scripts/check 패턴 적용 완료
- 첫 production-ready skill (voice-mimicry)이 동작
- GitHub Actions로 PR마다 자동 검증

Phase 2 (다음 단계, 별도 응답):
- `research-synthesis`, `obsidian-vault-care` skills
- `verticals/climate-energy/` 도메인 skills (proposal-drafting, patent-filing, carbon-mrv)
- `verticals/personal-venture/` skeleton
- `agents/` 명단 구현

Phase 3:
- `managed-agents/` headless 배포
- 추가 GitHub Actions workflow (industry-scan, weekly-review cron)

---

## Build Order — 체크리스트

순서대로. 각 step 끝나면 validation 섹션 확인 후 다음 step.

- [ ] **Step 1** — 디렉토리 트리 생성 (mkdir -p)
- [ ] **Step 2** — `/CLAUDE.md` (vault root)
- [ ] **Step 3** — `/.claude-plugin/plugin.json`
- [ ] **Step 4** — `07_Lua_System/verticals/_core/README.md`
- [ ] **Step 5** — `07_Lua_System/verticals/_core/.mcp.json`
- [ ] **Step 6** — `verticals/_core/skills/voice-mimicry/SKILL.md`
- [ ] **Step 7** — `references/voice-samples.md`
- [ ] **Step 8** — `references/anti-patterns.md`
- [ ] **Step 9a** — `assets/blog-template.md`
- [ ] **Step 9b** — `assets/email-template.md`
- [ ] **Step 10** — `scripts/check.js`
- [ ] **Step 11** — `.github/workflows/check.yml`

---

## Phase 1 끝났을 때 디렉토리 상태

```
Lua/
├── CLAUDE.md                                       [Step 2 — new]
├── README.md                                       (기존)
├── .claude-plugin/
│   └── plugin.json                                 [Step 3 — new]
├── .obsidian/                                      (기존)
├── .gitignore                                      (기존)
├── .github/
│   └── workflows/
│       └── check.yml                               [Step 11 — new]
├── scripts/
│   └── check.js                                    [Step 10 — new]
├── 00_Inbox/                                       (기존)
├── 01_Command Center/                              (기존)
├── 02_Projects/                                    (기존)
├── 03_Operation/                                   (기존)
├── 04_Resources/                                   (기존)
├── 05_Archives/                                    (기존)
├── 06_Personal Studio/                             (기존)
├── 07_Lua_System/                                  [Step 1 — new]
│   ├── agents/                                     (Phase 2 — 빈 폴더로 둠)
│   ├── verticals/
│   │   ├── _core/
│   │   │   ├── README.md                           [Step 4 — new]
│   │   │   ├── .mcp.json                           [Step 5 — new]
│   │   │   ├── skills/
│   │   │   │   └── voice-mimicry/
│   │   │   │       ├── SKILL.md                    [Step 6 — new]
│   │   │   │       ├── references/
│   │   │   │       │   ├── voice-samples.md        [Step 7 — new]
│   │   │   │       │   └── anti-patterns.md        [Step 8 — new]
│   │   │   │       └── assets/
│   │   │   │           ├── blog-template.md        [Step 9a — new]
│   │   │   │           └── email-template.md       [Step 9b — new]
│   │   │   └── commands/                           (Phase 2 — 빈 폴더)
│   │   ├── climate-energy/                         (Phase 2 — 빈 폴더)
│   │   └── personal-venture/                       (Phase 2 — 빈 폴더)
│   └── managed-agents/                             (Phase 3 — 빈 폴더)
└── 99_Templates/                                   (기존)
```

---

## File Specifications

### Step 1 — 디렉토리 트리

Cursor 터미널에서 한 번에:

```bash
mkdir -p 07_Lua_System/agents
mkdir -p 07_Lua_System/verticals/_core/skills/voice-mimicry/references
mkdir -p 07_Lua_System/verticals/_core/skills/voice-mimicry/assets
mkdir -p 07_Lua_System/verticals/_core/commands
mkdir -p 07_Lua_System/verticals/climate-energy
mkdir -p 07_Lua_System/verticals/personal-venture
mkdir -p 07_Lua_System/managed-agents
mkdir -p .claude-plugin
mkdir -p .github/workflows
mkdir -p scripts
```

**Validation**: `find 07_Lua_System -type d | sort`로 모든 디렉토리 보이는지 확인.

---

### Step 2 — /CLAUDE.md (vault root)

**위치**: `/CLAUDE.md` (repo 루트)

**목적**: 모든 agent가 첫 번째로 읽는 system context. `anthropics/financial-services` 패턴 그대로 차용 — 최상위 컨텍스트는 단일 진실 소스.

**길이 제한**: 500 lines 이하 (Anthropic Skills best practice)

**Frontmatter (YAML)**:
```yaml
---
type: system-root
load: always
priority: critical
last_updated: 2026-05-13
---
```

**Body 구조 — 필수 8개 섹션 (이 순서)**:

1. **`# Lua`** — 한 줄 정의
   - 예: "Solo agent company for climate-energy R&D (company 1) and personal ventures (company 2)."

2. **`## Who I am`** — Identity 파일들 link
   - `[[01_Command Center/Identity/about-me]]` — 기본 사실
   - `[[01_Command Center/Identity/voice]]` — 글 톤
   - `[[01_Command Center/Identity/decision-principles]]` — 트레이드오프 결정
   - `[[01_Command Center/Identity/context]]` — 단기 컨텍스트
   - 본문에서 "Always read these four before any task" 명시

3. **`## Verticals`** — 3개 vertical (각 1-2줄):
   - `_core` — 모든 agent가 공유하는 generic skills (voice-mimicry, research-synthesis, vault-care)
   - `climate-energy` — Company 1. 에너지 모니터링/기후/탄소 사업. 정부 R&D 과제, 특허, 산업 동향.
   - `personal-venture` — Company 2. 신규 개인 사업 아이디어 검증/MVP.

4. **`## Routing rule`** — 어느 vertical로 갈지 결정 기준 (한 단락)
   - 예시 로직: "정부/특허/탄소/에너지 키워드 → climate-energy. 신규 아이디어/검증/MVP 키워드 → personal-venture. 위 모두 X면 _core."

5. **`## Agent loop`** — Harness Loop link
   - `[[01_Command Center/Harness Loop]]`
   - 한 문장: "Every agent invocation follows the Harness Loop: invoke → check → refine → log."

6. **`## Safety boundaries`** — 비협상 룰
   - All drafts → `06_Personal Studio/_Drafts/`, never publish or send directly
   - Operations touching `01_Command Center/Identity/` require explicit human confirmation per file
   - Budget caps live in `decision-principles.md`
   - `_meta/` and `_System/` are off-limits to all agents

7. **`## Vault permissions`** — `[[01_Command Center/_System/agent-permissions]]` link
   - Phase 2에서 _System/agent-permissions.md 만들 거니까 지금은 link만 박아두기

8. **`## When to ask vs when to act`** — 한 단락
   - Default: ask one load-bearing question if anything ambiguous
   - Act without asking: when SOP explicitly covers the case
   - Always ask: external publication, money, replies to humans, Identity changes

**Validation**:
- [ ] 8개 섹션 다 있는가
- [ ] Frontmatter 4개 필드 다 있는가
- [ ] Body가 500 lines 이하인가
- [ ] Identity 4개 파일 link가 작동하는가 (Obsidian preview에서 미리보기 되는지)

---

### Step 3 — /.claude-plugin/plugin.json

**위치**: `/.claude-plugin/plugin.json`

**목적**: financial-services 패턴의 plugin manifest. Phase 2/3에서 marketplace 등록 시 사용. 지금은 metadata만.

**내용 (그대로 사용 가능)**:
```json
{
  "name": "lua",
  "version": "0.1.0",
  "description": "Solo agent company for climate-energy R&D and personal ventures",
  "author": "sooin",
  "marketplace": false,
  "verticals": [
    "_core",
    "climate-energy",
    "personal-venture"
  ],
  "agents": []
}
```

`agents: []`는 Phase 2에서 채움. 빈 배열로 두기.

**Validation**:
- [ ] `jq . .claude-plugin/plugin.json` 통과 (valid JSON)
- [ ] verticals 배열에 3개 다 있음

---

### Step 4 — 07_Lua_System/verticals/_core/README.md

**위치**: `/07_Lua_System/verticals/_core/README.md`

**목적**: _core vertical 무엇 포함하는지 정리. 사람용 + agent가 디스커버리 용으로 읽을 수도.

**Frontmatter**:
```yaml
---
type: vertical-readme
vertical: _core
---
```

**Body 구조**:

1. **`# _core vertical`** — 한 줄 정의
   - "Shared skills and connectors used by all agents and all verticals."

2. **`## Skills`** — 각 skill 한 줄 + link:
   ```
   - `[voice-mimicry](skills/voice-mimicry/SKILL.md)` — Write in user's voice
   - `research-synthesis` — Multi-source comparison (Phase 2)
   - `obsidian-vault-care` — Vault hygiene (Phase 2)
   ```

3. **`## Commands`** (Phase 2 placeholder):
   ```
   Phase 2 추가 예정:
   - `/weekly-review` — Sunday cycle automation
   - `/inbox-triage` — Inbox 14일+ 항목 정리
   ```

4. **`## MCP connectors`** — `.mcp.json` 참조
   - 현재: obsidian, notion
   - Phase 2 추가: slack

5. **`## Used by`** — 모든 agent (Phase 2에서 list로 채움. 지금은 "All agents (Phase 2 list)" 한 줄)

**Validation**:
- [ ] 5개 섹션 다 있음
- [ ] voice-mimicry link가 SKILL.md를 가리킴

---

### Step 5 — 07_Lua_System/verticals/_core/.mcp.json

**위치**: `/07_Lua_System/verticals/_core/.mcp.json`

**목적**: financial-services와 동일 패턴. vertical-level MCP connector 정의.

**내용**:
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "uvx",
      "args": ["mcp-obsidian"],
      "env": {
        "OBSIDIAN_API_KEY": "${OBSIDIAN_API_KEY}",
        "OBSIDIAN_HOST": "127.0.0.1",
        "OBSIDIAN_PORT": "27123"
      }
    },
    "notion": {
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

**전제조건 (먼저 셋업)**:
- Obsidian Community plugin "Local REST API" 설치 + 활성화 + API key 발급
- 환경변수 설정: `.env` 파일에 `OBSIDIAN_API_KEY=...` 추가
- `.gitignore`에 `.env` 추가 (이미 있을 수도 있음 — 확인)

**Validation**:
- [ ] `jq . .mcp.json` 통과
- [ ] `OBSIDIAN_API_KEY` 환경변수 설정됨
- [ ] `.env`가 `.gitignore`에 포함됨

---

### Step 6 — voice-mimicry/SKILL.md

**위치**: `/07_Lua_System/verticals/_core/skills/voice-mimicry/SKILL.md`

**목적**: 첫 production-ready skill. 너의 voice로 글 쓸 때 자동 발동.

**Frontmatter (필수, anthropics/skills 양식 엄수)**:
```yaml
---
name: voice-mimicry
description: Write in the user's authentic voice based on Identity/voice.md. Use whenever drafting blog posts, emails, social posts, reports, or any prose meant to sound like the user wrote it personally. Triggers on "write a post", "draft an email", "make this sound like me", "글 써줘", "블로그 초안", "이메일 답장 작성", "포스트 써줘".
vertical: _core
applies_to: [scribe, atlas]
allowed-tools: [Read, Write]
---
```

**Description 룰**:
- max 1024 chars (현재 ~370)
- "Use whenever..." 패턴
- 한국어 트리거 키워드 포함 (네가 한국어로 호출할 때 라우팅됨)
- 너무 짧으면 라우팅 정확도 떨어짐 (financial-services 권장: 트리거 + use case 모두 명시)

**Body 구조 (필수 7개 섹션, 이 순서)**:

```markdown
# voice-mimicry

## When this skill activates

[자동 활성화 조건. 어떤 task가 들어왔을 때 발동하는지 1-2단락]

명시적 트리거:
- "Write a blog post about X"
- "Draft an email to Y"
- "Make this sound like me"
- 한국어: "X에 대해 글 써줘", "이메일 답장 작성"

암시적 트리거:
- Any prose intended for external audience
- Anything that will be published or sent

NOT for:
- Internal notes (use plain Markdown)
- Code (route to Forge)
- Research compilation (route to Lens)

## Step 1: Load voice profile

Read `01_Command Center/Identity/voice.md` first, every single time. Pay attention to:
- Banned words and phrases
- Anti-examples (writing patterns to never produce)
- Tone defaults
- Structural preferences

Also load `01_Command Center/Identity/about-me.md` for context on who's writing.

## Step 2: Match structural preferences

From Identity/voice.md:
- Lead with the conclusion in the first 2 sentences
- Prose over bullets unless explicitly asked
- Close decisively — no open questions, no "what do you think?"
- Paragraph length: 3-4 sentences

## Step 3: Format-specific guidance

If format is **blog post**:
- Use `assets/blog-template.md` as the frontmatter skeleton
- Target 500-1500 words unless specified
- Conclusion → 3 supporting points → opening (write opening last)

If format is **email**:
- Use `assets/email-template.md`
- First sentence = the answer (yes/no/next step)
- 50-300 chars usually
- No "안녕하세요 좋은 하루 보내고 계신가요" wind-up

Phase 2 추가 예정:
- LinkedIn template
- Twitter/X template
- Newsletter template

## Step 4: Self-check before delivering

Pass through these four checks:

1. Any sentence sounds like "as an AI..." or hedges unnecessarily?
2. Are banned words from voice.md present?
3. Does the opening lead with conclusion?
4. Does it close decisively?

If any check fails, rewrite that section before delivering.

## Step 5: Save and signal

- Save to `06_Personal Studio/_Drafts/{YYYY-MM-DD}-{slug}.md`
- Frontmatter required: `status: draft`, `type`, `target_audience`, `word_count`, `created`
- End the agent message with: "Draft saved at _Drafts/{filename}. Awaiting review."
- Never publish, send, or post directly. This boundary is non-negotiable.

## Never do

- Invent facts, statistics, quotes, or names
- Publish or send directly (always stage in _Drafts/)
- Generic "professional" voice that's not the user's
- Open with "As an AI assistant..." or apologize for capabilities
- Use clickbait headlines

## References

- For deeper voice samples: `references/voice-samples.md`
- For anti-pattern catalog: `references/anti-patterns.md`

When in doubt, ask ONE clarifying question — the most load-bearing one.
```

**Validation**:
- [ ] Frontmatter 4개 필드 (name, description, vertical, applies_to) 모두 있음
- [ ] description에 영어 + 한국어 트리거 키워드 모두 있음
- [ ] description 길이 1024 chars 이하
- [ ] Body 7개 섹션 다 있음 (When/Step 1-5/Never do/References)
- [ ] Body 500 lines 이하
- [ ] References 안 링크가 실제 파일 가리킴

---

### Step 7 — references/voice-samples.md

**위치**: `voice-mimicry/references/voice-samples.md`

**목적**: 너의 진짜 글 발췌 모음. 모델이 추상적 룰보다 구체 예시를 더 잘 따라.

**Frontmatter**:
```yaml
---
type: reference
parent_skill: voice-mimicry
load: on-demand
---
```

**Body 구조 (5개 섹션)**:

1. `## 짧은 글 (200자 이하)` — 트윗/소셜 포스트 5-10개. 빈 placeholder로 두고 너가 채움.
2. `## 중간 글 (500-1000자)` — LinkedIn 포스트, 메모 발췌 2-3개
3. `## 긴 글 (1500자+)` — 블로그 단락 발췌 1-2개
4. `## 메일 톤 예시` — 거절/협업 제안/사과 각 1-2개
5. `## 한국어 vs 영어 변환 패턴` — 같은 메시지를 두 언어로 (표 형태)

**채우는 팁**:
- Vibe CEO Journal에서 발췌하면 빠름
- 한 발췌마다 50자 컨텍스트 (언제/누구에게/무엇을 위해 쓴 글인지)
- 5개 미만이면 모델이 일반적 톤으로 회귀함 — 최소 5개 권장

**Validation**:
- [ ] 5개 섹션 다 있음
- [ ] frontmatter 3개 필드 다 있음

---

### Step 8 — references/anti-patterns.md

**위치**: `voice-mimicry/references/anti-patterns.md`

**목적**: 절대 쓰면 안 되는 패턴 카탈로그. voice-samples.md가 "이렇게 써"라면 이건 "이렇게 쓰지 마".

**Frontmatter** (Step 7과 동일)

**Body 구조 (4개 섹션, 각 5-10개 예시)**:

1. `## 자기 비하 패턴`
   - "제가 아직 부족해서..."
   - "확신은 없지만..."
   - "혹시 제가 틀렸을 수도 있는데..."

2. `## 과한 친절 / hedging`
   - "혹시 시간 괜찮으시다면..."
   - "불편을 끼쳐드려 죄송합니다만..."
   - "어쩌면 제 생각이 잘못된 것일 수도 있지만..."

3. `## AI 잡소리`
   - "종합적으로 분석해 보면"
   - "다각도로 접근하여"
   - "인사이트를 도출할 수 있습니다"
   - "혁신적인 솔루션"

4. `## 한국어 비즈니스 클리셰`
   - "안녕하세요, 좋은 하루 보내고 계신가요?"
   - "다름이 아니라"
   - "본격적으로 들어가기 전에"

각 패턴마다 가능하면 **대체 표현** 한 줄 (예: "확신은 없지만 → 한 가지 방향은").

**Validation**:
- [ ] 4개 섹션 다 있음
- [ ] 각 섹션 최소 3개 예시
- [ ] 대체 표현 포함

---

### Step 9a — assets/blog-template.md

**위치**: `voice-mimicry/assets/blog-template.md`

**목적**: Scribe가 블로그 초안 만들 때 복붙해서 채우는 frontmatter + 구조.

**내용**:
```markdown
---
title: 
slug: 
type: blog
target_audience: 
word_count: 
status: draft
created: YYYY-MM-DD
---

# {title}

{첫 2문장 안에 결론 — 이 글이 무엇을 말하는지}

## {핵심 근거 1}

{본문 1단락, 3-4문장}

## {핵심 근거 2}

{본문 1단락}

## {핵심 근거 3}

{본문 1단락}

{단호한 마무리 — 다음 행동 또는 명확한 선언}
```

**Validation**:
- [ ] Frontmatter 7개 필드 다 있음
- [ ] 본문 구조에 "결론 먼저 → 근거 3개 → 단호한 마무리" 패턴 보임

---

### Step 9b — assets/email-template.md

**위치**: `voice-mimicry/assets/email-template.md`

**내용**:
```markdown
---
to: 
from: 
subject: 
type: email
status: draft
created: YYYY-MM-DD
---

{첫 문장: 핵심 답 또는 명확한 다음 행동. wind-up X.}

{본문 1-2단락. 이유 또는 디테일.}

{마무리: 다음 행동 한 줄 또는 단호한 마침표. "감사합니다" 한 번 이내.}
```

**Validation**:
- [ ] Frontmatter 6개 필드
- [ ] 본문이 3블록 (첫 문장 / 본문 / 마무리)

---

### Step 10 — scripts/check.js

**위치**: `/scripts/check.js`

**목적**: financial-services의 check.py를 Node.js로. PR마다 자동 실행되는 vault 검증.

**전제조건**:
```bash
# vault root에서
npm init -y    # package.json 없으면
npm install glob
```

**.gitignore에 추가** (없다면):
```
node_modules/
.env
```

**Skeleton (그대로 사용 가능, Phase 2에서 확장)**:

```javascript
#!/usr/bin/env node
/**
 * Lua vault validator.
 * Checks: CLAUDE.md exists, all SKILL.md have required frontmatter,
 * SKILL.md bodies <= 500 lines, references files exist.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];

async function checkCLAUDEmd() {
  const p = path.join(ROOT, 'CLAUDE.md');
  if (!fs.existsSync(p)) {
    errors.push('CLAUDE.md missing in vault root');
    return;
  }
  const content = fs.readFileSync(p, 'utf-8');
  if (!content.includes('## Verticals')) {
    warnings.push('CLAUDE.md missing "## Verticals" section');
  }
  if (!content.includes('## Routing rule')) {
    warnings.push('CLAUDE.md missing "## Routing rule" section');
  }
}

async function checkSkills() {
  const skillFiles = await glob('07_Lua_System/verticals/*/skills/*/SKILL.md', { cwd: ROOT });
  
  if (skillFiles.length === 0) {
    warnings.push('No SKILL.md files found under 07_Lua_System/verticals/*/skills/');
    return;
  }

  for (const file of skillFiles) {
    const fullPath = path.join(ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    // 1. Frontmatter exists
    const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
    if (!fmMatch) {
      errors.push(`${file}: missing YAML frontmatter`);
      continue;
    }
    const fm = fmMatch[1];
    
    // 2. Required frontmatter fields
    if (!/^name:\s*\S/m.test(fm)) errors.push(`${file}: missing 'name' in frontmatter`);
    if (!/^description:\s*\S/m.test(fm)) errors.push(`${file}: missing 'description'`);
    
    // 3. Description length (max 1024 chars)
    const descMatch = fm.match(/^description:\s*(.+?)(?=\n\w|\n---|$)/ms);
    if (descMatch && descMatch[1].length > 1024) {
      errors.push(`${file}: description ${descMatch[1].length} chars (max 1024)`);
    }
    
    // 4. Body length (max 500 lines)
    const body = content.replace(/^---\n[\s\S]+?\n---\n?/, '');
    const lines = body.split('\n').length;
    if (lines > 500) {
      errors.push(`${file}: body ${lines} lines (max 500). Move detail to references/`);
    }
    
    // 5. Referenced files exist
    const skillDir = path.dirname(fullPath);
    const refMatches = body.matchAll(/`([^`]*references\/[^`]+\.md)`/g);
    for (const m of refMatches) {
      const refPath = path.join(skillDir, m[1]);
      if (!fs.existsSync(refPath)) {
        errors.push(`${file}: broken reference to ${m[1]}`);
      }
    }
  }
}

async function checkMCPConfigs() {
  const mcpFiles = await glob('07_Lua_System/verticals/*/.mcp.json', { cwd: ROOT });
  for (const file of mcpFiles) {
    try {
      const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
      JSON.parse(content);
    } catch (e) {
      errors.push(`${file}: invalid JSON (${e.message})`);
    }
  }
}

async function main() {
  await checkCLAUDEmd();
  await checkSkills();
  await checkMCPConfigs();
  
  console.log('');
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach(w => console.log('  ⚠ ' + w));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log('  ✗ ' + e));
    console.log('');
    console.log(`Failed: ${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(1);
  } else {
    console.log(`✓ All checks passed (${warnings.length} warning(s))`);
  }
}

main().catch(err => {
  console.error('Check script crashed:', err);
  process.exit(2);
});
```

**Validation**:
- [ ] `node scripts/check.js` 실행됨
- [ ] 출력: "✓ All checks passed (0 warning(s))"
- [ ] 일부러 SKILL.md에서 `description:` 줄 지워보고 다시 실행 → errors 검출되면 OK

---

### Step 11 — .github/workflows/check.yml

**위치**: `/.github/workflows/check.yml`

**목적**: PR 올라올 때마다 자동으로 check.js 실행. 실패하면 머지 차단.

**내용**:
```yaml
name: Vault check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install glob
      
      - name: Run vault check
        run: node scripts/check.js
```

**Validation**:
- [ ] 작은 변경으로 PR 만들어 보고 GitHub Actions에서 자동 실행되는지 확인
- [ ] check.js가 실패하도록 일부러 SKILL.md 수정 → PR이 빨간 X 받는지

---

## 빌드 중 막힐 만한 곳 (미리 경고)

### 1. Obsidian Local REST API 환경변수

`mcp-obsidian`이 작동하려면 `OBSIDIAN_API_KEY` 필요:
- Obsidian → Settings → Community plugins → "Local REST API" 설치/활성화
- 플러그인 settings에서 API key 복사
- `.env`에 `OBSIDIAN_API_KEY=...` 저장
- `.gitignore`에 `.env` 추가 (필수, 절대 commit 금지)

### 2. CLAUDE.md의 link 형식

Obsidian에선 `[[01_Command Center/Identity/voice]]` (wiki-link)가 hover preview 됨.
Claude Code/Cursor에선 `01_Command Center/Identity/voice.md` (plain path)가 안전.
**두 가지 다 작동하니까 wiki-link 사용 권장** — Obsidian 안에서 작업할 때 훨씬 편함.

### 3. description 길이가 너무 짧으면

financial-services SKILL.md들의 description은 평균 200-400 chars. 트리거 키워드 + use case + "Use when..." 패턴이 다 들어가야 함.

좋은 예 (voice-mimicry):
```
description: Write in the user's authentic voice based on Identity/voice.md. 
Use whenever drafting blog posts, emails, social posts, reports, or any prose 
meant to sound like the user wrote it personally. Triggers on "write a post", 
"draft an email", "make this sound like me", "글 써줘", "블로그 초안".
```

나쁜 예:
```
description: Helps with writing.
```

### 4. SKILL.md body 500 lines 초과

긴 컨텍스트가 필요하면 본문에 직접 쓰지 말고:
- 깊은 절차는 `references/{topic}.md`로
- 코드 예시는 `references/examples.md` 또는 `scripts/{tool}.js`로
- 템플릿은 `assets/{name}.md`로

본문은 "어떤 단계로 진행, 어디서 디테일 찾기"만 적기.

### 5. .mcp.json은 JSON, SKILL.md는 YAML frontmatter

쉽게 헷갈림. JSON은 쉼표/중괄호, YAML은 들여쓰기/콜론. `jq .` 또는 `yamllint`로 검증.

---

## Phase 1 완료 기준

모든 11개 step의 validation 체크 완료 + 아래 4가지 통과:

1. [ ] `node scripts/check.js` → "✓ All checks passed"
2. [ ] GitHub Actions에서 workflow 자동 실행됨
3. [ ] Claude Desktop에서 Obsidian vault에 접근 가능 (mcp-obsidian 동작)
4. [ ] Cursor에서 `07_Lua_System/verticals/_core/skills/voice-mimicry/SKILL.md` 열어보고 frontmatter + 7개 섹션 다 있는지 눈으로 확인

---

## Phase 2 미리보기 (다음 응답에서 다룰 것)

- `verticals/_core/skills/research-synthesis/` 완전 구현
- `verticals/_core/skills/obsidian-vault-care/` 완전 구현
- `verticals/_core/commands/` — `/weekly-review`, `/inbox-triage`
- `verticals/climate-energy/skills/proposal-drafting/` — 정부 R&D 과제 작성 (회사 1 첫 도메인 skill)
- `verticals/personal-venture/` skeleton
- `01_Command Center/Identity/` 채우기 가이드 (about-me / voice / decision-principles / context)
- `01_Command Center/_System/agent-permissions.md` 작성

---

## Phase 3 미리보기

- `agents/` 폴더 — Atlas, Scribe, Forge, Lens, Vault, Archivist + workflow agents (proposal-agent, patent-agent, industry-intel-agent, validation-agent)
- `scripts/sync_skills.js` — vertical skills → agent bundles 자동 동기화
- `managed-agents/<slug>/agent.yaml` — headless 배포
- `.github/workflows/industry-scan.yml` — 매주 자동 산업 동향 스캔 (Industry Intel Agent cron)
- `.github/workflows/pr-voice-check.yml` — Drafts/ PR voice 검증

---

## 막혔을 때 빠른 참조

| 막힘 | 어디 보면 됨 |
|---|---|
| SKILL.md 양식 | anthropics/skills repo의 skills/*/SKILL.md |
| vertical 패턴 | anthropics/financial-services의 plugins/vertical-plugins/ |
| MCP 설정 | financial-services의 plugins/vertical-plugins/financial-analysis/.mcp.json |
| description 작성법 | anthropics/skills의 high-star skills 참고 |
| check.js 확장 | financial-services의 scripts/check.py |

검증과 빌드를 작은 단위로 자주. Step 11까지 도착하면 Phase 2 시작 가능.

## Archive Navigation

- Hub: [[05_Archives/Archives Hub|Archives Hub]]
- Current architecture: [[Lua-v4-operating-architecture|Lua v4 Operating Architecture]]

