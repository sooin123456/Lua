const { buildReply, buildStatusText, normalizeTelegramUpdate } = require('./command');
const { buildCommandResult, processCommand, processQueuedCommands } = require('./processor');
const { validateCloudEnv } = require('./config');
const { createServer, shouldStartProcessorLoop, start, startProcessorLoop } = require('./server');
const { createMemoryStore } = require('./store');

module.exports = {
  buildReply,
  buildCommandResult,
  buildStatusText,
  createMemoryStore,
  createServer,
  normalizeTelegramUpdate,
  processCommand,
  processQueuedCommands,
  shouldStartProcessorLoop,
  start,
  startProcessorLoop,
  validateCloudEnv,
};
