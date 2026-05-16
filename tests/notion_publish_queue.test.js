const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildCandidate, queueNotionPublish } = require('../scripts/notion_publish_queue');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeVault(sourceRel = path.join('04_Resources', 'Energy Policies', 'Floating Solar Research Brief.md')) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-notion-queue-'));
  write(
    path.join(root, sourceRel),
    `---
type: research-brief
status: draft
---

# Floating Solar Research Brief

## Executive Summary

K-water floating solar is a team-facing research topic with partner and competitor implications.

## Recommended Next Research

1. Download K-water public facility data.
2. Check public procurement history.
3. Separate competitor and partner candidates.
`
  );
  return { root, sourceRel };
}

test('builds a Notion publish candidate from a research brief', () => {
  const { root, sourceRel } = makeVault();

  const candidate = buildCandidate(root, sourceRel);

  assert.equal(candidate.title, 'Floating Solar Research Brief');
  assert.equal(candidate.status, 'draft');
  assert.equal(candidate.target.name, 'Research Briefs');
  assert.equal(candidate.target.status, 'missing');
  assert.match(candidate.summary, /K-water floating solar/);
  assert.deepEqual(candidate.next, [
    'Download K-water public facility data.',
    'Check public procurement history.',
    'Separate competitor and partner candidates.',
  ]);
});

test('writes a draft entry to the local Notion Publish Queue', () => {
  const { root, sourceRel } = makeVault();

  const result = queueNotionPublish({ root, sourceRel, apply: true });

  const queue = fs.readFileSync(path.join(root, result.queueRel), 'utf8');
  assert.match(queue, /# Notion Publish Queue/);
  assert.match(queue, /<!-- notion-publish/);
  assert.match(queue, /status: draft/);
  assert.match(queue, /Target \| Research Briefs missing; fallback Lua_Home child page/);
  assert.match(queue, /\[\[04_Resources\/Energy Policies\/Floating Solar Research Brief\|Obsidian source\]\]/);
});

test('refuses notes that look like secrets', () => {
  const { root, sourceRel } = makeVault(path.join('04_Resources', 'Secret.md'));
  fs.appendFileSync(path.join(root, sourceRel), '\napi_key: abc123\n', 'utf8');

  assert.throws(
    () => buildCandidate(root, sourceRel),
    /secret-like content/
  );
});
