const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_CONTEXT_DIRS = [
  '00_Lua/01_Commands',
  '00_Lua/03_Records',
  '90_System/80_Lua_Details/01_Command Center',
  '90_System/80_Lua_Details/02_Projects',
  '90_System/80_Lua_Details/03_Operation',
];

const EXCLUDED_SEGMENTS = new Set(['.git', 'node_modules', '_System', 'Identity']);
const STOP_WORDS = new Set(['그리고', '그것', '이것', '저것', '관련', '대해', '해줘', '해주세요', 'what', 'with', 'this', 'that', 'from', 'about', 'please']);

function toTerms(query) {
  return [...new Set(String(query || '')
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/gi, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term)))];
}

function isAllowedRelativePath(relativePath) {
  return relativePath
    .split(path.sep)
    .filter(Boolean)
    .every((segment) => !EXCLUDED_SEGMENTS.has(segment));
}

async function listMarkdownFiles(root, relativeDir, files = []) {
  if (!isAllowedRelativePath(relativeDir)) return files;
  const directory = path.join(root, relativeDir);
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (!isAllowedRelativePath(relativePath)) continue;
    if (entry.isDirectory()) await listMarkdownFiles(root, relativePath, files);
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(relativePath);
  }
  return files;
}

function excerpt(text, terms, maxChars) {
  const compact = String(text || '').replace(/\r/g, '');
  const lower = compact.toLowerCase();
  const indexes = terms.map((term) => lower.indexOf(term)).filter((index) => index >= 0);
  const start = Math.max(0, (indexes.length ? Math.min(...indexes) : 0) - 280);
  return compact.slice(start, start + maxChars).replace(/\s+/g, ' ').trim();
}

async function searchVaultContext(options = {}) {
  const root = options.root || process.cwd();
  const terms = toTerms(options.query);
  if (!terms.length) return [];
  const directories = Array.isArray(options.directories) && options.directories.length
    ? options.directories
    : DEFAULT_CONTEXT_DIRS;
  const files = (await Promise.all(directories.map((dir) => listMarkdownFiles(root, dir)))).flat();
  const maxResults = Math.min(Math.max(Number(options.limit) || 3, 1), 5);
  const maxChars = Math.min(Math.max(Number(options.maxChars) || 900, 200), 1_500);
  const matches = [];

  for (const relativePath of files) {
    const text = await fs.readFile(path.join(root, relativePath), 'utf8');
    const lower = text.toLowerCase();
    const score = terms.reduce((total, term) => total + (lower.includes(term) ? 1 : 0), 0);
    if (score) matches.push({ path: relativePath, score, excerpt: excerpt(text, terms, maxChars) });
  }

  return matches
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, maxResults);
}

module.exports = {
  DEFAULT_CONTEXT_DIRS,
  isAllowedRelativePath,
  searchVaultContext,
  toTerms,
};
