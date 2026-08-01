const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  buildCommandResult,
  buildStatusText,
  createCodexHandoff,
  createMemoryStore,
  createServer,
  getLatestTodo,
  normalizeTelegramUpdate,
  processQueuedCommands,
  shouldStartProcessorLoop,
  startProcessorLoop,
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

test('Telegram webhook processes /lua status commands and responds without exposing secrets', async () => {
  const fetchCalls = [];
  const fetchImpl = async (url, init) => {
    fetchCalls.push({ url, body: init.body ? JSON.parse(init.body) : null });
    return {
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 9 } }),
    };
  };
  const server = createServer({
    env: {
      TELEGRAM_BOT_TOKEN: 'telegram-secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
      TELEGRAM_ALLOWED_CHAT_IDS: '1780466684',
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
    assert.equal(body.queued, false);
    assert.equal(body.processed, true);
    assert.equal(body.command.command, '/lua status');
    assert.match(body.result, /Lua status/);
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
    fetchCalls.push({ url, body: init.body ? JSON.parse(init.body) : null });
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
      TELEGRAM_ALLOWED_CHAT_IDS: '1780466684',
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
    assert.equal(body.queued, false);
    assert.equal(body.processed, true);
    assert.ok(fetchCalls.some((call) => String(call.url).includes('/rest/v1/lua_commands')));
    assert.ok(fetchCalls.some((call) => String(call.url).includes('/sendMessage')));
  } finally {
    await close(server);
  }
});

test('Telegram webhook still processes when Telegram reply send fails', async () => {
  const fetchImpl = async () => ({
    ok: false,
    text: async () => '{"description":"chat not found"}',
  });
  const server = createServer({
    env: {
      TELEGRAM_BOT_TOKEN: 'telegram-secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
      TELEGRAM_ALLOWED_CHAT_IDS: '1',
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
          chat: { id: 1 },
          text: '/lua status Lua',
        },
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.queued, false);
    assert.equal(body.processed, true);
    assert.equal(body.command.command, '/lua status');
  } finally {
    await close(server);
  }
});

test('Telegram webhook ignores chats outside the allowlist', async () => {
  const server = createServer({
    env: {
      TELEGRAM_BOT_TOKEN: 'telegram-secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
      TELEGRAM_ALLOWED_CHAT_IDS: '1780466684',
      TELEGRAM_ALLOWED_CHAT_IDS: '123',
    },
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
        update_id: 4,
        message: { chat: { id: 999 }, text: '/lua status Lua' },
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.queued, false);
    assert.equal(body.command, undefined);
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

test('Telegram webhook acknowledges malformed /lua commands with a helpful reply', async () => {
  const fetchCalls = [];
  const fetchImpl = async (url, init) => {
    fetchCalls.push({ url, body: init.body ? JSON.parse(init.body) : null });
    return {
      ok: true,
      json: async () => ({ ok: true, result: { message_id: 10 } }),
    };
  };
  const server = createServer({
    env: {
      TELEGRAM_BOT_TOKEN: 'telegram-secret-token',
      TELEGRAM_WEBHOOK_SECRET: 'test-secret',
      TELEGRAM_ALLOWED_CHAT_IDS: '1780466684',
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
        update_id: 4,
        message: {
          message_id: 8,
          date: 1780538400,
          chat: { id: 1780466684 },
          text: '/lua',
        },
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.queued, false);
    assert.equal(body.error, 'invalid_lua_command');
    assert.match(fetchCalls[0].url, /sendMessage$/);
    assert.match(fetchCalls[0].body.text, /Lua command format/);
    assert.doesNotMatch(fetchCalls[0].body.text, /telegram-secret-token/);
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

test('builds practical command processor results', () => {
  const status = buildCommandResult(
    { agent: 'status', command: '/lua status', payload: 'Lua' },
    { commandCount: 4, memoryCount: 1 },
    { LUA_DEPLOYMENT_TARGET: 'railway' },
  );
  const remember = buildCommandResult({ agent: 'remember', command: '/lua remember', payload: '중요한 기억' });
  const todo = buildCommandResult({ agent: 'todo', command: '/lua todo', payload: 'Toss miniapp QA 확인' });
  const next = buildCommandResult(
    { agent: 'next', command: '/lua next', payload: '' },
    { todos: [{ id: 11, payload: 'Toss miniapp QA 확인' }], recentCommands: [] },
  );

  assert.match(status, /Lua status/);
  assert.match(status, /commands: 4/);
  assert.match(remember, /Lua memory recorded/);
  assert.match(todo, /Todo captured: Toss miniapp QA/);
  assert.match(next, /Recommended: Toss miniapp QA/);
  assert.match(next, /todo #11/);
});

test('processes queued commands into done results and logs', async () => {
  const updates = [];
  const logs = [];
  const store = {
    getCommandContext: async () => ({
      commandCount: 4,
      memoryCount: 1,
      logCount: 2,
      todos: [],
      recentCommands: [],
      memories: [],
    }),
    listQueuedCommands: async () => [
      {
        id: 7,
        chatId: '1780466684',
        command: '/lua status',
        agent: 'status',
        payload: 'Lua',
      },
    ],
    updateCommand: async (id, patch) => {
      updates.push({ id, patch });
      return { ok: true };
    },
    saveLog: async (log) => {
      logs.push(log);
      return log;
    },
  };

  const result = await processQueuedCommands({ store, env: { LUA_DEPLOYMENT_TARGET: 'railway' } });

  assert.equal(result.ok, true);
  assert.equal(result.processed, 1);
  assert.deepEqual(updates[0], { id: 7, patch: { status: 'processing' } });
  assert.equal(updates[1].id, 7);
  assert.equal(updates[1].patch.status, 'done');
  assert.match(updates[1].patch.result, /Lua status/);
  assert.match(updates[1].patch.result, /commands: 4/);
  assert.equal(logs[0].event, 'lua_command_processed');
});

test('processor loop can be disabled by env', () => {
  assert.equal(shouldStartProcessorLoop({ LUA_PROCESSOR_LOOP: 'false' }), false);
  assert.equal(shouldStartProcessorLoop({}), true);
  assert.equal(shouldStartProcessorLoop({}, { disableProcessorLoop: true }), false);
});

test('processor loop tick handles queued commands', async () => {
  const updates = [];
  const store = {
    getCommandContext: async () => ({
      commandCount: 1,
      memoryCount: 0,
      logCount: 0,
      todos: [{ id: 8, payload: 'Toss miniapp follow up' }],
      recentCommands: [],
      memories: [],
    }),
    listQueuedCommands: async () => [
      {
        id: 8,
        chatId: '1780466684',
        command: '/lua next',
        agent: 'next',
        payload: '',
      },
    ],
    updateCommand: async (id, patch) => {
      updates.push({ id, patch });
      return { ok: true };
    },
    saveLog: async (log) => log,
  };

  const loop = startProcessorLoop({
    env: {},
    store,
    intervalMs: 60_000,
    startImmediately: false,
  });
  loop.stop();
  await loop.tick();

  assert.equal(updates[0].patch.status, 'processing');
  assert.equal(updates[1].patch.status, 'done');
  assert.match(updates[1].patch.result, /Recommended: Toss miniapp follow up/);
});

test('creates a Codex handoff note from the latest Telegram todo without leaking secrets', async () => {
  const calls = [];
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-codex-handoff-'));
  const fetchImpl = async (url, init) => {
    calls.push({ url, authorization: init.headers.authorization });
    return {
      ok: true,
      text: async () =>
        JSON.stringify([
          {
            id: 12,
            agent: 'todo',
            command: '/lua todo',
            payload: 'Toss miniapp QA follow up',
            status: 'done',
            result: 'Todo captured: Toss miniapp QA follow up',
            createdAt: '2026-06-04T05:12:00.000Z',
            processedAt: '2026-06-04T05:12:01.000Z',
          },
        ]),
    };
  };

  const todo = await getLatestTodo({
    env: {
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
    },
    fetchImpl,
  });
  const result = createCodexHandoff({
    todo,
    rootDir: tmpDir,
    now: new Date('2026-06-04T06:00:00.000Z'),
  });

  assert.equal(todo.id, 12);
  assert.equal(result.created, true);
  assert.equal(result.fileRel, '90_System/80_Lua_Details/Command Runs/telegram-todo-12-codex-handoff.md');
  assert.ok(fs.existsSync(result.filePath));
  const content = fs.readFileSync(result.filePath, 'utf8');
  assert.match(content, /Toss miniapp QA follow up/);
  assert.match(content, /Tell Codex: `telegram-todo-12-codex-handoff 처리해줘`/);
  assert.doesNotMatch(content, /service-role-secret/);
  assert.equal(JSON.stringify(result).includes('service-role-secret'), false);
  assert.ok(calls.every((call) => call.authorization === 'Bearer service-role-secret'));
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
