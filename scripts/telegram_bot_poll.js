#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { queueTelegramCommand } = require('./telegram_command_inbox');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_OFFSET_FILE = path.join(ROOT, '.lua_agent', 'telegram_offset.txt');
const DEFAULT_ENV_FILE = path.join(ROOT, '.env');
const API_BASE = 'https://api.telegram.org';

function usage() {
  console.log(`Usage:
  TELEGRAM_BOT_TOKEN=... node scripts/telegram_bot_poll.js --once
  TELEGRAM_BOT_TOKEN=... TELEGRAM_ALLOWED_CHAT_IDS=123,456 node scripts/telegram_bot_poll.js --once --ack
  TELEGRAM_BOT_TOKEN=... node scripts/telegram_bot_poll.js --watch --timeout 25
`);
}

function parseArgs(argv) {
  const args = {
    ack: argv.includes('--ack'),
    help: argv.includes('--help') || argv.includes('-h'),
    once: argv.includes('--once') || !argv.includes('--watch'),
    watch: argv.includes('--watch'),
    timeout: 0,
    limit: 50,
    root: ROOT,
    offsetFile: DEFAULT_OFFSET_FILE,
    envFile: DEFAULT_ENV_FILE,
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--timeout') args.timeout = Number(argv[++i] || 0);
    else if (argv[i] === '--limit') args.limit = Number(argv[++i] || 50);
    else if (argv[i] === '--offset-file') args.offsetFile = path.resolve(argv[++i]);
    else if (argv[i] === '--env-file') args.envFile = path.resolve(argv[++i]);
    else if (argv[i] === '--root') args.root = path.resolve(argv[++i]);
  }
  return args;
}

function loadDotEnv(envFile = DEFAULT_ENV_FILE) {
  if (!fs.existsSync(envFile)) return;
  const content = fs.readFileSync(envFile, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseAllowedChatIds(value) {
  return new Set(
    String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function readOffset(offsetFile) {
  if (!fs.existsSync(offsetFile)) return 0;
  const value = Number(fs.readFileSync(offsetFile, 'utf8').trim());
  return Number.isFinite(value) ? value : 0;
}

function writeOffset(offsetFile, offset) {
  fs.mkdirSync(path.dirname(offsetFile), { recursive: true });
  fs.writeFileSync(offsetFile, String(offset), 'utf8');
}

async function telegramRequest(method, params, options) {
  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(`${API_BASE}/bot${options.token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    const description = data.description || response.statusText || 'Telegram API request failed';
    throw new Error(`${method}: ${description}`);
  }
  return data.result;
}

function extractCommandUpdate(update) {
  const message = update.message || update.channel_post || null;
  const text = message && typeof message.text === 'string' ? message.text.trim() : '';
  if (!text.startsWith('/lua')) return null;
  return {
    chatId: String(message.chat.id),
    date: message.date ? new Date(message.date * 1000) : new Date(),
    text,
  };
}

async function pollTelegramCommands(options) {
  if (!options.token) throw new Error('TELEGRAM_BOT_TOKEN is required.');
  const allowedChatIds = options.allowedChatIds || new Set();
  const offset = readOffset(options.offsetFile);
  const updates = await telegramRequest(
    'getUpdates',
    {
      offset: offset || undefined,
      limit: options.limit || 50,
      timeout: options.timeout || 0,
      allowed_updates: ['message', 'channel_post'],
    },
    options,
  );

  const queued = [];
  let nextOffset = offset;
  for (const update of updates) {
    if (typeof update.update_id === 'number') {
      nextOffset = Math.max(nextOffset, update.update_id + 1);
    }
    const command = extractCommandUpdate(update);
    if (!command) continue;
    if (allowedChatIds.size > 0 && !allowedChatIds.has(command.chatId)) continue;

    const result = queueTelegramCommand({
      root: options.root || ROOT,
      source: `telegram:${command.chatId}`,
      text: command.text,
      now: command.date,
    });
    queued.push(result);

    if (options.ack) {
      await telegramRequest(
        'sendMessage',
        {
          chat_id: command.chatId,
          text: `Lua queued ${result.id}: ${result.command}`,
        },
        options,
      );
    }
  }

  if (nextOffset !== offset) writeOffset(options.offsetFile, nextOffset);
  return { queued, nextOffset };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  loadDotEnv(args.envFile);

  const options = {
    ...args,
    token: process.env.TELEGRAM_BOT_TOKEN,
    allowedChatIds: parseAllowedChatIds(process.env.TELEGRAM_ALLOWED_CHAT_IDS),
  };

  do {
    const result = await pollTelegramCommands(options);
    if (result.queued.length === 0) console.log('No Telegram /lua commands found.');
    else result.queued.forEach((entry) => console.log(`Queued ${entry.id}: ${entry.command} -> ${entry.payload}`));
  } while (args.watch);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  extractCommandUpdate,
  loadDotEnv,
  parseAllowedChatIds,
  pollTelegramCommands,
  readOffset,
  telegramRequest,
  writeOffset,
};
