const { chromium } = require('playwright');

(async () => {
  console.log('Starting browser test...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`${msg.type()}: ${msg.text()}`));
  
  // Capture errors
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('Navigating to frontend...');
  try {
    await page.goto('https://frontend-eosin-omega-72.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('Navigation error:', e.message);
  }
  
  console.log('\n=== Page Title ===');
  console.log(await page.title());
  
  console.log('\n=== Page URL ===');
  console.log(page.url());
  
  console.log('\n=== Visible Text Content ===');
  const bodyText = await page.textContent('body');
  console.log(bodyText?.substring(0, 1000) || 'NO TEXT FOUND');
  
  console.log('\n=== Console Logs ===');
  consoleLogs.forEach(log => console.log(log));
  
  console.log('\n=== Page Errors ===');
  if (errors.length === 0) {
    console.log('No errors!');
  } else {
    errors.forEach(err => console.log('ERROR:', err));
  }
  
  console.log('\n=== Screenshot saved ===');
  await page.screenshot({ path: 'frontend-test.png', fullPage: true });
  console.log('Saved to frontend-test.png');
  
  await browser.close();
  console.log('\nTest complete!');
})();
