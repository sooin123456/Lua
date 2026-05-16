const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { addInboxCapture } = require('../scripts/add_inbox_capture');

test('creates a file-based Inbox note for a new capture', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-inbox-add-'));

  const result = addInboxCapture({
    root,
    source: 'manual',
    text: '토스 미니앱 명령 UI 아이디어',
    now: new Date('2026-05-16T04:30:00.000Z'),
  });

  assert.match(result.fileRel, /^00_Inbox\/\d{8}-\d{6}-manual\.md$/);
  const note = fs.readFileSync(path.join(root, result.fileRel), 'utf8');
  assert.match(note, /type: inbox-note/);
  assert.match(note, /status: captured/);
  assert.match(note, /source: manual/);
  assert.match(note, /토스 미니앱 명령 UI 아이디어/);
});
