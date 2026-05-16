const STORAGE_KEY = 'money-eating-dust:v1';

const CATEGORY_META = {
  ott: { label: 'OTT', color: 'coral', shape: 'cube' },
  shopping: { label: 'Shopping', color: 'mint', shape: 'gem' },
  mobile: { label: 'Mobile', color: 'blue', shape: 'capsule' },
  insurance: { label: 'Insurance', color: 'lavender', shape: 'shield' },
  app: { label: 'App', color: 'yellow', shape: 'star' },
  membership: { label: 'Membership', color: 'pink', shape: 'coin' },
  other: { label: 'Other', color: 'gray', shape: 'blob' },
};

const DEFAULT_DUST = [
  createDust({ id: 'sample-ott', name: '영상 구독', amount: 17000, category: 'ott' }),
  createDust({ id: 'sample-mobile', name: '통신비', amount: 59000, category: 'mobile' }),
  createDust({ id: 'sample-coffee', name: '커피 멤버십', amount: 9900, category: 'membership' }),
];

const DETECTED_SUBSCRIPTIONS = [
  { name: '음악 앱', amount: 14900, category: 'app', source: '카드 반복 결제' },
  { name: '쇼핑 멤버십', amount: 7890, category: 'shopping', source: '계좌 자동이체' },
  { name: '생활 보험', amount: 32000, category: 'insurance', source: '월 정기 납부' },
];

function parseAmount(amount) {
  const numeric = Number(String(amount || '').replace(/[^\d]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatWon(amount) {
  return `${Math.max(0, Math.round(amount)).toLocaleString('ko-KR')}원`;
}

function moodFor(amount) {
  if (amount >= 50000) return 'chubby';
  if (amount >= 20000) return 'hungry';
  return 'tiny';
}

function createDust({ id, name, amount, category = 'other', status = 'active' }) {
  const monthlyAmount = parseAmount(amount);
  const cleanName = String(name || '이름 없는').trim() || '이름 없는';
  const label = cleanName.endsWith('먼지') ? cleanName : `${cleanName} 먼지`;
  const meta = CATEGORY_META[category] || CATEGORY_META.other;

  return {
    id: id || `dust-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: cleanName,
    label,
    amount: monthlyAmount,
    dailyAmount: Math.round(monthlyAmount / 30),
    category: CATEGORY_META[category] ? category : 'other',
    shape: meta.shape,
    mood: moodFor(monthlyAmount),
    status,
    createdAt: new Date().toISOString(),
  };
}

function detectSubscriptions() {
  return DETECTED_SUBSCRIPTIONS.map((item, index) =>
    createDust({ id: `detected-${index + 1}`, ...item })
  );
}

function cancelAssistCopy(dust) {
  return `${dust.label} 해지는 실제 가맹점/결제수단 확인이 필요해요. 지금은 해지 화면으로 이동하는 도우미 형태로 보여줘요.`;
}

function sleepDust(dustList, id) {
  return dustList.map((dust) => {
    if (dust.id !== id) return dust;
    return {
      ...dust,
      status: 'sleeping',
      sleepCopy: `${dust.label}가 잠들었어요. 이번 달부터 ${formatWon(dust.amount)}을 안 먹어요.`,
    };
  });
}

function calculateDustTotals(dustList) {
  return dustList.reduce(
    (totals, dust) => {
      if (dust.status === 'sleeping') {
        totals.sleepingCount += 1;
        totals.savedMonthly += dust.amount;
      } else {
        totals.activeCount += 1;
        totals.monthlyTotal += dust.amount;
        totals.dailyTotal += dust.dailyAmount;
      }
      return totals;
    },
    {
      activeCount: 0,
      sleepingCount: 0,
      monthlyTotal: 0,
      dailyTotal: 0,
      savedMonthly: 0,
    }
  );
}

function loadDust() {
  if (typeof localStorage === 'undefined') return DEFAULT_DUST;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(saved) ? saved : DEFAULT_DUST;
  } catch (_error) {
    return DEFAULT_DUST;
  }
}

function saveDust(dustList) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dustList));
  }
}

function renderDustShape(dust, selectedId) {
  const meta = CATEGORY_META[dust.category] || CATEGORY_META.other;
  const face = dust.status === 'sleeping' ? '-_-' : dust.mood === 'chubby' ? 'o_o' : '._.';
  const selected = dust.id === selectedId;
  return `
    <button class="dust ${dust.mood} ${meta.color} ${dust.status}" data-id="${dust.id}" type="button" aria-label="${dust.label}" aria-pressed="${selected ? 'true' : 'false'}">
      <span class="dust-body ${meta.shape}" aria-hidden="true">
        <span class="dust-face">${face}</span>
        <span class="dust-cheek left"></span>
        <span class="dust-cheek right"></span>
        <span class="dust-bite"></span>
        <span class="dust-sleep-mark">Zzz</span>
      </span>
      <span class="dust-name">${dust.name}</span>
      <span class="dust-money">${formatWon(dust.amount)}</span>
      <span class="dust-category">${meta.label}</span>
    </button>
  `;
}

function renderApp(doc = document) {
  let dustList = loadDust();
  const room = doc.getElementById('dust-room');
  const form = doc.getElementById('dust-form');
  const nameInput = doc.getElementById('dust-name');
  const amountInput = doc.getElementById('dust-amount');
  const categoryInput = doc.getElementById('dust-category');
  const totalMonthly = doc.getElementById('total-monthly');
  const dailyLoss = doc.getElementById('daily-loss');
  const sleepPanel = doc.getElementById('sleep-panel');
  const statusCopy = doc.getElementById('status-copy');
  const resetButton = doc.getElementById('reset-demo');
  const detectButton = doc.getElementById('detect-button');
  const detectedList = doc.getElementById('auto-detected-list');
  const cancelAssistPanel = doc.getElementById('cancel-assist-panel');

  function paintDetected() {
    detectedList.innerHTML = DETECTED_SUBSCRIPTIONS.map((item) => {
      const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
      return `
        <button class="detected-row" type="button" data-detected="${item.name}">
          <span class="detected-dot ${meta.color}"></span>
          <span>
            <strong>${item.name}</strong>
            <small>${item.source}</small>
          </span>
          <b>${formatWon(item.amount)}</b>
        </button>
      `;
    }).join('');
  }

  function paint(selectedId) {
    const totals = calculateDustTotals(dustList);
    const selected = dustList.find((dust) => dust.id === selectedId) || dustList.find((dust) => dust.status === 'active');
    totalMonthly.textContent = formatWon(totals.monthlyTotal);
    dailyLoss.textContent = `하루 ${formatWon(totals.dailyTotal)}씩 조용히 먹고 있어요`;
    room.innerHTML = `
      <div class="wallet-lip" aria-hidden="true"></div>
      <div class="room-floor">
        ${dustList.map((dust) => renderDustShape(dust, selected && selected.id)).join('')}
      </div>
    `;

    if (!selected) {
      sleepPanel.innerHTML = '<p>먼지를 만들면 여기에서 재울 수 있어요.</p>';
    } else if (selected.status === 'sleeping') {
      sleepPanel.innerHTML = `<p>${selected.sleepCopy || `${selected.label}는 잠들었어요.`}</p>`;
    } else {
      sleepPanel.innerHTML = `
        <p><strong>${selected.label}</strong>는 매달 ${formatWon(selected.amount)}을 먹어요.</p>
        <p>재우면 하루 ${formatWon(selected.dailyAmount)} 정도를 지킬 수 있어요.</p>
        <button class="primary small" type="button" data-sleep="${selected.id}">잠깐 재우기</button>
      `;
      cancelAssistPanel.innerHTML = `
        <p><strong>${selected.label}</strong></p>
        <p>${cancelAssistCopy(selected)}</p>
        <button class="primary small" type="button">해지하러 가기</button>
      `;
    }

    if (totals.savedMonthly > 0) {
      statusCopy.textContent = `잠든 먼지가 ${formatWon(totals.savedMonthly)}을 지키고 있어요.`;
    } else {
      statusCopy.textContent = '귀엽지만 꽤 비싼 먼지들이에요.';
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = parseAmount(amountInput.value);
    if (!nameInput.value.trim() || amount <= 0) {
      statusCopy.textContent = '먼지 이름과 매달 먹는 돈을 알려주세요.';
      return;
    }
    const nextDust = createDust({
      name: nameInput.value,
      amount,
      category: categoryInput.value,
    });
    dustList = [nextDust, ...dustList];
    saveDust(dustList);
    form.reset();
    paint(nextDust.id);
  });

  room.addEventListener('click', (event) => {
    const button = event.target.closest('[data-id]');
    if (button) paint(button.dataset.id);
  });

  sleepPanel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-sleep]');
    if (!button) return;
    dustList = sleepDust(dustList, button.dataset.sleep);
    saveDust(dustList);
    paint(button.dataset.sleep);
  });

  resetButton.addEventListener('click', () => {
    dustList = DEFAULT_DUST;
    saveDust(dustList);
    paint();
  });

  detectButton.addEventListener('click', () => {
    const detected = detectSubscriptions();
    const existingNames = new Set(dustList.map((dust) => dust.name));
    dustList = [...detected.filter((dust) => !existingNames.has(dust.name)), ...dustList];
    saveDust(dustList);
    paint(detected[0] && detected[0].id);
  });

  detectedList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-detected]');
    if (!button) return;
    const source = DETECTED_SUBSCRIPTIONS.find((item) => item.name === button.dataset.detected);
    if (!source) return;
    const nextDust = createDust(source);
    dustList = [nextDust, ...dustList];
    saveDust(dustList);
    paint(nextDust.id);
  });

  paintDetected();
  paint();
  return { getDust: () => dustList };
}

if (typeof window !== 'undefined') {
  window.MoneyEatingDust = {
    calculateDustTotals,
    createDust,
    renderApp,
    sleepDust,
  };
  window.addEventListener('DOMContentLoaded', () => renderApp());
}

if (typeof module !== 'undefined') {
  module.exports = {
    calculateDustTotals,
    createDust,
    formatWon,
    cancelAssistCopy,
    detectSubscriptions,
    moodFor,
    sleepDust,
  };
}
