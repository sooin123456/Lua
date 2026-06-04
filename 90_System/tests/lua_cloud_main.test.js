const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const {
  buildStatusText,
  createMemoryStore,
  createServer,
  normalizeTelegramUpdate,
  validateCloudEnv,
} = require('../lua_cloud_main');
const { buildTelegramWebhookRequest, checkSupabaseSchema, runSetupCommand } = require('../lua_cloud_main/setup');

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

test('normalizes Telegram /lua webhook updates into durable commands', () => {
  const command = normalizeTelegramUpdate({
    update_id: 140947344,
    message: {
      message_id: 5,
      date: 1780538400,
      chat: { id: 1780466684 },
      from: { id: 1780466684, username: 'sooin123456' },
      text: '/lua remember :: Railway + Supabase로 Lua Cloud Main 시작',
    },
  });

  assert.deepEqual(command, {
    updateId: 140947344,
    messageId: 5,
    chatId: '1780466684',
    userId: '1780466684',
    username: 'sooin123456',
    text: '/lua remember :: Railway + Supabase로 Lua Cloud Main 시작',
    command: '/lua remember',
    agent: 'remember',
    intent: '',
    payload: 'Railway + Supabase로 Lua Cloud Main 시작',
    source: 'telegram:webhook',
    receivedAt: '2026-06-04T02:00:00.000Z',
  });
});

test('rejects non-lua Telegram webhook updates', () => {
  assert.equal(
    normalizeTelegramUpdate({
      update_id: 1,
      message: {
        chat: { id: 1 },
        text: '/start',
      },
    }),
    null,
  );
});

test('memory store records commands, logs, and memory without Supabase config', async () => {
  const store = createMemoryStore({});
  const command = {
    updateId: 1,
    chatId: '123',
    text: '/lua remember :: 중요한 결정',
    command: '/lua remember',
    agent: 'remember',
    payload: '중요한 결정',
    receivedAt: '2026-06-04T02:00:00.000Z',
  };

  await store.saveCommand(command);
  await store.saveMemory(command);
  await store.saveLog({ level: 'info', event: 'test' });

  assert.equal(store.snapshot().commands.length, 1);
  assert.equal(store.snapshot().memories.length, 1);
  assert.equal(store.snapshot().logs.length, 1);
});

test('memory store keeps running when Supabase insert fails', async () => {
  const store = createMemoryStore({
    env: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
    },
    fetchImpl: async () => ({
      ok: false,
      text: async () => '{"message":"table missing"}',
    }),
  });
  const command = {
    updateId: 1,
    chatId: '123',
    text: '/lua status Lua',
    command: '/lua status',
    agent: 'status',
    payload: 'Lua',
    receivedAt: '2026-06-04T02:00:00.000Z',
  };

  await store.saveCommand(command);
  await store.saveLog({ level: 'info', event: 'test' });

  const snapshot = store.snapshot();
  assert.equal(snapshot.commands.length, 1);
  assert.equal(snapshot.logs.length, 1);
  assert.equal(snapshot.warnings.length, 2);
  assert.equal(snapshot.warnings[0].event, 'supabase_insert_failed');
  assert.equal(JSON.stringify(snapshot).includes('service-role-secret'), false);
});

test('cloud main health endpoint reports configured channels', async () => {
  const server = createServer({
    env: {
      LUA_DEPLOYMENT_TARGET: 'railway',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'secret',
      TELEGRAM_BOT_TOKEN: 'secret',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
    },
  });
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.deploymentTarget, 'railway');
    assert.equal(body.supabaseConfigured, true);
    assert.equal(body.telegramConfigured, true);
  } finally {
    await close(server);
  }
});

test('Telegram webhook queues /lua status commands and responds without exposing secrets', async () => {
  const fetchCalls = [];
  const fetchImpl = async (url, init) => {
    fetchCalls.push({ url, body: JSON.parse(init.body) });
    return {
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 9 } }),
    };
  };
  const server = createServer({
    env: {
      TELEGRAM_BOT_TOKEN: 'telegram-secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
    },
    fetchImpl,
  });
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'test-secret',
      },
      body: JSON.stringify({
        update_id: 2,
        message: {
          message_id: 6,
          date: 1780538400,
          chat: { id: 1780466684 },
          text: '/lua status Lua',
        },
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.queued, true);
    assert.equal(body.command.command, '/lua status');
    assert.match(fetchCalls[0].url, /sendMessage$/);
    assert.equal(fetchCalls[0].body.chat_id, '1780466684');
    assert.match(fetchCalls[0].body.text, /Lua status/);
    assert.doesNotMatch(fetchCalls[0].body.text, /telegram-secret-token/);
  } finally {
    await close(server);
  }
});

test('Telegram webhook still acknowledges when Supabase table is missing', async () => {
  const fetchCalls = [];
  const fetchImpl = async (url, init) => {
    fetchCalls.push({ url, body: JSON.parse(init.body) });
    if (String(url).includes('supabase.co')) {
      return {
        ok: false,
        text: async () => '{"message":"Could not find the table"}',
      };
    }
    return {
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 9 } }),
    };
  };
  const server = createServer({
    env: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
      TELEGRAM_BOT_TOKEN: 'telegram-secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
    },
    fetchImpl,
  });
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'test-secret',
      },
      body: JSON.stringify({
        update_id: 2,
        message: {
          message_id: 6,
          date: 1780538400,
          chat: { id: 1780466684 },
          text: '/lua status Lua',
        },
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.queued, true);
    assert.ok(fetchCalls.some((call) => String(call.url).includes('/rest/v1/lua_commands')));
    assert.ok(fetchCalls.some((call) => String(call.url).includes('/sendMessage')));
  } finally {
    await close(server);
  }
});

test('Telegram webhook still queues when Telegram reply send fails', async () => {
  const fetchImpl = async () => ({
    ok: false,
    text: async () => '{"description":"chat not found"}',
  });
  const server = createServer({
    env: {
      TELEGRAM_BOT_TOKEN: 'telegram-secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
    },
    fetchImpl,
  });
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'test-secret',
      },
      body: JSON.stringify({
        update_id: 3,
        message: {
          message_id: 7,
          date: 1780538400,
          chat: { id: 0 },
          text: '/lua status Lua',
        },
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.queued, true);
    assert.equal(body.command.command, '/lua status');
  } finally {
    await close(server);
  }
});

test('Telegram webhook rejects requests with the wrong secret', async () => {
  const server = createServer({
    env: {
      TELEGRAM_BOT_TOKEN: 'telegram-secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
    },
  });
  const baseUrl = await listen(server);

  try {
    const response = await fetch(`${baseUrl}/webhooks/telegram`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ update_id: 2 }),
    });

    assert.equal(response.status, 401);
  } finally {
    await close(server);
  }
});

test('status text explains the next actionable Lua step', () => {
  const text = buildStatusText({
    commandCount: 3,
    memoryCount: 2,
    deploymentTarget: 'railway',
  });

  assert.match(text, /Lua status/);
  assert.match(text, /Railway/);
  assert.match(text, /commands: 3/);
});

test('cloud env validation reports missing values without leaking secrets', () => {
  const result = validateCloudEnv({
    TELEGRAM_BOT_TOKEN: 'secret-token',
    SUPABASE_URL: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, [
    'TELEGRAM_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]);
  assert.equal(result.present.TELEGRAM_BOT_TOKEN, true);
  assert.equal(JSON.stringify(result).includes('secret-token'), false);
});

test('builds Telegram webhook setup requests without exposing the bot token in output', () => {
  const request = buildTelegramWebhookRequest({
    env: {
      TELEGRAM_BOT_TOKEN: 'secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'webhook-secret',
    },
    publicUrl: 'https://lua-main.up.railway.app',
  });

  assert.equal(request.method, 'setWebhook');
  assert.equal(request.body.url, 'https://lua-main.up.railway.app/webhooks/telegram');
  assert.equal(request.body.secret_token, 'webhook-secret');
  assert.equal(request.safeSummary.tokenConfigured, true);
  assert.equal(JSON.stringify(request.safeSummary).includes('secret-token'), false);
});

test('setup command dry-runs webhook setup without making network calls', async () => {
  let called = false;
  const result = await runSetupCommand({
    argv: ['set-telegram-webhook', '--url', 'https://lua-main.up.railway.app'],
    env: {
      TELEGRAM_BOT_TOKEN: 'secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'webhook-secret',
    },
    fetchImpl: async () => {
      called = true;
    },
  });

  assert.equal(called, false);
  assert.equal(result.mode, 'dry-run');
  assert.equal(result.request.safeSummary.url, 'https://lua-main.up.railway.app/webhooks/telegram');
});

test('setup command can check required cloud environment values', async () => {
  const result = await runSetupCommand({
    argv: ['check-env'],
    env: {
      TELEGRAM_BOT_TOKEN: 'secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'webhook-secret',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
    },
  });

  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(result).includes('service-role-secret'), false);
});

test('checks Supabase schema without leaking service role key', async () => {
  const calls = [];
  const result = await checkSupabaseSchema({
    env: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
    },
    fetchImpl: async (url, init) => {
      calls.push({ url, authorization: init.headers.authorization });
      return {
        ok: !String(url).includes('lua_logs'),
        status: String(url).includes('lua_logs') ? 404 : 200,
        json: async () => ({ message: 'table missing' }),
      };
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.tables.length, 3);
  assert.equal(result.tables.find((table) => table.table === 'lua_logs').ok, false);
  assert.ok(calls.every((call) => call.authorization === 'Bearer service-role-secret'));
  assert.equal(JSON.stringify(result).includes('service-role-secret'), false);
});
