const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { auditFlow } = require('../scripts/flow_audit');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function makeVault({ withHubLink = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lua-flow-audit-'));
  write(
    path.join(root, '01_Command Center', 'Obsidian Command Center.md'),
    `# Obsidian Command Center

## Command Queue

| ID | Domain | Intent | Payload | Stage | Owner | Status | Result |
|---|---|---|---|---|---|---|---|
| cmd-1 | research | brief | K-water 수상태양광 조사 | brief | Lens | briefed | [[04_Resources/Energy Policies/K-water 수상태양광 Research Brief|brief]] |
`
  );
  write(
    path.join(root, '01_Command Center', 'Command Runs', 'cmd-1-research-brief.md'),
    `---
type: command-run
status: briefed
command_id: cmd-1
domain: research
intent: brief
stage: brief
agent: Lens
role: Researcher
---

# cmd-1 - research brief

## Research Brief

- [[04_Resources/Energy Policies/K-water 수상태양광 Research Brief|K-water 수상태양광 Research Brief]]
`
  );
  write(
    path.join(root, '04_Resources', 'Energy Policies', 'K-water 수상태양광 Research Brief.md'),
    `---
type: research-brief
status: draft
aliases:
  - K-water 수상태양광 Research Brief
---

# K-water 수상태양광 Research Brief
`
  );
  if (withHubLink) {
    write(
      path.join(root, '04_Resources', 'Energy Policies', 'Energy Policies Hub.md'),
      `---
type: hub
---

# Energy Policies Hub

- [[04_Resources/Energy Policies/K-water 수상태양광 Research Brief|K-water 수상태양광 Research Brief]]
`
    );
  }
  return root;
}

test('flow audit passes when command queue result, run note, brief, and hub are connected', () => {
  const result = auditFlow({ root: makeVault() });

  assert.deepEqual(result.errors, []);
});

test('flow audit fails when a completed brief has no hub entry point', () => {
  const result = auditFlow({ root: makeVault({ withHubLink: false }) });

  assert.match(result.errors.join('\n'), /missing hub link/);
});

test('flow audit fails when a completed command has no run note backstop', () => {
  const root = makeVault();
  fs.rmSync(path.join(root, '01_Command Center', 'Command Runs'), { recursive: true, force: true });

  const result = auditFlow({ root });

  assert.match(result.errors.join('\n'), /missing command run note/);
});
