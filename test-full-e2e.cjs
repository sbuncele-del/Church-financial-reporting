const puppeteer = require('puppeteer');
const BASE = 'https://church-solar-app.vercel.app';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  console.log('🚀 COMPREHENSIVE E2E TESTS\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  let passed = 0, failed = 0;
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  async function runTest(name, fn) {
    try {
      await fn();
      console.log('✅', name);
      passed++;
    } catch (e) {
      console.log('❌', name, '-', e.message.slice(0, 100));
      failed++;
    }
  }

  // ===== CORE PAGES =====
  console.log('\n📄 CORE PAGES');
  
  await runTest('Homepage loads', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  });

  await runTest('React renders #root', async () => {
    const html = await page.$eval('#root', el => el.innerHTML);
    if (html.length < 50) throw new Error('Empty root');
  });

  await runTest('Login page', async () => {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(1000);
  });

  await runTest('Register page', async () => {
    await page.goto(BASE + '/register', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(1000);
  });

  // ===== API INTEGRATION =====
  console.log('\n🔌 API INTEGRATION');
  
  await runTest('Health endpoint', async () => {
    const ok = await page.evaluate(async () => {
      const r = await fetch('/api/v1/health');
      const d = await r.json();
      return d.status === 'healthy';
    });
    if (!ok) throw new Error('Health check failed');
  });

  await runTest('Income categories (10 seeds)', async () => {
    const cats = await page.evaluate(async () => {
      const r = await fetch('/api/v1/finance/income-categories');
      return await r.json();
    });
    if (cats.length !== 10) throw new Error('Expected 10 categories, got ' + cats.length);
    const names = cats.map(c => c.name).join(', ');
    if (!names.includes('Tithes')) throw new Error('Missing Tithes');
    console.log('    Seeds:', names.slice(0, 80));
  });

  await runTest('Expense categories', async () => {
    const cats = await page.evaluate(async () => {
      const r = await fetch('/api/v1/finance/expense-categories');
      return await r.json();
    });
    if (cats.length < 50) throw new Error('Expected 50+ expense categories');
    console.log('    Found', cats.length, 'expense categories');
  });

  await runTest('Income records', async () => {
    const data = await page.evaluate(async () => {
      const r = await fetch('/api/v1/finance/income');
      return await r.json();
    });
    if (!data.incomes || data.incomes.length < 1) throw new Error('No income records');
    console.log('    Total income: R', data.total);
  });

  await runTest('Expense records', async () => {
    const data = await page.evaluate(async () => {
      const r = await fetch('/api/v1/finance/expenses');
      return await r.json();
    });
    if (!data.expenses) throw new Error('No expenses array');
    console.log('    Total expenses: R', data.total || 0);
  });

  await runTest('Budget endpoint', async () => {
    const data = await page.evaluate(async () => {
      const r = await fetch('/api/v1/finance/budget?year=2026');
      return await r.json();
    });
    if (!data.items || data.items.length < 1) throw new Error('No budget items');
    console.log('    Budget items:', data.items.length);
  });

  await runTest('Members endpoint', async () => {
    const data = await page.evaluate(async () => {
      const r = await fetch('/api/v1/members');
      return await r.json();
    });
    if (!data.members) throw new Error('No members array');
    console.log('    Members:', data.members.length);
  });

  await runTest('SOLAR dashboard', async () => {
    const data = await page.evaluate(async () => {
      const r = await fetch('/api/v1/solar/dashboard/1');
      return await r.json();
    });
    if (!data.church_name) throw new Error('No church_name');
  });

  // ===== FINANCE PAGES =====
  console.log('\n💰 FINANCE PAGES');

  await runTest('Income page renders', async () => {
    await page.goto(BASE + '/finance/income', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page appears blank');
    if (!text.includes('Income')) throw new Error('Missing Income heading');
  });

  await runTest('Expenses page renders', async () => {
    await page.goto(BASE + '/finance/expenses', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page appears blank');
  });

  await runTest('Budget page renders', async () => {
    await page.goto(BASE + '/finance/budget', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page appears blank');
  });

  await runTest('Reports page renders', async () => {
    await page.goto(BASE + '/finance/reports', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page appears blank');
  });

  // ===== OTHER PAGES =====
  console.log('\n📋 OTHER PAGES');

  await runTest('Members page renders', async () => {
    await page.goto(BASE + '/members', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });

  await runTest('SOLAR page renders', async () => {
    await page.goto(BASE + '/solar', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });

  await runTest('Dashboard page', async () => {
    await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(1000);
  });

  await browser.close();

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(50));
  console.log('✅ Passed:', passed);
  console.log('❌ Failed:', failed);
  console.log('📈 Success Rate:', Math.round(passed/(passed+failed)*100) + '%');
  
  if (consoleErrors.length > 0) {
    console.log('\n⚠️  Console Errors:', consoleErrors.length);
    consoleErrors.slice(0, 3).forEach(e => console.log('  -', e.slice(0, 120)));
  } else {
    console.log('\n✨ No console errors detected!');
  }

  process.exit(failed > 0 ? 1 : 0);
}

test().catch(e => {
  console.error('Runner error:', e);
  process.exit(1);
});
