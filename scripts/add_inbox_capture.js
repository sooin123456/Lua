#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { relativePosix } = require('./lib/files');

const DEFAULT_ROOT = path.resolve(__dirname, '..');

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

function kstParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function timestamp(now = new Date()) {
  const parts = kstParts(now);
  return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

function kstNow(now = new Date()) {
  const parts = kstParts(now);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} KST`;
}

function safeSlug(value) {
  return String(value || 'manual')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'manual';
}

function captureTitle(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)
    ?.slice(0, 80) || 'Inbox Capture';
}

function noteContent({ source, text, now }) {
  return `---
type: inbox-note
status: captured
source: ${source}
created: ${kstNow(now)}
last_updated: ${kstNow(now).slice(0, 10)}
---

# ${captureTitle(text)}

${text.trim()}

## Navigation

- [[00_Inbox/AI 분류 대기중...|AI 분류 대기중]]
- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
`;
}

function addInboxCapture(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  const source = options.source || 'manual';
  const text = options.text;
  const now = options.now || new Date();
  if (!text || !String(text).trim()) throw new Error('Missing capture text');

  const inboxDir = path.join(root, '00_Inbox');
  fs.mkdirSync(inboxDir, { recursive: true });

  const file = path.join(inboxDir, `${timestamp(now)}-${safeSlug(source)}.md`);
  fs.writeFileSync(file, noteContent({ source, text: String(text), now }), 'utf8');
  return { fileRel: relativePosix(root, file) };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.text) {
    usage();
    process.exit(args.help ? 0 : 1);
  }
  const result = addInboxCapture({ source: args.source, text: args.text });
  console.log(`Added inbox capture: ${result.fileRel}`);
}

if (require.main === module) main();

module.exports = {
  addInboxCapture,
};
