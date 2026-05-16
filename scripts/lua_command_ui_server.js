#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const { runAtlasRouter } = require('./atlas_router');
const { runBuildRunner } = require('./build_runner');
const { runCommandQueue } = require('./process_command_queue');

const ROOT = path.resolve(__dirname, '..');
const COMMAND_CENTER_REL = path.join('01_Command Center', 'Obsidian Command Center.md');
const PROTOTYPE_DIR = path.join(ROOT, '08_Artifacts', 'Lua Command UI Prototype');
const DEFAULT_PORT = 8765;

const DOMAINS = {
  planning: { owner: 'Atlas', intents: ['prioritize', 'validate', 'decide'] },
  design: { owner: 'Scribe+Forge', intents: ['screen', 'flow', 'prototype'] },
  build: { owner: 'Forge', intents: ['app', 'automation', 'script'] },
  research: { owner: 'Lens', intents: ['brief', 'compare', 'source-check'] },
  marketing: { owner: 'Scribe', intents: ['brief', 'message', 'campaign'] },
  ops: { owner: 'Vault', intents: ['cleanup', 'audit', 'sync'] },
};

function parseArgs(argv) {
  const portIndex = argv.indexOf('--port');
  return {
    port: portIndex >= 0 ? Number(argv[portIndex + 1]) : DEFAULT_PORT,
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function usage() {
  console.log(`Usage:
  node scripts/lua_command_ui_server.js
  node scripts/lua_command_ui_server.js --port 8765
`);
}

function kstParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function createCommandId(now = new Date()) {
  const parts = kstParts(now);
  return `lua-ui-${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

function sanitizePayload(payload) {
  return String(payload || '').replace(/\s+/g, ' ').trim();
}

function escapeCell(value) {
  return String(value || '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function validateCommand(command) {
  const domain = String(command?.domain || '').trim();
  const intent = String(command?.intent || '').trim();
  const payload = sanitizePayload(command?.payload);

  if (!DOMAINS[domain]) throw new Error(`Unsupported domain: ${domain}`);
  if (!DOMAINS[domain].intents.includes(intent)) throw new Error(`Unsupported intent: ${intent}`);
  if (!payload) throw new Error('Missing payload');

  return { domain, intent, payload };
}

function commandCenterInsertionIndex(lines) {
  const headerIndex = lines.findIndex((line) => line.trim().startsWith('| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |'));
  if (headerIndex < 0) return lines.length;
  let index = headerIndex + 1;
  while (index < lines.length && lines[index].trim().startsWith('|')) index += 1;
  return index;
}

function appendCommandFromUi(options = {}) {
  const root = options.root || ROOT;
  const now = options.now || new Date();
  const command = validateCommand(options.command || {});
  const id = options.id || createCommandId(now);
  const owner = DOMAINS[command.domain].owner;
  const row = `| ${id} | ${escapeCell(command.domain)} | ${escapeCell(command.intent)} | ${escapeCell(command.payload)} | clarify | ${escapeCell(owner)} | queued | from Lua Command UI |`;
  const commandCenterPath = path.join(root, COMMAND_CENTER_REL);
  const lines = fs.readFileSync(commandCenterPath, 'utf8').split(/\r?\n/);
  lines.splice(commandCenterInsertionIndex(lines), 0, row);
  fs.writeFileSync(commandCenterPath, lines.join('\n'), 'utf8');
  return { id, owner, row };
}

function runCommandFromUi(options = {}) {
  const root = options.root || ROOT;
  const queued = appendCommandFromUi({
    root,
    now: options.now,
    id: options.id,
    command: options.command,
  });
  const queuedResult = runCommandQueue({ root, apply: true, commandId: queued.id });
  if (queuedResult.processed.length !== 1) {
    throw new Error(`Failed to process queued command: ${queued.id}`);
  }

  const routedResult = runAtlasRouter({
    root,
    apply: true,
    firstOnly: true,
    commandId: queued.id,
  });
  const routed = routedResult.processed[0];
  if (!routed) throw new Error(`Failed to route command: ${queued.id}`);

  const result = {
    id: queued.id,
    owner: queued.owner,
    status: 'routed',
    stage: routed.stageAfter,
    run: routed.run,
    row: queued.row,
  };

  if (!options.build) return result;

  const builtResult = runBuildRunner({
    root,
    apply: true,
    commandId: queued.id,
    verification: options.verification || ['node scripts/check.js'],
  });
  const built = builtResult.processed[0];
  if (!built) throw new Error(`Failed to build command: ${queued.id}`);
  return {
    ...result,
    status: built.statusAfter,
    stage: built.stageAfter,
    artifact: built.artifact,
  };
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://localhost',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error('Request too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function createServer(options = {}) {
  const root = options.root || ROOT;
  const artifactDir = options.artifactDir || PROTOTYPE_DIR;

  return http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, 'http://localhost');

      if (req.method === 'GET' && requestUrl.pathname === '/health') {
        return sendJson(res, 200, { ok: true });
      }

      if (req.method === 'POST' && requestUrl.pathname === '/api/commands') {
        const body = await readBody(req);
        const parsed = body ? JSON.parse(body) : {};
        const result = appendCommandFromUi({ root, command: parsed });
        return sendJson(res, 201, result);
      }

      if (req.method === 'POST' && requestUrl.pathname === '/api/commands/run') {
        const body = await readBody(req);
        const parsed = body ? JSON.parse(body) : {};
        const result = runCommandFromUi({ root, command: parsed });
        return sendJson(res, 201, result);
      }

      if (req.method === 'POST' && requestUrl.pathname === '/api/commands/build') {
        const body = await readBody(req);
        const parsed = body ? JSON.parse(body) : {};
        const result = runCommandFromUi({
          root,
          command: parsed.command || parsed,
          build: true,
          verification: parsed.verification,
        });
        return sendJson(res, 201, result);
      }

      if (req.method !== 'GET') {
        return sendJson(res, 405, { error: 'Method not allowed' });
      }

      const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
      const target = path.resolve(artifactDir, `.${decodeURIComponent(pathname)}`);
      if (!target.startsWith(path.resolve(artifactDir))) {
        return sendJson(res, 403, { error: 'Forbidden' });
      }
      if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
        return sendJson(res, 404, { error: 'Not found' });
      }

      res.writeHead(200, { 'Content-Type': contentType(target) });
      return fs.createReadStream(target).pipe(res);
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  const server = createServer();
  server.listen(args.port, '127.0.0.1', () => {
    console.log(`Lua Command UI: http://127.0.0.1:${args.port}`);
  });
}

if (require.main === module) main();

module.exports = {
  appendCommandFromUi,
  createCommandId,
  createServer,
  runCommandFromUi,
  validateCommand,
};
