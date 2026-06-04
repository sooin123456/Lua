const http = require('node:http');

const { normalizeTelegramUpdate } = require('./command');
const { processCommand, processQueuedCommands } = require('./processor');
const { createMemoryStore } = require('./store');

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
        });
      }

      if (req.method === 'POST' && url.pathname === '/webhooks/telegram') {
        if (!isAuthorizedTelegramRequest(req, env)) {
          return sendJson(res, 401, { ok: false, error: 'Unauthorized webhook secret' });
        }

        const update = await readJson(req);
        const command = normalizeTelegramUpdate(update);
        if (!command) {
          await store.saveLog({ level: 'info', event: 'telegram_update_ignored' });
          return sendJson(res, 200, { ok: true, queued: false });
        }

        await store.saveCommand(command);
        if (command.agent === 'remember') {
          await store.saveMemory(command);
        }

        const processed = await processCommand(command, { store, env });
        const reply = processed.ok
          ? processed.result
          : `Lua could not process ${command.command}: ${processed.error}`;
        try {
          await sendTelegramMessage(command, reply, { env, fetchImpl: options.fetchImpl });
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
          result: processed.result || null,
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
      if (result.processed > 0) {
        console.log(`Lua processor handled ${result.processed} command(s).`);
      }
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
  shouldStartProcessorLoop,
  start,
  startProcessorLoop,
};
