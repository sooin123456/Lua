const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { appendCommandFromUi, createCommandId, validateCommand } = require('../scripts/lua_command_ui_server');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-command-ui-server-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `# Obsidian Command Center

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| example-001 | research | compare | sample | clarify | Lens | planned | [[01_Command Center/Command Runs/example-001-research-compare|run]] |
`
  );
  return root;
}

test('validates command input from Lua Command UI', () => {
  assert.throws(
    () => validateCommand({ domain: 'bad', intent: 'screen', payload: 'x' }),
    /Unsupported domain/
  );
  assert.throws(
    () => validateCommand({ domain: 'design', intent: 'bad', payload: 'x' }),
    /Unsupported intent/
  );
  assert.throws(
    () => validateCommand({ domain: 'design', intent: 'screen', payload: ' ' }),
    /Missing payload/
  );
});

test('creates stable lua-ui command IDs', () => {
  assert.equal(
    createCommandId(new Date('2026-05-16T04:45:30.000Z')),
    'lua-ui-20260516-134530'
  );
});

test('appends a queued command row from Lua Command UI', () => {
  const root = makeVault();

  const result = appendCommandFromUi({
    root,
    now: new Date('2026-05-16T04:45:30.000Z'),
    command: {
      domain: 'design',
      intent: 'screen',
      payload: '명령 UI 첫 화면을 설계해줘',
    },
  });

  assert.equal(result.id, 'lua-ui-20260516-134530');
  assert.equal(result.owner, 'Scribe+Forge');

  const commandCenter = fs.readFileSync(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    'utf8'
  );
  assert.match(
    commandCenter,
    /\| lua-ui-20260516-134530 \| design \| screen \| 명령 UI 첫 화면을 설계해줘 \| clarify \| Scribe\+Forge \| queued \| from Lua Command UI \|/
  );
});
