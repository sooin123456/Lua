#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INBOX = path.join(ROOT, '00_Inbox', 'AI 분류 대기중....md');

function usage() {
  console.log(`Usage:
  node scripts/add_inbox_capture.js "떠오른 생각"
  node scripts/add_inbox_capture.js --source meeting "회의 메모"
`);
}

function parseArgs(argv) {
  const args = { source: 'manual', text: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--source') args.source = argv[++i] || 'manual';
    else if (arg === '--help' || arg === '-h') args.help = true;
    else args.text = args.text ? `${args.text} ${arg}` : arg;
  }
  return args;
}

function kstNow() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace('T', ' ').slice(0, 19) + ' KST';
}

function captureId() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return `cap-${kst.toISOString().slice(0, 19).replace(/[-:T]/g, '')}`;
}

function ensureCaptureLog(content) {
  if (content.includes('## Capture Log')) return content;
  const block = [
    '',
    '## Capture Log',
    '',
    '| ID | Created | Source | Status | Raw Capture |',
    '|---|---|---|---|---|',
  ].join('\n');
  return `${content.trimEnd()}\n${block}\n`;
}

function escapeCell(value) {
  return String(value || '').replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|').trim();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.text) {
    usage();
    process.exit(args.help ? 0 : 1);
  }
  let content = fs.readFileSync(INBOX, 'utf8');
  content = ensureCaptureLog(content);
  const row = `| ${captureId()} | ${kstNow()} | ${escapeCell(args.source)} | captured | ${escapeCell(args.text)} |`;
  content = content.replace(/(\|---\|---\|---\|---\|---\|\r?\n)/, `$1${row}\n`);
  content = content.replace(/last_updated:\s*\d{4}-\d{2}-\d{2}/, `last_updated: ${kstNow().slice(0, 10)}`);
  fs.writeFileSync(INBOX, content, 'utf8');
  console.log(`Added inbox capture: ${row}`);
}

main();
