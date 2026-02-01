const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('ERROR:', error.message));
  
  try {
    console.log('1. Going to login page...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle0' });
    
    console.log('2. Logging in...');
    await page.type('input[type="email"]', 'pastor@gracechurch.org');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('3. Going to income page...');
    await page.goto('http://localhost:3001/solar/resources/financial/income', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    console.log('4. Clicking Record Income button...');
    await page.waitForSelector('button:has-text("Record Income")', { timeout: 5000 });
    await page.click('button:has-text("Record Income")');
    await page.waitForTimeout(1000);
    
    console.log('5. Checking category dropdown...');
    const categories = await page.evaluate(() => {
      const select = document.querySelector('select[name="category_id"]');
      if (!select) return { error: 'Select not found' };
      const options = Array.from(select.options).map(opt => ({
        value: opt.value,
        text: opt.text
      }));
      return { count: options.length - 1, options }; // -1 for "Select category" option
    });
    
    console.log('6. Categories found:', JSON.stringify(categories, null, 2));
    
    if (categories.count === 0) {
      console.error('❌ FAILED: No categories in dropdown!');
      
      // Check console logs
      const logs = await page.evaluate(() => {
        return window.__consoleLogs || 'No logs captured';
      });
      console.log('Console logs:', logs);
      
      process.exit(1);
    }
    
    console.log(`✅ SUCCESS: Found ${categories.count} categories`);
    console.log('Categories:', categories.options.filter(o => o.value).map(o => o.text).join(', '));
    
    // Try to record income
    console.log('7. Filling income form...');
    await page.select('select[name="category_id"]', '3'); // First Fruits
    await page.type('input[name="amount"]', '100');
    await page.type('input[name="date"]', '2026-01-31');
    
    console.log('8. Submitting form...');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    console.log('✅ ALL TESTS PASSED');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
