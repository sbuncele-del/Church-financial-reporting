const puppeteer = require('puppeteer');
const BASE = 'https://church-solar-app.vercel.app';

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function test() {
  console.log('🚀 Starting Frontend E2E Tests...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  let passed = 0, failed = 0;

  const consoleErrors = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  page.on('requestfailed', req => {
    networkErrors.push(`${req.url()} - ${req.failure().errorText}`);
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

  // Test 1: Homepage loads
  await runTest('Homepage loads', async () => {
    const resp = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!resp.ok()) throw new Error('HTTP ' + resp.status());
  });

  // Check what's actually on the page
  await delay(3000);
  const html = await page.content();
  console.log('\n📄 Page content preview:');
  console.log(html.slice(0, 500));

  // Check for JS bundles
  const scripts = await page.$$eval('script[src]', els => els.map(e => e.src));
  console.log('\n📦 Script sources:', scripts.slice(0, 5));

  // Test 2: Check if React rendered
  await runTest('React app renders', async () => {
    await delay(2000);
    const root = await page.$('#root');
    if (!root) throw new Error('No #root element');
    const innerHTML = await page.$eval('#root', el => el.innerHTML);
    if (innerHTML.length < 50) throw new Error('Root appears empty');
  });

  // Test 3: Navigate to login
  await runTest('Login route accessible', async () => {
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(2000);
    const url = page.url();
    // Just check we got there without error
    if (!url) throw new Error('Navigation failed');
  });

  // Test 4: API fetch works from browser
  await runTest('API reachable from frontend', async () => {
    const result = await page.evaluate(async () => {
      try {
        const resp = await fetch('/api/v1/health');
        const data = await resp.json();
        return data.status === 'healthy';
      } catch (e) {
        return false;
      }
    });
    if (!result) throw new Error('API not reachable');
  });

  // Test 5: Check finance income categories load
  await runTest('Income categories API works from browser', async () => {
    const cats = await page.evaluate(async () => {
      const resp = await fetch('/api/v1/finance/income-categories');
      return await resp.json();
    });
    if (!Array.isArray(cats) || cats.length < 5) throw new Error('Categories not loading');
    console.log('    Found', cats.length, 'income categories');
  });

  await browser.close();

  console.log('\n===== FRONTEND TEST RESULTS =====');
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  
  if (consoleErrors.length > 0) {
    console.log('\n⚠️  Console Errors (first 3):');
    consoleErrors.slice(0, 3).forEach(e => console.log('  -', e.slice(0, 150)));
  }
  
  if (networkErrors.length > 0) {
    console.log('\n🔴 Network Errors (first 3):');
    networkErrors.slice(0, 3).forEach(e => console.log('  -', e.slice(0, 150)));
  }

  process.exit(failed > 0 ? 1 : 0);
}

test().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});
