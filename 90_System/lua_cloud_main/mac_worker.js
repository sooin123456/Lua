#!/usr/bin/env node
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { loadDotEnv } = require('./setup');

const DEFAULT_WORKER_URL = 'https://lua-production-6d18.up.railway.app';
const DEFAULT_ENV_FILE = '.env.worker';
const MAX_OUTPUT = 2_000_000;
const RECORD_RELATIVE_PATH = path.join('00_Lua', '03_Records', 'Lua Assistant Records.md');

function safeText(value) {
  return String(value || '')
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, '[REDACTED_ANTHROPIC_KEY]')
    .replace(/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/g, '[REDACTED_OPENAI_KEY]')
    .replace(/lua_worker_[A-Za-z0-9_-]+/g, '[REDACTED_WORKER_TOKEN]')
    .replace(/\d{8,12}:[A-Za-z0-9_-]{20,}/g, '[REDACTED_TELEGRAM_TOKEN]')
    .trim();
}

function spawnCapture(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, Number(options.timeoutMs) || 30 * 60_000);
    if (typeof timeout.unref === 'function') timeout.unref();
    child.stdout.on('data', (chunk) => {
      if (stdout.length < MAX_OUTPUT) stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      if (stderr.length < MAX_OUTPUT) stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timeout);
      resolve({ ok: false, code: null, stdout, stderr: `${stderr}\n${error.message}`, timedOut });
    });
    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({ ok: code === 0 && !timedOut, code, stdout, stderr, timedOut });
    });
  });
}

async function detectAgentAvailability(options = {}) {
  const run = options.spawnCapture || spawnCapture;
  const claudePath = options.claudePath || process.env.LUA_CLAUDE_BIN || '/opt/homebrew/bin/claude';
  const codexPath = options.codexPath || process.env.LUA_CODEX_BIN || '/Applications/ChatGPT.app/Contents/Resources/codex';
  const [claude, codex] = await Promise.all([
    run(claudePath, ['auth', 'status'], { timeoutMs: 15_000 }),
    run(codexPath, ['login', 'status'], { timeoutMs: 15_000 }),
  ]);
  let claudeLoggedIn = false;
  try {
    claudeLoggedIn = JSON.parse(claude.stdout || claude.stderr || '{}').loggedIn === true;
  } catch {
    claudeLoggedIn = /logged.?in/i.test(`${claude.stdout}\n${claude.stderr}`) && claude.ok;
  }
  const codexLoggedIn = /Logged in using ChatGPT/i.test(`${codex.stdout}\n${codex.stderr}`) && codex.ok;
  return {
    agents: [claudeLoggedIn ? 'claude' : '', codexLoggedIn ? 'codex' : ''].filter(Boolean),
    claude: { installed: !/ENOENT/.test(claude.stderr), loggedIn: claudeLoggedIn },
    codex: { installed: !/ENOENT/.test(codex.stderr), loggedIn: codexLoggedIn },
  };
}

function buildAgentPrompt(task) {
  const base = [
    `Lua task #${task.id}`,
    `Source command: ${task.command || ''}`,
    `Requested work: ${task.payload || task.text || ''}`,
    '',
    'Follow the repository AGENTS.md and CLAUDE.md instructions.',
    'Never reveal credentials or authentication data.',
    'Do not send messages, publish, push, deploy, purchase, delete, or change accounts.',
    'If an external or destructive action is needed, prepare the safe local work and report the required approval.',
    'Return a concise Korean summary with outcome, verification, changed files, and next action.',
  ];
  if (task.routeAgent === 'claude') {
    base.push('This is a thinking and writing task. Work read-only and do not edit files.');
  } else {
    base.push('This is an implementation task already approved in Telegram. You may edit only within this workspace and must run relevant tests.');
  }
  return base.join('\n');
}

async function runClaudeTask(task, options = {}) {
  const run = options.spawnCapture || spawnCapture;
  const binary = options.claudePath || process.env.LUA_CLAUDE_BIN || '/opt/homebrew/bin/claude';
  const result = await run(binary, [
    '-p',
    '--output-format', 'text',
    '--permission-mode', 'plan',
    '--no-session-persistence',
    '--max-turns', '3',
    buildAgentPrompt(task),
  ], { cwd: options.rootDir || process.cwd(), timeoutMs: options.timeoutMs });
  if (!result.ok) throw new Error(safeText(result.stderr || `Claude exited with ${result.code}`));
  return safeText(result.stdout);
}

async function runCodexTask(task, options = {}) {
  const run = options.spawnCapture || spawnCapture;
  const binary = options.codexPath || process.env.LUA_CODEX_BIN || '/Applications/ChatGPT.app/Contents/Resources/codex';
  const rootDir = options.rootDir || process.cwd();
  const outputFile = path.join(os.tmpdir(), `lua-codex-${task.id}-${Date.now()}.txt`);
  const result = await run(binary, [
    'exec',
    '--sandbox', 'workspace-write',
    '--color', 'never',
    '--ephemeral',
    '--cd', rootDir,
    '--output-last-message', outputFile,
    buildAgentPrompt(task),
  ], { cwd: rootDir, timeoutMs: options.timeoutMs });
  let finalMessage = '';
  try {
    finalMessage = await fsp.readFile(outputFile, 'utf8');
    await fsp.unlink(outputFile);
  } catch {
    finalMessage = result.stdout;
  }
  if (!result.ok) throw new Error(safeText(result.stderr || finalMessage || `Codex exited with ${result.code}`));
  return safeText(finalMessage || result.stdout);
}

async function workerRequest(pathname, options = {}) {
  const env = options.env || process.env;
  const baseUrl = String(options.baseUrl || env.LUA_WORKER_URL || DEFAULT_WORKER_URL).replace(/\/$/, '');
  const response = await (options.fetchImpl || fetch)(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify(options.body || {}),
  });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
  if (!response.ok || body.ok === false) throw new Error(body.error || response.statusText || `Worker request failed: ${response.status}`);
  return body;
}

function writeWorkerEnv(filePath, values) {
  const content = [
    '# Generated by Lua Mac Worker pairing. Never commit this file.',
    `LUA_WORKER_URL=${values.url}`,
    `LUA_WORKER_TOKEN=${values.token}`,
    `LUA_WORKER_ID=${values.workerId}`,
    '',
  ].join('\n');
  fs.writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o600 });
}

function formatObsidianRecord(record) {
  const title = record.agent === 'remember' ? 'Remembered item' : `Task #${record.id} result`;
  const request = safeText(record.payload || record.text || '');
  const result = safeText(record.agent === 'remember' ? record.payload : record.result || '');
  return [
    `## ${new Date().toISOString().slice(0, 10)} - ${title}`,
    '',
    `- Command: ${safeText(record.command || '/lua')}`,
    `- Agent: ${safeText(record.routeAgent || record.agent || 'lua')}`,
    `- Request: ${request.slice(0, 2_000)}`,
    `- Result: ${result.slice(0, 6_000)}`,
    `- Source task: ${record.id || 'local'}`,
    '',
  ].join('\n');
}

async function appendObsidianRecord(record, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const recordPath = path.join(rootDir, RECORD_RELATIVE_PATH);
  await fsp.mkdir(path.dirname(recordPath), { recursive: true });
  if (!fs.existsSync(recordPath)) {
    await fsp.writeFile(recordPath, '# Lua Assistant Records\n\nAutomatically captured completed Lua tasks and explicit memories.\n\n', 'utf8');
  }
  await fsp.appendFile(recordPath, formatObsidianRecord(record), 'utf8');
  return recordPath;
}

async function runRecordOnce(options = {}) {
  const env = options.env || process.env;
  if (!env.LUA_WORKER_TOKEN) return { ok: false, reason: 'worker_not_paired' };
  const workerId = env.LUA_WORKER_ID || os.hostname();
  const claim = await workerRequest('/worker/records/claim', {
    env,
    fetchImpl: options.fetchImpl,
    token: env.LUA_WORKER_TOKEN,
    body: { workerId },
  });
  if (!claim.record) return { ok: true, recorded: false };
  let outcome;
  try {
    const recordPath = await appendObsidianRecord(claim.record, options);
    outcome = { ok: true, recordPath };
  } catch (error) {
    outcome = { ok: false, error: safeText(error.message) };
  }
  await workerRequest(`/worker/records/${claim.record.id}/complete`, {
    env,
    fetchImpl: options.fetchImpl,
    token: env.LUA_WORKER_TOKEN,
    body: { ok: outcome.ok },
  });
  return { ok: outcome.ok, recorded: true, recordId: claim.record.id, recordPath: outcome.recordPath, error: outcome.error };
}

async function pairWorker(code, options = {}) {
  if (!code) throw new Error('Pairing code is required. Send /lua pair to Telegram first.');
  const workerId = options.workerId || os.hostname();
  const url = String(options.baseUrl || DEFAULT_WORKER_URL).replace(/\/$/, '');
  const paired = await workerRequest('/worker/pair', {
    baseUrl: url,
    fetchImpl: options.fetchImpl,
    body: { code: String(code).trim(), workerId },
  });
  writeWorkerEnv(options.envFile || path.resolve(process.cwd(), DEFAULT_ENV_FILE), {
    url,
    token: paired.token,
    workerId,
  });
  return { ok: true, workerId, envFile: options.envFile || DEFAULT_ENV_FILE };
}

async function runWorkerOnce(options = {}) {
  const env = options.env || process.env;
  if (!env.LUA_WORKER_TOKEN) return { ok: false, reason: 'worker_not_paired' };
  const recordResult = await runRecordOnce({ ...options, env });
  const availability = options.availability || await detectAgentAvailability(options);
  if (!availability.agents.length) return { ok: false, reason: 'no_subscription_agent_logged_in', availability };
  const workerId = env.LUA_WORKER_ID || os.hostname();
  const claim = await workerRequest('/worker/tasks/claim', {
    env,
    fetchImpl: options.fetchImpl,
    token: env.LUA_WORKER_TOKEN,
    body: { workerId, agents: availability.agents },
  });
  if (!claim.task) return { ok: recordResult.ok, processed: false, recorded: recordResult.recorded, availability };
  const task = claim.task;
  let outcome;
  try {
    const result = task.routeAgent === 'claude'
      ? await runClaudeTask(task, options)
      : await runCodexTask(task, options);
    outcome = { ok: true, result };
  } catch (error) {
    outcome = { ok: false, error: safeText(error.message) };
  }
  await workerRequest(`/worker/tasks/${task.id}/result`, {
    env,
    fetchImpl: options.fetchImpl,
    token: env.LUA_WORKER_TOKEN,
    body: outcome,
  });
  return { ok: outcome.ok, processed: true, recorded: recordResult.recorded, taskId: task.id, agent: task.routeAgent, error: outcome.error };
}

function parseArgs(argv) {
  return { command: argv[0] || 'once', value: argv[1] || '', envFile: DEFAULT_ENV_FILE };
}

async function main(options = {}) {
  const args = parseArgs(options.argv || process.argv.slice(2));
  const env = options.env || process.env;
  loadDotEnv(args.envFile, env);
  if (args.command === 'pair') return pairWorker(args.value, { ...options, env });
  if (args.command === 'check') return { ok: true, ...(await detectAgentAvailability(options)), paired: Boolean(env.LUA_WORKER_TOKEN) };
  if (args.command === 'once') return runWorkerOnce({ ...options, env });
  if (args.command === 'watch') {
    const intervalMs = Math.max(Number(env.LUA_WORKER_INTERVAL_MS) || 15_000, 5_000);
    const tick = async () => {
      const result = await runWorkerOnce({ ...options, env });
      if (result.processed || !result.ok) console.log(JSON.stringify(result));
    };
    await tick();
    setInterval(() => tick().catch((error) => console.error(safeText(error.message))), intervalMs);
    return { ok: true, watching: true };
  }
  throw new Error(`Unknown worker command: ${args.command}`);
}

if (require.main === module) {
  main()
    .then((result) => {
      if (result && !result.watching) console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(safeText(error.message));
      process.exit(1);
    });
}

module.exports = {
  buildAgentPrompt,
  appendObsidianRecord,
  detectAgentAvailability,
  pairWorker,
  parseArgs,
  runClaudeTask,
  runCodexTask,
  runRecordOnce,
  runWorkerOnce,
  safeText,
  spawnCapture,
  workerRequest,
  writeWorkerEnv,
};
