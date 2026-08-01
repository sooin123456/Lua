const { buildReply, buildStatusText, normalizeTelegramUpdate } = require('./command');
const { createCodexHandoff, getLatestTodo, runCodexHandoff } = require('./codex_handoff');
const { buildCommandResult, processCommand, processQueuedCommands } = require('./processor');
const { validateCloudEnv } = require('./config');
const { createServer, shouldStartProcessorLoop, start, startProcessorLoop } = require('./server');
const { createMemoryStore } = require('./store');
const { buildApprovalReply, commandForPlainText, routeCommand } = require('./router');
const { askClaude, buildClaudeSystemPrompt, claudeIsConfigured, extractClaudeText } = require('./claude');
const { DEFAULT_CONTEXT_DIRS, isAllowedRelativePath, searchVaultContext, toTerms } = require('./vault_context');
const { buildDailyBrief, buildWeeklyReview, parseReminderInput, runProactiveCheck } = require('./proactive');

module.exports = {
  buildReply,
  askClaude,
  buildClaudeSystemPrompt,
  buildApprovalReply,
  buildCommandResult,
  buildDailyBrief,
  buildStatusText,
  buildWeeklyReview,
  commandForPlainText,
  claudeIsConfigured,
  createCodexHandoff,
  createMemoryStore,
  createServer,
  DEFAULT_CONTEXT_DIRS,
  extractClaudeText,
  getLatestTodo,
  normalizeTelegramUpdate,
  processCommand,
  processQueuedCommands,
  parseReminderInput,
  runCodexHandoff,
  routeCommand,
  runProactiveCheck,
  isAllowedRelativePath,
  searchVaultContext,
  shouldStartProcessorLoop,
  start,
  startProcessorLoop,
  validateCloudEnv,
  toTerms,
};
