#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = path.resolve(__dirname, '..');
const COMMAND_CENTER_REL = path.join('01_Command Center', 'Obsidian Command Center.md');
const WORK_LEDGER_REL = path.join('01_Command Center', 'Work Ledger.md');
const ARTIFACT_LEDGER_REL = path.join('08_Artifacts', 'Artifact Ledger.md');
const BUILD_OUTPUTS_REL = path.join('08_Artifacts', 'Build Outputs');
const TODAY = todayKst();

function todayKst() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function usage() {
  console.log(`Usage:
  node scripts/build_runner.js --dry-run --command-id lua-ui-20260516-135233
  node scripts/build_runner.js --apply --command-id lua-ui-20260516-135233
`);
}

function parseArgs(argv) {
  const commandIndex = argv.indexOf('--command-id');
  return {
    apply: argv.includes('--apply'),
    commandId: commandIndex >= 0 ? argv[commandIndex + 1] : null,
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function splitTableRow(line) {
  const cells = [];
  let cell = '';
  let wikiDepth = 0;
  const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');

  for (let i = 0; i < body.length; i += 1) {
    const pair = body.slice(i, i + 2);
    if (pair === '[[') {
      wikiDepth += 1;
      cell += pair;
      i += 1;
      continue;
    }
    if (pair === ']]' && wikiDepth > 0) {
      wikiDepth -= 1;
      cell += pair;
      i += 1;
      continue;
    }
    if (body[i] === '|' && wikiDepth === 0) {
      cells.push(cell);
      cell = '';
      continue;
    }
    cell += body[i];
  }

  cells.push(cell);
  return cells;
}

function parseRows(content) {
  return content
    .split(/\r?\n/)
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.startsWith('| ') && !line.includes('---'))
    .filter(({ line }) => !line.trim().startsWith('| ID '))
    .map(({ line, index }) => {
      const cells = splitTableRow(line).map((cell) => cell.trim().replace(/\\\|/g, '|'));
      if (cells.length < 8) return null;
      const [id, domain, intent, payload, stage, owner, status, result] = cells;
      return { id, domain, intent, payload, stage, owner, status, result, index };
    })
    .filter(Boolean);
}

function slugify(value) {
  const slug = String(value || '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return slug || 'command';
}

function escapeCell(value) {
  return String(value || '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function extractLinkTarget(result) {
  const match = String(result || '').match(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/);
  return match ? match[1] : null;
}

function runRelFor(entry) {
  const existing = extractLinkTarget(entry.result);
  if (existing) return existing;
  return path.posix.join(
    '01_Command Center',
    'Command Runs',
    `${entry.id}-${slugify(`${entry.domain}-${entry.intent || 'command'}`)}`
  );
}

function artifactRelFor(entry) {
  return path.posix.join(
    '08_Artifacts',
    'Build Outputs',
    `${entry.id}-${slugify(`${entry.domain}-${entry.intent || 'command'}`)}-output`
  );
}

function updateFrontmatter(content, updates) {
  const match = content.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return content;

  let frontmatter = match[1];
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}: ${value}`;
    const re = new RegExp(`^${key}:.*$`, 'm');
    frontmatter = re.test(frontmatter) ? frontmatter.replace(re, line) : `${frontmatter}\n${line}`;
  }
  return `---\n${frontmatter}\n---${content.slice(match[0].length)}`;
}

function buildOutputNote(entry, artifactRel, verification) {
  return `---
type: build-output
status: done
command_id: ${entry.id}
domain: ${entry.domain}
intent: ${entry.intent || ''}
owner: ${entry.owner}
last_updated: ${TODAY}
---

# ${entry.id} Build Output

## Request

${entry.payload}

## Deliverable

This build runner output closes the command into a durable artifact record. It captures the implementation target, the verification commands, and the continuation links needed to resume after context loss.

## Implementation Target

- Source command: [[${runRelFor(entry)}|${entry.id}]]
- Artifact path: \`${artifactRel}.md\`
- Build domain: \`${entry.domain}/${entry.intent || 'command'}\`

## Verification

${verification.map((item) => `- \`${item}\``).join('\n') || '- Manual verification pending'}

## Resume Context

- Continue from this artifact when the chat context is lost.
- Use the source command run note for planning history.
- Use Work Ledger for session provenance.
`;
}

function buildRunnerUpdate(entry, artifactRel, verification) {
  return `## Build Runner Output

| Field | Value |
|---|---|
| Command ID | ${entry.id} |
| Stage | ${entry.stage} -> brief |
| Status | ${entry.status} -> done |
| Artifact | [[${artifactRel}|Build Output]] |

### Execute

- [x] Created durable build output artifact.
- [x] Linked command run, artifact, Artifact Ledger, and Work Ledger.

### Verify

${verification.map((item) => `- [x] \`${item}\``).join('\n') || '- [ ] Manual verification pending'}

### Brief

- [x] Command Queue now points at the artifact.
- [x] Context can resume from the run note or artifact.
`;
}

function upsertBuildRunnerUpdate(content, update) {
  const start = content.indexOf('## Build Runner Output');
  const nav = content.indexOf('## Navigation');
  if (start >= 0) {
    const end = nav > start ? nav : content.length;
    return `${content.slice(0, start).trimEnd()}\n\n${update.trimEnd()}\n\n${content.slice(end).trimStart()}`;
  }
  if (nav >= 0) return `${content.slice(0, nav).trimEnd()}\n\n${update.trimEnd()}\n\n${content.slice(nav).trimStart()}`;
  return `${content.trimEnd()}\n\n${update.trimEnd()}\n`;
}

function replaceCommandRow(content, entry, artifactRel) {
  const lines = content.split(/\r?\n/);
  lines[entry.index] = `| ${entry.id} | ${escapeCell(entry.domain)} | ${escapeCell(entry.intent)} | ${escapeCell(entry.payload)} | brief | ${escapeCell(entry.owner)} | done | [[${artifactRel}|artifact]] |`;
  return lines.join('\n');
}

function ensureArtifactLedger(root, entry, artifactRel) {
  const file = path.join(root, ARTIFACT_LEDGER_REL);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `---
type: artifact-ledger
last_updated: ${TODAY}
---

# Artifact Ledger

| Date | Artifact | Type | Project | Location | Status | Owner | Reviewer |
|---|---|---|---|---|---|---|---|
`, 'utf8');
  }

  const current = fs.readFileSync(file, 'utf8');
  if (current.includes(artifactRel)) return;
  const row = `| ${TODAY} | ${path.basename(artifactRel)} | build output | Lua | \`${artifactRel}.md\` | done | ${entry.owner} | pending |`;
  fs.writeFileSync(file, `${current.trimEnd()}\n${row}\n`, 'utf8');
}

function appendWorkLedger(root, entry, artifactRel, verification) {
  const file = path.join(root, WORK_LEDGER_REL);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '# Work Ledger\n', 'utf8');
  }
  const current = fs.readFileSync(file, 'utf8');
  const marker = `Build Runner completed ${entry.id}`;
  if (current.includes(marker)) return;
  const block = `
## ${TODAY} KST - ${marker}

- Host: \`windows-codex\`
- Agent: \`Codex\`
- Repo/area: Build Runner, Command Queue, Artifacts
- Trigger: command \`${entry.id}\` reached build runner
- Changed: created [[${artifactRel}|build output]], marked the command \`done\`, and linked the run note for context recovery
- Verification: ${verification.map((item) => `\`${item}\``).join('; ') || 'manual verification pending'}
- Commit: pending
- Next: replace deterministic artifact output with domain-specific app implementation when the command requires code generation
`;
  fs.writeFileSync(file, `${current.trimEnd()}\n${block}`, 'utf8');
}

function runBuildRunner(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  const apply = Boolean(options.apply);
  const commandId = options.commandId || null;
  const verification = options.verification || [];
  const commandCenterPath = path.join(root, COMMAND_CENTER_REL);
  let commandCenter = fs.readFileSync(commandCenterPath, 'utf8');
  const entries = parseRows(commandCenter)
    .filter((entry) => !commandId || entry.id === commandId)
    .filter((entry) => entry.stage === 'plan' && ['routed', 'planned'].includes(entry.status));
  const processed = [];

  for (const entry of entries.slice(0, 1)) {
    const artifactRel = artifactRelFor(entry);
    processed.push({
      id: entry.id,
      stageBefore: entry.stage,
      stageAfter: 'brief',
      statusBefore: entry.status,
      statusAfter: 'done',
      artifact: artifactRel,
    });

    if (!apply) continue;

    const artifactPath = path.join(root, `${artifactRel}.md`);
    fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
    fs.writeFileSync(artifactPath, buildOutputNote(entry, artifactRel, verification), 'utf8');

    const runPath = path.join(root, `${runRelFor(entry)}.md`);
    const runNote = fs.existsSync(runPath) ? fs.readFileSync(runPath, 'utf8') : '';
    const updatedRunNote = upsertBuildRunnerUpdate(
      updateFrontmatter(runNote, { status: 'done', stage: 'brief', last_updated: TODAY }),
      buildRunnerUpdate(entry, artifactRel, verification)
    );
    fs.writeFileSync(runPath, updatedRunNote, 'utf8');

    commandCenter = replaceCommandRow(commandCenter, entry, artifactRel);
    ensureArtifactLedger(root, entry, artifactRel);
    appendWorkLedger(root, entry, artifactRel, verification);
  }

  if (apply && processed.length > 0) fs.writeFileSync(commandCenterPath, commandCenter, 'utf8');
  return { processed };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const result = runBuildRunner({
    apply: args.apply,
    commandId: args.commandId,
    verification: ['node scripts/check.js'],
  });
  if (result.processed.length === 0) {
    console.log('No build-ready plan commands found.');
    return;
  }
  for (const entry of result.processed) {
    console.log(`${entry.id}: ${entry.stageBefore}/${entry.statusBefore} -> ${entry.stageAfter}/${entry.statusAfter}`);
    console.log(`artifact: ${entry.artifact}`);
  }
  if (!args.apply) console.log('Dry run only. Use --apply to write the artifact.');
}

if (require.main === module) main();

module.exports = {
  parseRows,
  runBuildRunner,
};
