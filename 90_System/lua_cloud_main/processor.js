const { buildStatusText } = require('./command');
const { askClaude, claudeIsConfigured } = require('./claude');
const { buildApprovalReply, routeCommand } = require('./router');
const { parseReminderInput } = require('./proactive');
const { createMemoryStore } = require('./store');

function compactText(value, fallback = '') {
  return String(value || fallback).replace(/\s+/g, ' ').trim();
}

function buildCommandResult(command, snapshot = {}, env = {}) {
  if (command.agent === 'status') {
    const runtime = snapshot.runtime || {};
    return buildStatusText({
      commandCount: Number(snapshot.commandCount ?? snapshot.commands?.length ?? 0),
      memoryCount: Number(snapshot.memoryCount ?? snapshot.memories?.length ?? 0),
      deploymentTarget: env.LUA_DEPLOYMENT_TARGET || 'railway',
      supabaseConnected: runtime.supabaseConnected,
      worker: runtime.worker,
      queue: runtime.queue,
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

  if (command.agent === 'tasks') {
    const tasks = Array.isArray(snapshot.tasks) ? snapshot.tasks : [];
    if (!tasks.length) return 'Lua tasks\nNo work is waiting for approval or an agent.';
    return ['Lua tasks', ...tasks.map((task) => `#${task.id || task.updateId} ${task.routeAgent || task.agent}: ${task.status}`)].join('\n');
  }

  return `Queued for manual routing: ${command.command}${command.payload ? ` :: ${command.payload}` : ''}`;
}

async function resolveApproval(command, options) {
  const store = options.store;
  const targetId = String(command.payload || '').trim();
  if (!/^\d+$/.test(targetId) || !store.getCommand) {
    return { ok: false, error: 'Give Lua a numeric task ID, for example /lua approve :: 12.' };
  }
  const target = await store.getCommand(targetId);
  if (!target || String(target.chatId) !== String(command.chatId)) {
    return { ok: false, error: `Lua could not find task #${targetId}.` };
  }
  if (!['awaiting_approval', 'awaiting_agent'].includes(target.status)) {
    return { ok: false, error: `Task #${targetId} is ${target.status || 'not awaiting approval'}.` };
  }
  if (command.agent === 'reject') {
    await store.updateCommand(targetId, { status: 'rejected', processedAt: new Date().toISOString() });
    return { ok: true, result: `Task #${targetId} rejected. No agent work was started.` };
  }
  await store.updateCommand(targetId, {
    status: 'awaiting_agent',
    approvedAt: new Date().toISOString(),
  });
  return {
    ok: true,
    result: [
      `Task #${targetId} approved for ${target.routeAgent || 'Lua'}.`,
      target.routeAgent === 'codex'
        ? `Next: ask Codex to process task #${targetId}.`
        : target.routeAgent === 'claude'
          ? `Next: ask Claude to process task #${targetId}.`
          : target.routeAgent === 'local'
            ? `Next: Lua Fast will process task #${targetId} on this Mac.`
          : 'Lua will continue the task.',
    ].join('\n'),
  };
}

async function processCommand(command, options = {}) {
  const store = options.store;
  const env = options.env || process.env;
  if (!store) throw new Error('processCommand requires a store.');
  const commandId = command.id ?? command.updateId;

  try {
    if (command.agent === 'pair') {
      if (!store.createWorkerPair) throw new Error('Lua Worker pairing is unavailable.');
      const pairing = await store.createWorkerPair(command.chatId);
      const result = [
        'Lua Mac Worker pairing',
        `Code: ${pairing.code}`,
        'Valid for 10 minutes and usable once.',
        `On the Mac run: npm run cloud:worker:pair -- ${pairing.code}`,
      ].join('\n');
      await store.updateCommand(commandId, {
        status: 'done',
        result: 'Lua Mac Worker pairing code sent to the authorized Telegram chat.',
        processedAt: new Date().toISOString(),
      });
      await store.saveLog({ level: 'info', event: 'lua_worker_pair_requested', command: command.command, chatId: command.chatId });
      return { ok: true, commandId, command: command.command, result };
    }
    if (['approve', 'reject'].includes(command.agent)) {
      const approval = await resolveApproval(command, { store });
      await store.updateCommand(commandId, {
        status: approval.ok ? 'done' : 'failed',
        result: approval.result || approval.error,
        processedAt: new Date().toISOString(),
      });
      return { ...approval, commandId, command: command.command };
    }
    if (command.agent === 'remind') {
      if (!store.createReminder) throw new Error('Lua reminders are unavailable.');
      const reminder = parseReminderInput(command.payload || command.intent || command.text);
      const created = await store.createReminder({ ...reminder, chatId: command.chatId });
      const result = `Reminder set for ${new Date(created.remindAt).toLocaleString('sv-SE', { timeZone: 'Asia/Seoul', hour12: false }).replace(' ', ' ')} KST: ${created.message}`;
      await store.updateCommand(commandId, { status: 'done', result, processedAt: new Date().toISOString() });
      await store.saveLog({ level: 'info', event: 'lua_reminder_created', command: command.command, chatId: command.chatId });
      return { ok: true, commandId, command: command.command, result };
    }
    const route = command.routeAgent ? command : { ...command, ...routeCommand(command) };
    if (route.approval !== 'auto') {
      const approvalReply = buildApprovalReply(route, commandId);
      await store.updateCommand(commandId, {
        status: 'awaiting_approval',
        routeAgent: route.routeAgent,
        approval: route.approval,
        result: approvalReply.text,
      });
      await store.saveLog({ level: 'info', event: 'lua_command_awaiting_approval', command: route.command, chatId: route.chatId });
      return { ok: true, commandId, command: route.command, result: approvalReply.text, replyMarkup: approvalReply.replyMarkup };
    }
    if (route.routeAgent === 'claude' && claudeIsConfigured(env)) {
      await store.updateCommand(commandId, { status: 'processing', routeAgent: 'claude', approval: route.approval });
      const answer = await askClaude(route, { env, fetchImpl: options.fetchImpl, vaultRoot: options.vaultRoot });
      await store.updateCommand(commandId, {
        status: 'done',
        routeAgent: 'claude',
        approval: route.approval,
        result: answer.text,
        processedAt: new Date().toISOString(),
      });
      await store.saveLog({ level: 'info', event: 'lua_claude_completed', command: route.command, chatId: route.chatId });
      return { ok: true, commandId, command: route.command, result: answer.text };
    }
    if (['claude', 'codex', 'local'].includes(route.routeAgent)) {
      const result = [
        `${route.routeAgent === 'codex' ? 'Codex' : route.routeAgent === 'local' ? 'Lua Fast' : 'Claude'} task #${commandId} queued.`,
        `Task: ${compactText(route.payload || route.text, 'empty task')}`,
        `Use /lua tasks to check its status.`,
      ].join('\n');
      await store.updateCommand(commandId, {
        status: 'awaiting_agent',
        routeAgent: route.routeAgent,
        approval: route.approval,
        result,
      });
      await store.saveLog({ level: 'info', event: 'lua_command_routed', command: route.command, chatId: route.chatId });
      return { ok: true, commandId, command: route.command, result };
    }
    await store.updateCommand(commandId, { status: 'processing' });
    const snapshot = store.getCommandContext
      ? await store.getCommandContext()
      : store.getStats
        ? await store.getStats()
        : store.snapshot
          ? store.snapshot()
          : {};
    if (command.agent === 'status' && store.getRuntimeStatus) {
      snapshot.runtime = await store.getRuntimeStatus(command.chatId);
    }
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
