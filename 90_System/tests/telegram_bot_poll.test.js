const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  extractCommandUpdate,
  loadDotEnv,
  parseAllowedChatIds,
  pollTelegramCommands,
} = require('../scripts/telegram_bot_poll');
const { INBOX_REL } = require('../scripts/telegram_command_inbox');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-telegram-bot-'));
  write(
    path.join(root, INBOX_REL),
    `# Telegram Command Inbox

## Queue

| ID | Source | Command | Payload | Status | Result |
|---|---|---|---|---|---|
| example-001 | Telegram | \`/lua inbox\` | 예시 아이디어 | done | [[90_System/80_Lua_Details/00_Inbox/AI 분류 대기중...|Inbox]] |
`,
  );
  return root;
}

test('extracts /lua command updates from Telegram messages', () => {
  const command = extractCommandUpdate({
    message: {
      date: 1779937200,
      chat: { id: 123 },
      text: '/lua status Lua',
    },
  });

  assert.equal(command.chatId, '123');
  assert.equal(command.text, '/lua status Lua');
});

test('ignores non-/lua Telegram messages', () => {
  assert.equal(
    extractCommandUpdate({
      message: {
        chat: { id: 123 },
        text: 'hello',
      },
    }),
    null,
  );
});

test('parses allowed chat ids', () => {
  assert.deepEqual([...parseAllowedChatIds('123, 456 ,,')], ['123', '456']);
});

test('loads .env without printing secret values', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-telegram-env-'));
  const envFile = path.join(root, '.env');
  write(
    envFile,
    `# comment
TELEGRAM_BOT_TOKEN="secret-token"
TELEGRAM_ALLOWED_CHAT_IDS=123,456
`,
  );
  const oldToken = process.env.TELEGRAM_BOT_TOKEN;
  const oldChatIds = process.env.TELEGRAM_ALLOWED_CHAT_IDS;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_ALLOWED_CHAT_IDS;

  try {
    loadDotEnv(envFile);
    assert.equal(process.env.TELEGRAM_BOT_TOKEN, 'secret-token');
    assert.equal(process.env.TELEGRAM_ALLOWED_CHAT_IDS, '123,456');
  } finally {
    if (oldToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = oldToken;
    if (oldChatIds === undefined) delete process.env.TELEGRAM_ALLOWED_CHAT_IDS;
    else process.env.TELEGRAM_ALLOWED_CHAT_IDS = oldChatIds;
  }
});

test('polls Telegram updates into the command inbox and stores offset', async () => {
  const root = makeVault();
  const offsetFile = path.join(root, '.lua_agent', 'telegram_offset.txt');
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return {
      ok: true,
      json: async () => ({
        ok: true,
        result: [
          {
            update_id: 10,
            message: {
              date: 1779937200,
              chat: { id: 123 },
              text: '/lua build app :: Toss QA 자동화',
            },
          },
          {
            update_id: 11,
            message: {
              date: 1779937201,
              chat: { id: 999 },
              text: '/lua status secret',
            },
          },
          {
            update_id: 12,
            message: {
              date: 1779937202,
              chat: { id: 123 },
              text: 'not a command',
            },
          },
        ],
      }),
    };
  };

  const result = await pollTelegramCommands({
    root,
    token: 'test-token',
    offsetFile,
    fetchImpl,
    allowedChatIds: new Set(['123']),
  });

  assert.equal(result.queued.length, 1);
  assert.equal(result.nextOffset, 13);
  assert.equal(fs.readFileSync(offsetFile, 'utf8'), '13');
  assert.equal(calls[0].body.offset, undefined);

  const inbox = fs.readFileSync(path.join(root, INBOX_REL), 'utf8');
  assert.match(inbox, /\| telegram-20260528-030000 \| telegram:123 \| \/lua build \| Toss QA 자동화 \| queued \|  \|/);
  assert.doesNotMatch(inbox, /secret/);
});

test('skips invalid /lua commands while preserving the Telegram offset', async () => {
  const root = makeVault();
  const offsetFile = path.join(root, '.lua_agent', 'telegram_offset.txt');
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({
      ok: true,
      result: [
        {
          update_id: 21,
          message: {
            date: 1779937200,
            chat: { id: 123 },
            text: '/lua sds',
          },
        },
      ],
    }),
  });

  const result = await pollTelegramCommands({
    root,
    token: 'test-token',
    offsetFile,
    fetchImpl,
    allowedChatIds: new Set(['123']),
  });

  assert.equal(result.queued.length, 0);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.nextOffset, 22);
  assert.equal(fs.readFileSync(offsetFile, 'utf8'), '22');
});

test('sends an acknowledgement when ack is enabled', async () => {
  const root = makeVault();
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    const method = url.endsWith('/sendMessage') ? 'sendMessage' : 'getUpdates';
    return {
      ok: true,
      json: async () => ({
        ok: true,
        result:
          method === 'getUpdates'
            ? [
                {
                  update_id: 3,
                  message: {
                    date: 1779937200,
                    chat: { id: 123 },
                    text: '/lua status Lua',
                  },
                },
              ]
            : { message_id: 5 },
      }),
    };
  };

  await pollTelegramCommands({
    root,
    token: 'test-token',
    offsetFile: path.join(root, '.lua_agent', 'telegram_offset.txt'),
    fetchImpl,
    ack: true,
  });

  assert.equal(calls.length, 2);
  assert.match(calls[1].url, /sendMessage$/);
  assert.equal(calls[1].body.chat_id, '123');
  assert.match(calls[1].body.text, /Lua queued telegram-/);
});
