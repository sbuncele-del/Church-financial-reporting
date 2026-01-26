const puppeteer = require('puppeteer');

(async () => {
  console.log('=== COMPREHENSIVE MODULE TEST ===\n');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const errors = [];
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => errors.push(err.message));
  
  const results = {};
  
  // Helper to test a page
  async function testPage(name, url, expectedText) {
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      const bodyText = await page.$eval('body', el => el.innerText);
      const hasExpected = expectedText ? bodyText.includes(expectedText) : bodyText.length > 50;
      results[name] = {
        status: hasExpected ? '✅' : '⚠️',
        url: page.url(),
        hasContent: bodyText.length > 50,
        expectedFound: hasExpected,
        sample: bodyText.substring(0, 200)
      };
      console.log(`${results[name].status} ${name}: ${hasExpected ? 'OK' : 'Content missing'}`);
    } catch (e) {
      results[name] = { status: '❌', error: e.message };
      console.log(`❌ ${name}: ${e.message}`);
    }
  }
  
  const baseUrl = 'https://frontend-eosin-omega-72.vercel.app';
  
  // Test all modules
  console.log('1. Testing Dashboard...');
  await testPage('Dashboard', `${baseUrl}/dashboard`, 'Dashboard');
  
  console.log('2. Testing SOLAR Dashboard...');
  await testPage('SOLAR Dashboard', `${baseUrl}/solar/dashboard`, 'SOLAR');
  
  console.log('3. Testing SOLAR Assessment...');
  await testPage('SOLAR Assessment', `${baseUrl}/solar/assessment`, 'Assessment');
  
  console.log('4. Testing Finance - Income...');
  await testPage('Finance Income', `${baseUrl}/finance/income`, 'Income');
  
  console.log('5. Testing Finance - Expenses...');
  await testPage('Finance Expenses', `${baseUrl}/finance/expenses`, 'Expense');
  
  console.log('6. Testing Finance - Reports...');
  await testPage('Finance Reports', `${baseUrl}/finance/reports`, 'Report');
  
  console.log('7. Testing Members...');
  await testPage('Members', `${baseUrl}/members`, 'Member');
  
  console.log('8. Testing Settings...');
  await testPage('Settings', `${baseUrl}/settings`, 'Setting');
  
  console.log('\n=== RESULTS SUMMARY ===');
  for (const [name, result] of Object.entries(results)) {
    console.log(`${result.status} ${name}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }
  
  console.log('\n=== ERRORS CAPTURED ===');
  if (errors.length === 0) {
    console.log('No JavaScript errors!');
  } else {
    errors.forEach(err => console.log(`ERROR: ${err}`));
  }
  
  // Take screenshots of key pages
  console.log('\n=== TAKING SCREENSHOTS ===');
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'test-dashboard.png', fullPage: true });
  console.log('Saved: test-dashboard.png');
  
  await page.goto(`${baseUrl}/solar/dashboard`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'test-solar.png', fullPage: true });
  console.log('Saved: test-solar.png');
  
  await page.goto(`${baseUrl}/members`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'test-members.png', fullPage: true });
  console.log('Saved: test-members.png');
  
  await browser.close();
  console.log('\n=== TEST COMPLETE ===');
})();
