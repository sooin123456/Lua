#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = path.resolve(__dirname, '..');
const COMMAND_CENTER_REL = path.join('01_Command Center', 'Obsidian Command Center.md');
const ACTION_BOARD_REL = path.join('01_Command Center', 'User Action Board.md');
const TODAY = todayKst();

const ROLE_MAP = {
  planning: { role: 'CEO', agent: 'Atlas' },
  marketing: { role: 'Doc Engineer', agent: 'Scribe' },
  design: { role: 'Designer', agent: 'Scribe+Forge' },
  service: { role: 'PM', agent: 'Vault+Scribe' },
  project: { role: 'PM', agent: 'Atlas+Vault' },
  research: { role: 'Researcher', agent: 'Lens' },
  build: { role: 'Eng Manager', agent: 'Forge' },
  ops: { role: 'QA/Ops', agent: 'Vault' },
};

const ACTIONABLE_STATUSES = new Set(['planned', 'queued']);

function todayKst() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function usage() {
  console.log(`Usage:
  node scripts/atlas_router.js --dry-run
  node scripts/atlas_router.js --apply
  node scripts/atlas_router.js --apply --all
`);
}

function parseArgs(argv) {
  return {
    apply: argv.includes('--apply'),
    dryRun: argv.includes('--dry-run') || !argv.includes('--apply'),
    all: argv.includes('--all'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function roleFor(domain) {
  return ROLE_MAP[domain] || ROLE_MAP.planning;
}

function escapeCell(value) {
  return String(value || '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function parseRows(content) {
  return content
    .split(/\r?\n/)
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.startsWith('| ') && !line.includes('---'))
    .filter(({ line }) => !line.trim().startsWith('| ID '))
    .map(({ line, index }) => {
      const cells = line.slice(1, -1).split('|').map((cell) => cell.trim().replace(/\\\|/g, '|'));
      if (cells.length < 8) return null;
      const [id, domain, intent, payload, stage, owner, status, result] = cells;
      return { id, domain, intent, payload, stage, owner, status, result, line, index };
    })
    .filter(Boolean);
}

function isActionable(entry) {
  return ACTIONABLE_STATUSES.has(entry.status) && !entry.id.startsWith('example-');
}

function slugify(value) {
  const slug = String(value || '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return slug || 'command';
}

function extractLinkTarget(result) {
  const match = String(result || '').match(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/);
  return match ? match[1] : null;
}

function runRelFor(entry) {
  const existing = extractLinkTarget(entry.result);
  if (existing) return existing;
  return path.posix.join(
    '01_Command Center',
    'Command Runs',
    `${entry.id}-${slugify(`${entry.domain}-${entry.intent || 'command'}`)}`
  );
}

function runPathFor(root, entry) {
  return path.join(root, `${runRelFor(entry)}.md`);
}

function updateFrontmatter(content, updates) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return content;

  let frontmatter = match[1];
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}: ${value}`;
    const re = new RegExp(`^${key}:.*$`, 'm');
    frontmatter = re.test(frontmatter) ? frontmatter.replace(re, line) : `${frontmatter}\n${line}`;
  }

  return `---\n${frontmatter}\n---${content.slice(match[0].length)}`;
}

function baseRunNote(entry) {
  const role = roleFor(entry.domain);
  return `---
type: command-run
status: planned
command_id: ${entry.id}
domain: ${entry.domain}
intent: ${entry.intent || ''}
stage: ${entry.stage || 'clarify'}
agent: ${role.agent}
role: ${role.role}
last_updated: ${TODAY}
---

# ${entry.id} - ${entry.domain} ${entry.intent || 'command'}

## Command

${entry.payload}
`;
}

function nextStage(entry) {
  if (entry.domain === 'research' && entry.intent === 'brief' && entry.stage === 'clarify') return 'research';
  if (entry.stage === 'clarify') return 'plan';
  if (entry.stage === 'design') return 'plan';
  if (entry.stage === 'plan') return 'execute';
  if (entry.stage === 'execute') return 'verify';
  if (entry.stage === 'verify') return 'brief';
  return 'plan';
}

function atlasUpdate(entry) {
  const role = roleFor(entry.domain);
  const stageAfter = nextStage(entry);
  const content = routerContent(entry);
  return `## Atlas CEO Router Update

| Field | Value |
|---|---|
| Command ID | ${entry.id} |
| Domain / Intent | ${entry.domain} / ${entry.intent || '-'} |
| Stage | ${entry.stage || 'clarify'} -> ${stageAfter} |
| gstack Role | ${role.role} |
| Lua Agent | ${role.agent} |

### Clarify

${content.clarify}

### Design

${content.design}

### Plan

${content.plan}

### Next User Action

다음에는 Codex에게 아래처럼 말하면 된다.

\`\`\`text
${content.nextAction}
\`\`\`
`;
}

function routerContent(entry) {
  if (entry.domain === 'build' && entry.intent === 'app') return buildAppContent(entry);
  if (entry.domain === 'research' && entry.intent === 'brief') return researchBriefContent(entry);
  return planningContent(entry);
}

function planningContent(entry) {
  return {
    clarify: `- 목표: "${entry.payload}"를 이번 주 실행 가능한 우선순위와 다음 행동으로 바꾼다.
- 현재 제약: Obsidian이 기본 명령 본부이고, Slack은 보조 입력/알림, Notion은 나중의 팀 공유 정리본으로 둔다.
- 아직 하지 않을 것: Notion DB 자동 발행, Slack 중심 운영, 큰 범위의 사업 실행을 먼저 시작하는 일.`,
    design: `- 추천 방향: Obsidian Command Center를 먼저 안정화하고, planned/queued run을 Atlas Router가 순서대로 처리하게 만든다.
- 대안 1: Slack 명령 앱을 먼저 키운다. 원격 입력은 좋아지지만 지금의 기본 운영 원칙과 맞지 않는다.
- 대안 2: Notion 공유 DB를 먼저 만든다. 팀 공유에는 좋지만 아직 개인 command flow가 충분히 안정적이지 않다.`,
    plan: `- [x] 첫 처리 대상: [[01_Command Center/Command Runs/${path.basename(runRelFor(entry))}|${entry.id}]].
- [x] Atlas CEO 방식으로 clarify/design/plan 작성.
- [x] User Action Board를 다음 행동 중심으로 갱신.
- [ ] 다음 run은 \`inbox-20260516-031554-01\` build/app clarify로 진행.
- [ ] 그 다음 run은 \`inbox-20260516-031554-02\` research/brief로 진행.`,
    nextAction: '다음 command run 진행해줘',
  };
}

function buildAppContent(entry) {
  return {
    clarify: `- 목표: "${entry.payload}"를 Neural UI 사업/제품 후보로 정리하고, 바로 만들 수 있는 최소 MVP 실험을 고른다.
- 핵심 질문: 미리 짜둔 화면이 아니라 매 순간 신경망이 그리는 UI가 어떤 사용자 문제를 더 잘 풀 수 있는가?
- 제약: 지금은 앱 전체 구현이 아니라 Toss 미니앱처럼 작고 검증 가능한 첫 사용 장면을 정한다.
- 아직 하지 않을 것: 대형 플랫폼 설계, 실제 결제/개인정보 연동, Notion 공유본 발행.`,
    design: `- 추천 방향: "사업 아이디어를 말하면 AI가 즉석에서 화면/흐름/다음 행동을 만들어주는 미니앱"을 첫 실험으로 둔다.
- 대안 1: Neural UI 개념 설명용 데모를 만든다. 이해는 쉽지만 사업 검증 신호가 약하다.
- 대안 2: Toss 미니앱 스타일의 특정 업무 도구를 만든다. 범위는 작지만 어떤 업무를 고를지 추가 판단이 필요하다.
- 대안 3: Lua Command Center 위에 Neural UI 입력 화면을 얹는다. 기존 시스템과 연결되지만 구현 복잡도가 올라간다.`,
    plan: `- [x] 첫 처리 대상: [[01_Command Center/Command Runs/${path.basename(runRelFor(entry))}|${entry.id}]].
- [x] Neural UI / Toss 미니앱 관점으로 clarify/design/plan 작성.
- [x] 지금 단계는 MVP 실험 정의로 제한.
- [ ] 첫 MVP 후보를 하나 고른다: 아이디어 입력 -> 즉석 화면 초안 -> 다음 command run 생성.
- [ ] 선택한 MVP를 별도 build/spec command로 승격한다.
- [ ] 다음 command run은 \`inbox-20260516-031554-02\` research/brief로 진행한다.`,
    nextAction: '수상태양광 리서치 진행해줘',
  };
}

function researchBriefContent(entry) {
  return {
    clarify: `- 목표: "${entry.payload}"를 출처 기반 Research Brief로 만들기 위한 조사 범위와 검증 순서를 정한다.
- 핵심 질문: K-water 발주 규모와 일정, 협력 가능 업체, 경쟁사, 테크인의 포지션을 각각 어떤 근거로 확인할 것인가?
- 제약: 지금은 결론을 단정하지 않고, 조사 범위와 출처 기준을 먼저 세운다.
- 아직 하지 않을 것: 미확인 수치 인용, 출처 없는 경쟁사 비교, 팀 공유용 Notion 정리본 발행.`,
    design: `- 추천 방향: Lens가 공공 발주/기관 자료 -> 업체 후보 -> 경쟁사 -> 테크인 순서로 조사해 Research Brief를 만든다.
- 대안 1: K-water 발주 규모만 먼저 본다. 빠르지만 사업 판단에 필요한 협력사/경쟁사 맥락이 부족하다.
- 대안 2: 경쟁사 비교표부터 만든다. 보기 좋지만 발주 맥락이 약하면 비교 기준이 흔들린다.
- 대안 3: 테크인 단독 조사부터 한다. 중요하지만 시장/발주/협력사 맥락 없이 보면 해석이 좁아진다.`,
    plan: `- [x] 첫 처리 대상: [[01_Command Center/Command Runs/${path.basename(runRelFor(entry))}|${entry.id}]].
- [x] Lens / Researcher 방식으로 clarify/research/brief 하네스 작성.
- [x] 조사 범위: K-water 발주 사이즈, 협력 가능 업체, 경쟁사, 테크인.
- [ ] 공공 발주와 K-water 관련 1차 출처를 확인한다.
- [ ] 협력 가능 업체와 경쟁사를 표로 나눈다.
- [ ] 테크인 관련 근거를 따로 모아 Research Brief 초안으로 정리한다.`,
    nextAction: '리서치 실행 승인해줘',
  };
}

function upsertAtlasUpdate(content, entry) {
  const update = atlasUpdate(entry).trimEnd();
  const start = content.indexOf('## Atlas CEO Router Update');
  const nav = content.indexOf('## Navigation');

  if (start >= 0) {
    const end = nav > start ? nav : content.length;
    return `${content.slice(0, start).trimEnd()}\n\n${update}\n\n${content.slice(end).trimStart()}`;
  }

  if (nav >= 0) {
    return `${content.slice(0, nav).trimEnd()}\n\n${update}\n\n${content.slice(nav).trimStart()}`;
  }

  return `${content.trimEnd()}\n\n${update}\n`;
}

function routeRunNote(root, entry) {
  const file = runPathFor(root, entry);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : baseRunNote(entry);
  const withFrontmatter = updateFrontmatter(current, {
    status: 'routed',
    stage: nextStage(entry),
    agent: roleFor(entry.domain).agent,
    role: roleFor(entry.domain).role,
    last_updated: TODAY,
  });
  fs.writeFileSync(file, upsertAtlasUpdate(withFrontmatter, entry), 'utf8');
  return file;
}

function replaceQueueRow(content, entry) {
  const link = `[[${runRelFor(entry)}|run]]`;
  const newRow = `| ${entry.id} | ${escapeCell(entry.domain)} | ${escapeCell(entry.intent)} | ${escapeCell(entry.payload)} | ${nextStage(entry)} | ${escapeCell(roleFor(entry.domain).agent)} | routed | ${link} |`;
  const lines = content.split(/\r?\n/);
  lines[entry.index] = newRow;
  return lines.join('\n');
}

function actionBoardUpdate(entry) {
  const content = routerContent(entry);
  return `## Atlas Router 처리 완료

| 항목 | 내용 |
|---|---|
| 처리한 command | [[01_Command Center/Command Runs/${path.basename(runRelFor(entry))}|${entry.id}]] |
| 처리 방식 | Atlas CEO clarify -> design -> plan |
| 현재 상태 | routed / plan |
| 다음 사용자 행동 | \`${content.nextAction}\` |

## Current Tasks For User

| 우선순위 | 해야 할 말 | Codex가 하는 일 |
|---|---|---|
| 1 | \`${content.nextAction}\` | 다음 planned command run을 clarify/design/plan으로 진행 |
| 2 | \`Command Center 상태 보여줘\` | 남은 queue와 현재 stage를 보여줌 |
| 3 | \`보류해줘\` | 현재 command run을 paused로 표시 |
`;
}

function updateActionBoard(root, entry) {
  const file = path.join(root, ACTION_BOARD_REL);
  const current = fs.existsSync(file)
    ? fs.readFileSync(file, 'utf8')
    : `---\ntype: action-board\nstatus: active\nlast_updated: ${TODAY}\n---\n\n# User Action Board\n`;
  const updatedFrontmatter = updateFrontmatter(current, { last_updated: TODAY });
  const update = actionBoardUpdate(entry);
  const atlasSection = update.split('\n## Current Tasks For User\n')[0].trimEnd();
  const taskSection = `## Current Tasks For User\n${update.split('\n## Current Tasks For User\n')[1]}`.trimEnd();
  let content = replaceOrInsertSection(updatedFrontmatter, '## Atlas Router 처리 완료', atlasSection, '## Today');
  content = replaceOrInsertSection(content, '## Current Tasks For User', taskSection, '## Atlas Router 처리 완료');
  fs.writeFileSync(file, `${content.trimEnd()}\n`, 'utf8');
}

function sectionBounds(content, heading) {
  const start = content.indexOf(heading);
  if (start < 0) return null;
  const next = content.indexOf('\n## ', start + heading.length);
  return { start, end: next < 0 ? content.length : next + 1 };
}

function replaceOrInsertSection(content, heading, section, afterHeading) {
  const existing = sectionBounds(content, heading);
  if (existing) {
    return `${content.slice(0, existing.start).trimEnd()}\n\n${section}\n\n${content.slice(existing.end).trimStart()}`;
  }

  const after = sectionBounds(content, afterHeading);
  if (after) {
    return `${content.slice(0, after.end).trimEnd()}\n\n${section}\n\n${content.slice(after.end).trimStart()}`;
  }

  return `${content.trimEnd()}\n\n${section}\n`;
}

function runAtlasRouter(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  const apply = Boolean(options.apply);
  const firstOnly = options.firstOnly !== false;
  const commandCenterPath = path.join(root, COMMAND_CENTER_REL);
  let commandCenter = fs.readFileSync(commandCenterPath, 'utf8');
  const entries = parseRows(commandCenter).filter(isActionable);
  const targets = firstOnly ? entries.slice(0, 1) : entries;
  const processed = [];

  for (const entry of targets) {
    const routed = {
      id: entry.id,
      domain: entry.domain,
      intent: entry.intent,
      agent: roleFor(entry.domain).agent,
      stageBefore: entry.stage,
      stageAfter: nextStage(entry),
      run: runRelFor(entry),
    };
    processed.push(routed);

    if (!apply) continue;

    routeRunNote(root, entry);
    commandCenter = replaceQueueRow(commandCenter, entry);
    updateActionBoard(root, entry);
  }

  if (apply && processed.length > 0) fs.writeFileSync(commandCenterPath, commandCenter, 'utf8');

  return { processed };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const result = runAtlasRouter({ apply: args.apply, firstOnly: !args.all });
  if (result.processed.length === 0) {
    console.log('No planned or queued command runs found.');
    return;
  }

  for (const entry of result.processed) {
    console.log(`${entry.id}: ${entry.domain}/${entry.intent || '-'} -> ${entry.agent} (${entry.stageBefore} -> ${entry.stageAfter})`);
  }
  if (args.dryRun) console.log('Dry run only. Use --apply to update the first command run.');
}

if (require.main === module) main();

module.exports = {
  parseRows,
  runAtlasRouter,
};
