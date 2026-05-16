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
    if (navigator.clipboard) await navigator.clipboard.writeText(text);
    toast.textContent = 'Command draft copied';
    toast.hidden = false;
    window.setTimeout(() => {
      toast.hidden = true;
    }, 1800);
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
  };
  window.addEventListener('DOMContentLoaded', () => initApp());
}

if (typeof module !== 'undefined') {
  module.exports = {
    DOMAINS,
    buildCommand,
    buildDraftRow,
    routeFor,
  };
}
