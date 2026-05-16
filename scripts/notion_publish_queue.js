#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { toPosix } = require('./lib/files');

const DEFAULT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_SOURCE_REL = path.join('04_Resources', 'Energy Policies', 'K-water 수상태양광 Research Brief.md');
const QUEUE_REL = path.join('09_Automations', 'Notion Publish Queue.md');
const TODAY = todayKst();

const TARGETS = {
  researchBrief: {
    name: 'Research Briefs',
    status: 'missing',
    fallback: 'Lua_Home child page',
    parentPageId: '8cbeb124-ae5f-839e-8c3d-010d23a1c7d0',
    notionUrl: 'https://www.notion.so/8cbeb124ae5f839e8c3d010d23a1c7d0',
  },
  teamBrief: {
    name: 'Team Briefs',
    status: 'missing',
    fallback: 'Lua_Home child page',
    parentPageId: '8cbeb124-ae5f-839e-8c3d-010d23a1c7d0',
    notionUrl: 'https://www.notion.so/8cbeb124ae5f839e8c3d010d23a1c7d0',
  },
  existingTask: {
    name: '작업',
    status: 'available',
    dataSourceId: '40feb124-ae5f-8391-aee0-07e8ba9bfec8',
  },
  existingProject: {
    name: '프로젝트',
    status: 'available',
    dataSourceId: '35feb124-ae5f-8237-a001-07c587def486',
  },
};

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

function parseArgs(argv) {
  const sourceIndex = argv.indexOf('--source');
  return {
    apply: argv.includes('--apply'),
    dryRun: argv.includes('--dry-run') || !argv.includes('--apply'),
    help: argv.includes('--help') || argv.includes('-h'),
    sourceRel: sourceIndex >= 0 ? argv[sourceIndex + 1] : DEFAULT_SOURCE_REL,
  };
}

function usage() {
  console.log(`Usage:
  node scripts/notion_publish_queue.js --dry-run
  node scripts/notion_publish_queue.js --apply
  node scripts/notion_publish_queue.js --apply --source "04_Resources/Energy Policies/K-water 수상태양광 Research Brief.md"
`);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].trim();
  }
  return data;
}

function titleFrom(content, sourceRel) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return path.basename(sourceRel, '.md');
}

function section(content, heading) {
  const start = content.search(new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'm'));
  if (start < 0) return '';
  const rest = content.slice(start);
  const next = rest.slice(1).search(/^##\s+/m);
  const body = next < 0 ? rest : rest.slice(0, next + 1);
  return body.replace(/^##\s+.+\r?\n/, '').trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripMarkdownLinks(value) {
  return String(value).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function firstParagraph(value) {
  return stripMarkdownLinks(value)
    .split(/\r?\n\r?\n/)
    .map((part) => part.trim())
    .find(Boolean) || '';
}

function bulletsFromSection(value, limit = 5) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => stripMarkdownLinks(line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim()))
    .slice(0, limit);
}

function classifyTarget(frontmatter) {
  if (frontmatter.type === 'research-brief') return TARGETS.researchBrief;
  if (frontmatter.type === 'team-brief' || frontmatter.type === 'team-brief-drafts') return TARGETS.teamBrief;
  return TARGETS.teamBrief;
}

function assertSafeSource(sourceRel, content) {
  const normalized = sourceRel.replace(/\\/g, '/');
  const forbiddenPath = /(^|\/)(05_Identity|identity|secrets?)(\/|$)/i;
  const forbiddenContent = /(api[_-]?key|secret|password|token)\s*[:=]/i;

  if (forbiddenPath.test(normalized)) {
    throw new Error(`Refusing to queue private or identity source: ${sourceRel}`);
  }
  if (forbiddenContent.test(content)) {
    throw new Error(`Refusing to queue note with secret-like content: ${sourceRel}`);
  }
}

function buildCandidate(root, sourceRel) {
  const fullPath = path.join(root, sourceRel);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing source note: ${sourceRel}`);

  const content = fs.readFileSync(fullPath, 'utf8');
  assertSafeSource(sourceRel, content);

  const frontmatter = parseFrontmatter(content);
  const title = titleFrom(content, sourceRel);
  const target = classifyTarget(frontmatter);
  const summary = firstParagraph(section(content, 'Executive Summary'));
  const next = bulletsFromSection(section(content, 'Recommended Next Research'), 5);
  const sourcePosix = toPosix(sourceRel);

  return {
    id: slugify(`${title}-${TODAY}`),
    title,
    sourceRel: sourcePosix.replace(/\.md$/, ''),
    sourceFile: sourcePosix,
    target,
    summary,
    next,
    status: 'draft',
    lastUpdated: TODAY,
  };
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'notion-publish';
}

function candidateBlock(candidate) {
  const next = candidate.next.length > 0
    ? candidate.next.map((item) => `- ${item}`).join('\n')
    : '- 확인된 다음 행동 없음';
  const targetLine = candidate.target.status === 'available'
    ? `${candidate.target.name} (${candidate.target.dataSourceId})`
    : `${candidate.target.name} missing; fallback ${candidate.target.fallback}`;

  return `<!-- notion-publish
id: ${candidate.id}
status: draft
target: ${candidate.target.name}
source: ${candidate.sourceFile}
-->
### ${candidate.title}

| Field | Value |
|---|---|
| Status | draft |
| Target | ${targetLine} |
| Source | [[${candidate.sourceRel}|Obsidian source]] |
| Parent | ${candidate.target.notionUrl || '-'} |
| Last updated | ${candidate.lastUpdated} |

Changed:
- ${candidate.summary || '팀 공유용 요약을 작성해야 합니다.'}

Decision needed:
- Notion에 이 초안을 발행할지 승인해야 합니다.

Blocker:
- 전용 Notion DB가 아직 없으면 \`${candidate.target.fallback}\`로 먼저 발행합니다.

Next:
${next}
<!-- /notion-publish -->`;
}

function queueTemplate() {
  return `---
type: notion-publish-queue
status: active
last_updated: ${TODAY}
---

# Notion Publish Queue

Obsidian 원본에서 Notion으로 보낼 팀 공유 초안을 모은다.

## Draft Queue

## Rules

- Obsidian이 원본이고 Notion은 팀 공유용 정리본이다.
- 승인 전에는 Notion에 쓰지 않는다.
- Identity, raw prompts, secrets는 발행하지 않는다.
- Notion 행/페이지는 자동 삭제하지 않는다.

## Navigation

- [[09_Automations/Notion Sync|Notion Sync]]
- [[09_Automations/Notion Workspace Plan|Notion Workspace Plan]]
- [[03_Operation/Team Sharing Workflow|Team Sharing Workflow]]
- [[01_Command Center/Work Ledger|Work Ledger]]
`;
}

function updateFrontmatter(content, updates) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return content;

  let frontmatter = match[1];
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}: ${value}`;
    const re = new RegExp(`^${key}:.*$`, 'm');
    frontmatter = re.test(frontmatter) ? frontmatter.replace(re, line) : `${frontmatter}\n${line}`;
  }

  return `---\n${frontmatter}\n---${content.slice(match[0].length)}`;
}

function upsertCandidate(content, candidate) {
  const block = candidateBlock(candidate);
  const re = new RegExp(`<!-- notion-publish\\nid: ${escapeRegExp(candidate.id)}[\\s\\S]*?<!-- /notion-publish -->`);
  if (re.test(content)) return content.replace(re, block);

  const heading = '## Draft Queue';
  const index = content.indexOf(heading);
  if (index < 0) return `${content.trimEnd()}\n\n## Draft Queue\n\n${block}\n`;

  const insertAt = index + heading.length;
  return `${content.slice(0, insertAt)}\n\n${block}${content.slice(insertAt)}`;
}

function queueNotionPublish(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  const sourceRel = options.sourceRel || DEFAULT_SOURCE_REL;
  const apply = Boolean(options.apply);
  const candidate = buildCandidate(root, sourceRel);

  if (!apply) return { candidate, queueRel: QUEUE_REL };

  const queuePath = path.join(root, QUEUE_REL);
  fs.mkdirSync(path.dirname(queuePath), { recursive: true });
  const current = fs.existsSync(queuePath) ? fs.readFileSync(queuePath, 'utf8') : queueTemplate();
  const updated = upsertCandidate(updateFrontmatter(current, { last_updated: TODAY }), candidate);
  fs.writeFileSync(queuePath, `${updated.trimEnd()}\n`, 'utf8');
  return { candidate, queueRel: QUEUE_REL };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const result = queueNotionPublish({ apply: args.apply, sourceRel: args.sourceRel });
  const target = result.candidate.target;
  console.log(`${result.candidate.title} -> ${target.name} (${target.status})`);
  if (args.dryRun) console.log('Dry run only. Use --apply to update Notion Publish Queue.');
}

if (require.main === module) main();

module.exports = {
  buildCandidate,
  queueNotionPublish,
};
