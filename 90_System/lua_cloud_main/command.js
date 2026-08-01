const { parseCommand } = require('../scripts/telegram_command_inbox');
const { commandForPlainText, routeCommand } = require('./router');

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

  const parsed = text.startsWith('/lua')
    ? parseCommand(text)
    : commandForPlainText(text);
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
  return [
    'Lua status',
    `runtime: ${deploymentTarget === 'railway' ? 'Railway' : deploymentTarget}`,
    `commands: ${commandCount}`,
    `memories: ${memoryCount}`,
    'next: Cloud Main is ready to route Telegram commands into durable work.',
  ].join('\n');
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
