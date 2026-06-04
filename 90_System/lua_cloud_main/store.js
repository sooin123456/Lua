function createMemoryStore(options = {}) {
  const state = {
    commands: [],
    memories: [],
    logs: [],
    warnings: [],
  };
  const fetchImpl = options.fetchImpl || fetch;
  const supabaseUrl = options.supabaseUrl || options.env?.SUPABASE_URL || '';
  const serviceRoleKey = options.serviceRoleKey || options.env?.SUPABASE_SERVICE_ROLE_KEY || '';
  const configured = Boolean(supabaseUrl && serviceRoleKey);

  async function insert(table, payload) {
    if (!configured) return { ok: false, skipped: true, reason: 'supabase_not_configured' };
    const response = await fetchImpl(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        'content-type': 'application/json',
        prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      const warning = {
        level: 'warn',
        event: 'supabase_insert_failed',
        table,
        message: text || response.statusText,
        createdAt: new Date().toISOString(),
      };
      state.warnings.push(warning);
      return { ok: false, warning };
    }
    return { ok: true };
  }

  return {
    async saveCommand(command) {
      state.commands.push(command);
      await insert('lua_commands', command);
      return command;
    },

    async saveMemory(command) {
      const memory = {
        source: command.source,
        chatId: command.chatId,
        text: command.payload,
        createdAt: command.receivedAt,
      };
      state.memories.push(memory);
      await insert('lua_memories', memory);
      return memory;
    },

    async saveLog(log) {
      const entry = {
        ...log,
        createdAt: log.createdAt || new Date().toISOString(),
      };
      state.logs.push(entry);
      await insert('lua_logs', entry);
      return entry;
    },

    snapshot() {
      return {
        commands: [...state.commands],
        memories: [...state.memories],
        logs: [...state.logs],
        warnings: [...state.warnings],
      };
    },
  };
}

module.exports = {
  createMemoryStore,
};
