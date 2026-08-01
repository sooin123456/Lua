const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  DEFAULT_IGNORE_FILTERS,
  planSync,
  syncObsidianVault,
} = require('../scripts/sync_obsidian_vault');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeFixture() {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-sync-source-'));
  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-sync-target-'));

  write(path.join(source, '00_Lua/README.md'), '# Lua\n');
  write(path.join(source, '00_Lua/01_Commands/Command Inbox.md'), '# Inbox\n');
  write(path.join(source, '90_System/scripts/check.js'), 'console.log("check");\n');
  write(path.join(source, '90_System/99_Previous_Obsidian_Root_20260101/old.md'), 'old\n');
  write(path.join(source, 'AGENTS.md'), '# Agents\n');
  write(path.join(source, 'README.md'), '# Readme\n');
  write(path.join(source, '.env'), 'SECRET=must-not-copy\n');
  write(path.join(source, '00_Lua/.env'), 'SECRET=must-not-copy\n');
  write(path.join(source, 'node_modules/example/index.js'), 'bad\n');
  write(path.join(source, '.obsidian/app.json'), '{"bad":true}\n');

  write(
    path.join(target, '.obsidian/app.json'),
    JSON.stringify({ userIgnoreFilters: ['Existing.md'] }, null, 2),
  );
  write(path.join(target, 'User Note.md'), '# keep me\n');

  return { source, target };
}

test('plans safe Lua and system files without dangerous paths', () => {
  const { source, target } = makeFixture();

  const plan = planSync({ sourceRoot: source, targetRoot: target });
  const dests = plan.copyFiles.map((item) => item.relativePath);

  assert.ok(dests.includes('00_Lua/README.md'));
  assert.ok(dests.includes('00_Lua/01_Commands/Command Inbox.md'));
  assert.ok(dests.includes('90_System/scripts/check.js'));
  assert.ok(dests.includes('AGENTS.md'));
  assert.ok(!dests.includes('.env'));
  assert.ok(!dests.includes('00_Lua/.env'));
  assert.ok(!dests.includes('node_modules/example/index.js'));
  assert.ok(!dests.includes('.obsidian/app.json'));
  assert.ok(!dests.includes('90_System/99_Previous_Obsidian_Root_20260101/old.md'));
});

test('dry-run reports planned work without writing to the target vault', () => {
  const { source, target } = makeFixture();

  const result = syncObsidianVault({
    sourceRoot: source,
    targetRoot: target,
    apply: false,
  });

  assert.equal(result.mode, 'dry-run');
  assert.ok(result.copyFiles.length > 0);
  assert.equal(fs.existsSync(path.join(target, '00_Lua/README.md')), false);
  assert.equal(fs.readFileSync(path.join(target, 'User Note.md'), 'utf8'), '# keep me\n');
});

test('apply copies safe files and preserves user files', () => {
  const { source, target } = makeFixture();

  const result = syncObsidianVault({
    sourceRoot: source,
    targetRoot: target,
    apply: true,
  });

  assert.equal(result.mode, 'apply');
  assert.equal(fs.readFileSync(path.join(target, '00_Lua/README.md'), 'utf8'), '# Lua\n');
  assert.equal(fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8'), '# Agents\n');
  assert.equal(fs.readFileSync(path.join(target, 'User Note.md'), 'utf8'), '# keep me\n');
  assert.equal(fs.existsSync(path.join(target, '.env')), false);
  assert.equal(fs.existsSync(path.join(target, '00_Lua/.env')), false);
});

test('apply merges Obsidian ignore filters without removing existing filters', () => {
  const { source, target } = makeFixture();

  syncObsidianVault({
    sourceRoot: source,
    targetRoot: target,
    apply: true,
  });

  const appJson = JSON.parse(fs.readFileSync(path.join(target, '.obsidian/app.json'), 'utf8'));

  assert.ok(appJson.userIgnoreFilters.includes('Existing.md'));
  for (const filter of DEFAULT_IGNORE_FILTERS) {
    assert.ok(appJson.userIgnoreFilters.includes(filter), `missing ${filter}`);
  }
});
