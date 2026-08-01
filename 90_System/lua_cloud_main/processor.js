const { buildStatusText } = require('./command');
const { createMemoryStore } = require('./store');

function compactText(value, fallback = '') {
  return String(value || fallback).replace(/\s+/g, ' ').trim();
}

function buildCommandResult(command, snapshot = {}, env = {}) {
  if (command.agent === 'status') {
    return buildStatusText({
      commandCount: Number(snapshot.commandCount ?? snapshot.commands?.length ?? 0),
      memoryCount: Number(snapshot.memoryCount ?? snapshot.memories?.length ?? 0),
      deploymentTarget: env.LUA_DEPLOYMENT_TARGET || 'railway',
    });
  }

  if (command.agent === 'todo') {
    const todo = compactText(command.payload || command.intent || command.text, 'empty todo');
    return [
      `Todo captured: ${todo}`,
      'Next: send /lua next when you want Lua to pick the next action from stored todos.',
    ].join('\n');
  }

  if (command.agent === 'remember') {
    return `Lua memory recorded: ${command.payload || command.text || 'empty memory'}`;
  }

  if (command.agent === 'next') {
    const todos = Array.isArray(snapshot.todos) ? snapshot.todos : [];
    const recentCommands = Array.isArray(snapshot.recentCommands) ? snapshot.recentCommands : [];
    const latestTodo = todos.find((todo) => compactText(todo.payload));
    const latestCommand = recentCommands.find((item) => item.agent !== 'next');

    if (latestTodo) {
      return [
        'Lua next',
        `Recommended: ${compactText(latestTodo.payload)}`,
        `Source: todo #${latestTodo.id || 'local'}`,
        'Action: ask Codex to execute it, or send /lua todo :: ... to add a sharper next action.',
      ].join('\n');
    }

    if (latestCommand) {
      return [
        'Lua next',
        `Recommended: continue from ${latestCommand.command || latestCommand.agent}`,
        `Context: ${compactText(latestCommand.payload || latestCommand.result, 'recent Lua command')}`,
        'Action: add a concrete /lua todo if this should become the next work item.',
      ].join('\n');
    }

    return [
      'Lua next',
      'Recommended: add one concrete todo.',
      'Example: /lua todo :: Toss miniapp QA flow 확인',
    ].join('\n');
  }

  return `Queued for manual routing: ${command.command}${command.payload ? ` :: ${command.payload}` : ''}`;
}

async function processCommand(command, options = {}) {
  const store = options.store;
  const env = options.env || process.env;
  if (!store) throw new Error('processCommand requires a store.');
  const commandId = command.id ?? command.updateId;

  try {
    await store.updateCommand(commandId, { status: 'processing' });
    const snapshot = store.getCommandContext
      ? await store.getCommandContext()
      : store.getStats
        ? await store.getStats()
        : store.snapshot
          ? store.snapshot()
          : {};
    const result = buildCommandResult(command, snapshot, env);
    await store.updateCommand(commandId, {
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
