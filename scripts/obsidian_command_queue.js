#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMMAND_CENTER = path.join(ROOT, '01_Command Center', 'Obsidian Command Center.md');
const VALID_DOMAINS = new Set(['planning', 'marketing', 'design', 'service', 'project', 'research', 'build', 'ops']);

function usage() {
  console.log(`Usage:
  node scripts/obsidian_command_queue.js "/lua planning prioritize :: 이번 주 해야 할 일"
  node scripts/obsidian_command_queue.js --stage design "/lua design screen :: 타이머 앱 첫 화면"
`);
}

function parseArgs(argv) {
  const args = { stage: 'clarify', text: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--stage') args.stage = argv[++i] || 'clarify';
    else if (arg === '--help' || arg === '-h') args.help = true;
    else args.text = args.text ? `${args.text} ${arg}` : arg;
  }
  return args;
}

function parseCommand(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/^\/lua\s+(\S+)(?:\s+([^:]+?))?(?:\s+::\s+([\s\S]+))?$/);
  if (!match) throw new Error('Command must start with /lua.');
  const domain = match[1].toLowerCase();
  if (!VALID_DOMAINS.has(domain)) throw new Error(`Unknown domain: ${domain}`);
  const intent = (match[2] || '').trim();
  const payload = (match[3] || '').trim() || intent;
  if (!payload) throw new Error('Missing payload.');
  return { domain, intent, payload };
}

function ownerFor(domain) {
  return {
    planning: 'Atlas',
    marketing: 'Scribe',
    design: 'Scribe+Forge',
    service: 'Vault+Scribe',
    project: 'Atlas+Vault',
    research: 'Lens',
    build: 'Forge',
    ops: 'Vault',
  }[domain] || 'Atlas';
}

function stamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
}

function escapeCell(value) {
  return String(value || '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function appendQueue(entry) {
  let content = fs.readFileSync(COMMAND_CENTER, 'utf8');
  const row = `| ${entry.id} | ${escapeCell(entry.domain)} | ${escapeCell(entry.intent)} | ${escapeCell(entry.payload)} | ${escapeCell(entry.stage)} | ${escapeCell(entry.owner)} | queued |  |`;
  const marker = '| example-001 | research | compare | 테크인과 경쟁사 비교 | clarify | Lens | queued |  |';
  if (content.includes(marker)) {
    content = content.replace(marker, `${marker}\n${row}`);
  } else {
    content = `${content.trimEnd()}\n${row}\n`;
  }
  fs.writeFileSync(COMMAND_CENTER, content, 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.text) {
    usage();
    process.exit(args.help ? 0 : 1);
  }
  const parsed = parseCommand(args.text);
  const entry = {
    id: `cmd-${stamp()}`,
    stage: args.stage,
    owner: ownerFor(parsed.domain),
    ...parsed,
  };
  appendQueue(entry);
  console.log(`Queued ${entry.id}: ${entry.domain}/${entry.intent || '-'} -> ${entry.owner}`);
}

main();
