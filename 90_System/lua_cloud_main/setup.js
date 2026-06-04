#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const { validateCloudEnv } = require('./config');

function loadDotEnv(envFile = path.resolve(process.cwd(), '.env'), env = process.env) {
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
    if (!env[key]) env[key] = value;
  }
}

function parseArgs(argv) {
  const args = {
    command: argv[0] || 'check-env',
    apply: argv.includes('--apply'),
    envFile: '.env',
    publicUrl: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--url') {
      args.publicUrl = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--env-file') {
      args.envFile = argv[index + 1] || '.env';
      index += 1;
    }
  }

  return args;
}

function normalizePublicUrl(publicUrl) {
  const value = String(publicUrl || '').trim().replace(/\/$/, '');
  if (!/^https:\/\//.test(value)) {
    throw new Error('--url must be an https URL, for example https://lua-main.up.railway.app');
  }
  return value;
}

function buildTelegramWebhookRequest({ env = process.env, publicUrl }) {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is required.');
  if (!env.TELEGRAM_WEBHOOK_SECRET) throw new Error('TELEGRAM_WEBHOOK_SECRET is required.');

  const baseUrl = normalizePublicUrl(publicUrl);
  const webhookUrl = `${baseUrl}/webhooks/telegram`;

  return {
    method: 'setWebhook',
    apiUrl: `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`,
    body: {
      url: webhookUrl,
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ['message', 'channel_post'],
    },
    safeSummary: {
      method: 'setWebhook',
      url: webhookUrl,
      tokenConfigured: true,
      secretConfigured: true,
    },
  };
}

async function runSetupCommand(options = {}) {
  const argv = options.argv || process.argv.slice(2);
  const env = options.env || process.env;
  const args = parseArgs(argv);
  if (options.loadEnv !== false) loadDotEnv(args.envFile, env);

  if (args.command === 'check-env') {
    return validateCloudEnv(env);
  }

  if (args.command === 'set-telegram-webhook') {
    const request = buildTelegramWebhookRequest({ env, publicUrl: args.publicUrl });
    if (!args.apply) {
      return {
        mode: 'dry-run',
        request: {
          safeSummary: request.safeSummary,
        },
      };
    }

    const fetchImpl = options.fetchImpl || fetch;
    const response = await fetchImpl(request.apiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request.body),
    });
    const body = await response.json();
    if (!response.ok || !body.ok) {
      throw new Error(body.description || response.statusText || 'Telegram setWebhook failed');
    }
    return {
      mode: 'apply',
      ok: true,
      request: {
        safeSummary: request.safeSummary,
      },
    };
  }

  throw new Error(`Unknown setup command: ${args.command}`);
}

function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  runSetupCommand()
    .then(printResult)
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  buildTelegramWebhookRequest,
  loadDotEnv,
  normalizePublicUrl,
  parseArgs,
  runSetupCommand,
};
