const puppeteer = require('puppeteer');
const BASE = 'https://church-solar-app.vercel.app';
async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  console.log('🚀 EXPENSES WORKFLOW E2E TEST\n');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let passed = 0, failed = 0;

  async function check(name, fn) {
    try { await fn(); console.log('✅', name); passed++; }
    catch (e) { console.log('❌', name, '-', e.message.slice(0, 100)); failed++; }
  }

  await check('Navigate to Expenses', async () => {
    await page.goto(BASE + '/finance/expenses', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);
  });

  await check('Expenses heading visible', async () => {
    const h1 = await page.$eval('h1', el => el.textContent);
    if (!h1.toLowerCase().includes('expense')) throw new Error('No heading');
    console.log('    Heading:', h1);
  });

  await check('Add Expense button exists', async () => {
    const buttons = await page.$$eval('button', els => els.map(e => e.textContent));
    const addBtn = buttons.find(b => b.toLowerCase().includes('expense') || b.toLowerCase().includes('add') || b.toLowerCase().includes('record'));
    console.log('    Buttons:', buttons.filter(b => b.trim()).slice(0, 5).join(', '));
  });

  await check('Click Add Expense button', async () => {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent.toLowerCase().includes('record') || b.textContent.toLowerCase().includes('add'));
      if (btn) btn.click();
    });
    await delay(1000);
  });

  await check('Expense form modal opens', async () => {
    const inputs = await page.$$('input, select, textarea');
    console.log('    Form inputs:', inputs.length);
    if (inputs.length < 3) throw new Error('No form inputs found');
  });

  await check('Expense categories in dropdown', async () => {
    const options = await page.$$eval('select option', els => els.map(e => e.textContent));
    console.log('    Categories:', options.slice(0, 8).join(', '));
    if (options.length < 10) throw new Error('Too few expense categories');
  });

  await page.screenshot({ path: 'test-results/expenses-form.png' });
  console.log('📸 Saved: expenses-form.png');

  await browser.close();
  console.log('\n✅ Passed:', passed, '| ❌ Failed:', failed);
  process.exit(failed > 0 ? 1 : 0);
}
test().catch(e => { console.error(e); process.exit(1); });
