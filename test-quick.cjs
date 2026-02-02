const puppeteer = require('puppeteer');
const BASE = 'https://church-solar-app.vercel.app';

async function test() {
  console.log('🚀 Quick E2E Tests\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  let passed = 0, failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log('✅', name);
      passed++;
    } catch (e) {
      console.log('❌', name, '-', e.message.slice(0, 80));
      failed++;
    }
  }

  // Quick page checks
  const pages = [
    { name: 'Homepage', path: '/' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Finance Income', path: '/finance/income' },
    { name: 'Finance Expenses', path: '/finance/expenses' },
    { name: 'Finance Budget', path: '/finance/budget' },
    { name: 'Finance Reports', path: '/finance/reports' },
    { name: 'Members', path: '/members' },
    { name: 'SOLAR', path: '/solar' },
  ];

  for (const p of pages) {
    await check(p.name + ' page loads', async () => {
      const r = await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (!r.ok()) throw new Error('HTTP ' + r.status());
    });
  }

  // API checks from browser context
  console.log('\n🔌 API from Browser:');
  
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  await check('Health API', async () => {
    const ok = await page.evaluate(() => fetch('/api/v1/health').then(r => r.json()).then(d => d.status === 'healthy'));
    if (!ok) throw new Error('Health failed');
  });

  await check('Income Categories API', async () => {
    const c = await page.evaluate(() => fetch('/api/v1/finance/income-categories').then(r => r.json()));
    if (!c.length || c.length < 5) throw new Error('Missing categories');
    console.log('    →', c.length, 'categories');
  });

  await check('Expenses API', async () => {
    const e = await page.evaluate(() => fetch('/api/v1/finance/expenses').then(r => r.json()));
    if (!e.expenses) throw new Error('No expenses');
    console.log('    →', e.expenses.length, 'expenses, total R', e.total);
  });

  await check('Budget API', async () => {
    const b = await page.evaluate(() => fetch('/api/v1/finance/budget?year=2026').then(r => r.json()));
    if (!b.items) throw new Error('No budget');
    console.log('    →', b.items.length, 'budget items');
  });

  await browser.close();

  console.log('\n====================');
  console.log('✅ Passed:', passed);
  console.log('❌ Failed:', failed);
  console.log('Success:', Math.round(passed*100/(passed+failed)) + '%');
  
  process.exit(failed > 0 ? 1 : 0);
}

test().catch(e => { console.error('Error:', e.message); process.exit(1); });
