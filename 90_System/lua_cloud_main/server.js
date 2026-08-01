const http = require('node:http');

const { normalizeTelegramUpdate } = require('./command');
const { processCommand, processQueuedCommands } = require('./processor');
const { createMemoryStore } = require('./store');
const { claudeIsConfigured } = require('./claude');
const { runProactiveCheck } = require('./proactive');

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error(`Invalid JSON: ${error.message}`));
      }
    });
    req.on('error', reject);
  });
}

async function sendTelegramMessage(command, text, options) {
  if (!options.env.TELEGRAM_BOT_TOKEN) return null;
  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(
    `https://api.telegram.org/bot${options.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: command.chatId,
        text,
        ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
      }),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${body || response.statusText}`);
  }
  return response.json();
}

function isAuthorizedTelegramRequest(req, env) {
  if (!env.TELEGRAM_WEBHOOK_SECRET) return true;
  return req.headers['x-telegram-bot-api-secret-token'] === env.TELEGRAM_WEBHOOK_SECRET;
}

function getBearerToken(req) {
  const authorization = String(req.headers.authorization || '');
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
}

function workerResultText(task) {
  const label = task.status === 'done' ? 'completed' : 'failed';
  const result = String(task.result || '').slice(0, 3_500);
  return [`Lua ${task.routeAgent || 'agent'} task #${task.id} ${label}`, result].filter(Boolean).join('\n');
}

function getTelegramChatId(update) {
  const message = update.message || update.channel_post || update.callback_query?.message || null;
  return message && message.chat && message.chat.id ? String(message.chat.id) : '';
}

function isAllowedTelegramChat(update, env) {
  const allowed = String(env.TELEGRAM_ALLOWED_CHAT_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  return allowed.includes(getTelegramChatId(update));
}

function buildInvalidCommandReply(error) {
  return [
    'Lua command format',
    '/lua status Lua',
    '/lua todo :: next action',
    '/lua next',
    `error: ${error.message}`,
  ].join('\n');
}

function createServer(options = {}) {
  const env = options.env || process.env;
  const store = options.store || createMemoryStore({ env, fetchImpl: options.fetchImpl });

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');

      if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, {
          ok: true,
          service: 'lua-cloud-main',
          deploymentTarget: env.LUA_DEPLOYMENT_TARGET || 'railway',
          supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
          telegramConfigured: Boolean(env.TELEGRAM_BOT_TOKEN),
          claudeConfigured: claudeIsConfigured(env),
        });
      }

      if (req.method === 'POST' && url.pathname === '/worker/pair') {
        const body = await readJson(req);
        const pairing = await store.exchangeWorkerPair(body.code, body.workerId);
        if (!pairing) return sendJson(res, 401, { ok: false, error: 'Invalid or expired pairing code' });
        await store.saveLog({ level: 'info', event: 'lua_worker_paired' });
        return sendJson(res, 200, { ok: true, token: pairing.token });
      }

      if (req.method === 'POST' && url.pathname === '/worker/tasks/claim') {
        const worker = await store.authorizeWorker(getBearerToken(req));
        if (!worker) return sendJson(res, 401, { ok: false, error: 'Unauthorized worker' });
        const body = await readJson(req);
        const task = await store.claimNextAgentTask(body.agents, body.workerId || worker.workerId);
        return sendJson(res, 200, { ok: true, task: task || null });
      }

      if (req.method === 'POST' && url.pathname === '/worker/records/claim') {
        const worker = await store.authorizeWorker(getBearerToken(req));
        if (!worker) return sendJson(res, 401, { ok: false, error: 'Unauthorized worker' });
        const body = await readJson(req);
        const record = await store.claimNextRecord(body.workerId || worker.workerId);
        return sendJson(res, 200, { ok: true, record: record || null });
      }

      const recordMatch = url.pathname.match(/^\/worker\/records\/(\d+)\/complete$/);
      if (req.method === 'POST' && recordMatch) {
        const worker = await store.authorizeWorker(getBearerToken(req));
        if (!worker) return sendJson(res, 401, { ok: false, error: 'Unauthorized worker' });
        const body = await readJson(req);
        const record = await store.completeRecord(recordMatch[1], { ok: body.ok === true });
        if (!record) return sendJson(res, 404, { ok: false, error: 'Record not found' });
        await store.saveLog({
          level: body.ok === true ? 'info' : 'warn',
          event: body.ok === true ? 'lua_obsidian_recorded' : 'lua_obsidian_record_failed',
          command: record.command,
          chatId: record.chatId,
        });
        return sendJson(res, 200, { ok: true, recorded: body.ok === true });
      }

      const resultMatch = url.pathname.match(/^\/worker\/tasks\/(\d+)\/result$/);
      if (req.method === 'POST' && resultMatch) {
        const worker = await store.authorizeWorker(getBearerToken(req));
        if (!worker) return sendJson(res, 401, { ok: false, error: 'Unauthorized worker' });
        const body = await readJson(req);
        const task = await store.completeAgentTask(resultMatch[1], {
          ok: body.ok === true,
          result: body.result,
          error: body.error,
        });
        if (!task) return sendJson(res, 404, { ok: false, error: 'Task not found' });
        try {
          await sendTelegramMessage(task, workerResultText(task), { env, fetchImpl: options.fetchImpl });
        } catch (error) {
          await store.saveLog({ level: 'warn', event: 'telegram_reply_failed', command: task.command, chatId: task.chatId, message: error.message });
        }
        await store.saveLog({ level: task.status === 'done' ? 'info' : 'error', event: 'lua_worker_task_finished', command: task.command, chatId: task.chatId });
        return sendJson(res, 200, { ok: true, status: task.status });
      }

      if (req.method === 'POST' && url.pathname === '/webhooks/telegram') {
        if (!isAuthorizedTelegramRequest(req, env)) {
          return sendJson(res, 401, { ok: false, error: 'Unauthorized webhook secret' });
        }

        const update = await readJson(req);
        if (!isAllowedTelegramChat(update, env)) {
          await store.saveLog({ level: 'warn', event: 'telegram_chat_ignored' });
          return sendJson(res, 200, { ok: true, queued: false });
        }
        let command;
        try {
          command = normalizeTelegramUpdate(update);
        } catch (error) {
          const chatId = getTelegramChatId(update);
          if (chatId) {
            try {
              await sendTelegramMessage({ chatId }, buildInvalidCommandReply(error), {
                env,
                fetchImpl: options.fetchImpl,
              });
            } catch (replyError) {
              await store.saveLog({
                level: 'warn',
                event: 'telegram_reply_failed',
                chatId,
                message: replyError.message,
              });
            }
          }
          await store.saveLog({
            level: 'warn',
            event: 'telegram_command_invalid',
            chatId,
            message: error.message,
          });
          return sendJson(res, 200, {
            ok: true,
            queued: false,
            error: 'invalid_lua_command',
          });
        }
        if (!command) {
          await store.saveLog({ level: 'info', event: 'telegram_update_ignored' });
          return sendJson(res, 200, { ok: true, queued: false });
        }

        await store.saveCommand(command);
        if (command.agent === 'remember') {
          await store.saveMemory(command);
        }

        const processed = await processCommand(command, {
          store,
          env,
          fetchImpl: options.fetchImpl,
          vaultRoot: options.vaultRoot,
        });
        const reply = processed.ok
          ? processed.result
          : `Lua could not process ${command.command}: ${processed.error}`;
        try {
          await sendTelegramMessage(command, reply, {
            env,
            fetchImpl: options.fetchImpl,
            replyMarkup: processed.replyMarkup,
          });
        } catch (error) {
          await store.saveLog({
            level: 'warn',
            event: 'telegram_reply_failed',
            command: command.command,
            chatId: command.chatId,
            message: error.message,
          });
        }
        await store.saveLog({
          level: processed.ok ? 'info' : 'error',
          event: processed.ok ? 'telegram_command_processed' : 'telegram_command_failed',
          command: command.command,
          chatId: command.chatId,
        });

        return sendJson(res, 200, {
          ok: true,
          queued: false,
          processed: processed.ok,
          command,
          result: command.agent === 'pair' ? 'pairing_code_sent' : processed.result || null,
          error: processed.error || null,
        });
      }

      return sendJson(res, 404, { ok: false, error: 'Not found' });
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message });
    }
  });
}

function shouldStartProcessorLoop(env, options = {}) {
  if (options.disableProcessorLoop) return false;
  return env.LUA_PROCESSOR_LOOP !== 'false';
}

function startProcessorLoop(options = {}) {
  const env = options.env || process.env;
  const store = options.store || createMemoryStore({ env, fetchImpl: options.fetchImpl });
  const intervalMs = Number(options.intervalMs || env.LUA_PROCESS_INTERVAL_MS || 60_000);
  const limit = Number(options.limit || env.LUA_PROCESS_LIMIT || 10);
  let running = false;

  async function tick() {
    if (running) return;
    running = true;
    try {
      const result = await processQueuedCommands({ store, env, limit });
      const proactive = await runProactiveCheck({
        store,
        env,
        sendTelegram: (chatId, text) => sendTelegramMessage({ chatId }, text, { env, fetchImpl: options.fetchImpl }),
      });
      if (result.processed > 0) {
        console.log(`Lua processor handled ${result.processed} command(s).`);
      }
      if (proactive.sent?.length) console.log(`Lua proactive sent ${proactive.sent.join(', ')}.`);
    } catch (error) {
      console.error(`Lua processor loop failed: ${error.message}`);
    } finally {
      running = false;
    }
  }

  const timer = setInterval(tick, intervalMs);
  if (typeof timer.unref === 'function') timer.unref();
  if (options.startImmediately !== false) tick();
  return {
    stop() {
      clearInterval(timer);
    },
    tick,
  };
}

function start(options = {}) {
  const port = Number(options.port || process.env.PORT || 3000);
  const env = options.env || process.env;
  const store = options.store || createMemoryStore({ env, fetchImpl: options.fetchImpl });
  const server = createServer({ ...options, env, store });
  if (shouldStartProcessorLoop(env, options)) {
    server.processorLoop = startProcessorLoop({ ...options, env, store });
  }
  server.listen(port, () => {
    console.log(`Lua Cloud Main listening on ${port}`);
  });
  return server;
}

module.exports = {
  createServer,
  getBearerToken,
  isAllowedTelegramChat,
  shouldStartProcessorLoop,
  start,
  startProcessorLoop,
};
