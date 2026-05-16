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
  return `## Atlas CEO Router Update

| Field | Value |
|---|---|
| Command ID | ${entry.id} |
| Domain / Intent | ${entry.domain} / ${entry.intent || '-'} |
| Stage | ${entry.stage || 'clarify'} -> ${stageAfter} |
| gstack Role | ${role.role} |
| Lua Agent | ${role.agent} |

### Clarify

- 목표: "${entry.payload}"를 이번 주 실행 가능한 우선순위와 다음 행동으로 바꾼다.
- 현재 제약: Obsidian이 기본 명령 본부이고, Slack은 보조 입력/알림, Notion은 나중의 팀 공유 정리본으로 둔다.
- 아직 하지 않을 것: Notion DB 자동 발행, Slack 중심 운영, 큰 범위의 사업 실행을 먼저 시작하는 일.

### Design

- 추천 방향: Obsidian Command Center를 먼저 안정화하고, planned/queued run을 Atlas Router가 순서대로 처리하게 만든다.
- 대안 1: Slack 명령 앱을 먼저 키운다. 원격 입력은 좋아지지만 지금의 기본 운영 원칙과 맞지 않는다.
- 대안 2: Notion 공유 DB를 먼저 만든다. 팀 공유에는 좋지만 아직 개인 command flow가 충분히 안정적이지 않다.

### Plan

- [x] 첫 처리 대상: [[01_Command Center/Command Runs/${path.basename(runRelFor(entry))}|${entry.id}]].
- [x] Atlas CEO 방식으로 clarify/design/plan 작성.
- [x] User Action Board를 다음 행동 중심으로 갱신.
- [ ] 다음 run은 \`inbox-20260516-031554-01\` build/app clarify로 진행.
- [ ] 그 다음 run은 \`inbox-20260516-031554-02\` research/brief로 진행.

### Next User Action

다음에는 Codex에게 아래처럼 말하면 된다.

\`\`\`text
다음 command run 진행해줘
\`\`\`
`;
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
  return `## Atlas Router 처리 완료

| 항목 | 내용 |
|---|---|
| 처리한 command | [[01_Command Center/Command Runs/${path.basename(runRelFor(entry))}|${entry.id}]] |
| 처리 방식 | Atlas CEO clarify -> design -> plan |
| 현재 상태 | routed / plan |
| 다음 사용자 행동 | \`다음 command run 진행해줘\` |

## Current Tasks For User

| 우선순위 | 해야 할 말 | Codex가 하는 일 |
|---|---|---|
| 1 | \`다음 command run 진행해줘\` | Neural UI build/app command를 clarify/design/plan으로 진행 |
| 2 | \`수상태양광 리서치 진행해줘\` | research/brief command를 Lens 방식으로 정리 |
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
