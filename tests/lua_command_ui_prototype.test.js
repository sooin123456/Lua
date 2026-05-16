const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const PROTOTYPE_DIR = path.join(ROOT, '08_Artifacts', 'Lua Command UI Prototype');

test('prototype files exist and include the required UI regions', () => {
  const html = fs.readFileSync(path.join(PROTOTYPE_DIR, 'index.html'), 'utf8');

  assert.match(html, /id="domain-options"/);
  assert.match(html, /id="intent-options"/);
  assert.match(html, /id="payload-input"/);
  assert.match(html, /id="command-preview"/);
  assert.match(html, /id="draft-row"/);
  assert.match(html, /id="run-button"/);
  assert.match(html, /id="connection-status"/);
});

test('command builder maps domain and intent into preview and draft row', () => {
  const { buildCommand, buildDraftRow, canWriteToQueue, routeFor, submitCommand } = require('../08_Artifacts/Lua Command UI Prototype/app');

  const command = buildCommand({
    domain: 'design',
    intent: 'screen',
    payload: '토스 미니앱처럼 명령 UI 첫 화면을 설계해줘',
  });

  assert.equal(command, '/lua design screen :: 토스 미니앱처럼 명령 UI 첫 화면을 설계해줘');
  assert.deepEqual(routeFor('design'), {
    agent: 'Scribe+Forge',
    stage: 'clarify',
    output: 'Screen or service flow draft',
  });
  assert.match(
    buildDraftRow({ id: 'draft-001', domain: 'design', intent: 'screen', payload: '테스트' }),
    /\| draft-001 \| design \| screen \| 테스트 \| clarify \| Scribe\+Forge \| queued \| from Lua Command UI \|/
  );
  assert.equal(canWriteToQueue({ protocol: 'file:', hostname: '' }), false);
  assert.equal(canWriteToQueue({ protocol: 'http:', hostname: '127.0.0.1' }), true);
});

test('command submitter can run through the localhost end-to-end endpoint', async () => {
  const { submitCommand } = require('../08_Artifacts/Lua Command UI Prototype/app');
  const requests = [];

  const result = await submitCommand(
    { domain: 'build', intent: 'app', payload: 'Lua_template 기반 앱 실행' },
    async (url, options) => {
      requests.push({ url, options });
      return {
        ok: true,
        json: async () => ({
          id: 'lua-ui-20260516-134530',
          status: 'routed',
          stage: 'plan',
          run: '01_Command Center/Command Runs/lua-ui-20260516-134530-build-app',
        }),
      };
    },
    { protocol: 'http:', hostname: '127.0.0.1' },
    { run: true }
  );

  assert.equal(requests[0].url, '/api/commands/run');
  assert.equal(JSON.parse(requests[0].options.body).domain, 'build');
  assert.deepEqual(result, {
    mode: 'run',
    ok: true,
    id: 'lua-ui-20260516-134530',
    status: 'routed',
    stage: 'plan',
    run: '01_Command Center/Command Runs/lua-ui-20260516-134530-build-app',
  });
});
