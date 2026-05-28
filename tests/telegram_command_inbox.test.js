const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { INBOX_REL, parseCommand, queueTelegramCommand } = require('../scripts/telegram_command_inbox');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-telegram-inbox-'));
  write(
    path.join(root, INBOX_REL),
    `# Telegram Command Inbox

## Queue

| ID | Source | Command | Payload | Status | Result |
|---|---|---|---|---|---|
| example-001 | Telegram | \`/lua inbox\` | 예시 아이디어 | done | [[00_Inbox/AI 분류 대기중...|Inbox]] |
`,
  );
  return root;
}

test('parses Telegram /lua role commands', () => {
  const parsed = parseCommand('/lua research brief :: 테크인 수상태양광 실적 조사');

  assert.equal(parsed.command, '/lua research');
  assert.equal(parsed.agent, 'research');
  assert.equal(parsed.intent, 'brief');
  assert.equal(parsed.payload, '테크인 수상태양광 실적 조사');
});

test('writes Telegram command rows into the Telegram command inbox', () => {
  const root = makeVault();

  const result = queueTelegramCommand({
    root,
    source: 'telegram-mobile',
    text: '/lua build app :: Toss follow-up QA 자동화',
    now: new Date('2026-05-28T03:04:05.000Z'),
  });

  assert.equal(result.id, 'telegram-20260528-030405');

  const inbox = fs.readFileSync(path.join(root, INBOX_REL), 'utf8');
  assert.match(inbox, /\| telegram-20260528-030405 \| telegram-mobile \| \/lua build \| Toss follow-up QA 자동화 \| queued \|  \|/);
});

test('rejects unknown Telegram /lua commands', () => {
  assert.throws(
    () => parseCommand('/lua unknown thing'),
    /Unknown \/lua command: unknown/,
  );
});
