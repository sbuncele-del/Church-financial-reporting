/**
 * Check for JavaScript errors
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture ALL console messages
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}]`, msg.text());
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  try {
    console.log('=== Navigate to Income page ===');
    await page.goto('https://church-solar-app.vercel.app/login', { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Login
    await page.type('input[type="email"]', 'e2e_complete_test@example.com');
    await page.type('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('login'), { timeout: 30000 });
    
    console.log('=== Logged in, going to income page ===');
    await page.goto('https://church-solar-app.vercel.app/solar/resources/financial/income', { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    });
    
    await new Promise(r => setTimeout(r, 5000));
    
    // Check for errors in window
    const windowErrors = await page.evaluate(() => {
      return window.__errors || [];
    });
    console.log('Window errors:', windowErrors);
    
  } catch (error) {
    console.error('Test Error:', error.message);
  } finally {
    await browser.close();
  }
})();
