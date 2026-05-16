const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { runAtlasRouter } = require('../scripts/atlas_router');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-atlas-router-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `# Obsidian Command Center

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| example-001 | research | compare | 테크인과 경쟁사 비교 | clarify | Lens | planned | [[01_Command Center/Command Runs/example-001-research-compare|run]] |
| cmd-20260516-024544 | planning | prioritize | 이번 주 Lua 구축 우선순위 정리 | clarify | Atlas | planned | [[01_Command Center/Command Runs/cmd-20260516-024544-planning-prioritize|run]] |
| inbox-20260516-031554-01 | build | app | Neural UI 사업 아이디어 | clarify | Forge | planned | [[01_Command Center/Command Runs/inbox-20260516-031554-01-build-app|run]] |
`
  );
  write(
    path.join(root, '01_Command Center', 'Command Runs', 'cmd-20260516-024544-planning-prioritize.md'),
    `---
type: command-run
status: planned
command_id: cmd-20260516-024544
domain: planning
intent: prioritize
stage: clarify
agent: Atlas
role: CEO
last_updated: 2026-05-16
---

# cmd-20260516-024544 - planning prioritize

## Command

이번 주 Lua 구축 우선순위 정리
`
  );
  write(
    path.join(root, '01_Command Center', 'User Action Board.md'),
    `---
type: action-board
status: active
last_updated: 2026-05-16
---

# User Action Board

## Current Tasks For User

| 우선순위 | 해야 할 말 | Codex가 하는 일 |
|---|---|---|
| 1 | 첫 번째부터 진행해줘 | Atlas CEO 방식으로 처리 |

## Reference Section

이 섹션은 Atlas Router가 보존해야 한다.
`
  );
  return root;
}

test('routes the first real planned command run through Atlas CEO notes', () => {
  const root = makeVault();

  const result = runAtlasRouter({ root, apply: true, firstOnly: true });

  assert.equal(result.processed.length, 1);
  assert.equal(result.processed[0].id, 'cmd-20260516-024544');
  assert.equal(result.processed[0].agent, 'Atlas');
  assert.equal(result.processed[0].stageAfter, 'plan');

  const commandCenter = fs.readFileSync(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    'utf8'
  );
  assert.match(
    commandCenter,
    /\| cmd-20260516-024544 \| planning \| prioritize \| 이번 주 Lua 구축 우선순위 정리 \| plan \| Atlas \| routed \|/
  );

  const runNote = fs.readFileSync(
    path.join(root, '01_Command Center', 'Command Runs', 'cmd-20260516-024544-planning-prioritize.md'),
    'utf8'
  );
  assert.match(runNote, /status: routed/);
  assert.match(runNote, /stage: plan/);
  assert.match(runNote, /## Atlas CEO Router Update/);
  assert.match(runNote, /### Clarify/);
  assert.match(runNote, /이번 주 Lua 구축 우선순위 정리/);
  assert.match(runNote, /### Design/);
  assert.match(runNote, /### Plan/);

  const actionBoard = fs.readFileSync(
    path.join(root, '01_Command Center', 'User Action Board.md'),
    'utf8'
  );
  assert.match(actionBoard, /Atlas Router 처리 완료/);
  assert.match(actionBoard, /cmd-20260516-024544/);
  assert.match(actionBoard, /다음 사용자 행동/);
  assert.match(actionBoard, /## Reference Section/);
  assert.match(actionBoard, /이 섹션은 Atlas Router가 보존해야 한다/);
});

test('dry-run reports the target without changing files', () => {
  const root = makeVault();
  const runPath = path.join(
    root,
    '01_Command Center',
    'Command Runs',
    'cmd-20260516-024544-planning-prioritize.md'
  );
  const before = fs.readFileSync(runPath, 'utf8');

  const result = runAtlasRouter({ root, apply: false, firstOnly: true });

  assert.equal(result.processed.length, 1);
  assert.equal(result.processed[0].id, 'cmd-20260516-024544');
  assert.equal(fs.readFileSync(runPath, 'utf8'), before);
});
