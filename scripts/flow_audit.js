#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { findFiles, relativePosix } = require('./lib/files');

const DEFAULT_ROOT = path.resolve(__dirname, '..');
const COMMAND_CENTER_REL = path.join('01_Command Center', 'Obsidian Command Center.md');
const RUNS_DIR_REL = path.join('01_Command Center', 'Command Runs');
const COMPLETED_STATUSES = new Set(['routed', 'briefed', 'done']);

function parseRows(content) {
  return content
    .split(/\r?\n/)
    .filter((line) => line.startsWith('| ') && !line.includes('---'))
    .filter((line) => !line.trim().startsWith('| ID '))
    .map((line) => {
      const cells = splitTableRow(line).map((cell) => cell.trim().replace(/\\\|/g, '|'));
      if (cells.length < 8) return null;
      const [id, domain, intent, payload, stage, owner, status, result] = cells;
      return { id, domain, intent, payload, stage, owner, status, result };
    })
    .filter(Boolean);
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

function stripWiki(link) {
  return String(link || '').split('|')[0].trim().replace(/\\$/, '').split('#')[0].trim();
}

function extractWikiLinks(content) {
  return [...content.matchAll(/\[\[([^\]]+)\]\]/g)].map((match) => stripWiki(match[1]));
}

function firstWikiTarget(value) {
  const match = String(value || '').match(/\[\[([^\]]+)\]\]/);
  return match ? stripWiki(match[1]) : null;
}

function toMdRel(target) {
  if (!target) return null;
  const normalized = target.replace(/\\/g, '/');
  return normalized.endsWith('.md') ? normalized : `${normalized}.md`;
}

function allMarkdown(root) {
  return findFiles(
    root,
    (fullPath) => fullPath.endsWith('.md'),
    { skipDirs: ['.obsidian', 'node_modules', 'XX_System', '.trash'] }
  ).map((file) => relativePosix(root, file));
}

function fileExists(root, relNoExt) {
  const rel = toMdRel(relNoExt);
  return Boolean(rel && fs.existsSync(path.join(root, rel)));
}

function findRunNote(root, entry) {
  const runsDir = path.join(root, RUNS_DIR_REL);
  if (!fs.existsSync(runsDir)) return null;
  const matches = findFiles(runsDir, (fullPath) => {
    const name = path.basename(fullPath);
    return name.startsWith(`${entry.id}-`) && name.endsWith('.md');
  });
  return matches[0] || null;
}

function hasIncomingHubLink(root, targetRelNoExt) {
  const target = toMdRel(targetRelNoExt);
  if (!target) return false;
  const targetNoExt = target.replace(/\.md$/, '');
  for (const rel of allMarkdown(root)) {
    const base = path.basename(rel, '.md');
    if (!base.includes('Hub')) continue;
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    const links = extractWikiLinks(content).map((link) => toMdRel(link));
    if (links.includes(target) || links.includes(`${targetNoExt}.md`)) return true;
  }
  return false;
}

function runNoteLinksTarget(runNotePath, targetRelNoExt) {
  if (!runNotePath || !targetRelNoExt) return false;
  const target = toMdRel(targetRelNoExt);
  const content = fs.readFileSync(runNotePath, 'utf8');
  return extractWikiLinks(content).map((link) => toMdRel(link)).includes(target);
}

function auditFlow(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  const errors = [];
  const warnings = [];
  const commandCenterPath = path.join(root, COMMAND_CENTER_REL);

  if (!fs.existsSync(commandCenterPath)) {
    return { errors: [`missing command center: ${COMMAND_CENTER_REL}`], warnings };
  }

  const rows = parseRows(fs.readFileSync(commandCenterPath, 'utf8'))
    .filter((entry) => !entry.id.startsWith('example-'));

  for (const entry of rows) {
    const target = firstWikiTarget(entry.result);
    if (COMPLETED_STATUSES.has(entry.status) && !target) {
      errors.push(`${entry.id}: completed command missing result link`);
      continue;
    }
    if (target && !fileExists(root, target)) errors.push(`${entry.id}: result link missing target ${target}`);

    if (COMPLETED_STATUSES.has(entry.status)) {
      const runNote = findRunNote(root, entry);
      if (!runNote) {
        errors.push(`${entry.id}: missing command run note`);
        continue;
      }
      if (entry.status === 'briefed' && !runNoteLinksTarget(runNote, target)) {
        errors.push(`${entry.id}: command run note does not link result ${target}`);
      }
      if (entry.status === 'briefed' && !hasIncomingHubLink(root, target)) {
        errors.push(`${entry.id}: result ${target} missing hub link`);
      }
    }
  }

  return { errors, warnings };
}

function main() {
  const result = auditFlow();
  if (result.warnings.length > 0) {
    console.log('Warnings:');
    result.warnings.forEach((warning) => console.log(`  ! ${warning}`));
  }
  if (result.errors.length > 0) {
    console.log('Flow audit failed:');
    result.errors.forEach((error) => console.log(`  x ${error}`));
    process.exit(1);
  }
  console.log('✓ Flow audit passed');
}

if (require.main === module) main();

module.exports = {
  auditFlow,
  parseRows,
  splitTableRow,
};
