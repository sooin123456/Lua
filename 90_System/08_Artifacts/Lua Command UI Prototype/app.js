const DOMAINS = {
  planning: {
    label: '우선순위/결정',
    agent: 'Atlas',
    output: 'Decision or priority draft',
    intents: ['prioritize', 'validate', 'decide'],
  },
  design: {
    label: '화면/흐름',
    agent: 'Scribe+Forge',
    output: 'Screen or service flow draft',
    intents: ['screen', 'flow', 'prototype'],
  },
  build: {
    label: '만들기',
    agent: 'Forge',
    output: 'MVP plan and build task',
    intents: ['app', 'automation', 'script'],
  },
  research: {
    label: '조사',
    agent: 'Lens',
    output: 'Research note with sources',
    intents: ['brief', 'compare', 'source-check'],
  },
  marketing: {
    label: '공유/콘텐츠',
    agent: 'Scribe',
    output: 'Team/customer brief draft',
    intents: ['brief', 'message', 'campaign'],
  },
  ops: {
    label: '정리/검사',
    agent: 'Vault',
    output: 'Vault/system operation result',
    intents: ['cleanup', 'audit', 'sync'],
  },
};

const DEFAULT_PAYLOAD = '토스 미니앱처럼 내 명령 체계를 UI로 표현하는 첫 화면을 설계해줘';

function routeFor(domain) {
  const config = DOMAINS[domain] || DOMAINS.planning;
  return {
    agent: config.agent,
    stage: 'clarify',
    output: config.output,
  };
}

function sanitizePayload(payload) {
  return String(payload || '').replace(/\s+/g, ' ').trim();
}

function buildCommand({ domain, intent, payload }) {
  return `/lua ${domain} ${intent} :: ${sanitizePayload(payload)}`;
}

function buildDraftRow({ id, domain, intent, payload }) {
  const route = routeFor(domain);
  const safePayload = sanitizePayload(payload).replace(/\|/g, '\\|');
  return `| ${id} | ${domain} | ${intent} | ${safePayload} | ${route.stage} | ${route.agent} | queued | from Lua Command UI |`;
}

function canWriteToQueue(locationLike = window.location) {
  return locationLike.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(locationLike.hostname);
}

async function submitCommand(state, fetchImpl = fetch, locationLike = window.location, options = {}) {
  if (!canWriteToQueue(locationLike)) {
    return { mode: 'copy', ok: false };
  }

  const endpoint = options.build
    ? '/api/commands/build'
    : options.run
      ? '/api/commands/run'
      : '/api/commands';
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: state.domain,
      intent: state.intent,
      payload: state.payload,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to write command');
  return { mode: options.build ? 'build' : options.run ? 'run' : 'write', ok: true, ...data };
}

function draftId() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
  return `draft-${stamp}`;
}

function renderOptions(container, values, selected, onSelect, labelFor = (value) => value) {
  container.innerHTML = '';
  values.forEach((value) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = value === selected ? 'option active' : 'option';
    button.dataset.value = value;
    button.textContent = labelFor(value);
    button.addEventListener('click', () => onSelect(value));
    container.appendChild(button);
  });
}

function initApp(doc = document) {
  const state = {
    domain: 'design',
    intent: 'screen',
    payload: DEFAULT_PAYLOAD,
    id: draftId(),
  };

  const domainOptions = doc.getElementById('domain-options');
  const intentOptions = doc.getElementById('intent-options');
  const payloadInput = doc.getElementById('payload-input');
  const commandPreview = doc.getElementById('command-preview');
  const draftRow = doc.getElementById('draft-row');
  const routeAgent = doc.getElementById('route-agent');
  const routeStage = doc.getElementById('route-stage');
  const routeOutput = doc.getElementById('route-output');
  const draftButton = doc.getElementById('draft-button');
  const runButton = doc.getElementById('run-button');
  const buildButton = doc.getElementById('build-button');
  const connectionStatus = doc.getElementById('connection-status');
  const toast = doc.getElementById('toast');

  function setDomain(domain) {
    state.domain = domain;
    state.intent = DOMAINS[domain].intents[0];
    render();
  }

  function setIntent(intent) {
    state.intent = intent;
    render();
  }

  function render() {
    renderOptions(domainOptions, Object.keys(DOMAINS), state.domain, setDomain, (domain) => DOMAINS[domain].label);
    renderOptions(intentOptions, DOMAINS[state.domain].intents, state.intent, setIntent);
    payloadInput.value = state.payload;
    commandPreview.textContent = buildCommand(state);
    draftRow.textContent = buildDraftRow(state);
    connectionStatus.textContent = canWriteToQueue(window.location)
      ? 'local writer connected'
      : 'copy fallback';

    const route = routeFor(state.domain);
    routeAgent.textContent = route.agent;
    routeStage.textContent = route.stage;
    routeOutput.textContent = route.output;
  }

  payloadInput.addEventListener('input', (event) => {
    state.payload = event.target.value;
    commandPreview.textContent = buildCommand(state);
    draftRow.textContent = buildDraftRow(state);
  });

  draftButton.addEventListener('click', async () => {
    const text = `${buildCommand(state)}\n\n${buildDraftRow(state)}`;
    try {
      const result = await submitCommand(state);
      if (result.mode === 'write') {
        toast.textContent = `Command Queue에 추가됨: ${result.id}`;
      } else {
        if (navigator.clipboard) await navigator.clipboard.writeText(text);
        toast.textContent = '로컬 서버가 없어 command draft를 복사했습니다';
      }
      toast.hidden = false;
      window.setTimeout(() => {
        toast.hidden = true;
      }, 2200);
    } catch (error) {
      toast.textContent = error.message;
      toast.hidden = false;
    }
  });

  runButton.addEventListener('click', async () => {
    const text = `${buildCommand(state)}\n\n${buildDraftRow(state)}`;
    try {
      const result = await submitCommand(state, fetch, window.location, { run: true });
      if (result.mode === 'run') {
        toast.textContent = `실행 완료: ${result.id} -> ${result.run}`;
      } else {
        if (navigator.clipboard) await navigator.clipboard.writeText(text);
        toast.textContent = '로컬 서버가 없어 command draft를 복사했습니다';
      }
      toast.hidden = false;
      window.setTimeout(() => {
        toast.hidden = true;
      }, 3000);
    } catch (error) {
      toast.textContent = error.message;
      toast.hidden = false;
    }
  });

  buildButton.addEventListener('click', async () => {
    const text = `${buildCommand(state)}\n\n${buildDraftRow(state)}`;
    try {
      const result = await submitCommand(state, fetch, window.location, { build: true });
      if (result.mode === 'build') {
        toast.textContent = `완성물 생성: ${result.id} -> ${result.artifact}`;
      } else {
        if (navigator.clipboard) await navigator.clipboard.writeText(text);
        toast.textContent = '로컬 서버가 없어 command draft를 복사했습니다';
      }
      toast.hidden = false;
      window.setTimeout(() => {
        toast.hidden = true;
      }, 3600);
    } catch (error) {
      toast.textContent = error.message;
      toast.hidden = false;
    }
  });

  render();
  return state;
}

if (typeof window !== 'undefined') {
  window.LuaCommandUI = {
    buildCommand,
    buildDraftRow,
    initApp,
    routeFor,
    submitCommand,
  };
  window.addEventListener('DOMContentLoaded', () => initApp());
}

if (typeof module !== 'undefined') {
  module.exports = {
    DOMAINS,
    buildCommand,
    buildDraftRow,
    canWriteToQueue,
    routeFor,
    submitCommand,
  };
}
