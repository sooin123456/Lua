const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const PROTOTYPE_DIR = path.join(ROOT, '08_Artifacts', 'Money Eating Dust Prototype');

test('money dust prototype files exist and include the required UI regions', () => {
  const html = fs.readFileSync(path.join(PROTOTYPE_DIR, 'index.html'), 'utf8');

  assert.match(html, /돈 먹는 먼지/);
  assert.match(html, /예: 영상 구독/);
  assert.match(html, /id="dust-room"/);
  assert.match(html, /id="dust-form"/);
  assert.match(html, /id="dust-name"/);
  assert.match(html, /id="dust-amount"/);
  assert.match(html, /id="total-monthly"/);
  assert.match(html, /id="daily-loss"/);
  assert.match(html, /id="sleep-panel"/);
  assert.match(html, /id="submission-copy"/);
});

test('prototype css protects the mobile layout from horizontal clipping', () => {
  const css = fs.readFileSync(path.join(PROTOTYPE_DIR, 'styles.css'), 'utf8');

  assert.match(css, /\.summary\s*{[^}]*flex-direction:\s*column/s);
  assert.match(css, /\.preview-rail\s*{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /grid-template-columns:\s*repeat\(3,\s*180px\)/);
  assert.match(css, /grid-auto-columns:\s*180px/);
  assert.match(css, /\.room-floor\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(min-width:\s*520px\)[\s\S]*\.section-heading\s*{[\s\S]*display:\s*flex/);
  assert.match(css, /@media\s*\(min-width:\s*520px\)[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test('prototype includes cute dust character details and wallet room styling', () => {
  const js = fs.readFileSync(path.join(PROTOTYPE_DIR, 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(PROTOTYPE_DIR, 'styles.css'), 'utf8');

  assert.match(js, /aria-pressed/);
  assert.match(js, /class="dust-body \$\{meta\.shape\}"/);
  assert.match(js, /class="dust-cheek left"/);
  assert.match(js, /class="dust-cheek right"/);
  assert.match(js, /class="dust-bite"/);
  assert.match(js, /class="dust-sleep-mark"/);
  assert.match(js, /class="dust-category"/);
  assert.match(css, /\.room-floor/);
  assert.match(css, /\.wallet-lip/);
  assert.match(css, /\.dust-bite/);
  assert.match(css, /\.dust\[aria-pressed="true"\]/);
  assert.match(css, /\.dust\.sleeping\s+\.dust-sleep-mark/);
  assert.match(css, /animation:\s*floatDust/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
});

test('prototype form gives mobile-friendly amount guidance', () => {
  const html = fs.readFileSync(path.join(PROTOTYPE_DIR, 'index.html'), 'utf8');

  assert.match(html, /id="amount-help"/);
  assert.match(html, /aria-describedby="amount-help"/);
  assert.match(html, /pattern="\[0-9,\]\*"/);
});

test('prototype shows open banking, assisted cancellation, and wider Toss-style sections', () => {
  const html = fs.readFileSync(path.join(PROTOTYPE_DIR, 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(PROTOTYPE_DIR, 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(PROTOTYPE_DIR, 'styles.css'), 'utf8');

  assert.match(html, /id="open-banking-card"/);
  assert.match(html, /class="preview-rail"/);
  assert.match(html, /class="poster-card intro-card"/);
  assert.match(html, /class="phone-card room-card"/);
  assert.match(html, /class="phone-card action-card"/);
  assert.match(html, /id="auto-detected-list"/);
  assert.match(html, /id="cancel-assist-panel"/);
  assert.match(html, /오픈뱅킹으로 찾기/);
  assert.match(html, /해지 도우미/);
  assert.match(js, /detectSubscriptions/);
  assert.match(js, /cancelAssistCopy/);
  assert.match(js, /shape:\s*'cube'/);
  assert.match(js, /shape:\s*'capsule'/);
  assert.match(js, /shape:\s*'gem'/);
  assert.match(js, /shape:\s*'star'/);
  assert.match(js, /shape:\s*'coin'/);
  assert.match(css, /width:\s*min\(100%,\s*760px\)/);
  assert.match(css, /background:\s*#15171b/);
  assert.match(css, /\.app-icon/);
  assert.match(css, /\.hero-dust/);
  assert.match(css, /\.phone-card/);
  assert.match(css, /\.preview-rail/);
  assert.match(css, /\.dust-body\.cube/);
  assert.match(css, /\.dust-body\.capsule/);
  assert.match(css, /\.dust-body\.gem/);
  assert.match(css, /\.dust-body\.star/);
  assert.match(css, /\.dust-body\.coin/);
});

test('submission package includes the selected dust-room screenshot asset', () => {
  const screenshotPath = path.join(PROTOTYPE_DIR, 'screenshots', 'dust-room-mobile.png');
  const packagePath = path.join(ROOT, '02_Projects', 'TOSS', 'Submission Package.md');

  assert.equal(fs.existsSync(screenshotPath), true);
  assert.ok(fs.statSync(screenshotPath).size > 50_000);

  const submissionPackage = fs.readFileSync(packagePath, 'utf8');
  assert.match(submissionPackage, /돈 먹는 먼지/);
  assert.match(submissionPackage, /dust-room-mobile\.png/);
  assert.match(submissionPackage, /대표 스크린샷: 먼지방/);
});

test('dust model creates cute fixed-cost dust and calculates monthly totals', () => {
  const { createDust, calculateDustTotals } = require('../08_Artifacts/Money Eating Dust Prototype/app');

  const dust = [
    createDust({ name: '영상 구독', amount: '17000', category: 'ott' }),
    createDust({ name: '통신비', amount: '59000', category: 'mobile' }),
  ];

  assert.deepEqual(dust.map((item) => item.mood), ['tiny', 'chubby']);
  assert.equal(dust[0].label, '영상 구독 먼지');
  assert.equal(dust[1].dailyAmount, 1967);
  assert.deepEqual(calculateDustTotals(dust), {
    activeCount: 2,
    sleepingCount: 0,
    monthlyTotal: 76000,
    dailyTotal: 2534,
    savedMonthly: 0,
  });
});

test('sleeping dust removes it from active monthly cost and reports savings', () => {
  const { createDust, sleepDust, calculateDustTotals } = require('../08_Artifacts/Money Eating Dust Prototype/app');

  const dust = [
    createDust({ id: 'dust-1', name: '음악 앱', amount: 14900, category: 'app' }),
    createDust({ id: 'dust-2', name: '커피 멤버십', amount: 9900, category: 'membership' }),
  ];

  const next = sleepDust(dust, 'dust-1');

  assert.equal(next[0].status, 'sleeping');
  assert.equal(next[0].sleepCopy, '음악 앱 먼지가 잠들었어요. 이번 달부터 14,900원을 안 먹어요.');
  assert.deepEqual(calculateDustTotals(next), {
    activeCount: 1,
    sleepingCount: 1,
    monthlyTotal: 9900,
    dailyTotal: 330,
    savedMonthly: 14900,
  });
});
