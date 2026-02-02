const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  console.log('\n=== BUDGET & REPORTS TEST ===\n');
  
  // 1. Login
  console.log('1. Login...');
  await page.goto('https://church-solar-app.vercel.app/login', { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.type('input[type="email"]', 'pastor@gracechurch.org');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
  console.log('   ✅ Logged in');
  
  // 2. Test Budget page
  console.log('\n2. Testing Budget page...');
  await page.goto('https://church-solar-app.vercel.app/finance/budget', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.waitForSelector('h1', { timeout: 10000 });
  
  const budgetTitle = await page.$eval('h1', el => el.textContent);
  console.log(`   Title: ${budgetTitle}`);
  
  // Check for grouped/flat toggle buttons
  const toggleButtons = await page.$$eval('button', btns => btns.map(b => b.textContent).filter(t => t.includes('Grouped') || t.includes('All Categories')));
  console.log(`   View toggles: ${toggleButtons.length > 0 ? '✅ Found' : '❌ Missing'}`);
  
  // Check for income groups
  const incomeGroupsText = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('Tithes & Offerings') || text.includes('Income Budget');
  });
  console.log(`   Income Budget section: ${incomeGroupsText ? '✅ Found' : '❌ Missing'}`);
  
  // Check for expense groups
  const expenseGroupsText = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('Personnel') || text.includes('Expense Budget');
  });
  console.log(`   Expense Budget section: ${expenseGroupsText ? '✅ Found' : '❌ Missing'}`);
  
  // Check for period selector
  const hasYearSelector = await page.$('select');
  console.log(`   Period selector: ${hasYearSelector ? '✅ Found' : '❌ Missing'}`);
  
  // 3. Test Reports page
  console.log('\n3. Testing Reports page...');
  await page.goto('https://church-solar-app.vercel.app/finance/reports', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.waitForSelector('h1', { timeout: 10000 });
  
  const reportsTitle = await page.$eval('h1', el => el.textContent);
  console.log(`   Title: ${reportsTitle}`);
  
  // Check for report types
  const reportTypes = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      weekly: text.includes('Weekly Report'),
      income: text.includes('Income Statement'),
      monthly: text.includes('Monthly Comparison'),
      category: text.includes('Category Breakdown'),
    };
  });
  console.log(`   Weekly Report: ${reportTypes.weekly ? '✅' : '❌'}`);
  console.log(`   Income Statement: ${reportTypes.income ? '✅' : '❌'}`);
  console.log(`   Monthly Comparison: ${reportTypes.monthly ? '✅' : '❌'}`);
  console.log(`   Category Breakdown: ${reportTypes.category ? '✅' : '❌'}`);
  
  // Check for quick date buttons
  const quickDateButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const texts = buttons.map(b => b.textContent);
    return {
      thisWeek: texts.some(t => t.includes('This Week')),
      lastWeek: texts.some(t => t.includes('Last Week')),
      thisMonth: texts.some(t => t.includes('This Month')),
      lastMonth: texts.some(t => t.includes('Last Month')),
    };
  });
  console.log(`   This Week button: ${quickDateButtons.thisWeek ? '✅' : '❌'}`);
  console.log(`   Last Week button: ${quickDateButtons.lastWeek ? '✅' : '❌'}`);
  console.log(`   This Month button: ${quickDateButtons.thisMonth ? '✅' : '❌'}`);
  console.log(`   Last Month button: ${quickDateButtons.lastMonth ? '✅' : '❌'}`);
  
  // Test clicking Weekly Report
  console.log('\n4. Testing Weekly Report generation...');
  const weeklyButton = await page.$('button:has-text("Weekly Report")');
  if (weeklyButton) {
    await weeklyButton.click();
    await page.waitForTimeout(2000);
  } else {
    // Click by text match
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Weekly Report')) {
          btn.click();
          break;
        }
      }
    });
    await page.waitForTimeout(2000);
  }
  
  const weeklyContent = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('Select Week') || text.includes('Sunday');
  });
  console.log(`   Weekly report options: ${weeklyContent ? '✅ Found' : '❌ Missing'}`);
  
  console.log('\n=== ALL TESTS COMPLETE ===\n');
  
  await browser.close();
})();
