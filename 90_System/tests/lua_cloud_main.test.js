const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  buildCommandResult,
  claudeIsConfigured,
  buildStatusText,
  createCodexHandoff,
  createMemoryStore,
  createServer,
  getLatestTodo,
  normalizeTelegramUpdate,
  processCommand,
  processQueuedCommands,
  routeCommand,
  searchVaultContext,
  shouldStartProcessorLoop,
  startProcessorLoop,
  validateCloudEnv,
} = require('../lua_cloud_main');
const { buildTelegramWebhookRequest, checkSupabaseSchema, runSetupCommand } = require('../lua_cloud_main/setup');
const {
  buildAgentPrompt,
  detectAgentAvailability,
  pairWorker,
  runWorkerOnce,
  safeText,
} = require('../lua_cloud_main/mac_worker');
const { buildPlist, servicePaths } = require('../lua_cloud_main/mac_worker_service');

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
    routeAgent: 'lua',
    approval: 'auto',
  });
});

test('captures plain Telegram text as a todo command', () => {
  const command = normalizeTelegramUpdate({
    update_id: 1,
    message: {
      chat: { id: 1 },
      text: '다음 주 회의 준비해줘',
    },
  });

  assert.equal(command.command, '/lua todo');
  assert.equal(command.agent, 'todo');
  assert.equal(command.payload, '다음 주 회의 준비해줘');
});

test('routes plain Telegram text to Claude, Codex, or Lua deterministically', () => {
  assert.deepEqual(routeCommand({ agent: 'ask', payload: '이번 주 계획을 정리해줘' }), {
    routeAgent: 'claude',
    approval: 'auto',
  });
  assert.deepEqual(routeCommand({ agent: 'do', payload: '저장소 테스트를 고쳐줘' }), {
    routeAgent: 'codex',
    approval: 'ask_first',
  });

  const codex = normalizeTelegramUpdate({ update_id: 2, message: { chat: { id: 1 }, text: 'GitHub 배포 오류를 수정해줘' } });
  const claude = normalizeTelegramUpdate({ update_id: 3, message: { chat: { id: 1 }, text: '이번 주 계획을 요약해줘' } });
  const memory = normalizeTelegramUpdate({ update_id: 4, message: { chat: { id: 1 }, text: '이 결정 기억해줘' } });

  assert.equal(codex.routeAgent, 'codex');
  assert.equal(codex.approval, 'ask_first');
  assert.equal(claude.routeAgent, 'claude');
  assert.equal(claude.approval, 'auto');
  assert.equal(memory.agent, 'remember');
});

test('searches only permitted Markdown context and excludes protected folders', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-context-'));
  fs.mkdirSync(path.join(root, '90_System/80_Lua_Details/02_Projects'), { recursive: true });
  fs.mkdirSync(path.join(root, '00_Lua/02_Memory/Identity'), { recursive: true });
  fs.writeFileSync(path.join(root, '90_System/80_Lua_Details/02_Projects', 'Solar.md'), '# Solar\n센서 교체 범위를 검토한다.');
  fs.writeFileSync(path.join(root, '00_Lua/02_Memory/Identity', 'secret.md'), 'private identity detail');

  const context = await searchVaultContext({
    root,
    directories: ['90_System/80_Lua_Details/02_Projects', '00_Lua/02_Memory/Identity'],
    query: '센서 교체 범위',
  });

  assert.equal(context.length, 1);
  assert.equal(context[0].path, path.join('90_System/80_Lua_Details/02_Projects', 'Solar.md'));
  assert.doesNotMatch(JSON.stringify(context), /identity detail/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('runs a configured Claude task with limited Obsidian context', async () => {
  const store = createMemoryStore({});
  const task = {
    updateId: 44,
    chatId: '1780466684',
    text: '/lua ask :: 이번 주 센서 계획을 요약해줘',
    command: '/lua ask',
    agent: 'ask',
    payload: '이번 주 센서 계획을 요약해줘',
    routeAgent: 'claude',
    approval: 'auto',
  };
  const requests = [];
  await store.saveCommand(task);
  const result = await processCommand(task, {
    store,
    env: { ANTHROPIC_API_KEY: 'test-key', CLAUDE_MODEL: 'test-model' },
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return { ok: true, text: async () => JSON.stringify({ content: [{ type: 'text', text: '이번 주 센서 계획입니다.' }] }) };
    },
    vaultRoot: path.join(os.tmpdir(), 'lua-empty-context'),
  });

  assert.equal(result.ok, true);
  assert.match(result.result, /센서 계획/);
  assert.equal(store.snapshot().commands[0].status, 'done');
  assert.equal(requests.length, 1);
  assert.match(requests[0].url, /anthropic\.com\/v1\/messages$/);
  assert.equal(JSON.parse(requests[0].init.body).model, 'test-model');
  assert.doesNotMatch(requests[0].init.body, /test-key/);
  assert.equal(claudeIsConfigured({}), false);
  assert.equal(claudeIsConfigured({ ANTHROPIC_API_KEY: 'key' }), true);
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

test('pairs a Mac Worker with a one-time code and authorizes its token', async () => {
  const store = createMemoryStore({});
  const pairing = await store.createWorkerPair('1780466684', new Date('2026-08-01T00:00:00Z'));
  const exchanged = await store.exchangeWorkerPair(pairing.code, 'test-mac', new Date('2026-08-01T00:01:00Z'));

  assert.equal(pairing.code.length, 16);
  assert.match(exchanged.token, /^lua_worker_/);
  assert.equal((await store.exchangeWorkerPair(pairing.code, 'other-mac', new Date('2026-08-01T00:02:00Z'))), null);
  const worker = await store.authorizeWorker(exchanged.token);
  assert.equal(worker.workerId, 'test-mac');
  assert.equal(JSON.stringify(store.snapshot()).includes(exchanged.token), false);
});

test('processes Telegram Mac Worker pairing without persisting the code in command result', async () => {
  const store = createMemoryStore({});
  const command = { id: 61, chatId: '1780466684', command: '/lua pair', agent: 'pair', payload: '' };
  await store.saveCommand(command);
  const result = await processCommand(command, { store });

  assert.equal(result.ok, true);
  assert.match(result.result, /Code: [A-Z0-9]{16}/);
  assert.doesNotMatch(store.snapshot().commands[0].result, /[A-Z0-9]{16}/);
});

test('serves authenticated worker claim and completion endpoints', async () => {
  const store = createMemoryStore({});
  const pairing = await store.createWorkerPair('1780466684');
  const { token } = await store.exchangeWorkerPair(pairing.code, 'test-mac');
  await store.saveCommand({
    id: 72,
    chatId: '1780466684',
    command: '/lua do',
    agent: 'do',
    payload: '검증 작업',
    routeAgent: 'codex',
    approval: 'ask_first',
    status: 'awaiting_agent',
  });
  const telegramCalls = [];
  const server = createServer({
    store,
    env: { TELEGRAM_BOT_TOKEN: 'test-token' },
    fetchImpl: async (url, init) => {
      telegramCalls.push({ url, body: JSON.parse(init.body) });
      return { ok: true, json: async () => ({ ok: true }) };
    },
  });
  const baseUrl = await listen(server);
  try {
    const unauthorized = await fetch(`${baseUrl}/worker/tasks/claim`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    assert.equal(unauthorized.status, 401);

    const claim = await fetch(`${baseUrl}/worker/tasks/claim`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ workerId: 'test-mac', agents: ['codex'] }),
    });
    const claimed = await claim.json();
    assert.equal(claimed.task.id, 72);
    assert.equal(claimed.task.status, 'running');

    const complete = await fetch(`${baseUrl}/worker/tasks/72/result`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, result: '검증 완료' }),
    });
    assert.equal(complete.status, 200);
    assert.equal(store.snapshot().commands[0].status, 'done');
    assert.match(telegramCalls[0].body.text, /검증 완료/);
  } finally {
    await close(server);
  }
});

test('detects subscription CLI logins and processes a Codex worker task', async () => {
  const availability = await detectAgentAvailability({
    spawnCapture: async (command) => command.includes('claude')
      ? { ok: false, stdout: '{"loggedIn":false}', stderr: '' }
      : { ok: true, stdout: 'Logged in using ChatGPT', stderr: '' },
    claudePath: '/test/claude',
    codexPath: '/test/codex',
  });
  assert.deepEqual(availability.agents, ['codex']);

  const requests = [];
  const result = await runWorkerOnce({
    env: { LUA_WORKER_URL: 'https://worker.test', LUA_WORKER_TOKEN: 'worker-token', LUA_WORKER_ID: 'test-mac' },
    availability,
    spawnCapture: async () => ({ ok: true, stdout: 'Codex 작업 완료', stderr: '', code: 0 }),
    fetchImpl: async (url, init) => {
      requests.push({ url, body: JSON.parse(init.body), authorization: init.headers.authorization });
      const body = url.endsWith('/claim')
        ? { ok: true, task: { id: 81, routeAgent: 'codex', payload: '테스트 실행' } }
        : { ok: true, status: 'done' };
      return { ok: true, text: async () => JSON.stringify(body) };
    },
  });
  assert.equal(result.ok, true);
  assert.equal(result.taskId, 81);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].body.result, 'Codex 작업 완료');
  assert.match(requests[0].authorization, /^Bearer /);
});

test('pairs worker into a protected env file and builds a secret-free launchd service', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-worker-'));
  const envFile = path.join(root, '.env.worker');
  const paired = await pairWorker('PAIR-CODE', {
    envFile,
    workerId: 'test-mac',
    baseUrl: 'https://worker.test',
    fetchImpl: async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, token: 'lua_worker_private' }) }),
  });
  const content = fs.readFileSync(envFile, 'utf8');
  assert.equal(paired.ok, true);
  assert.match(content, /LUA_WORKER_TOKEN=lua_worker_private/);
  assert.equal(fs.statSync(envFile).mode & 0o777, 0o600);
  const plist = buildPlist({ rootDir: root, homeDir: root, nodePath: '/usr/bin/node' });
  assert.match(plist, /dev\.lua\.mac-worker/);
  assert.doesNotMatch(plist, /lua_worker_private/);
  assert.match(servicePaths({ rootDir: root, homeDir: root }).plistPath, /Library\/LaunchAgents/);
  assert.match(buildAgentPrompt({ id: 1, routeAgent: 'codex', payload: '수정' }), /must run relevant tests/);
  assert.equal(safeText('token lua_worker_abcdefghijkl'), 'token [REDACTED_WORKER_TOKEN]');
  fs.rmSync(root, { recursive: true, force: true });
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

test('holds Codex work for approval and releases it with an approval command', async () => {
  const store = createMemoryStore({});
  const task = {
    updateId: 31,
    chatId: '1780466684',
    text: '/lua do :: GitHub 배포 오류 수정',
    command: '/lua do',
    agent: 'do',
    payload: 'GitHub 배포 오류 수정',
    routeAgent: 'codex',
    approval: 'ask_first',
    receivedAt: '2026-06-04T02:00:00.000Z',
  };
  await store.saveCommand(task);
  const held = await processCommand(task, { store });

  assert.equal(held.ok, true);
  assert.equal(store.snapshot().commands[0].status, 'awaiting_approval');
  assert.equal(held.replyMarkup.inline_keyboard[0][0].callback_data, 'approve:31');

  const approval = {
    updateId: 32,
    chatId: '1780466684',
    command: '/lua approve',
    agent: 'approve',
    payload: '31',
    receivedAt: '2026-06-04T02:00:01.000Z',
  };
  await store.saveCommand(approval);
  const released = await processCommand(approval, { store });

  assert.equal(released.ok, true);
  assert.equal(store.snapshot().commands[0].status, 'awaiting_agent');
  assert.match(released.result, /approved for codex/i);
});

test('normalizes Telegram approval button callbacks', () => {
  const command = normalizeTelegramUpdate({
    update_id: 33,
    callback_query: {
      data: 'approve:31',
      from: { id: 1780466684, username: 'sooin123456' },
      message: { message_id: 9, chat: { id: 1780466684 } },
    },
  });

  assert.equal(command.command, '/lua approve');
  assert.equal(command.payload, '31');
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
