const { buildStatusText } = require('./command');
const { createMemoryStore } = require('./store');

function buildCommandResult(command, snapshot = {}, env = {}) {
  if (command.agent === 'status') {
    return buildStatusText({
      commandCount: Number(snapshot.commandCount ?? snapshot.commands?.length ?? 0),
      memoryCount: Number(snapshot.memoryCount ?? snapshot.memories?.length ?? 0),
      deploymentTarget: env.LUA_DEPLOYMENT_TARGET || 'railway',
    });
  }

  if (command.agent === 'remember') {
    return `Lua memory recorded: ${command.payload || command.text || 'empty memory'}`;
  }

  if (command.agent === 'next') {
    return 'Next: review queued Lua commands, then route the highest-priority item into Codex or Claude.';
  }

  return `Queued for manual routing: ${command.command}${command.payload ? ` :: ${command.payload}` : ''}`;
}

async function processCommand(command, options = {}) {
  const store = options.store;
  const env = options.env || process.env;
  if (!store) throw new Error('processCommand requires a store.');
  const commandId = command.id ?? command.updateId;

  async function updateOrThrow(patch) {
    const update = await store.updateCommand(commandId, patch);
    if (update && update.ok === false) {
      throw new Error(update.warning?.message || 'Command update failed');
    }
    return update;
  }

  await updateOrThrow({ status: 'processing' });
  try {
    const snapshot = store.snapshot ? store.snapshot() : {};
    const result = buildCommandResult(command, snapshot, env);
    await updateOrThrow({
      status: 'done',
      result,
      processedAt: new Date().toISOString(),
    });
    await store.saveLog({
      level: 'info',
      event: 'lua_command_processed',
      command: command.command,
      chatId: command.chatId,
    });
    return { ok: true, commandId, command: command.command, result };
  } catch (error) {
    await store.updateCommand(commandId, {
      status: 'failed',
      result: error.message,
      processedAt: new Date().toISOString(),
    });
    await store.saveLog({
      level: 'error',
      event: 'lua_command_failed',
      command: command.command,
      chatId: command.chatId,
    });
    return { ok: false, commandId, command: command.command, error: error.message };
  }
}

async function processQueuedCommands(options = {}) {
  const env = options.env || process.env;
  const store = options.store || createMemoryStore({ env, fetchImpl: options.fetchImpl });
  const limit = Number(options.limit || 10);
  const commands = await store.listQueuedCommands(limit);
  const results = [];

  for (const command of commands) {
    results.push(await processCommand(command, { store, env }));
  }

  return {
    ok: results.every((result) => result.ok),
    processed: results.length,
    results,
  };
}

module.exports = {
  buildCommandResult,
  processCommand,
  processQueuedCommands,
};
