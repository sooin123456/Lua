#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_DRAFT_FILE = path.join(ROOT, '03_Operation', 'Team Brief Drafts.md');

function parseArgs(argv) {
  const args = {
    dryRun: false,
    all: false,
    confirmSend: false,
    file: DEFAULT_DRAFT_FILE,
    message: null,
    channel: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--all') args.all = true;
    else if (arg === '--confirm-send') args.confirmSend = true;
    else if (arg === '--file') args.file = path.resolve(ROOT, argv[++i]);
    else if (arg === '--message') args.message = argv[++i];
    else if (arg === '--channel') args.channel = argv[++i];
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/slack_brief.js --dry-run
  node scripts/slack_brief.js --message "hello" --channel "#ai-briefings" --dry-run
  node scripts/slack_brief.js --message "hello" --channel "#ai-briefings" --confirm-send

Draft block format:
  <!-- slack-brief
  channel: #ai-briefings
  status: approved
  title: Weekly update
  -->
  Message text
  <!-- /slack-brief -->
`);
}

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function normalizeChannel(channel) {
  return channel.replace(/^#/, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase();
}

function webhookFor(channel) {
  if (channel) {
    const key = `SLACK_WEBHOOK_${normalizeChannel(channel)}`;
    if (process.env[key]) return { url: process.env[key], key };
  }
  if (process.env.SLACK_WEBHOOK_URL) return { url: process.env.SLACK_WEBHOOK_URL, key: 'SLACK_WEBHOOK_URL' };
  return null;
}

function parseFrontMatter(block) {
  const meta = {};
  for (const line of block.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key) meta[key] = value;
  }
  return meta;
}

function parseDrafts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const re = /<!--\s*slack-brief\s*([\s\S]*?)-->\s*([\s\S]*?)\s*<!--\s*\/slack-brief\s*-->/gi;
  const drafts = [];
  let match;
  while ((match = re.exec(content)) !== null) {
    const meta = parseFrontMatter(match[1]);
    const text = match[2].trim();
    if (!text) continue;
    drafts.push({
      channel: meta.channel || '#ai-briefings',
      status: (meta.status || 'draft').toLowerCase(),
      title: meta.title || 'Untitled brief',
      text,
    });
  }
  return drafts;
}

async function postSlack(webhookUrl, text) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack webhook failed: ${response.status} ${body}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  loadDotEnv();

  let briefs = [];
  if (args.message) {
    briefs.push({
      channel: args.channel || '#ai-briefings',
      status: 'approved',
      title: 'CLI message',
      text: args.message,
    });
  } else {
    briefs = parseDrafts(args.file).filter((draft) => draft.status === 'approved');
    if (!args.all && briefs.length > 1) briefs = briefs.slice(0, 1);
  }

  if (briefs.length === 0) {
    console.log('No approved Slack briefs found.');
    return;
  }

  for (const brief of briefs) {
    const target = webhookFor(brief.channel);
    console.log(`\n=== Slack brief: ${brief.title} -> ${brief.channel} ===`);
    console.log(brief.text);
    if (args.dryRun) {
      console.log('\nDry run only. No Slack message sent.');
      continue;
    }
    if (!args.confirmSend) {
      throw new Error('Refusing to send without --confirm-send. Slack is an online command.');
    }
    if (!target) {
      throw new Error(`Missing webhook for ${brief.channel}. Set SLACK_WEBHOOK_${normalizeChannel(brief.channel)} or SLACK_WEBHOOK_URL in .env.`);
    }
    await postSlack(target.url, brief.text);
    console.log(`Sent via ${target.key}.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
