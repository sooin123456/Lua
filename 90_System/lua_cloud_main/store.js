function createMemoryStore(options = {}) {
  const crypto = require('node:crypto');
  const state = {
    commands: [],
    memories: [],
    logs: [],
    warnings: [],
    workerPairs: [],
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
    if (typeof response.text === 'function') {
      const text = await response.text();
      return { ok: true, data: text ? JSON.parse(text) : null };
    }
    if (typeof response.json === 'function') {
      return { ok: true, data: await response.json() };
    }
    return { ok: true, data: null };
  }

  async function insert(table, payload) {
    return request(table, {
      method: 'POST',
      body: payload,
      prefer: 'return=minimal',
      json: false,
    });
  }

  function hashSecret(value) {
    return crypto.createHash('sha256').update(String(value || '')).digest('hex');
  }

  function newPairCode() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  function newWorkerToken() {
    return `lua_worker_${crypto.randomBytes(32).toString('base64url')}`;
  }

  return {
    async createWorkerPair(chatId, now = new Date()) {
      const code = newPairCode();
      const pair = {
        chatId: String(chatId),
        pairCodeHash: hashSecret(code),
        createdAt: now.toISOString(),
        pairExpiresAt: new Date(now.getTime() + 10 * 60_000).toISOString(),
      };
      state.workerPairs.push(pair);
      if (configured) await insert('lua_worker_pairs', pair);
      return { code, expiresAt: pair.pairExpiresAt };
    },

    async exchangeWorkerPair(code, workerId, now = new Date()) {
      const pairCodeHash = hashSecret(code);
      let pair = state.workerPairs.find((item) => item.pairCodeHash === pairCodeHash && !item.pairedAt);
      if (configured) {
        const result = await request('lua_worker_pairs', {
          query: `?select=*&pairCodeHash=eq.${pairCodeHash}&pairedAt=is.null&limit=1`,
        });
        pair = result.ok && Array.isArray(result.data) ? result.data[0] || null : null;
      }
      if (!pair || new Date(pair.pairExpiresAt).getTime() <= now.getTime()) return null;
      const token = newWorkerToken();
      const patch = {
        workerTokenHash: hashSecret(token),
        workerId: String(workerId || 'mac-worker').slice(0, 120),
        pairedAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
      };
      Object.assign(pair, patch);
      if (configured) {
        await request('lua_worker_pairs', {
          method: 'PATCH',
          query: `?id=eq.${pair.id}`,
          body: patch,
          prefer: 'return=minimal',
          json: false,
        });
      }
      return { token, chatId: pair.chatId };
    },

    async authorizeWorker(token, now = new Date()) {
      const workerTokenHash = hashSecret(token);
      let pair = state.workerPairs.find((item) => item.workerTokenHash === workerTokenHash && !item.revokedAt);
      if (configured) {
        const result = await request('lua_worker_pairs', {
          query: `?select=id,chatId,workerId,revokedAt&workerTokenHash=eq.${workerTokenHash}&revokedAt=is.null&limit=1`,
        });
        pair = result.ok && Array.isArray(result.data) ? result.data[0] || null : null;
      }
      if (!pair) return null;
      const patch = { lastSeenAt: now.toISOString() };
      Object.assign(pair, patch);
      if (configured) {
        await request('lua_worker_pairs', {
          method: 'PATCH',
          query: `?id=eq.${pair.id}`,
          body: patch,
          prefer: 'return=minimal',
          json: false,
        });
      }
      return pair;
    },

    async claimNextAgentTask(agents, workerId, now = new Date()) {
      const allowedAgents = Array.isArray(agents) ? agents.filter((agent) => ['claude', 'codex'].includes(agent)) : [];
      if (!allowedAgents.length) return null;
      let task = state.commands.find((command) => command.status === 'awaiting_agent' && allowedAgents.includes(command.routeAgent));
      if (configured) {
        const result = await request('lua_commands', {
          query: `?select=*&status=eq.awaiting_agent&routeAgent=in.(${allowedAgents.join(',')})&order=id.asc&limit=1`,
        });
        task = result.ok && Array.isArray(result.data) ? result.data[0] || null : null;
      }
      if (!task) return null;
      const patch = { status: 'running', workerId: String(workerId || 'mac-worker').slice(0, 120), startedAt: now.toISOString() };
      Object.assign(task, patch);
      if (configured) {
        const claimed = await request('lua_commands', {
          method: 'PATCH',
          query: `?id=eq.${task.id}&status=eq.awaiting_agent`,
          body: patch,
          prefer: 'return=representation',
        });
        if (!claimed.ok || !Array.isArray(claimed.data) || !claimed.data[0]) return null;
        task = claimed.data[0];
      }
      return task;
    },

    async completeAgentTask(id, outcome, now = new Date()) {
      const patch = {
        status: outcome.ok ? 'done' : 'failed',
        result: String(outcome.result || outcome.error || '').slice(0, 100_000),
        processedAt: now.toISOString(),
      };
      const task = await this.getCommand(id);
      await this.updateCommand(id, patch);
      return task ? { ...task, ...patch } : null;
    },
    async saveCommand(command) {
      state.commands.push(command);
      const result = await request('lua_commands', {
        method: 'POST',
        body: command,
        prefer: 'return=representation',
      });
      if (result.ok && Array.isArray(result.data) && result.data[0]) {
        Object.assign(command, result.data[0]);
      }
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

    async getCommand(id) {
      const local = state.commands.find((command) => String(command.id || command.updateId) === String(id));
      if (!configured) return local || null;
      const result = await request('lua_commands', {
        query: `?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
      });
      return result.ok && Array.isArray(result.data) ? result.data[0] || null : null;
    },

    async getStats() {
      if (!configured) {
        return {
          commandCount: state.commands.length,
          memoryCount: state.memories.length,
          logCount: state.logs.length,
        };
      }

      const [commands, memories, logs] = await Promise.all([
        request('lua_commands', { query: '?select=id' }),
        request('lua_memories', { query: '?select=id' }),
        request('lua_logs', { query: '?select=id' }),
      ]);

      return {
        commandCount: commands.ok && Array.isArray(commands.data) ? commands.data.length : 0,
        memoryCount: memories.ok && Array.isArray(memories.data) ? memories.data.length : 0,
        logCount: logs.ok && Array.isArray(logs.data) ? logs.data.length : 0,
      };
    },

    async getRuntimeStatus(chatId) {
      if (!configured) {
        const worker = [...state.workerPairs]
          .filter((pair) => String(pair.chatId) === String(chatId) && pair.pairedAt && !pair.revokedAt)
          .sort((a, b) => String(b.pairedAt).localeCompare(String(a.pairedAt)))[0] || null;
        const active = state.commands.filter((command) => ['awaiting_agent', 'running'].includes(command.status));
        return {
          supabaseConnected: false,
          worker,
          queue: {
            waiting: active.filter((command) => command.status === 'awaiting_agent').length,
            running: active.filter((command) => command.status === 'running').length,
          },
        };
      }

      const encodedChatId = encodeURIComponent(String(chatId || ''));
      const [workerResult, waitingResult, runningResult] = await Promise.all([
        request('lua_worker_pairs', {
          query: `?select=workerId,pairedAt,lastSeenAt,revokedAt&chatId=eq.${encodedChatId}&pairedAt=not.is.null&revokedAt=is.null&order=pairedAt.desc&limit=1`,
        }),
        request('lua_commands', { query: '?select=id&status=eq.awaiting_agent' }),
        request('lua_commands', { query: '?select=id&status=eq.running' }),
      ]);
      return {
        supabaseConnected: workerResult.ok && waitingResult.ok && runningResult.ok,
        worker: workerResult.ok && Array.isArray(workerResult.data) ? workerResult.data[0] || null : null,
        queue: {
          waiting: waitingResult.ok && Array.isArray(waitingResult.data) ? waitingResult.data.length : 0,
          running: runningResult.ok && Array.isArray(runningResult.data) ? runningResult.data.length : 0,
        },
      };
    },

    async getCommandContext(limit = 5) {
      const count = Number(limit) || 5;
      const stats = await this.getStats();
      if (!configured) {
        const recentCommands = [...state.commands].slice(-count).reverse();
        const todos = recentCommands.filter((command) => command.agent === 'todo');
        const memories = [...state.memories].slice(-count).reverse();
        const tasks = recentCommands.filter((command) => ['awaiting_approval', 'awaiting_agent', 'running'].includes(command.status));
        return { ...stats, recentCommands, todos, memories, tasks };
      }

      const [recentCommands, todos, memories] = await Promise.all([
        request('lua_commands', {
          query: `?select=id,agent,command,payload,status,result,createdAt&order=id.desc&limit=${count}`,
        }),
        request('lua_commands', {
          query: `?select=id,agent,command,payload,status,result,createdAt&agent=eq.todo&order=id.desc&limit=${count}`,
        }),
        request('lua_memories', {
          query: `?select=id,text,createdAt&order=id.desc&limit=${count}`,
        }),
      ]);

      return {
        ...stats,
        recentCommands: recentCommands.ok && Array.isArray(recentCommands.data) ? recentCommands.data : [],
        tasks: recentCommands.ok && Array.isArray(recentCommands.data)
          ? recentCommands.data.filter((command) => ['awaiting_approval', 'awaiting_agent', 'running'].includes(command.status))
          : [],
        todos: todos.ok && Array.isArray(todos.data) ? todos.data : [],
        memories: memories.ok && Array.isArray(memories.data) ? memories.data : [],
      };
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
