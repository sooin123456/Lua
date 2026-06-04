#!/usr/bin/env node
const { loadDotEnv } = require('./setup');
const { processQueuedCommands } = require('./processor');

function parseArgs(argv) {
  const args = { limit: 10, envFile: '.env' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--limit') {
      args.limit = Number(argv[index + 1] || 10);
      index += 1;
    } else if (arg === '--env-file') {
      args.envFile = argv[index + 1] || '.env';
      index += 1;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadDotEnv(args.envFile);
  const result = await processQueuedCommands({ limit: args.limit });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  parseArgs,
};
