const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { promoteInbox } = require('../scripts/promote_inbox_to_commands');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-inbox-promote-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `---
type: command-center
---

# Obsidian Command Center

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| example-001 | research | compare | sample | clarify | Lens | planned | [[01_Command Center/Command Runs/example-001-research-compare|run]] |
`
  );
  write(
    path.join(root, '00_Inbox', 'Toss 미니앱 만들기.md'),
    `https://toss.im/apps-in-toss/blog/making-miniapps?utm_source=meta&fbclid=abc

토스 미니앱 만들기

주제는 아직 고민중 대신 이번에는 디자인 쪽으로 어제 말한 내용 나의 명령 체계를 ui로 표현해주는 좀 더 쉽게 뭔가 명령할 수 있는 그런 서비스
`
  );
  return root;
}

test('promotes file-based Inbox notes into the Command Queue', () => {
  const root = makeVault();

  const result = promoteInbox({ root, apply: true });

  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].domain, 'design');
  assert.equal(result.entries[0].intent, 'screen');
  assert.match(result.entries[0].payload, /토스 미니앱 만들기/);
  assert.match(result.entries[0].payload, /https:\/\/toss\.im\/apps-in-toss\/blog\/making-miniapps/);
  assert.doesNotMatch(result.entries[0].payload, /utm_source|fbclid/);

  const commandCenter = fs.readFileSync(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    'utf8'
  );
  assert.match(commandCenter, /\| inbox-\d{8}-\d{6}-01 \| design \| screen \|/);
  assert.match(commandCenter, /Toss 미니앱 만들기/);

  const inboxNote = fs.readFileSync(path.join(root, '00_Inbox', 'Toss 미니앱 만들기.md'), 'utf8');
  assert.match(inboxNote, /status: promoted/);
  assert.match(inboxNote, /promoted_to:/);
});

test('does not promote already promoted file notes again', () => {
  const root = makeVault();

  promoteInbox({ root, apply: true });
  const second = promoteInbox({ root, apply: true });

  assert.equal(second.entries.length, 0);
});

test('does not promote the central Inbox index note', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-inbox-index-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `# Obsidian Command Center

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
`
  );
  write(
    path.join(root, '00_Inbox', 'AI 분류 대기중....md'),
    `---
type: inbox-index
status: active
---

# AI 분류 대기중

새 아이디어는 이 파일에 길게 붙여도 되고, 개별 Inbox 노트로 만들어도 된다.
`
  );

  const result = promoteInbox({ root, apply: true });

  assert.equal(result.entries.length, 0);
});
