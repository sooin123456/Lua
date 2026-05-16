#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INBOX = path.join(ROOT, '09_Automations', 'Slack Command Inbox.md');
const VALID_AGENTS = new Set(['inbox', 'todo', 'brief', 'ask', 'status', 'remind', 'approve', 'ceo', 'pm', 'research', 'write', 'build', 'qa', 'release', 'ops']);

function usage() {
  console.log(`Usage:
  node scripts/slack_command_inbox.js "/lua research brief :: 테크인 조사"
  node scripts/slack_command_inbox.js --source slack-mobile "/lua inbox 밖에서 떠오른 아이디어"
`);
}

function parseArgs(argv) {
  const args = { source: 'manual', text: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--source') args.source = argv[++i] || 'manual';
    else if (argv[i] === '--help' || argv[i] === '-h') args.help = true;
    else args.text = args.text ? `${args.text} ${argv[i]}` : argv[i];
  }
  return args;
}

function parseCommand(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/^\/lua\s+(\S+)(?:\s+([^:]+?))?(?:\s+::\s+([\s\S]+))?$/);
  if (!match) throw new Error('Command must start with /lua.');
  const agent = match[1].toLowerCase();
  if (!VALID_AGENTS.has(agent)) throw new Error(`Unknown /lua command: ${agent}`);
  const intent = (match[2] || '').trim();
  const payload = (match[3] || '').trim() || intent;
  return {
    command: `/lua ${agent}`,
    agent,
    intent: match[3] ? intent : '',
    payload,
  };
}

function todayStamp() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toISOString().slice(11, 19).replace(/:/g, '');
  return `${date}-${time}`;
}

function escapeCell(value) {
  return String(value || '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function appendQueue(entry) {
  let content = fs.readFileSync(INBOX, 'utf8');
  const row = `| ${entry.id} | ${escapeCell(entry.source)} | ${escapeCell(entry.command)} | ${escapeCell(entry.payload)} | queued |  |`;
  const marker = '| example-001 | Slack | `/lua inbox` | 예시 아이디어 | done | [[00_Inbox/AI 분류 대기중...|Inbox]] |';
  if (content.includes(marker)) {
    content = content.replace(marker, `${marker}\n${row}`);
  } else {
    content = `${content.trimEnd()}\n${row}\n`;
  }
  fs.writeFileSync(INBOX, content, 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.text) {
    usage();
    process.exit(args.help ? 0 : 1);
  }
  const parsed = parseCommand(args.text);
  const id = `slack-${todayStamp()}`;
  appendQueue({ id, source: args.source, ...parsed });
  console.log(`Queued ${id}: ${parsed.command} -> ${parsed.payload}`);
}

main();
