const { parseCommand } = require('../scripts/telegram_command_inbox');
const { commandForPlainText, isTodoOverviewRequest, routeCommand } = require('./router');

function normalizeTelegramUpdate(update) {
  const callback = update.callback_query || null;
  const message = update.message || update.channel_post || callback?.message || null;
  if (callback && /^(approve|reject):\d+$/.test(callback.data || '')) {
    const [agent, payload] = callback.data.split(':');
    const chat = message?.chat || {};
    const from = callback.from || {};
    return {
      updateId: update.update_id,
      messageId: message?.message_id,
      chatId: String(chat.id),
      userId: from.id ? String(from.id) : String(chat.id),
      username: from.username || '',
      text: `/lua ${agent} :: ${payload}`,
      command: `/lua ${agent}`,
      agent,
      intent: '',
      payload,
      source: 'telegram:webhook',
      receivedAt: new Date().toISOString(),
    };
  }
  const text = message && typeof message.text === 'string' ? message.text.trim() : '';
  if (!text) return null;

  let parsed = text.startsWith('/lua')
    ? parseCommand(text)
    : commandForPlainText(text);
  if (parsed.agent === 'ask' && isTodoOverviewRequest(parsed)) {
    parsed = { command: '/lua next', agent: 'next', intent: '', payload: '' };
  }
  const chat = message.chat || {};
  const from = message.from || {};
  const date = message.date ? new Date(message.date * 1000) : new Date();

  return {
    updateId: update.update_id,
    messageId: message.message_id,
    chatId: String(chat.id),
    userId: from.id ? String(from.id) : String(chat.id),
    username: from.username || '',
    text,
    command: parsed.command,
    agent: parsed.agent,
    intent: parsed.intent,
    payload: parsed.payload,
    source: 'telegram:webhook',
    receivedAt: date.toISOString(),
    ...routeCommand(parsed),
  };
}

function buildStatusText(options = {}) {
  const deploymentTarget = options.deploymentTarget || 'Railway';
  const commandCount = Number(options.commandCount || 0);
  const memoryCount = Number(options.memoryCount || 0);
  const worker = options.worker || null;
  const workerLastSeen = worker?.lastSeenAt ? new Date(worker.lastSeenAt).getTime() : 0;
  const workerOnline = workerLastSeen > 0 && (Date.now() - workerLastSeen) <= 90_000;
  const queue = options.queue || {};
  const lines = [
    'Lua status',
    `Railway: ${deploymentTarget === 'railway' ? 'online' : deploymentTarget}`,
    `Supabase: ${options.supabaseConnected === false ? 'unavailable' : 'connected'}`,
    `Mac Worker: ${worker ? (workerOnline ? 'online' : 'paired, waiting for heartbeat') : 'not paired'}`,
    `queue: ${Number(queue.waiting || 0)} waiting, ${Number(queue.running || 0)} running`,
    `commands: ${commandCount}`,
    `memories: ${memoryCount}`,
    'next: /lua ask for a question, or /lua do for a repository task requiring approval.',
  ];
  if (worker?.workerId) lines.splice(4, 0, `worker: ${worker.workerId}`);
  return lines.join('\n');
}

function buildReply(command, snapshot, env = {}) {
  if (command.agent === 'status') {
    return buildStatusText({
      commandCount: snapshot.commands.length,
      memoryCount: snapshot.memories.length,
      deploymentTarget: env.LUA_DEPLOYMENT_TARGET || 'railway',
    });
  }

  if (command.agent === 'remember') {
    return `Lua remembered: ${command.payload}`;
  }

  return `Lua queued ${command.command}: ${command.payload || command.intent || 'no payload'}`;
}

module.exports = {
  buildReply,
  buildStatusText,
  normalizeTelegramUpdate,
};
