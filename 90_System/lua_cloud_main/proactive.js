const KST_OFFSET_MS = 9 * 60 * 60 * 1_000;

function kstParts(now = new Date()) {
  const shifted = new Date(now.getTime() + KST_OFFSET_MS);
  return {
    date: shifted.toISOString().slice(0, 10),
    hour: shifted.getUTCHours(),
    weekday: shifted.getUTCDay(),
  };
}

function kstDayStart(now = new Date()) {
  const { date } = kstParts(now);
  return new Date(`${date}T00:00:00+09:00`).toISOString();
}

function parseReminderInput(value) {
  const match = String(value || '').trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+(.+)$/);
  if (!match) {
    throw new Error('Use /lua remind :: YYYY-MM-DD HH:mm message (KST), for example /lua remind :: 2026-08-02 09:00 회의 준비.');
  }
  const remindAt = new Date(`${match[1]}T${match[2]}:00+09:00`);
  if (Number.isNaN(remindAt.getTime())) throw new Error('Reminder date or time is invalid.');
  return { remindAt: remindAt.toISOString(), message: match[3].trim() };
}

function buildDailyBrief(snapshot = {}) {
  const todos = Array.isArray(snapshot.todos) ? snapshot.todos.slice(0, 3) : [];
  const tasks = Array.isArray(snapshot.tasks) ? snapshot.tasks.slice(0, 3) : [];
  return [
    'Lua morning brief',
    todos.length ? `Top todos: ${todos.map((item) => item.payload).join(' · ')}` : 'Top todos: none',
    tasks.length ? `Open work: ${tasks.map((item) => `#${item.id} ${item.status}`).join(', ')}` : 'Open work: none',
    'Reply /lua next for the recommended next action, or /lua status for live system health.',
  ].join('\n');
}

function buildWeeklyReview(snapshot = {}) {
  const recent = Array.isArray(snapshot.recentCommands) ? snapshot.recentCommands.slice(0, 5) : [];
  return [
    'Lua weekly review',
    recent.length ? `Recent work: ${recent.map((item) => item.command || item.agent).join(' · ')}` : 'Recent work: none',
    `Stored todos: ${Array.isArray(snapshot.todos) ? snapshot.todos.length : 0}`,
    'Reply /lua ask :: 이번 주를 회고하고 다음 주 우선순위를 제안해줘 for a deeper review.',
  ].join('\n');
}

async function runProactiveCheck(options = {}) {
  const env = options.env || process.env;
  if (env.LUA_PROACTIVE_ENABLED !== 'true') return { ok: true, enabled: false, sent: [] };
  const chatId = String(env.LUA_PROACTIVE_CHAT_ID || String(env.TELEGRAM_ALLOWED_CHAT_IDS || '').split(',')[0] || '').trim();
  if (!chatId || typeof options.sendTelegram !== 'function') return { ok: false, enabled: true, sent: [], reason: 'proactive_chat_or_sender_missing' };
  const store = options.store;
  const now = options.now || new Date();
  const sent = [];
  const due = store.claimDueReminders ? await store.claimDueReminders(chatId, now, 3) : [];
  for (const reminder of due) {
    try {
      await options.sendTelegram(chatId, `Lua reminder\n${reminder.message}`);
      await store.completeReminder(reminder.id, { ok: true }, now);
      sent.push(`reminder:${reminder.id}`);
    } catch (error) {
      await store.completeReminder(reminder.id, { ok: false }, now);
    }
  }

  const { hour, weekday } = kstParts(now);
  const briefHour = Math.min(Math.max(Number(env.LUA_DAILY_BRIEF_HOUR_KST || 8), 0), 23);
  const dayStart = kstDayStart(now);
  if (hour === briefHour && !(await store.hasLogSince?.('lua_daily_brief_sent', chatId, dayStart))) {
    const snapshot = await store.getCommandContext(5);
    await options.sendTelegram(chatId, buildDailyBrief(snapshot));
    await store.saveLog({ level: 'info', event: 'lua_daily_brief_sent', chatId });
    sent.push('daily_brief');
  }
  if (env.LUA_WEEKLY_REVIEW_ENABLED === 'true' && weekday === 1 && hour === briefHour
    && !(await store.hasLogSince?.('lua_weekly_review_sent', chatId, dayStart))) {
    const snapshot = await store.getCommandContext(5);
    await options.sendTelegram(chatId, buildWeeklyReview(snapshot));
    await store.saveLog({ level: 'info', event: 'lua_weekly_review_sent', chatId });
    sent.push('weekly_review');
  }
  return { ok: true, enabled: true, sent };
}

module.exports = {
  buildDailyBrief,
  buildWeeklyReview,
  kstDayStart,
  kstParts,
  parseReminderInput,
  runProactiveCheck,
};
