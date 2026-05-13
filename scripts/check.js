#!/usr/bin/env node
/**
 * Lua vault validator.
 * Checks: CLAUDE.md exists, all SKILL.md have required frontmatter,
 * SKILL.md bodies <= 500 lines, references files exist.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];

async function checkCLAUDEmd() {
  const p = path.join(ROOT, 'CLAUDE.md');
  if (!fs.existsSync(p)) {
    errors.push('CLAUDE.md missing in vault root');
    return;
  }
  const content = fs.readFileSync(p, 'utf-8');
  if (!content.includes('## Verticals')) {
    warnings.push('CLAUDE.md missing "## Verticals" section');
  }
  if (!content.includes('## Routing rule')) {
    warnings.push('CLAUDE.md missing "## Routing rule" section');
  }
}

async function checkSkills() {
  const skillFiles = await glob('07_Lua_System/verticals/*/skills/*/SKILL.md', { cwd: ROOT });

  if (skillFiles.length === 0) {
    warnings.push('No SKILL.md files found under 07_Lua_System/verticals/*/skills/');
    return;
  }

  for (const file of skillFiles) {
    const fullPath = path.join(ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // 1. Frontmatter exists
    const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
    if (!fmMatch) {
      errors.push(`${file}: missing YAML frontmatter`);
      continue;
    }
    const fm = fmMatch[1];

    // 2. Required frontmatter fields
    if (!/^name:\s*\S/m.test(fm)) errors.push(`${file}: missing 'name' in frontmatter`);
    if (!/^description:\s*\S/m.test(fm)) errors.push(`${file}: missing 'description'`);

    // 3. Description length (max 1024 chars)
    const descMatch = fm.match(/^description:\s*(.+?)(?=\n\w|\n---|$)/ms);
    if (descMatch && descMatch[1].length > 1024) {
      errors.push(`${file}: description ${descMatch[1].length} chars (max 1024)`);
    }

    // 4. Body length (max 500 lines)
    const body = content.replace(/^---\n[\s\S]+?\n---\n?/, '');
    const lines = body.split('\n').length;
    if (lines > 500) {
      errors.push(`${file}: body ${lines} lines (max 500). Move detail to references/`);
    }

    // 5. Referenced files exist
    const skillDir = path.dirname(fullPath);
    const refMatches = body.matchAll(/`([^`]*references\/[^`]+\.md)`/g);
    for (const m of refMatches) {
      const refPath = path.join(skillDir, m[1]);
      if (!fs.existsSync(refPath)) {
        errors.push(`${file}: broken reference to ${m[1]}`);
      }
    }
  }
}

async function checkMCPConfigs() {
  const mcpFiles = await glob('07_Lua_System/verticals/*/.mcp.json', { cwd: ROOT });
  for (const file of mcpFiles) {
    try {
      const content = fs.readFileSync(path.join(ROOT, file), 'utf-8');
      JSON.parse(content);
    } catch (e) {
      errors.push(`${file}: invalid JSON (${e.message})`);
    }
  }
}

async function main() {
  await checkCLAUDEmd();
  await checkSkills();
  await checkMCPConfigs();

  console.log('');
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach(w => console.log('  ⚠ ' + w));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log('  ✗ ' + e));
    console.log('');
    console.log(`Failed: ${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(1);
  } else {
    console.log(`✓ All checks passed (${warnings.length} warning(s))`);
  }
}

main().catch(err => {
  console.error('Check script crashed:', err);
  process.exit(2);
});
