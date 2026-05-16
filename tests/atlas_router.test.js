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

function makeBuildVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-atlas-router-build-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `# Obsidian Command Center

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| inbox-20260516-031554-01 | build | app | 카파시 인터뷰 기반 Neural UI 사업 아이디어. Toss 미니앱 같은 예시. | clarify | Forge | planned | [[01_Command Center/Command Runs/inbox-20260516-031554-01-build-app|run]] |
| inbox-20260516-031554-02 | research | brief | 수상태양광 리서치 | clarify | Lens | planned | [[01_Command Center/Command Runs/inbox-20260516-031554-02-research-brief|run]] |
`
  );
  write(
    path.join(root, '01_Command Center', 'Command Runs', 'inbox-20260516-031554-01-build-app.md'),
    `---
type: command-run
status: planned
command_id: inbox-20260516-031554-01
domain: build
intent: app
stage: clarify
agent: Forge
role: Eng Manager
last_updated: 2026-05-16
---

# inbox-20260516-031554-01 - build app

## Command

카파시 인터뷰 기반 Neural UI 사업 아이디어. Toss 미니앱 같은 예시.
`
  );
  write(
    path.join(root, '01_Command Center', 'User Action Board.md'),
    `# User Action Board

## Today

| 순서 | 할 일 | 위치 | 완료 기준 |
|---|---|---|---|
| 1 | 다음 run 처리 | Codex | Queue가 처리됨 |
`
  );
  return root;
}

function makeResearchVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-atlas-router-research-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `# Obsidian Command Center

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| inbox-20260516-031554-02 | research | brief | 수상태양광 미팅. K-water 발주 사이즈, 협력 가능 업체, 경쟁사, 테크인 조사가 필요함. | clarify | Lens | planned | [[01_Command Center/Command Runs/inbox-20260516-031554-02-research-brief|run]] |
`
  );
  write(
    path.join(root, '01_Command Center', 'Command Runs', 'inbox-20260516-031554-02-research-brief.md'),
    `---
type: command-run
status: planned
command_id: inbox-20260516-031554-02
domain: research
intent: brief
stage: clarify
agent: Lens
role: Researcher
last_updated: 2026-05-16
---

# inbox-20260516-031554-02 - research brief

## Command

수상태양광 미팅. K-water 발주 사이즈, 협력 가능 업체, 경쟁사, 테크인 조사가 필요함.
`
  );
  write(
    path.join(root, '01_Command Center', 'User Action Board.md'),
    `# User Action Board

## Today

| 순서 | 할 일 | 위치 | 완료 기준 |
|---|---|---|---|
| 1 | 다음 run 처리 | Codex | Queue가 처리됨 |
`
  );
  return root;
}

function makeDesignScreenVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-atlas-router-design-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `# Obsidian Command Center

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| inbox-20260516-041614-01 | design | screen | Toss 미니앱 만들기: https://toss.im/apps-in-toss/blog/making-miniapps 토스 미니앱 만들기 주제는 아직 고민중 대신 이번에는 디자인 쪽으로 나의 명령 체계를 ui로 표현해주는 서비스 | clarify | Scribe+Forge | planned | [[01_Command Center/Command Runs/inbox-20260516-041614-01-design-screen|run]] |
`
  );
  write(
    path.join(root, '01_Command Center', 'Command Runs', 'inbox-20260516-041614-01-design-screen.md'),
    `\uFEFF---
type: command-run
status: planned
command_id: inbox-20260516-041614-01
domain: design
intent: screen
stage: clarify
agent: Scribe+Forge
role: Designer
last_updated: 2026-05-16
---

# inbox-20260516-041614-01 - design screen

## Command

Toss 미니앱 만들기: https://toss.im/apps-in-toss/blog/making-miniapps 토스 미니앱 만들기 주제는 아직 고민중 대신 이번에는 디자인 쪽으로 나의 명령 체계를 ui로 표현해주는 서비스
`
  );
  write(
    path.join(root, '01_Command Center', 'User Action Board.md'),
    `# User Action Board

## Today

| 순서 | 할 일 | 위치 | 완료 기준 |
|---|---|---|---|
| 1 | 다음 run 처리 | Codex | Queue가 처리됨 |
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

test('build app command gets Neural UI MVP clarify design and plan content', () => {
  const root = makeBuildVault();

  const result = runAtlasRouter({ root, apply: true, firstOnly: true });

  assert.equal(result.processed[0].id, 'inbox-20260516-031554-01');
  assert.equal(result.processed[0].agent, 'Forge');

  const runNote = fs.readFileSync(
    path.join(root, '01_Command Center', 'Command Runs', 'inbox-20260516-031554-01-build-app.md'),
    'utf8'
  );
  assert.match(runNote, /Neural UI/);
  assert.match(runNote, /Toss 미니앱/);
  assert.match(runNote, /MVP/);
  assert.match(runNote, /실험/);
  assert.doesNotMatch(runNote, /Command Center를 먼저 안정화/);

  const actionBoard = fs.readFileSync(
    path.join(root, '01_Command Center', 'User Action Board.md'),
    'utf8'
  );
  assert.match(actionBoard, /수상태양광 리서치 진행해줘/);
});

test('research brief command gets Lens source-based research harness content', () => {
  const root = makeResearchVault();

  const result = runAtlasRouter({ root, apply: true, firstOnly: true });

  assert.equal(result.processed[0].id, 'inbox-20260516-031554-02');
  assert.equal(result.processed[0].agent, 'Lens');

  const runNote = fs.readFileSync(
    path.join(root, '01_Command Center', 'Command Runs', 'inbox-20260516-031554-02-research-brief.md'),
    'utf8'
  );
  assert.match(runNote, /K-water/);
  assert.match(runNote, /협력 가능 업체/);
  assert.match(runNote, /경쟁사/);
  assert.match(runNote, /테크인/);
  assert.match(runNote, /출처 기반 Research Brief/);
  assert.match(runNote, /조사 범위/);
  assert.doesNotMatch(runNote, /Command Center를 먼저 안정화/);
  assert.doesNotMatch(runNote, /Neural UI/);

  const actionBoard = fs.readFileSync(
    path.join(root, '01_Command Center', 'User Action Board.md'),
    'utf8'
  );
  assert.match(actionBoard, /리서치 실행 승인해줘/);
});

test('design screen command gets Lua command UI miniapp clarify design and plan content', () => {
  const root = makeDesignScreenVault();

  const result = runAtlasRouter({ root, apply: true, firstOnly: true });

  assert.equal(result.processed[0].id, 'inbox-20260516-041614-01');
  assert.equal(result.processed[0].agent, 'Scribe+Forge');
  assert.equal(result.processed[0].stageAfter, 'plan');

  const runNote = fs.readFileSync(
    path.join(root, '01_Command Center', 'Command Runs', 'inbox-20260516-041614-01-design-screen.md'),
    'utf8'
  );
  assert.match(runNote, /status: routed/);
  assert.match(runNote, /stage: plan/);
  assert.match(runNote, /Lua 명령 UI/);
  assert.match(runNote, /domain 선택/);
  assert.match(runNote, /intent 선택/);
  assert.match(runNote, /payload 입력/);
  assert.match(runNote, /Command Preview/);
  assert.match(runNote, /Toss 미니앱/);
  assert.doesNotMatch(runNote, /Command Center를 먼저 안정화/);
  assert.doesNotMatch(runNote, /수상태양광/);

  const actionBoard = fs.readFileSync(
    path.join(root, '01_Command Center', 'User Action Board.md'),
    'utf8'
  );
  assert.match(actionBoard, /Lua Command UI 화면 설계 승인해줘/);
});
