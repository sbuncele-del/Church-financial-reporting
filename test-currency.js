const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  console.log('Testing ZAR Currency Display...\n');
  await page.goto('https://frontend-eosin-omega-72.vercel.app/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const bodyText = await page.$eval('body', el => el.innerText);
  
  console.log('=== CURRENCY CHECK ===');
  
  // Check for Rand formatting (R 12,500.00 or R12 500,00)
  const hasRandFormat = bodyText.includes('R 12') || bodyText.includes('R12') || bodyText.includes('R 8');
  const hasUSDFormat = bodyText.includes('$12') || bodyText.includes('$8') || bodyText.includes('$ 12');
  
  console.log('Contains ZAR (Rands):', hasRandFormat ? '✅ YES' : '❌ NO');
  console.log('Contains USD ($):', hasUSDFormat ? '⚠️ YES (should be gone)' : '✅ NO (good!)');
  
  // Show actual financial values from page
  console.log('\n=== SAMPLE CONTENT ===');
  const lines = bodyText.split('\n').filter(l => l.includes('12,500') || l.includes('8,500') || l.includes('4,000') || l.includes('R '));
  lines.slice(0, 10).forEach(l => console.log(l.trim()));
  
  // Take screenshot
  await page.screenshot({ path: 'test-currency.png', fullPage: true });
  console.log('\nScreenshot saved: test-currency.png');
  
  await browser.close();
})();
