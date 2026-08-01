#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const { loadDotEnv } = require('./setup');

const HANDOFF_DIR = '90_System/80_Lua_Details/Command Runs';

function requireSupabaseEnv(env) {
  if (!env.SUPABASE_URL) throw new Error('SUPABASE_URL is required.');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required.');
}

async function getLatestTodo(options = {}) {
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || fetch;
  requireSupabaseEnv(env);

  const baseUrl = env.SUPABASE_URL.replace(/\/$/, '');
  const query = [
    'select=id,agent,command,payload,status,result,createdAt,processedAt',
    'or=(agent.eq.todo,routeAgent.eq.codex)',
    'status=in.(done,awaiting_agent)',
    'order=id.desc',
    'limit=1',
  ].join('&');
  const response = await fetchImpl(`${baseUrl}/rest/v1/lua_commands?${query}`, {
    method: 'GET',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) {
    const text = typeof response.text === 'function' ? await response.text() : response.statusText;
    throw new Error(`Could not read latest todo: ${text || response.statusText}`);
  }

  const text = typeof response.text === 'function' ? await response.text() : '';
  const data = text ? JSON.parse(text) : await response.json();
  return Array.isArray(data) && data[0] ? data[0] : null;
}

function escapeMarkdown(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

function buildHandoffMarkdown({ todo, now = new Date() }) {
  const todoId = todo.id || todo.updateId || 'unknown';
  const payload = escapeMarkdown(todo.payload || todo.text || '');
  const createdAt = escapeMarkdown(todo.createdAt || '');
  const processedAt = escapeMarkdown(todo.processedAt || '');
  const result = escapeMarkdown(todo.result || '');
  const today = now.toISOString().slice(0, 10);

  return `---
type: codex-handoff
status: planned
source: telegram
command_id: ${todoId}
agent: Codex
last_updated: ${today}
---

# Telegram Todo ${todoId} Codex Handoff

## Source Command

- Source: Telegram -> Lua Cloud Main -> Supabase
- Command ID: ${todoId}
- Command: ${escapeMarkdown(todo.command || '/lua todo')}
- Status: ${escapeMarkdown(todo.status || 'unknown')}
- Created: ${createdAt || 'unknown'}
- Processed: ${processedAt || 'not recorded'}

## Original Todo

${payload || '(empty todo payload)'}

## Codex Action

Tell Codex: \`telegram-todo-${todoId}-codex-handoff 처리해줘\`

Codex should load this handoff, inspect the relevant repo or vault context, implement the smallest useful next step, verify it, and append the result to the Work Ledger.

## Latest Lua Result

${result || '(no result recorded)'}

## Verification Checklist

- [ ] Load the smallest useful context for this todo.
- [ ] Make the smallest useful repo or vault change.
- [ ] Run the relevant test or check command.
- [ ] Append the outcome to \`00_Lua/03_Records/Work Ledger.md\`.
- [ ] Sync to the actual Obsidian vault when vault docs changed.
`;
}

function createCodexHandoff(options = {}) {
  const todo = options.todo;
  if (!todo) {
    return {
      ok: false,
      created: false,
      reason: 'no_todo_found',
    };
  }

  const rootDir = options.rootDir || process.cwd();
  const todoId = todo.id || todo.updateId;
  if (!todoId) throw new Error('Todo id is required for Codex handoff.');

  const fileRel = `${HANDOFF_DIR}/telegram-todo-${todoId}-codex-handoff.md`;
  const filePath = path.join(rootDir, fileRel);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (fs.existsSync(filePath) && !options.force) {
    return {
      ok: true,
      created: false,
      todoId,
      fileRel,
      filePath,
      payload: todo.payload || '',
    };
  }

  fs.writeFileSync(filePath, buildHandoffMarkdown({ todo, now: options.now }), 'utf8');
  return {
    ok: true,
    created: true,
    todoId,
    fileRel,
    filePath,
    payload: todo.payload || '',
  };
}

function parseArgs(argv) {
  const args = { envFile: '.env', force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--env-file') {
      args.envFile = argv[index + 1] || '.env';
      index += 1;
    } else if (arg === '--force') {
      args.force = true;
    }
  }
  return args;
}

async function runCodexHandoff(options = {}) {
  const argv = options.argv || process.argv.slice(2);
  const env = options.env || process.env;
  const args = parseArgs(argv);
  if (options.loadEnv !== false) loadDotEnv(args.envFile, env);

  const todo = await getLatestTodo({
    env,
    fetchImpl: options.fetchImpl || fetch,
  });
  return createCodexHandoff({
    todo,
    rootDir: options.rootDir || process.cwd(),
    force: args.force,
    now: options.now,
  });
}

if (require.main === module) {
  runCodexHandoff()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = {
  buildHandoffMarkdown,
  createCodexHandoff,
  getLatestTodo,
  parseArgs,
  runCodexHandoff,
};
