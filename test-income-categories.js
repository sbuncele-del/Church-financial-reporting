/**
 * Test Income page category dropdown
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen to console and network errors
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Income') || text.includes('Error') || text.includes('categories')) {
      console.log('BROWSER LOG:', text);
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/finance/income-categories') || url.includes('/members/summary')) {
      try {
        const json = await response.json();
        console.log(`API ${url.split('/').pop()}: ${JSON.stringify(json).substring(0, 100)}`);
      } catch (e) {}
    }
  });

  try {
    console.log('1. Navigate to login page...');
    await page.goto('https://church-solar-app.vercel.app/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('2. Login with test user...');
    await page.type('input[type="email"]', 'e2e_complete_test@example.com');
    await page.type('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForFunction(() => window.location.pathname.includes('dashboard') || window.location.pathname === '/', { timeout: 30000 });
    console.log('3. Logged in, at:', await page.url());
    
    // Navigate to Income page
    console.log('4. Navigate to Income page...');
    await page.goto('https://church-solar-app.vercel.app/finance/income', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    console.log('5. Current URL:', await page.url());
    
    // Look for Record Income button
    const recordBtn = await page.$('button');
    const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent));
    console.log('6. Buttons found:', buttons.filter(b => b.includes('Income') || b.includes('Record')));
    
    // Click Record Income button
    const recordIncomeBtn = await page.$x("//button[contains(., 'Record Income')]");
    if (recordIncomeBtn.length > 0) {
      console.log('7. Clicking Record Income button...');
      await recordIncomeBtn[0].click();
      await page.waitForTimeout(2000);
      
      // Check for modal and select
      const modal = await page.$('.fixed.inset-0');
      console.log('8. Modal opened:', !!modal);
      
      // Get select options
      const selectOptions = await page.$$eval('select option', opts => opts.map(o => o.textContent));
      console.log('9. Select options found:', selectOptions.length);
      console.log('10. Categories in dropdown:', selectOptions.slice(1)); // Skip "Select category" placeholder
    } else {
      console.log('ERROR: Record Income button not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
