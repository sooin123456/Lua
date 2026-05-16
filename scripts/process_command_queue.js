#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMMAND_CENTER_REL = path.join('01_Command Center', 'Obsidian Command Center.md');
const RUNS_DIR_REL = path.join('01_Command Center', 'Command Runs');

const ROLE_MAP = {
  planning: { role: 'CEO', agent: 'Atlas' },
  marketing: { role: 'Doc Engineer', agent: 'Scribe' },
  design: { role: 'Designer', agent: 'Scribe+Forge' },
  service: { role: 'PM', agent: 'Vault+Scribe' },
  project: { role: 'PM', agent: 'Atlas+Vault' },
  research: { role: 'Researcher', agent: 'Lens' },
  build: { role: 'Eng Manager', agent: 'Forge' },
  ops: { role: 'QA/Ops', agent: 'Vault' },
};

function usage() {
  console.log(`Usage:
  node scripts/process_command_queue.js --dry-run
  node scripts/process_command_queue.js --apply
  node scripts/process_command_queue.js --apply --command-id lua-ui-20260516-135233
`);
}

function parseArgs(argv) {
  const commandIndex = argv.indexOf('--command-id');
  return {
    dryRun: argv.includes('--dry-run') || !argv.includes('--apply'),
    apply: argv.includes('--apply'),
    commandId: commandIndex >= 0 ? argv[commandIndex + 1] : null,
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function parseRows(content) {
  return content
    .split(/\r?\n/)
    .filter((line) => line.startsWith('| ') && !line.includes('---'))
    .map((line) => line.trim())
    .filter((line) => !line.startsWith('| ID '))
    .map((line) => {
      const cells = line.slice(1, -1).split('|').map((cell) => cell.trim().replace(/\\\|/g, '|'));
      if (cells.length < 8) return null;
      const [id, domain, intent, payload, stage, owner, status, result] = cells;
      return { id, domain, intent, payload, stage, owner, status, result };
    })
    .filter(Boolean);
}

function roleFor(domain) {
  return ROLE_MAP[domain] || { role: 'CEO', agent: 'Atlas' };
}

function outputFor(domain, intent) {
  if (domain === 'planning') return 'Decision or priority draft';
  if (domain === 'marketing') return 'Team/customer brief draft';
  if (domain === 'design') return 'Screen or service flow draft';
  if (domain === 'service') return 'Service process or CS draft';
  if (domain === 'project') return 'Project scope or backlog';
  if (domain === 'research') return 'Research note with sources';
  if (domain === 'build') return intent === 'app' ? 'MVP plan and build task' : 'Implementation task';
  if (domain === 'ops') return 'Vault/system operation result';
  return 'Clarified task';
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'command';
}

function runRelFor(entry) {
  return path.join(RUNS_DIR_REL, `${entry.id}-${slugify(entry.domain + '-' + entry.intent)}`)
    .replace(/\\/g, '/');
}

function runNote(entry) {
  const role = roleFor(entry.domain);
  const title = `${entry.id} - ${entry.domain} ${entry.intent || 'command'}`;
  return `---
type: command-run
status: planned
command_id: ${entry.id}
domain: ${entry.domain}
intent: ${entry.intent || ''}
stage: ${entry.stage || 'clarify'}
agent: ${role.agent}
role: ${role.role}
last_updated: 2026-05-16
---

# ${title}

## Command

${entry.payload}

## Routing

| Field | Value |
|---|---|
| Domain | ${entry.domain} |
| Intent | ${entry.intent || '-'} |
| gstack Role | ${role.role} |
| Lua Agent | ${role.agent} |
| Expected Output | ${outputFor(entry.domain, entry.intent)} |

## Superpowers Workflow

### 1. Clarify

- What is the exact desired outcome?
- What constraints matter?
- What should not be done yet?

### 2. Design

- What are 2-3 possible approaches?
- Which approach is smallest and safest?

### 3. Plan

- [ ] Define first useful output.
- [ ] Identify destination note.
- [ ] Identify verification method.

### 4. Execute

- [ ] Produce draft or implementation.

### 5. Verify

- [ ] Check links, assumptions, and output quality.

### 6. Brief

- [ ] Update Work Ledger.
- [ ] Decide whether Slack/Notion sharing is needed.

## Next User Action

Tell Codex: \`${entry.id} 처리해줘\`

## Navigation

- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[07_Lua_System/commands/Domain Command Playbook|Domain Command Playbook]]
- [[01_Command Center/Work Ledger|Work Ledger]]
`;
}

function createRun(root, entry) {
  const runsDir = path.join(root, RUNS_DIR_REL);
  fs.mkdirSync(runsDir, { recursive: true });
  const file = path.join(runsDir, `${entry.id}-${slugify(entry.domain + '-' + entry.intent)}.md`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, runNote(entry), 'utf8');
  return runRelFor(entry);
}

function replaceRow(content, entry, resultLink) {
  const escapedPayload = entry.payload.replace(/\|/g, '\\|');
  const oldRow = `| ${entry.id} | ${entry.domain} | ${entry.intent} | ${escapedPayload} | ${entry.stage} | ${entry.owner} | ${entry.status} | ${entry.result} |`;
  const newRow = `| ${entry.id} | ${entry.domain} | ${entry.intent} | ${escapedPayload} | ${entry.stage || 'clarify'} | ${entry.owner} | planned | [[${resultLink}|run]] |`;
  if (content.includes(oldRow)) return content.replace(oldRow, newRow);
  return content;
}

function runCommandQueue(options = {}) {
  const root = options.root || ROOT;
  const apply = Boolean(options.apply);
  const commandId = options.commandId || null;
  const commandCenterPath = path.join(root, COMMAND_CENTER_REL);
  let content = fs.readFileSync(commandCenterPath, 'utf8');
  const entries = parseRows(content)
    .filter((entry) => entry.status === 'queued')
    .filter((entry) => !commandId || entry.id === commandId);
  const processed = [];

  for (const entry of entries) {
    const link = apply ? createRun(root, entry) : runRelFor(entry);
    if (apply) content = replaceRow(content, entry, link);
    processed.push({
      id: entry.id,
      domain: entry.domain,
      intent: entry.intent,
      agent: roleFor(entry.domain).agent,
      run: link,
    });
  }

  if (apply && processed.length > 0) fs.writeFileSync(commandCenterPath, content, 'utf8');
  return { processed };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const result = runCommandQueue({ apply: args.apply, commandId: args.commandId });
  if (result.processed.length === 0) {
    console.log('No queued commands found.');
    return;
  }
  for (const entry of result.processed) {
    const role = roleFor(entry.domain);
    console.log(`${entry.id}: ${entry.domain}/${entry.intent || '-'} -> ${role.role} (${role.agent})`);
  }
  if (!args.apply) {
    console.log('Dry run only. Use --apply to create run notes.');
    return;
  }
  console.log(`Created/updated ${result.processed.length} command run note(s).`);
}

if (require.main === module) main();

module.exports = {
  parseRows,
  runCommandQueue,
};
