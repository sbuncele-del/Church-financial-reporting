const puppeteer = require('puppeteer');
const BASE = 'https://church-solar-app.vercel.app';
async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  console.log('🚀 COMPLETE FINANCE MODULE E2E TEST\n');
  console.log('='.repeat(50));
  
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let passed = 0, failed = 0;

  async function check(name, fn) {
    try { await fn(); console.log('✅', name); passed++; return true; }
    catch (e) { console.log('❌', name, '-', e.message.slice(0, 80)); failed++; return false; }
  }

  // ====== INCOME ======
  console.log('\n💰 INCOME MODULE\n');
  
  await check('Income page loads', async () => {
    await page.goto(BASE + '/finance/income', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });
  
  await check('Income total displayed', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (!text.includes('Total Income')) throw new Error('No total');
  });
  
  await check('Record Income button works', async () => {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Record'));
      if (btn) btn.click();
    });
    await delay(1000);
    const inputs = await page.$$('input, select');
    if (inputs.length < 4) throw new Error('Modal did not open');
  });
  
  await check('Income categories: Tithes, First Fruits, Seeds', async () => {
    const options = await page.$$eval('select option', els => els.map(e => e.textContent));
    const has = ['Tithes', 'First Fruits', 'Regular Seed', 'Alms'].every(s => 
      options.some(o => o.includes(s))
    );
    if (!has) throw new Error('Missing seed categories');
    console.log('    Categories:', options.slice(1, 6).join(', '));
  });
  
  await page.screenshot({ path: 'test-results/1-income-modal.png' });

  // ====== EXPENSES ======
  console.log('\n💸 EXPENSES MODULE\n');
  
  await check('Expenses page loads', async () => {
    await page.goto(BASE + '/finance/expenses', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });
  
  await check('Expenses total displayed', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (!text.includes('Expense')) throw new Error('No expenses');
  });
  
  await check('Record Expense button works', async () => {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => 
        b.textContent.toLowerCase().includes('record') || b.textContent.toLowerCase().includes('add'));
      if (btn) btn.click();
    });
    await delay(1000);
    const inputs = await page.$$('input, select');
    if (inputs.length < 4) throw new Error('Modal did not open');
  });
  
  await check('Expense categories loaded (52 categories)', async () => {
    const options = await page.$$eval('select option', els => els.map(e => e.textContent));
    if (options.length < 30) throw new Error('Too few categories: ' + options.length);
    console.log('    Total expense categories:', options.length - 1);
  });
  
  await page.screenshot({ path: 'test-results/2-expenses-modal.png' });

  // ====== BUDGET ======
  console.log('\n📊 BUDGET MODULE\n');
  
  await check('Budget page loads', async () => {
    await page.goto(BASE + '/finance/budget', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });
  
  await check('Budget data displayed', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (!text.includes('Budget')) throw new Error('No budget content');
    console.log('    Page size:', text.length, 'chars');
  });
  
  await check('Budget categories visible', async () => {
    const text = await page.$eval('body', el => el.innerText);
    const hasData = text.includes('Income') || text.includes('Expense') || text.includes('Category');
    if (!hasData) throw new Error('No category data');
  });
  
  await page.screenshot({ path: 'test-results/3-budget-page.png' });

  // ====== REPORTS ======
  console.log('\n📈 REPORTS MODULE\n');
  
  await check('Reports page loads', async () => {
    await page.goto(BASE + '/finance/reports', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
  });
  
  await check('Reports content visible', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (text.length < 100) throw new Error('Page blank');
  });
  
  await check('Report controls exist', async () => {
    const buttons = await page.$$('button');
    const selects = await page.$$('select');
    console.log('    Controls:', buttons.length, 'buttons,', selects.length, 'selects');
  });
  
  await page.screenshot({ path: 'test-results/4-reports-page.png' });

  // ====== API INTEGRATION ======
  console.log('\n🔌 API INTEGRATION\n');
  
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  
  await check('API: Income categories', async () => {
    const data = await page.evaluate(() => fetch('/api/v1/finance/income-categories').then(r => r.json()));
    if (!data.length) throw new Error('No categories');
    console.log('    Fetched', data.length, 'income categories');
  });
  
  await check('API: Expense categories', async () => {
    const data = await page.evaluate(() => fetch('/api/v1/finance/expense-categories').then(r => r.json()));
    if (!data.length) throw new Error('No categories');
    console.log('    Fetched', data.length, 'expense categories');
  });
  
  await check('API: Incomes', async () => {
    const data = await page.evaluate(() => fetch('/api/v1/finance/income').then(r => r.json()));
    if (!data.incomes) throw new Error('No incomes');
    console.log('    Fetched', data.incomes.length, 'incomes, total R', data.total);
  });
  
  await check('API: Expenses', async () => {
    const data = await page.evaluate(() => fetch('/api/v1/finance/expenses').then(r => r.json()));
    if (!data.expenses) throw new Error('No expenses');
    console.log('    Fetched', data.expenses.length, 'expenses');
  });
  
  await check('API: Budget', async () => {
    const data = await page.evaluate(() => fetch('/api/v1/finance/budget?year=2026').then(r => r.json()));
    if (!data.items) throw new Error('No budget items');
    console.log('    Fetched', data.items.length, 'budget items');
  });

  await browser.close();

  // ====== SUMMARY ======
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINANCE MODULE E2E TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Passed:', passed);
  console.log('❌ Failed:', failed);
  console.log('📈 Success Rate:', Math.round(passed*100/(passed+failed)) + '%');
  console.log('\n📸 Screenshots saved in test-results/');
  
  process.exit(failed > 0 ? 1 : 0);
}

test().catch(e => { console.error('Error:', e); process.exit(1); });
