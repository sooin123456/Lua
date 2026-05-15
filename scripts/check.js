#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { findFiles, relativePosix, toPosix } = require('./lib/files');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];
const FRONTMATTER_RE = /^\uFEFF?\s*---\r?\n([\s\S]+?)\r?\n---/;

function under(...parts) {
  return path.join(ROOT, ...parts);
}

function isSkillFile(fullPath) {
  const rel = relativePosix(ROOT, fullPath);
  return rel.startsWith('07_Lua_System/verticals/')
    && rel.includes('/skills/')
    && rel.endsWith('/SKILL.md');
}

function isBundledSkillFile(fullPath) {
  const rel = relativePosix(ROOT, fullPath);
  return rel.startsWith('07_Lua_System/agents/')
    && rel.includes('/skills/')
    && rel.endsWith('/SKILL.md');
}

function isCommandFile(fullPath) {
  const rel = relativePosix(ROOT, fullPath);
  return rel.startsWith('07_Lua_System/verticals/')
    && rel.includes('/commands/')
    && rel.endsWith('.md');
}

function isMcpConfig(fullPath) {
  const rel = relativePosix(ROOT, fullPath);
  return rel.startsWith('07_Lua_System/verticals/') && rel.endsWith('/.mcp.json');
}

function verticalSkillSources(skillName) {
  return findFiles(under('07_Lua_System', 'verticals'), (fullPath) => {
    const rel = relativePosix(ROOT, fullPath);
    return rel.endsWith(`/skills/${skillName}/SKILL.md`);
  }).map((file) => relativePosix(ROOT, file));
}

async function checkCLAUDEmd() {
  const p = path.join(ROOT, 'CLAUDE.md');
  if (!fs.existsSync(p)) {
    errors.push('CLAUDE.md missing in vault root');
    return;
  }
  const content = fs.readFileSync(p, 'utf-8');
  if (!content.includes('## Verticals')) warnings.push('CLAUDE.md missing "## Verticals" section');
  if (!content.includes('## Routing rule')) warnings.push('CLAUDE.md missing "## Routing rule" section');
}

async function checkIdentity() {
  const required = [
    '01_Command Center/Identity/about-me.md',
    '01_Command Center/Identity/voice.md',
    '01_Command Center/Identity/decision-principles.md',
    '01_Command Center/Identity/context.md',
  ];
  for (const f of required) {
    if (!fs.existsSync(path.join(ROOT, f))) errors.push(`Identity file missing: ${f}`);
  }
  const voicePath = path.join(ROOT, '01_Command Center/Identity/voice.md');
  if (fs.existsSync(voicePath)) {
    const bodyLines = fs.readFileSync(voicePath, 'utf-8').split('\n').length;
    if (bodyLines < 30) warnings.push('voice.md too short (< 30 lines).');
  }
}

async function checkAgentPermissions() {
  const p = path.join(ROOT, '01_Command Center/_System/agent-permissions.md');
  if (!fs.existsSync(p)) errors.push('_System/agent-permissions.md missing');
}

async function checkSkills() {
  const skillFiles = findFiles(under('07_Lua_System', 'verticals'), isSkillFile)
    .map((file) => relativePosix(ROOT, file));
  if (skillFiles.length === 0) {
    warnings.push('No SKILL.md files found under 07_Lua_System/verticals/*/skills/');
    return;
  }
  for (const file of skillFiles) {
    const fullPath = path.join(ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fmMatch = content.match(FRONTMATTER_RE);
    if (!fmMatch) {
      errors.push(`${file}: missing YAML frontmatter`);
      continue;
    }
    const fm = fmMatch[1];
    if (!/^name:\s*\S/m.test(fm)) errors.push(`${file}: missing 'name' in frontmatter`);
    if (!/^description:\s*\S/m.test(fm)) errors.push(`${file}: missing 'description'`);

    const descMatch = fm.match(/^description:\s*(.+?)(?=\n\w|\n---|$)/ms);
    if (descMatch && descMatch[1].length > 1024) {
      errors.push(`${file}: description ${descMatch[1].length} chars (max 1024)`);
    }

    const body = content.replace(/^\uFEFF?\s*---\r?\n[\s\S]+?\r?\n---\r?\n?/, '');
    const lines = body.split('\n').length;
    if (lines > 500) errors.push(`${file}: body ${lines} lines (max 500).`);

    const skillDir = path.dirname(fullPath);
    for (const m of body.matchAll(/`([^`]*references\/[^`]+\.md)`/g)) {
      const refPath = path.join(skillDir, m[1]);
      if (!fs.existsSync(refPath)) errors.push(`${file}: broken reference to ${m[1]}`);
    }
  }
}

async function checkCommands() {
  const commandFiles = findFiles(under('07_Lua_System', 'verticals'), isCommandFile)
    .map((file) => relativePosix(ROOT, file));
  for (const file of commandFiles) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
    const fm = content.match(FRONTMATTER_RE);
    if (!fm) {
      errors.push(`${file}: missing frontmatter`);
      continue;
    }
    if (!/^trigger:\s*\S/m.test(fm[1])) errors.push(`${file}: missing 'trigger' in frontmatter`);
  }
}

async function checkMCPConfigs() {
  const mcpFiles = findFiles(under('07_Lua_System', 'verticals'), isMcpConfig)
    .map((file) => relativePosix(ROOT, file));
  for (const file of mcpFiles) {
    try {
      JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf-8'));
    } catch (e) {
      errors.push(`${file}: invalid JSON (${e.message})`);
    }
  }
}

async function checkAgents() {
  const agentsRoot = path.join(ROOT, '07_Lua_System/agents');
  if (!fs.existsSync(agentsRoot)) {
    warnings.push('07_Lua_System/agents/ missing');
    return;
  }
  const agentDirs = fs
    .readdirSync(agentsRoot)
    .filter((name) => fs.statSync(path.join(agentsRoot, name)).isDirectory())
    .filter((name) => !['verticals'].includes(name));
  if (agentDirs.length === 0) {
    warnings.push('No agents found in 07_Lua_System/agents/');
    return;
  }
  const required = ['atlas', 'scribe', 'forge', 'lens', 'vault', 'archivist'];
  for (const req of required) if (!agentDirs.includes(req)) errors.push(`Missing generic agent: ${req}`);
  for (const agent of agentDirs) {
    const promptPath = path.join(agentsRoot, agent, 'system-prompt.md');
    if (!fs.existsSync(promptPath)) {
      errors.push(`agents/${agent}/system-prompt.md missing`);
      continue;
    }
    if (!FRONTMATTER_RE.test(fs.readFileSync(promptPath, 'utf-8'))) {
      errors.push(`agents/${agent}/system-prompt.md: missing frontmatter`);
    }
  }
}

async function checkSkillDrift() {
  const bundledFiles = findFiles(under('07_Lua_System', 'agents'), isBundledSkillFile)
    .map((file) => relativePosix(ROOT, file));
  for (const bundled of bundledFiles) {
    const skillName = path.basename(path.dirname(bundled));
    const sources = verticalSkillSources(skillName);
    if (sources.length === 0) {
      warnings.push(`Bundled skill ${bundled} has no source in verticals/`);
      continue;
    }
    if (sources.length > 1) {
      errors.push(`Skill ${skillName} found in multiple verticals: ${sources.join(', ')}`);
      continue;
    }
    const sourceContent = fs.readFileSync(path.join(ROOT, sources[0]), 'utf-8');
    const bundledContent = fs.readFileSync(path.join(ROOT, bundled), 'utf-8');
    if (sourceContent !== bundledContent) {
      errors.push(`Drift: ${bundled} differs from source ${sources[0]}. Run sync_skills.js.`);
    }
  }
}

async function main() {
  await checkCLAUDEmd();
  await checkIdentity();
  await checkAgentPermissions();
  await checkSkills();
  await checkAgents();
  await checkSkillDrift();
  await checkCommands();
  await checkMCPConfigs();

  console.log('');
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach((w) => console.log('  ! ' + w));
    console.log('');
  }
  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach((e) => console.log('  x ' + e));
    console.log('');
    console.log(`Failed: ${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(1);
  }
  console.log(`✓ All checks passed (${warnings.length} warning(s))`);
}

main().catch((err) => {
  console.error('Check script crashed:', err);
  process.exit(2);
});
