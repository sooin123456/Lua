#!/usr/bin/env node

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_TARGET_ROOT = path.join(os.homedir(), 'Documents', 'Obsidian Vault');

const ROOT_ENTRIES = [
  '00_Lua',
  '90_System',
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'Lua End-to-End Flow.md',
  'Lua-v4-operating-architecture.md',
];

const BLOCKED_NAMES = new Set([
  '.env',
  '.git',
  '.lua_agent',
  '.obsidian',
  '.pytest_cache',
  '.venv',
  '__pycache__',
  'node_modules',
]);

const DEFAULT_IGNORE_FILTERS = [
  '90_System/',
  'node_modules/',
  '.git/',
  '.github/',
  '.claude-plugin/',
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'Lua End-to-End Flow.md',
  'Lua-v4-operating-architecture.md',
  'package.json',
  'package-lock.json',
  'Obsidian Vault.code-workspace',
  '.gitignore',
];

function normalizeRel(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function isBlocked(relativePath) {
  const parts = normalizeRel(relativePath).split('/');
  return parts.some((part) => {
    if (BLOCKED_NAMES.has(part)) return true;
    return /^99_Previous_Obsidian_Root_/.test(part);
  });
}

function walkFiles(root, base = root) {
  if (!fs.existsSync(root)) return [];

  const stat = fs.statSync(root);
  if (stat.isFile()) {
    const relativePath = normalizeRel(path.relative(base, root));
    return isBlocked(relativePath) ? [] : [relativePath];
  }

  const files = [];
  for (const entry of fs.readdirSync(root).sort()) {
    const absolutePath = path.join(root, entry);
    const relativePath = normalizeRel(path.relative(base, absolutePath));
    if (isBlocked(relativePath)) continue;

    const entryStat = fs.statSync(absolutePath);
    if (entryStat.isDirectory()) {
      files.push(...walkFiles(absolutePath, base));
    } else if (entryStat.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

function planSync({ sourceRoot = REPO_ROOT, targetRoot = DEFAULT_TARGET_ROOT } = {}) {
  const copyFiles = [];
  const missing = [];

  for (const entry of ROOT_ENTRIES) {
    const sourcePath = path.join(sourceRoot, entry);
    if (!fs.existsSync(sourcePath)) {
      missing.push(entry);
      continue;
    }

    const stat = fs.statSync(sourcePath);
    if (stat.isFile()) {
      if (!isBlocked(entry)) {
        copyFiles.push({
          relativePath: normalizeRel(entry),
          sourcePath,
          targetPath: path.join(targetRoot, entry),
        });
      }
      continue;
    }

    for (const relativePath of walkFiles(sourcePath, sourceRoot)) {
      copyFiles.push({
        relativePath,
        sourcePath: path.join(sourceRoot, relativePath),
        targetPath: path.join(targetRoot, relativePath),
      });
    }
  }

  return { sourceRoot, targetRoot, copyFiles, missing };
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mergeIgnoreFilters(appJson, filters = DEFAULT_IGNORE_FILTERS) {
  const existing = Array.isArray(appJson.userIgnoreFilters)
    ? appJson.userIgnoreFilters
    : [];
  return {
    ...appJson,
    userIgnoreFilters: Array.from(new Set([...existing, ...filters])),
  };
}

function updateObsidianAppJson(targetRoot, apply) {
  const appJsonPath = path.join(targetRoot, '.obsidian', 'app.json');
  const existing = readJsonIfExists(appJsonPath);
  const next = mergeIgnoreFilters(existing);

  if (apply) {
    fs.mkdirSync(path.dirname(appJsonPath), { recursive: true });
    fs.writeFileSync(appJsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  }

  return {
    path: appJsonPath,
    addedFilters: DEFAULT_IGNORE_FILTERS.filter(
      (filter) => !Array.isArray(existing.userIgnoreFilters) || !existing.userIgnoreFilters.includes(filter),
    ),
  };
}

function syncObsidianVault({
  sourceRoot = REPO_ROOT,
  targetRoot = DEFAULT_TARGET_ROOT,
  apply = false,
} = {}) {
  const plan = planSync({ sourceRoot, targetRoot });

  if (apply) {
    fs.mkdirSync(targetRoot, { recursive: true });
    for (const file of plan.copyFiles) {
      fs.mkdirSync(path.dirname(file.targetPath), { recursive: true });
      fs.copyFileSync(file.sourcePath, file.targetPath);
    }
  }

  const appJson = updateObsidianAppJson(targetRoot, apply);

  return {
    mode: apply ? 'apply' : 'dry-run',
    sourceRoot,
    targetRoot,
    copyFiles: plan.copyFiles,
    missing: plan.missing,
    appJson,
  };
}

function parseArgs(argv) {
  const options = { apply: false, targetRoot: DEFAULT_TARGET_ROOT, sourceRoot: REPO_ROOT };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--dry-run') {
      options.apply = false;
    } else if (arg === '--target') {
      options.targetRoot = path.resolve(argv[index + 1]);
      index += 1;
    } else if (arg === '--source') {
      options.sourceRoot = path.resolve(argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printReport(result) {
  console.log(`Lua Obsidian sync (${result.mode})`);
  console.log(`Source: ${result.sourceRoot}`);
  console.log(`Target: ${result.targetRoot}`);
  console.log(`Files: ${result.copyFiles.length}`);
  if (result.missing.length > 0) {
    console.log(`Missing optional entries: ${result.missing.join(', ')}`);
  }
  if (result.copyFiles.length > 0) {
    console.log('Sample:');
    for (const file of result.copyFiles.slice(0, 10)) {
      console.log(`  - ${file.relativePath}`);
    }
  }
  console.log(`Ignore filters added: ${result.appJson.addedFilters.length}`);
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = syncObsidianVault(options);
    printReport(result);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  DEFAULT_IGNORE_FILTERS,
  DEFAULT_TARGET_ROOT,
  ROOT_ENTRIES,
  isBlocked,
  mergeIgnoreFilters,
  planSync,
  syncObsidianVault,
};
