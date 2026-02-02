const puppeteer = require('puppeteer');
const BASE = 'https://church-solar-app.vercel.app';
async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  console.log('🧪 TESTING INCOME SAVE FUNCTIONALITY\n');
  
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Capture all console messages
  page.on('console', msg => console.log('   [Browser]', msg.text().slice(0, 150)));
  
  // Capture network requests
  page.on('requestfailed', req => console.log('   [NET FAIL]', req.url().slice(-60)));
  
  // Navigate to income page
  await page.goto(BASE + '/finance/income', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(3000);
  
  console.log('1. Opening Record Income modal...');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Record'));
    if (btn) btn.click();
  });
  await delay(1500);
  
  // Check if modal opened
  const modalOpen = await page.$('.fixed.inset-0');
  console.log('   Modal opened:', !!modalOpen);
  
  if (!modalOpen) {
    console.log('❌ Modal did not open!');
    await browser.close();
    return;
  }
  
  console.log('\n2. Filling form...');
  
  // Select category (first one - Tithes)
  const selects = await page.$$('select');
  console.log('   Found', selects.length, 'select elements');
  
  if (selects.length > 0) {
    // Get category options
    const options = await page.$$eval('select:first-of-type option', els => 
      els.map(e => ({ value: e.value, text: e.textContent }))
    );
    console.log('   Category options:', options.slice(0, 4).map(o => o.text).join(', '));
    
    // Select "Tithes" (value should be 1)
    await page.select('select:first-of-type', '1');
    console.log('   Selected category: Tithes');
  }
  
  // Fill amount
  const amountInput = await page.$('input[type="number"]');
  if (amountInput) {
    await amountInput.click({ clickCount: 3 });
    await amountInput.type('250');
    console.log('   Entered amount: 250');
  }
  
  // Check date
  const dateInput = await page.$('input[type="date"]');
  if (dateInput) {
    const dateValue = await page.$eval('input[type="date"]', el => el.value);
    console.log('   Date value:', dateValue || '(empty)');
  }
  
  await page.screenshot({ path: 'test-results/save-income-form-filled.png' });
  console.log('📸 Screenshot: save-income-form-filled.png');
  
  console.log('\n3. Looking for Save button...');
  const buttons = await page.$$eval('button', els => els.map(e => ({
    text: e.textContent.trim(),
    type: e.type,
    disabled: e.disabled,
    classes: e.className
  })));
  console.log('   All buttons:', buttons.map(b => `"${b.text}" (type=${b.type}, disabled=${b.disabled})`).join('\n                '));
  
  // Find Save button
  const saveBtn = buttons.find(b => b.text === 'Save' || b.text === 'Submit');
  console.log('   Save button found:', saveBtn ? 'YES' : 'NO');
  if (saveBtn) {
    console.log('   Save button disabled:', saveBtn.disabled);
  }
  
  console.log('\n4. Clicking Save button...');
  
  // Intercept network request
  let apiCalled = false;
  let apiResponse = null;
  page.on('response', async resp => {
    if (resp.url().includes('/api/') && resp.request().method() === 'POST') {
      apiCalled = true;
      try {
        apiResponse = await resp.json();
      } catch (e) {
        apiResponse = { status: resp.status(), text: await resp.text().catch(() => 'N/A') };
      }
      console.log('   [API Response]', JSON.stringify(apiResponse).slice(0, 200));
    }
  });
  
  // Click save
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Save');
    if (btn) {
      console.log('Clicking save button...');
      btn.click();
    } else {
      console.log('Save button not found!');
    }
  });
  
  await delay(3000);
  
  console.log('\n5. Checking result...');
  console.log('   API was called:', apiCalled);
  
  // Check if modal closed
  const modalStillOpen = await page.$('.fixed.inset-0.z-50');
  console.log('   Modal still open:', !!modalStillOpen);
  
  // Take screenshot of result
  await page.screenshot({ path: 'test-results/save-income-result.png' });
  console.log('📸 Screenshot: save-income-result.png');
  
  // Check for error messages
  const errorMsgs = await page.$$eval('.text-red-500, .text-red-600, [role="alert"]', els => els.map(e => e.textContent));
  if (errorMsgs.length > 0) {
    console.log('   ⚠️ Error messages:', errorMsgs.join(', '));
  }
  
  // Check for toast notifications
  const toasts = await page.$$eval('[class*="toast"], [class*="Toaster"]', els => els.map(e => e.textContent));
  if (toasts.length > 0) {
    console.log('   Toast messages:', toasts.join(', '));
  }
  
  await browser.close();
  console.log('\n✅ Test complete');
}

test().catch(e => console.error('Error:', e));
