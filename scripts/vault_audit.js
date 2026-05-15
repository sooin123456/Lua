#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { findFiles, relativePosix } = require('./lib/files');

const ROOT = path.resolve(__dirname, '..');
const STALE_DAYS = 14;
const FRONTMATTER_RE = /^\uFEFF?\s*---\r?\n[\s\S]+?\r?\n---/;
const REPORT = {
  orphans: [],
  brokenLinks: [],
  missingFrontmatter: [],
  staleInbox: [],
  inconsistentTags: {},
  orphanExceptions: {},
};

function extractWikiLinks(content) {
  return [...content.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]);
}
function extractTags(content) {
  return [...content.matchAll(/#([\w가-힣\-]+)/g)].map((m) => m[1]);
}
function stripWiki(link) {
  return link.split('|')[0].trim().replace(/\\$/, '').split('#')[0].trim();
}

async function getAllMarkdown() {
  return findFiles(
    ROOT,
    (fullPath) => fullPath.endsWith('.md'),
    { skipDirs: ['.obsidian', '_meta', 'XX_System', '.trash'] }
  ).map((file) => relativePosix(ROOT, file));
}

function buildIndexes(allFiles) {
  const filesSet = new Set(allFiles);
  const byBasename = new Map();
  for (const f of allFiles) {
    const base = path.basename(f, '.md').toLowerCase();
    if (!byBasename.has(base)) byBasename.set(base, []);
    byBasename.get(base).push(f);
  }
  return { filesSet, byBasename };
}

function resolveWikiTarget(innerRaw, { filesSet, byBasename }) {
  const inner = stripWiki(innerRaw);
  if (!inner) return null;
  if (inner.includes('/') || inner.endsWith('.md')) {
    let rel = inner.replace(/\\/g, '/');
    if (!rel.endsWith('.md')) rel += '.md';
    return filesSet.has(rel) ? rel : null;
  }
  const list = byBasename.get(inner.toLowerCase());
  if (!list || list.length === 0) return null;
  return list[0];
}

function orphanExceptionReason(relPosix) {
  if (relPosix.includes('01_Command Center/Identity/')) return 'identity';
  if (relPosix.includes('01_Command Center/_System/')) return 'system';
  if (relPosix.startsWith('00_Inbox/')) return 'inbox-queue';
  if (relPosix.startsWith('05_Archives/')) return 'archive';
  if (relPosix.startsWith('06_Personal Studio/_Drafts/')) return 'draft';
  if (relPosix.includes('/references/')) return 'skill-reference';
  if (relPosix.includes('/assets/')) return 'skill-asset';
  if (relPosix.endsWith('/SKILL.md')) return 'skill-entrypoint';
  if (relPosix.endsWith('/system-prompt.md')) return 'agent-prompt';
  if (relPosix.startsWith('99_Templates/')) return 'template';
  const base = path.basename(relPosix, '.md');
  if (base === 'README' || base === 'CLAUDE' || base.includes('Hub')) return 'hub-or-readme';
  return null;
}

function markOrphanException(reason) {
  REPORT.orphanExceptions[reason] = (REPORT.orphanExceptions[reason] || 0) + 1;
}

async function detectMissingFrontmatter() {
  const hits = findFiles(ROOT, (fullPath) => {
    const rel = relativePosix(ROOT, fullPath);
    if (!rel.endsWith('.md')) return false;
    if (rel.startsWith('01_Command Center/Identity/')) return true;
    if (rel.startsWith('07_Lua_System/verticals/') && rel.endsWith('/SKILL.md')) return true;
    if (rel.startsWith('03_Operation/') && rel.includes('/_SOPs/')) return true;
    return false;
  }, { skipDirs: ['.obsidian', '_meta', 'XX_System', '.trash'] });

  for (const f of hits.map((file) => relativePosix(ROOT, file))) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    if (!FRONTMATTER_RE.test(content)) REPORT.missingFrontmatter.push(f);
  }
}

async function detectOrphans(allFiles, indexes) {
  const incoming = new Map(allFiles.map((f) => [f, 0]));
  for (const f of allFiles) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    for (const raw of extractWikiLinks(content)) {
      const target = resolveWikiTarget(raw, indexes);
      if (target && incoming.has(target)) incoming.set(target, incoming.get(target) + 1);
    }
  }
  for (const f of allFiles) {
    const reason = orphanExceptionReason(f);
    if (reason) {
      markOrphanException(reason);
      continue;
    }
    if ((incoming.get(f) || 0) === 0) REPORT.orphans.push(f);
  }
}

async function detectBrokenLinks(allFiles, indexes) {
  for (const f of allFiles) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    for (const raw of extractWikiLinks(content)) {
      const inner = stripWiki(raw);
      if (!inner) continue;
      if (!resolveWikiTarget(inner, indexes)) REPORT.brokenLinks.push({ from: f, to: inner });
    }
  }
}

async function detectStaleInbox() {
  const inboxFiles = findFiles(path.join(ROOT, '00_Inbox'), (fullPath) => fullPath.endsWith('.md'))
    .map((file) => relativePosix(ROOT, file));
  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  for (const f of inboxFiles) {
    const stat = fs.statSync(path.join(ROOT, f));
    if (stat.mtimeMs < cutoff) {
      const daysAgo = Math.floor((Date.now() - stat.mtimeMs) / (24 * 60 * 60 * 1000));
      REPORT.staleInbox.push({ file: f, daysOld: daysAgo });
    }
  }
}

async function detectInconsistentTags(allFiles) {
  const tagMap = {};
  for (const f of allFiles) {
    const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    for (const t of extractTags(content)) {
      const key = t.toLowerCase();
      if (!tagMap[key]) tagMap[key] = new Set();
      tagMap[key].add(t);
    }
  }
  for (const [key, variants] of Object.entries(tagMap)) {
    if (variants.size > 1) REPORT.inconsistentTags[key] = [...variants];
  }
}

function printReport() {
  console.log('\n=== Vault audit report ===\n');
  console.log(`Orphan notes: ${REPORT.orphans.length}`);
  REPORT.orphans.slice(0, 10).forEach((o) => console.log('  • ' + o));
  if (REPORT.orphans.length > 10) console.log(`  ... and ${REPORT.orphans.length - 10} more`);

  console.log(`\nOrphan exceptions: ${Object.values(REPORT.orphanExceptions).reduce((a, b) => a + b, 0)}`);
  Object.entries(REPORT.orphanExceptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([reason, count]) => {
      console.log(`  • ${reason}: ${count}`);
    });

  console.log(`\nBroken links: ${REPORT.brokenLinks.length}`);
  REPORT.brokenLinks.slice(0, 10).forEach((b) => console.log(`  • ${b.from} → ${b.to}`));
  if (REPORT.brokenLinks.length > 10) console.log(`  ... and ${REPORT.brokenLinks.length - 10} more`);

  console.log(`\nMissing frontmatter: ${REPORT.missingFrontmatter.length}`);
  REPORT.missingFrontmatter.slice(0, 20).forEach((m) => console.log('  • ' + m));
  if (REPORT.missingFrontmatter.length > 20) console.log(`  ... and ${REPORT.missingFrontmatter.length - 20} more`);

  console.log(`\nStale Inbox (${STALE_DAYS}d+): ${REPORT.staleInbox.length}`);
  REPORT.staleInbox.forEach((s) => console.log(`  • ${s.file} (${s.daysOld}일 전)`));

  console.log(`\nInconsistent tags: ${Object.keys(REPORT.inconsistentTags).length}`);
  Object.entries(REPORT.inconsistentTags).forEach(([key, variants]) => {
    console.log(`  • ${key}: ${variants.join(', ')}`);
  });
  console.log('\n=== End ===\n');
  console.log('이건 report만. 실제 수정은 사람 컨펌 후 vault SKILL 통해서.');
}

async function main() {
  const allFiles = await getAllMarkdown();
  const indexes = buildIndexes(allFiles);
  await detectOrphans(allFiles, indexes);
  await detectBrokenLinks(allFiles, indexes);
  await detectMissingFrontmatter();
  await detectStaleInbox();
  await detectInconsistentTags(allFiles);
  printReport();
}

main().catch((err) => {
  console.error('Audit script crashed:', err);
  process.exit(1);
});
