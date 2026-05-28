const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set(['.git', 'node_modules']);

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function findFiles(root, predicate, options = {}) {
  const results = [];
  const skipDirs = new Set([...SKIP_DIRS, ...(options.skipDirs || [])]);

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && skipDirs.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!predicate || predicate(fullPath)) results.push(fullPath);
    }
  }

  walk(root);
  return results;
}

function relativePosix(root, filePath) {
  return toPosix(path.relative(root, filePath));
}

module.exports = {
  findFiles,
  relativePosix,
  toPosix,
};
