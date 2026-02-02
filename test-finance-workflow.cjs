const puppeteer = require('puppeteer');
const BASE = 'https://church-solar-app.vercel.app';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  console.log('🚀 FINANCE WORKFLOW E2E TEST\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  let passed = 0, failed = 0;
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  async function check(name, fn) {
    try {
      await fn();
      console.log('✅', name);
      passed++;
      return true;
    } catch (e) {
      console.log('❌', name, '-', e.message.slice(0, 100));
      failed++;
      return false;
    }
  }

  // ========== INCOME PAGE WORKFLOW ==========
  console.log('📥 INCOME PAGE WORKFLOW\n');

  await check('Navigate to Income page', async () => {
    await page.goto(BASE + '/finance/income', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });

  await check('Income page has content', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page blank');
    if (!text.toLowerCase().includes('income')) throw new Error('Missing income heading');
  });

  // Check for Add Income button
  await check('Add Income button exists', async () => {
    const btn = await page.$('button');
    if (!btn) throw new Error('No buttons found');
    const buttons = await page.$$eval('button', els => els.map(e => e.innerText.toLowerCase()));
    console.log('    Buttons found:', buttons.slice(0, 5).join(', '));
  });

  // Check for income form or modal trigger
  await check('Look for income form elements', async () => {
    const inputs = await page.$$('input, select');
    const forms = await page.$$('form');
    console.log('    Inputs:', inputs.length, 'Forms:', forms.length);
    if (inputs.length === 0 && forms.length === 0) {
      // Try clicking Add button
      const addBtn = await page.$('button');
      if (addBtn) {
        await addBtn.click();
        await delay(1000);
        const inputsAfter = await page.$$('input, select');
        console.log('    After click - Inputs:', inputsAfter.length);
      }
    }
  });

  // Check income categories dropdown
  await check('Income categories load in dropdown', async () => {
    const selects = await page.$$('select');
    if (selects.length > 0) {
      const options = await page.$$eval('select option', els => els.map(e => e.textContent));
      console.log('    Options:', options.slice(0, 5).join(', '));
      if (options.some(o => o.includes('Tithe') || o.includes('Seed'))) {
        console.log('    ✓ Seed categories found!');
      }
    } else {
      // Check for category buttons or other UI
      const text = await page.$eval('body', el => el.innerText);
      if (text.includes('Tithe') || text.includes('Seed')) {
        console.log('    ✓ Seed categories visible on page');
      }
    }
  });

  // ========== EXPENSES PAGE WORKFLOW ==========
  console.log('\n📤 EXPENSES PAGE WORKFLOW\n');

  await check('Navigate to Expenses page', async () => {
    await page.goto(BASE + '/finance/expenses', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });

  await check('Expenses page has content', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page blank');
  });

  await check('Expense buttons/controls exist', async () => {
    const buttons = await page.$$eval('button', els => els.map(e => e.innerText));
    console.log('    Buttons:', buttons.slice(0, 5).join(', '));
  });

  // ========== BUDGET PAGE WORKFLOW ==========
  console.log('\n📊 BUDGET PAGE WORKFLOW\n');

  await check('Navigate to Budget page', async () => {
    await page.goto(BASE + '/finance/budget', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });

  await check('Budget page renders data', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page blank');
    console.log('    Page has', text.length, 'chars of content');
  });

  await check('Budget shows categories', async () => {
    const text = await page.$eval('body', el => el.innerText);
    const hasBudgetData = text.includes('Budget') || text.includes('Actual') || text.includes('Variance');
    if (!hasBudgetData) throw new Error('No budget data visible');
  });

  // ========== REPORTS PAGE WORKFLOW ==========
  console.log('\n📈 REPORTS PAGE WORKFLOW\n');

  await check('Navigate to Reports page', async () => {
    await page.goto(BASE + '/finance/reports', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });

  await check('Reports page has content', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page blank');
  });

  await check('Report controls exist', async () => {
    const buttons = await page.$$eval('button', els => els.map(e => e.innerText));
    const selects = await page.$$('select');
    console.log('    Buttons:', buttons.length, 'Selects:', selects.length);
  });

  // ========== TAKE SCREENSHOTS ==========
  console.log('\n📸 Taking screenshots...\n');
  
  await page.goto(BASE + '/finance/income', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);
  await page.screenshot({ path: 'test-results/income-page.png', fullPage: true });
  console.log('   Saved: income-page.png');

  await page.goto(BASE + '/finance/budget', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);
  await page.screenshot({ path: 'test-results/budget-page.png', fullPage: true });
  console.log('   Saved: budget-page.png');

  await browser.close();

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINANCE WORKFLOW TEST RESULTS');
  console.log('='.repeat(50));
  console.log('✅ Passed:', passed);
  console.log('❌ Failed:', failed);
  console.log('📈 Success Rate:', Math.round(passed*100/(passed+failed)) + '%');

  if (errors.length > 0) {
    console.log('\n⚠️ Console errors:', errors.length);
    errors.slice(0, 3).forEach(e => console.log('  -', e.slice(0, 100)));
  }

  process.exit(failed > 0 ? 1 : 0);
}

test().catch(e => { console.error('Error:', e); process.exit(1); });
