const DEFAULT_LOCAL_MODEL = 'hf.co/google/gemma-4-12B-it-qat-q4_0-gguf:Q4_0';
const DEFAULT_LOCAL_MODEL_URL = 'http://127.0.0.1:11434';

function localModelConfig(env = {}) {
  return {
    enabled: env.LUA_LOCAL_MODEL_ENABLED === 'true',
    model: env.LUA_LOCAL_MODEL || DEFAULT_LOCAL_MODEL,
    url: String(env.LUA_LOCAL_MODEL_URL || DEFAULT_LOCAL_MODEL_URL).replace(/\/$/, ''),
  };
}

async function ollamaRequest(pathname, options = {}) {
  const config = localModelConfig(options.env);
  const response = await (options.fetchImpl || fetch)(`${config.url}${pathname}`, {
    ...options.request,
    signal: options.signal || AbortSignal.timeout(options.timeoutMs || 10_000),
  });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
  if (!response.ok) throw new Error(body.error || response.statusText || `Ollama request failed: ${response.status}`);
  return body;
}

async function checkLocalModelAvailability(options = {}) {
  const config = localModelConfig(options.env);
  if (!config.enabled) return { configured: false, installed: false, available: false, model: config.model };
  try {
    const body = await ollamaRequest('/api/tags', { ...options, timeoutMs: 3_000 });
    const installed = Array.isArray(body.models) && body.models.some((item) => item.name === config.model);
    return { configured: true, installed, available: installed, model: config.model };
  } catch (error) {
    return { configured: true, installed: false, available: false, model: config.model, error: error.message };
  }
}

async function runLocalTask(task, options = {}) {
  const config = localModelConfig(options.env);
  if (!config.enabled) throw new Error('Lua Fast local model is not enabled on this worker.');
  const body = await ollamaRequest('/api/chat', {
    ...options,
    timeoutMs: options.timeoutMs || 90_000,
    request: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        stream: false,
        think: false,
        keep_alive: '20m',
        options: { num_ctx: 8192, num_predict: 420, temperature: 0.2 },
        messages: [
          {
            role: 'system',
            content: 'You are Lua Fast, a concise Korean personal assistant. Answer directly in Korean. Do not reveal hidden reasoning. Do not claim to access private data or complete external actions. If the request needs research, code changes, sensitive decisions, or lengthy analysis, say that Claude or Codex is more suitable.',
          },
          { role: 'user', content: String(task.payload || task.text || '') },
        ],
      }),
    },
  });
  const result = String(body.message?.content || '').trim();
  if (!result) throw new Error('Lua Fast returned an empty response.');
  return result;
}

module.exports = {
  DEFAULT_LOCAL_MODEL,
  DEFAULT_LOCAL_MODEL_URL,
  checkLocalModelAvailability,
  localModelConfig,
  runLocalTask,
};
