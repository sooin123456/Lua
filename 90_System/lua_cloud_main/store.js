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

  function baseTableUrl(table) {
    return `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`;
  }

  async function request(table, options = {}) {
    if (!configured) return { ok: false, skipped: true, reason: 'supabase_not_configured' };
    const response = await fetchImpl(`${baseTableUrl(table)}${options.query || ''}`, {
      method: options.method || 'GET',
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...(options.prefer ? { prefer: options.prefer } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
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
    if (options.json === false) return { ok: true };
    const text = await response.text();
    return { ok: true, data: text ? JSON.parse(text) : null };
  }

  async function insert(table, payload) {
    return request(table, {
      method: 'POST',
      body: payload,
      prefer: 'return=minimal',
      json: false,
    });
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

    async listQueuedCommands(limit = 10) {
      const localQueued = state.commands.filter((command) => !command.status || command.status === 'queued');
      if (!configured) return localQueued.slice(0, limit);

      const result = await request('lua_commands', {
        query: `?select=*&or=(status.is.null,status.eq.queued)&order=id.asc&limit=${Number(limit) || 10}`,
      });
      if (!result.ok) return [];
      return result.data || [];
    },

    async updateCommand(id, patch) {
      const local = state.commands.find((command) => String(command.id || command.updateId) === String(id));
      if (local) Object.assign(local, patch);
      if (!configured) return { ok: true, localOnly: true };

      return request('lua_commands', {
        method: 'PATCH',
        query: `?id=eq.${encodeURIComponent(id)}`,
        body: patch,
        prefer: 'return=minimal',
        json: false,
      });
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
