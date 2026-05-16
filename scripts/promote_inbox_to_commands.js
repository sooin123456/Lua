#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { findFiles, relativePosix } = require('./lib/files');

const DEFAULT_ROOT = path.resolve(__dirname, '..');
const LEGACY_INBOX_REL = path.join('00_Inbox', 'AI 분류 대기중....md');
const COMMAND_CENTER_REL = path.join('01_Command Center', 'Obsidian Command Center.md');
const INBOX_DIR_REL = '00_Inbox';

const RULES = [
  {
    domain: 'design',
    intent: 'screen',
    owner: 'Scribe+Forge',
    stage: 'clarify',
    patterns: ['화면', 'ux', 'ui', '사용자', '흐름', '디자인', '명령 체계', '표현'],
  },
  {
    domain: 'build',
    intent: 'app',
    owner: 'Forge',
    stage: 'clarify',
    patterns: ['앱', '서비스', 'mvp', 'mini', '미니앱', '타이머', '만들'],
  },
  {
    domain: 'planning',
    intent: 'validate',
    owner: 'Atlas',
    stage: 'clarify',
    patterns: ['사업', '아이템', '우선순위', '전략', '결정', '기획'],
  },
  {
    domain: 'research',
    intent: 'brief',
    owner: 'Lens',
    stage: 'clarify',
    patterns: ['조사', '경쟁사', '비교', '시장', '발주', '실적', '자료', '테크인', '테크윈', 'k water', 'k-water'],
  },
  {
    domain: 'marketing',
    intent: 'brief',
    owner: 'Scribe',
    stage: 'clarify',
    patterns: ['홍보', '마케팅', '콘텐츠', '고객', '메시지', '세일즈'],
  },
  {
    domain: 'service',
    intent: 'flow',
    owner: 'Vault+Scribe',
    stage: 'clarify',
    patterns: ['cs', '고객문의', '운영', '프로세스', '응대'],
  },
  {
    domain: 'project',
    intent: 'split',
    owner: 'Atlas+Vault',
    stage: 'clarify',
    patterns: ['프로젝트', '일정', '마일스톤', 'task', '태스크', 'backlog'],
  },
];

function usage() {
  console.log(`Usage:
  node scripts/promote_inbox_to_commands.js --dry-run
  node scripts/promote_inbox_to_commands.js --apply
`);
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run') || !argv.includes('--apply'),
    apply: argv.includes('--apply'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function stripFrontmatter(text) {
  return text.replace(/^\uFEFF?\s*---\r?\n[\s\S]*?\r?\n---\s*/, '');
}

function parseFrontmatter(text) {
  const match = text.match(/^\uFEFF?\s*---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].trim();
  }
  return data;
}

function section(text, heading) {
  const re = new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |\\z)`, 'm');
  const match = text.match(re);
  return match ? match[1].trim() : '';
}

function splitSignals(raw) {
  const withoutTables = raw
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('|'))
    .filter((line) => !line.trim().startsWith('<!--'))
    .join('\n');
  return withoutTables
    .split(/\n\s*\n+/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .map(cleanTrackingUrls)
    .filter((part) => part.length > 8);
}

function cleanTrackingUrls(value) {
  return String(value).replace(/https?:\/\/\S+/g, (rawUrl) => {
    try {
      const url = new URL(rawUrl);
      url.search = '';
      url.hash = '';
      return url.toString().replace(/\/$/, rawUrl.endsWith('/') ? '/' : '');
    } catch (_error) {
      return rawUrl;
    }
  });
}

function classify(text) {
  const lower = text.replace(/https?:\/\/\S+/g, '').toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const rule of RULES) {
    const score = rule.patterns.reduce((count, pattern) => (
      lower.includes(pattern.toLowerCase()) ? count + 1 : count
    ), 0);
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }
  return best || {
    domain: 'planning',
    intent: 'validate',
    owner: 'Atlas',
    stage: 'clarify',
  };
}

function stamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
}

function escapeCell(value) {
  return String(value || '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function noteTitle(filePath) {
  return path.basename(filePath, '.md');
}

function inboxFiles(root) {
  const inboxDir = path.join(root, INBOX_DIR_REL);
  if (!fs.existsSync(inboxDir)) return [];

  const files = findFiles(
    inboxDir,
    (fullPath) => fullPath.endsWith('.md'),
    { skipDirs: ['Archive', 'Templates'] }
  );

  return files.filter((file) => {
    const rel = relativePosix(root, file);
    const content = fs.readFileSync(file, 'utf8');
    const fm = parseFrontmatter(content);
    if (fm.type === 'inbox-index') return false;
    if (rel === LEGACY_INBOX_REL.replace(/\\/g, '/')) return true;
    return fm.status !== 'promoted' && fm.status !== 'archived';
  });
}

function payloadForFile(filePath, content) {
  const body = stripFrontmatter(content);
  const original = section(body, 'Original Capture') || body;
  const title = noteTitle(filePath);
  const signals = splitSignals(original);
  if (signals.length === 0) return [];
  if (filePath.endsWith(LEGACY_INBOX_REL)) return signals;

  const combined = signals.join(' ');
  return [`${title}: ${combined}`];
}

function commandCenterInsertionIndex(lines) {
  const headerIndex = lines.findIndex((line) => line.trim().startsWith('| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |'));
  if (headerIndex < 0) return lines.length;

  let index = headerIndex + 1;
  while (index < lines.length && lines[index].trim().startsWith('|')) index += 1;
  return index;
}

function appendRows(root, rows) {
  const commandCenter = path.join(root, COMMAND_CENTER_REL);
  const lines = fs.readFileSync(commandCenter, 'utf8').split(/\r?\n/);
  const tableRows = rows.map((entry) => (
    `| ${entry.id} | ${escapeCell(entry.domain)} | ${escapeCell(entry.intent)} | ${escapeCell(entry.payload)} | ${escapeCell(entry.stage)} | ${escapeCell(entry.owner)} | queued | from Inbox |`
  ));
  const insertionIndex = commandCenterInsertionIndex(lines);
  lines.splice(insertionIndex, 0, ...tableRows);
  fs.writeFileSync(commandCenter, lines.join('\n'), 'utf8');
}

function frontmatterBlock(updates) {
  return [
    '---',
    ...Object.entries(updates).map(([key, value]) => `${key}: ${value}`),
    '---',
    '',
  ].join('\n');
}

function updateFrontmatter(content, updates) {
  const match = content.match(/^\uFEFF?\s*---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return `${frontmatterBlock(updates)}${content}`;

  let frontmatter = match[1];
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}: ${value}`;
    const re = new RegExp(`^${key}:.*$`, 'm');
    frontmatter = re.test(frontmatter) ? frontmatter.replace(re, line) : `${frontmatter}\n${line}`;
  }

  return `---\n${frontmatter}\n---${content.slice(match[0].length)}`;
}

function appendTriageLog(filePath, entries) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = updateFrontmatter(content, {
    type: 'inbox-note',
    status: 'promoted',
    promoted_to: entries.map((entry) => entry.id).join(', '),
    last_updated: todayKst(),
  });
  const lines = [
    '',
    '## Command Promotion',
    '',
    '| ID | Domain | Intent | Payload |',
    '|---|---|---|---|',
    ...entries.map((entry) => `| ${entry.id} | ${entry.domain} | ${entry.intent} | ${escapeCell(entry.payload)} |`),
    '',
  ].join('\n');
  if (!content.includes('## Command Promotion')) {
    content = `${content.trimEnd()}\n${lines}`;
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

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

function promoteInbox(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  const apply = Boolean(options.apply);
  const base = options.stamp || stamp();
  const entries = [];
  const byFile = new Map();

  for (const file of inboxFiles(root)) {
    const content = fs.readFileSync(file, 'utf8');
    const payloads = payloadForFile(file, content);
    const fileEntries = payloads.map((payload) => {
      const rule = classify(payload);
      return {
        id: `inbox-${base}-${String(entries.length + 1).padStart(2, '0')}`,
        payload,
        source: relativePosix(root, file),
        ...rule,
      };
    });
    fileEntries.forEach((entry) => entries.push(entry));
    if (fileEntries.length > 0) byFile.set(file, fileEntries);
  }

  if (apply && entries.length > 0) {
    appendRows(root, entries);
    for (const [file, fileEntries] of byFile.entries()) appendTriageLog(file, fileEntries);
  }

  return { entries };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const result = promoteInbox({ apply: args.apply });
  if (result.entries.length === 0) {
    console.log('No promotable inbox signals found.');
    return;
  }

  for (const entry of result.entries) {
    console.log(`${entry.id}: ${entry.domain}/${entry.intent} -> ${entry.owner}`);
    console.log(`  ${entry.payload}`);
  }

  if (args.apply) console.log(`Applied ${result.entries.length} command(s) to Obsidian Command Center.`);
  else console.log('Dry run only. Use --apply to write rows.');
}

if (require.main === module) main();

module.exports = {
  classify,
  cleanTrackingUrls,
  promoteInbox,
};
