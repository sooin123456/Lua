function createMemoryStore(options = {}) {
  const crypto = require('node:crypto');
  const state = {
    commands: [],
    memories: [],
    logs: [],
    warnings: [],
    workerPairs: [],
    reminders: [],
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
      const allowedAgents = Array.isArray(agents) ? agents.filter((agent) => ['claude', 'codex', 'local'].includes(agent)) : [];
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

    async completeTodo(chatId, target, now = new Date()) {
      const query = String(target || '').trim().toLowerCase();
      if (!query) return { ok: false, reason: 'missing_target' };
      let todos = state.commands.filter((command) => (
        command.agent === 'todo'
        && String(command.chatId) === String(chatId)
        && command.todoState === 'open'
      ));
      if (configured) {
        const result = await request('lua_commands', {
          query: `?select=*&agent=eq.todo&chatId=eq.${encodeURIComponent(String(chatId))}&todoState=eq.open&order=id.desc&limit=20`,
        });
        todos = result.ok && Array.isArray(result.data) ? result.data : [];
      }
      const matches = todos.filter((todo) => String(todo.payload || '').toLowerCase().includes(query));
      if (!matches.length) return { ok: false, reason: 'not_found' };
      const exact = matches.filter((todo) => String(todo.payload || '').trim().toLowerCase() === query);
      const candidates = exact.length ? exact : matches;
      if (candidates.length > 1) return { ok: false, reason: 'ambiguous', matches: candidates.slice(0, 5) };
      const todo = candidates[0];
      const completedAt = now.toISOString();
      const patch = {
        status: 'done',
        todoState: 'completed',
        completedAt,
        processedAt: completedAt,
        result: `Completed Todo\nClassification: Todo\nCompleted at: ${completedAt}\nObsidian record: pending local worker capture.`,
      };
      Object.assign(todo, patch);
      if (configured) {
        const result = await request('lua_commands', {
          method: 'PATCH',
          query: `?id=eq.${todo.id}&todoState=eq.open`,
          body: patch,
          prefer: 'return=representation',
        });
        if (!result.ok || !Array.isArray(result.data) || !result.data[0]) return { ok: false, reason: 'already_completed' };
        return { ok: true, todo: result.data[0] };
      }
      return { ok: true, todo };
    },

    async claimNextRecord(workerId, now = new Date()) {
      const claimedAt = now.toISOString();
      let record = state.commands.find((command) => (
        command.status === 'done'
        && !command.recordedAt
        && !command.recordingAt
        && (command.agent === 'remember'
          || (command.agent === 'todo' && command.todoState === 'completed')
          || ['claude', 'codex', 'local'].includes(command.routeAgent))
      ));
      if (configured) {
        const result = await request('lua_commands', {
          query: '?select=*&status=eq.done&recordedAt=is.null&recordingAt=is.null&or=(agent.eq.remember,routeAgent.eq.claude,routeAgent.eq.codex,routeAgent.eq.local,and(agent.eq.todo,todoState.eq.completed))&order=id.asc&limit=1',
        });
        record = result.ok && Array.isArray(result.data) ? result.data[0] || null : null;
      }
      if (!record) return null;
      const patch = { recordingAt: claimedAt, workerId: String(workerId || 'mac-worker').slice(0, 120) };
      Object.assign(record, patch);
      if (configured) {
        const result = await request('lua_commands', {
          method: 'PATCH',
          query: `?id=eq.${record.id}&recordedAt=is.null&recordingAt=is.null`,
          body: patch,
          prefer: 'return=representation',
        });
        if (!result.ok || !Array.isArray(result.data) || !result.data[0]) return null;
        record = result.data[0];
      }
      return record;
    },

    async completeRecord(id, outcome, now = new Date()) {
      const patch = outcome.ok
        ? { recordedAt: now.toISOString(), recordingAt: null }
        : { recordingAt: null };
      await this.updateCommand(id, patch);
      return this.getCommand(id);
    },
    async createReminder(reminder) {
      const record = {
        chatId: String(reminder.chatId),
        message: String(reminder.message).slice(0, 2_000),
        remindAt: reminder.remindAt,
        status: 'pending',
      };
      state.reminders.push(record);
      const result = await request('lua_reminders', { method: 'POST', body: record, prefer: 'return=representation' });
      if (result.ok && Array.isArray(result.data) && result.data[0]) Object.assign(record, result.data[0]);
      return record;
    },
    async claimDueReminders(chatId, now = new Date(), limit = 3) {
      const max = Math.min(Math.max(Number(limit) || 3, 1), 10);
      let reminders = state.reminders
        .filter((item) => item.status === 'pending' && String(item.chatId) === String(chatId) && new Date(item.remindAt) <= now)
        .slice(0, max);
      if (configured) {
        const result = await request('lua_reminders', {
          query: `?select=*&chatId=eq.${encodeURIComponent(String(chatId))}&status=eq.pending&remindAt=lte.${encodeURIComponent(now.toISOString())}&order=remindAt.asc&limit=${max}`,
        });
        reminders = result.ok && Array.isArray(result.data) ? result.data : [];
      }
      const claimed = [];
      for (const reminder of reminders) {
        const patch = { status: 'sending' };
        if (configured) {
          const result = await request('lua_reminders', {
            method: 'PATCH', query: `?id=eq.${reminder.id}&status=eq.pending`, body: patch, prefer: 'return=representation',
          });
          if (!result.ok || !Array.isArray(result.data) || !result.data[0]) continue;
          claimed.push(result.data[0]);
        } else {
          Object.assign(reminder, patch);
          claimed.push(reminder);
        }
      }
      return claimed;
    },
    async completeReminder(id, outcome, now = new Date()) {
      const patch = outcome.ok
        ? { status: 'sent', sentAt: now.toISOString() }
        : { status: 'pending' };
      const local = state.reminders.find((item) => String(item.id) === String(id));
      if (local) Object.assign(local, patch);
      if (!configured) return local || null;
      const result = await request('lua_reminders', {
        method: 'PATCH', query: `?id=eq.${encodeURIComponent(id)}`, body: patch, prefer: 'return=representation',
      });
      return result.ok && Array.isArray(result.data) ? result.data[0] || null : null;
    },
    async hasLogSince(event, chatId, since) {
      if (!configured) return state.logs.some((item) => item.event === event && String(item.chatId) === String(chatId) && item.createdAt >= since);
      const result = await request('lua_logs', {
        query: `?select=id&event=eq.${encodeURIComponent(event)}&chatId=eq.${encodeURIComponent(String(chatId))}&createdAt=gte.${encodeURIComponent(since)}&limit=1`,
      });
      return Boolean(result.ok && Array.isArray(result.data) && result.data[0]);
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
        const todos = recentCommands.filter((command) => command.agent === 'todo' && command.todoState === 'open');
        const memories = [...state.memories].slice(-count).reverse();
        const tasks = recentCommands.filter((command) => ['awaiting_approval', 'awaiting_agent', 'running'].includes(command.status));
        return { ...stats, recentCommands, todos, memories, tasks };
      }

      const [recentCommands, todos, memories] = await Promise.all([
        request('lua_commands', {
          query: `?select=id,agent,command,payload,status,result,createdAt&order=id.desc&limit=${count}`,
        }),
        request('lua_commands', {
          query: `?select=id,agent,command,payload,status,result,createdAt&agent=eq.todo&todoState=eq.open&order=id.desc&limit=${count}`,
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
        reminders: [...state.reminders],
        warnings: [...state.warnings],
      };
    },
  };
}

module.exports = {
  createMemoryStore,
};
