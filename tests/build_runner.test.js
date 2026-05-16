const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { runBuildRunner } = require('../scripts/build_runner');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-build-runner-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `# Obsidian Command Center

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| build-001 | build | app | Make a tiny timer app from the Lua template | plan | Forge | routed | [[01_Command Center/Command Runs/build-001-build-app|run]] |
`
  );
  write(
    path.join(root, '01_Command Center', 'Command Runs', 'build-001-build-app.md'),
    `---
type: command-run
status: routed
command_id: build-001
domain: build
intent: app
stage: plan
agent: Forge
role: Eng Manager
last_updated: 2026-05-16
---

# build-001 - build app

## Command

Make a tiny timer app from the Lua template

## Atlas CEO Router Update

### Plan

- [ ] Define first useful output.
- [ ] Identify verification method.
`
  );
  write(
    path.join(root, '08_Artifacts', 'Artifact Ledger.md'),
    `---
type: artifact-ledger
last_updated: 2026-05-16
---

# Artifact Ledger

| Date | Artifact | Type | Project | Location | Status | Owner | Reviewer |
|---|---|---|---|---|---|---|---|
`
  );
  write(
    path.join(root, '01_Command Center', 'Work Ledger.md'),
    `# Work Ledger
`
  );
  return root;
}

function makeTemplate() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-build-runner-template-'));
  write(path.join(root, 'app', 'core', 'lib', 'supa-client.server.ts'), 'createServerClient SUPABASE_URL SUPABASE_ANON_KEY');
  write(path.join(root, 'app', 'core', 'lib', 'supa-admin-client.server.ts'), 'SUPABASE_SERVICE_ROLE_KEY');
  write(path.join(root, 'app', 'core', 'db', 'drizzle-client.server.ts'), 'drizzle DATABASE_URL');
  write(path.join(root, 'app', 'core', 'lib', 'guards.server.ts'), 'requireAuthentication');
  write(path.join(root, 'app', 'features', 'auth', 'screens', 'login.tsx'), 'signInWithPassword');
  write(path.join(root, 'app', 'features', 'auth', 'screens', 'join.tsx'), 'signUp');
  write(path.join(root, 'app', 'features', 'users', 'schema.ts'), 'pgTable profiles pgPolicy authUsers');
  write(path.join(root, 'sql', 'migrations', '0000.sql'), 'ENABLE ROW LEVEL SECURITY CREATE POLICY profiles');
  write(path.join(root, 'e2e', 'auth', 'login.spec.ts'), 'loginUser');
  return root;
}

test('build runner turns a planned build command into a done artifact', () => {
  const root = makeVault();
  const templateRoot = makeTemplate();

  const result = runBuildRunner({
    root,
    templateRoot,
    apply: true,
    commandId: 'build-001',
    verification: ['node scripts/check.js'],
  });

  assert.equal(result.processed.length, 1);
  assert.equal(result.processed[0].id, 'build-001');
  assert.equal(result.processed[0].stageAfter, 'brief');
  assert.equal(result.processed[0].statusAfter, 'done');
  assert.equal(
    result.processed[0].artifact,
    '08_Artifacts/Build Outputs/build-001-build-app-output'
  );

  const commandCenter = fs.readFileSync(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    'utf8'
  );
  assert.match(
    commandCenter,
    /\| build-001 \| build \| app \| Make a tiny timer app from the Lua template \| brief \| Forge \| done \| \[\[08_Artifacts\/Build Outputs\/build-001-build-app-output\|artifact\]\] \|/
  );

  const runNote = fs.readFileSync(
    path.join(root, '01_Command Center', 'Command Runs', 'build-001-build-app.md'),
    'utf8'
  );
  assert.match(runNote, /status: done/);
  assert.match(runNote, /stage: brief/);
  assert.match(runNote, /## Build Runner Output/);
  assert.match(runNote, /\[\[08_Artifacts\/Build Outputs\/build-001-build-app-output\|Build Output\]\]/);

  const artifact = fs.readFileSync(
    path.join(root, '08_Artifacts', 'Build Outputs', 'build-001-build-app-output.md'),
    'utf8'
  );
  assert.match(artifact, /type: build-output/);
  assert.match(artifact, /Make a tiny timer app from the Lua template/);
  assert.match(artifact, /node scripts\/check.js/);
  assert.match(artifact, /## Lua_template Capability Map/);
  assert.match(artifact, /Supabase auth/);
  assert.match(artifact, /Drizzle/);
  assert.match(artifact, /profiles/);

  const artifactLedger = fs.readFileSync(
    path.join(root, '08_Artifacts', 'Artifact Ledger.md'),
    'utf8'
  );
  assert.match(artifactLedger, /build-001-build-app-output/);

  const workLedger = fs.readFileSync(
    path.join(root, '01_Command Center', 'Work Ledger.md'),
    'utf8'
  );
  assert.match(workLedger, /build-001/);
  assert.match(workLedger, /Build Runner/);
});
