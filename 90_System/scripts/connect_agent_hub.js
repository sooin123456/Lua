#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TODAY = '2026-05-15';

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content, 'utf8');
}

function link(rel, label) {
  return `[[${rel.replace(/\.md$/, '')}|${label}]]`;
}

const agents = [
  ['atlas', 'Claude Sonnet 4.6', '라우터'],
  ['scribe', 'Claude Opus 4.7', '글쓰기'],
  ['forge', 'Kimi K2.6 / Codex', '코딩'],
  ['lens', 'Kimi K2.6 Swarm', '리서치'],
  ['vault', 'Claude Sonnet 4.6', 'Obsidian 정리'],
  ['archivist', 'Notion Custom Agent', 'Notion 운영'],
];

function bundledSkillRows() {
  const rows = [];
  for (const agent of ['lens', 'scribe', 'vault']) {
    const dir = path.join(ROOT, '90_System/07_Lua_System', 'agents', agent, 'skills');
    if (!fs.existsSync(dir)) continue;
    for (const skill of fs.readdirSync(dir).sort()) {
      const skillPath = `90_System/07_Lua_System/agents/${agent}/skills/${skill}/SKILL.md`;
      if (fs.existsSync(path.join(ROOT, skillPath))) {
        rows.push(`| ${agent} | ${link(skillPath, skill)} |`);
      }
    }
  }
  return rows.join('\n');
}

function writeAgentsReadme() {
  const rows = agents
    .map(([agent, brain, role]) => {
      return `| ${agent} | ${brain} | ${role} | ${link(`90_System/07_Lua_System/agents/${agent}/system-prompt.md`, 'system prompt')} |`;
    })
    .join('\n');

  write('90_System/07_Lua_System/agents/README.md', `---
type: agents-readme
last_updated: ${TODAY}
---

# Lua Agents

Lua의 agent 허브다. 실제 작업 출처는 [[00_Lua/03_Records/Work Ledger|Work Ledger]]에 기록하고, 공통 실행 규칙은 [[AGENTS]]와 [[CLAUDE]]를 따른다.

## Generic Agents

| Agent | Brain | 역할 | System prompt |
|---|---|---|---|
${rows}

## Bundled Skills

| Agent | Skill |
|---|---|
${bundledSkillRows()}

## Source Verticals

- [[90_System/07_Lua_System/verticals/_core/README|_core vertical]]
- [[90_System/07_Lua_System/verticals/climate-energy/README|climate-energy vertical]]

## Workflow Agents 예정

| Agent | 도메인 | 호출 패턴 |
|---|---|---|
| Proposal Agent | climate-energy | \`/proposal-write {grant} {topic}\` |
| Patent Agent | climate-energy | \`/patent-draft {title}\` |
| Industry Intel Agent | climate-energy | cron weekly |
| Validation Agent | personal-venture | \`/validate {idea}\` |

## Skill Bundling

각 agent는 필요한 skill을 \`skills/\` 아래에 복사해 자기완결 번들을 만든다.

- 동기화: \`node 90_System/scripts/sync_skills.js\`
- 검증: \`node 90_System/scripts/check.js\`
- 원본: [[90_System/07_Lua_System/verticals/_core/README|verticals]]

## Operating Rule

- Codex/Windows 작업은 \`[host:windows-codex]\` 커밋 prefix를 쓴다.
- Claude/Mac 작업은 \`[host:mac-claude]\` 커밋 prefix를 쓴다.
- 의미 있는 작업은 [[00_Lua/03_Records/Work Ledger|Work Ledger]]에 남긴다.
`);
}

function updateAgentPrompts() {
  for (const [agent] of agents) {
    const rel = `90_System/07_Lua_System/agents/${agent}/system-prompt.md`;
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    let content = read(rel);
    if (content.includes('## Agent Hub Links')) continue;

    const block = `
## Agent Hub Links

- Hub: [[90_System/07_Lua_System/agents/README|Lua Agents]]
- Runtime rules: [[AGENTS]]
- Shared root: [[CLAUDE]]
- Work provenance: [[00_Lua/03_Records/Work Ledger|Work Ledger]]
`;

    const commitIndex = content.indexOf('\n## Commits');
    if (commitIndex >= 0) {
      content = content.slice(0, commitIndex) + block + content.slice(commitIndex);
    } else {
      content += block;
    }
    write(rel, content);
  }
}

function appendOrInsertDashboardLink(rel) {
  let content = read(rel);
  if (content.includes('[[90_System/07_Lua_System/agents/README|Lua Agents]]')) return;
  content = content.replace(
    '- [[Lua-v4-operating-architecture|Lua v4 Architecture]]',
    '- [[Lua-v4-operating-architecture|Lua v4 Architecture]]\n- [[90_System/07_Lua_System/agents/README|Lua Agents]]'
  );
  write(rel, content);
}

function updateRoots() {
  let agentsMd = read('AGENTS.md');
  if (!agentsMd.includes('`90_System/07_Lua_System/agents/README.md`')) {
    agentsMd = agentsMd
      .replace('1. `CLAUDE.md`', '1. `CLAUDE.md`\n2. `90_System/07_Lua_System/agents/README.md`')
      .replace('2. `90_System/80_Lua_Details/01_Command Center/01_Commands/Harness Loop.md`', '3. `90_System/80_Lua_Details/01_Command Center/01_Commands/Harness Loop.md`')
      .replace('3. `00_Lua/02_Memory/Identity/context.md`', '4. `00_Lua/02_Memory/Identity/context.md`')
      .replace('4. `90_System/80_Lua_Details/01_Command Center/04_Policies/_System/agent-permissions.md`', '5. `90_System/80_Lua_Details/01_Command Center/04_Policies/_System/agent-permissions.md`');
    write('AGENTS.md', agentsMd);
  }

  let claude = read('CLAUDE.md');
  if (!claude.includes('[[90_System/07_Lua_System/agents/README|Lua Agents]]')) {
    claude += '\n## Agents\n\n- [[90_System/07_Lua_System/agents/README|Lua Agents]]\n';
    write('CLAUDE.md', claude);
  }

  appendOrInsertDashboardLink('90_System/80_Lua_Details/01_Command Center/00_Dashboard/Master Dashboard.md');
  appendOrInsertDashboardLink('90_System/80_Lua_Details/01_Command Center/00_Dashboard/Agent Dashboard.md');
}

function main() {
  writeAgentsReadme();
  updateAgentPrompts();
  updateRoots();
  console.log('Agent hub linked.');
}

main();
