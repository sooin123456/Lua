const { buildReply, buildStatusText, normalizeTelegramUpdate } = require('./command');
const { createCodexHandoff, getLatestTodo, runCodexHandoff } = require('./codex_handoff');
const { buildCommandResult, processCommand, processQueuedCommands } = require('./processor');
const { validateCloudEnv } = require('./config');
const { createServer, shouldStartProcessorLoop, start, startProcessorLoop } = require('./server');
const { createMemoryStore } = require('./store');
const { buildApprovalReply, commandForPlainText, routeCommand } = require('./router');

module.exports = {
  buildReply,
  buildApprovalReply,
  buildCommandResult,
  buildStatusText,
  commandForPlainText,
  createCodexHandoff,
  createMemoryStore,
  createServer,
  getLatestTodo,
  normalizeTelegramUpdate,
  processCommand,
  processQueuedCommands,
  runCodexHandoff,
  routeCommand,
  shouldStartProcessorLoop,
  start,
  startProcessorLoop,
  validateCloudEnv,
};
