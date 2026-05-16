#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INBOX = path.join(ROOT, '00_Inbox', 'AI 분류 대기중....md');
const COMMAND_CENTER = path.join(ROOT, '01_Command Center', 'Obsidian Command Center.md');

const RULES = [
  {
    domain: 'build',
    intent: 'app',
    owner: 'Forge',
    stage: 'clarify',
    patterns: ['앱', '서비스', 'mvp', 'mini', '미니앱', '타이머', '만들'],
  },
  {
    domain: 'design',
    intent: 'flow',
    owner: 'Scribe+Forge',
    stage: 'clarify',
    patterns: ['화면', 'ux', 'ui', '사용자', '흐름', '디자인'],
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
    patterns: ['조사', '경쟁사', '비교', '시장', '발주', '실적', '자료', '테크인', 'k water', 'k-water'],
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

function section(text, heading) {
  const re = new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |\\z)`, 'm');
  const match = text.match(re);
  return match ? match[1].trim() : '';
}

function splitSignals(raw) {
  const withoutTables = raw
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('|'))
    .join('\n');
  return withoutTables
    .split(/\n\s*\n+/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length > 8);
}

function classify(text) {
  const lower = text.toLowerCase();
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

function stamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
}

function escapeCell(value) {
  return String(value || '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function appendRows(rows) {
  let content = fs.readFileSync(COMMAND_CENTER, 'utf8');
  const marker = '| cmd-20260516-024544 | planning | prioritize | 이번 주 Lua 구축 우선순위 정리 | clarify | Atlas | queued |  |';
  const tableRows = rows.map((entry) => (
    `| ${entry.id} | ${escapeCell(entry.domain)} | ${escapeCell(entry.intent)} | ${escapeCell(entry.payload)} | ${escapeCell(entry.stage)} | ${escapeCell(entry.owner)} | queued | from Inbox |`
  )).join('\n');
  if (content.includes(marker)) {
    content = content.replace(marker, `${marker}\n${tableRows}`);
  } else {
    content = `${content.trimEnd()}\n${tableRows}\n`;
  }
  fs.writeFileSync(COMMAND_CENTER, content, 'utf8');
}

function appendTriageLog(entries) {
  let content = fs.readFileSync(INBOX, 'utf8');
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
  fs.writeFileSync(INBOX, content, 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  const inboxText = fs.readFileSync(INBOX, 'utf8');
  const original = section(stripFrontmatter(inboxText), 'Original Capture') || stripFrontmatter(inboxText);
  const signals = splitSignals(original);
  const base = stamp();
  const entries = signals.map((signal, index) => {
    const rule = classify(signal);
    return {
      id: `inbox-${base}-${String(index + 1).padStart(2, '0')}`,
      payload: signal,
      ...rule,
    };
  });

  if (entries.length === 0) {
    console.log('No promotable inbox signals found.');
    return;
  }

  for (const entry of entries) {
    console.log(`${entry.id}: ${entry.domain}/${entry.intent} -> ${entry.owner}`);
    console.log(`  ${entry.payload}`);
  }

  if (args.apply) {
    appendRows(entries);
    appendTriageLog(entries);
    console.log(`Applied ${entries.length} command(s) to Obsidian Command Center.`);
  } else {
    console.log('Dry run only. Use --apply to write rows.');
  }
}

main();
