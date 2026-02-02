const puppeteer = require('puppeteer');
const BASE = 'https://church-solar-app.vercel.app';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  console.log('🚀 INCOME RECORDING E2E TEST\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Log console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Income Page]') || msg.type() === 'error') {
      console.log('   [Browser]', text.slice(0, 150));
    }
  });

  let passed = 0, failed = 0;

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

  console.log('📥 INCOME PAGE WORKFLOW\n');

  await check('Navigate to Income page', async () => {
    await page.goto(BASE + '/finance/income', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000); // Wait for React to load data
  });

  await check('Page shows "Income" heading', async () => {
    const h1 = await page.$eval('h1', el => el.textContent);
    if (!h1.includes('Income')) throw new Error('Missing Income heading: ' + h1);
    console.log('    Heading:', h1);
  });

  await check('Total Income card visible', async () => {
    const text = await page.$eval('body', el => el.innerText);
    if (!text.includes('Total Income')) throw new Error('Missing Total Income');
    // Extract amount
    const match = text.match(/Total Income\s*R?\s*([\d,. ]+)/);
    if (match) console.log('    Total Income:', match[1].trim());
  });

  await check('Record Income button exists', async () => {
    // Find button with "Record Income" text
    const buttons = await page.$$eval('button', els => 
      els.map(e => ({ text: e.textContent, classes: e.className }))
    );
    const recordBtn = buttons.find(b => b.text.includes('Record Income'));
    if (!recordBtn) throw new Error('No Record Income button. Found: ' + buttons.map(b => b.text).join(', '));
    console.log('    Button found!');
  });

  await check('Click Record Income button', async () => {
    // Click button containing "Record Income"
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent.includes('Record Income'));
      if (btn) btn.click();
    });
    await delay(1000);
  });

  await check('Modal opens with form', async () => {
    // Check for modal
    const modal = await page.$('.fixed.inset-0');
    if (!modal) throw new Error('Modal not visible');
    
    // Check for form elements
    const inputs = await page.$$('input, select, textarea');
    console.log('    Form inputs found:', inputs.length);
    if (inputs.length < 4) throw new Error('Too few form inputs');
  });

  await check('Category dropdown has options', async () => {
    const options = await page.$$eval('select option', els => els.map(e => e.textContent));
    console.log('    Select options:', options.slice(0, 6).join(', '));
    
    // Check for our seed categories
    const hasSeeds = options.some(o => 
      o.includes('Tithe') || o.includes('First Fruit') || o.includes('Seed') || o.includes('Alm')
    );
    if (!hasSeeds) throw new Error('Seed categories not found');
    console.log('    ✓ Seed categories present!');
  });

  await check('Fill out income form', async () => {
    // Select first income category (index 1, skip "Select category")
    await page.select('select:first-of-type', '1'); 
    
    // Fill amount
    const amountInput = await page.$('input[type="number"]');
    if (amountInput) {
      await amountInput.click({ clickCount: 3 });
      await amountInput.type('500');
    }
    
    // Date should be prefilled
    console.log('    Form filled with R500');
  });

  // Take screenshot of filled form
  await page.screenshot({ path: 'test-results/income-form.png', fullPage: false });
  console.log('📸 Saved: income-form.png');

  await check('Cancel button works', async () => {
    // Find and click Cancel
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent.includes('Cancel'));
      if (btn) btn.click();
    });
    await delay(500);
    
    // Modal should be gone
    const modal = await page.$('.fixed.inset-0.z-50');
    if (modal) throw new Error('Modal still visible');
  });

  // ========== Test income table ==========
  console.log('\n📊 INCOME TABLE\n');

  await check('Income records display', async () => {
    const rows = await page.$$('tbody tr');
    console.log('    Table rows:', rows.length);
    
    // Check for category badges
    const badges = await page.$$eval('.badge', els => els.map(e => e.textContent));
    if (badges.length > 0) {
      console.log('    Categories:', badges.slice(0, 5).join(', '));
    }
  });

  await check('Edit/Delete buttons in table', async () => {
    const editBtns = await page.$$('[title="Edit"]');
    const deleteBtns = await page.$$('[title="Delete"]');
    console.log('    Edit buttons:', editBtns.length, 'Delete buttons:', deleteBtns.length);
  });

  // Take final screenshot
  await page.screenshot({ path: 'test-results/income-page-final.png', fullPage: true });
  console.log('📸 Saved: income-page-final.png');

  await browser.close();

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(50));
  console.log('📊 INCOME WORKFLOW RESULTS');
  console.log('='.repeat(50));
  console.log('✅ Passed:', passed);
  console.log('❌ Failed:', failed);
  console.log('📈 Success Rate:', Math.round(passed*100/(passed+failed)) + '%');

  process.exit(failed > 0 ? 1 : 0);
}

test().catch(e => { console.error('Error:', e); process.exit(1); });
