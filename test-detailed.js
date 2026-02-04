/**
 * More detailed test
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Detailed logging
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/v1/')) {
      const status = response.status();
      const path = url.split('/api/v1/')[1]?.split('?')[0] || 'unknown';
      if (status !== 200 && status !== 201) {
        try {
          const body = await response.text();
          console.log(`❌ API ERROR [${status}] /${path}:`, body.substring(0, 200));
        } catch (e) {
          console.log(`❌ API ERROR [${status}] /${path}: (no body)`);
        }
      } else {
        console.log(`✅ API OK [${status}] /${path}`);
      }
    }
  });

  try {
    console.log('=== Starting test ===');
    
    // First, warm up the API with a direct call
    console.log('Warming up API...');
    await page.goto('https://church-solar-app.vercel.app/api/v1/finance/income-categories?church_id=11', { waitUntil: 'networkidle2', timeout: 60000 });
    const warmupContent = await page.content();
    console.log('Warmup response:', warmupContent.includes('Tithes') ? 'OK (has categories)' : 'UNEXPECTED');
    
    // Now test the actual flow
    console.log('1. Navigate to login page...');
    await page.goto('https://church-solar-app.vercel.app/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('2. Login...');
    await page.type('input[type="email"]', 'e2e_complete_test@example.com');
    await page.type('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    await page.waitForFunction(() => window.location.pathname.includes('dashboard') || window.location.pathname === '/', { timeout: 30000 });
    console.log('3. Logged in!');
    
    console.log('4. Navigate directly to Income page...');
    await page.goto('https://church-solar-app.vercel.app/finance/income', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait longer for API calls to complete
    await new Promise(r => setTimeout(r, 5000));
    
    // Check page state
    const pageHtml = await page.content();
    const hasRecordButton = pageHtml.includes('Record Income');
    const hasError = pageHtml.includes('error') || pageHtml.includes('Error');
    console.log('5. Page state - Has Record Income button:', hasRecordButton, '| Has error:', hasError);
    
    // Get all select elements
    const selects = await page.$$eval('select', sels => 
      sels.map(s => ({
        name: s.name,
        id: s.id,
        options: Array.from(s.options).map(o => o.text)
      }))
    );
    console.log('6. Select elements on page:', selects);
    
    // Click the Record Income button
    const btn = await page.$('button:has-text("Record Income")');
    if (!btn) {
      const allBtns = await page.$$eval('button', btns => btns.map(b => b.textContent));
      const recordBtn = allBtns.findIndex(b => b?.includes('Record Income'));
      if (recordBtn >= 0) {
        const btns = await page.$$('button');
        await btns[recordBtn].click();
        console.log('7. Clicked button #' + recordBtn);
      }
    } else {
      await btn.click();
      console.log('7. Clicked Record Income');
    }
    
    // Wait for modal
    await new Promise(r => setTimeout(r, 2000));
    
    // Get all selects in the modal
    const modalSelects = await page.$$eval('select', sels => 
      sels.map(s => ({
        name: s.name,
        className: s.className,
        options: Array.from(s.options).map(o => ({text: o.text, value: o.value}))
      }))
    );
    
    console.log('8. Modal selects:', JSON.stringify(modalSelects, null, 2));
    
    // Check for category select specifically
    const categorySelect = modalSelects.find(s => s.options.some(o => o.text.includes('category') || o.text === 'Tithes'));
    if (categorySelect) {
      console.log('9. ✅ Category dropdown found with', categorySelect.options.length, 'options');
      console.log('   Categories:', categorySelect.options.map(o => o.text));
    } else {
      console.log('9. ❌ No category dropdown found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
