#!/usr/bin/env node
/**
 * Sync skills from verticals/ source to agents/<agent>/skills/ bundles.
 * Source of truth: 07_Lua_System/verticals/
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, '07_Lua_System/agents');
const VERTICALS_DIR = path.join(ROOT, '07_Lua_System/verticals');
const FRONTMATTER_RE = /^\uFEFF?\s*---\r?\n([\s\S]+?)\r?\n---/;

function parseDependsOn(content) {
  const m = content.match(FRONTMATTER_RE);
  if (!m) return [];
  const fm = m[1];

  const inline = fm.match(/depends_on:\s*\[([\s\S]*?)\]/);
  if (inline) {
    return inline[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const lines = fm.split('\n');
  const deps = [];
  let inDeps = false;
  for (const line of lines) {
    if (/^depends_on:\s*$/.test(line)) {
      inDeps = true;
      continue;
    }
    if (inDeps) {
      const item = line.match(/^\s*-\s*(.+?)\s*$/);
      if (item) {
        deps.push(item[1].trim());
        continue;
      }
      if (line.trim() === '') continue;
      inDeps = false;
    }
  }
  return deps;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

async function main() {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.error('Missing agents directory:', AGENTS_DIR);
    process.exit(2);
  }

  const agentDirs = fs
    .readdirSync(AGENTS_DIR)
    .filter((name) => {
      const p = path.join(AGENTS_DIR, name);
      return fs.statSync(p).isDirectory() && name !== 'verticals';
    });

  const report = { synced: [], skipped: [], errors: [] };

  for (const agent of agentDirs) {
    const promptPath = path.join(AGENTS_DIR, agent, 'system-prompt.md');
    if (!fs.existsSync(promptPath)) {
      report.skipped.push(`${agent}: no system-prompt.md`);
      continue;
    }

    const content = fs.readFileSync(promptPath, 'utf-8');
    const dependsOn = parseDependsOn(content);
    if (!dependsOn.length) {
      report.skipped.push(`${agent}: no depends_on`);
      continue;
    }

    const bundleDir = path.join(AGENTS_DIR, agent, 'skills');
    if (fs.existsSync(bundleDir)) {
      fs.rmSync(bundleDir, { recursive: true, force: true });
    }

    for (const dep of dependsOn) {
      const srcPath = path.join(VERTICALS_DIR, dep);
      if (!fs.existsSync(srcPath)) {
        report.errors.push(`${agent}: source ${dep} not found`);
        continue;
      }
      const skillName = path.basename(dep);
      const destPath = path.join(bundleDir, skillName);
      try {
        copyDir(srcPath, destPath);
        report.synced.push(`${agent} ← ${dep}`);
      } catch (e) {
        report.errors.push(`${agent}: copy failed ${dep} (${e.message})`);
      }
    }
  }

  console.log('\n=== Sync report ===\n');
  console.log(`Synced: ${report.synced.length}`);
  report.synced.forEach((s) => console.log('  ✓ ' + s));
  console.log(`\nSkipped: ${report.skipped.length}`);
  report.skipped.forEach((s) => console.log('  – ' + s));
  if (report.errors.length > 0) {
    console.log(`\nErrors: ${report.errors.length}`);
    report.errors.forEach((e) => console.log('  ✗ ' + e));
    process.exit(1);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Sync crashed:', err);
  process.exit(2);
});
