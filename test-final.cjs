const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  
  console.log('\n=== COMPREHENSIVE TEST ===\n');
  
  try {
    // Login
    console.log('1. Login...');
    await page.goto('https://church-solar-app.vercel.app/login');
    await new Promise(r => setTimeout(r, 3000));
    await page.type('input[type="email"]', 'pastor@gracechurch.org');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 5000));
    console.log('   ✅ Login submitted');
    
    // Budget page
    console.log('\n2. Budget Page...');
    await page.goto('https://church-solar-app.vercel.app/finance/budget');
    await new Promise(r => setTimeout(r, 4000));
    const budgetContent = await page.content();
    console.log('   Title: ' + (budgetContent.includes('Budget Management') ? '✅ Budget Management' : '❌ Not found'));
    console.log('   Grouped view: ' + (budgetContent.includes('Grouped') ? '✅' : '❌'));
    console.log('   All Categories view: ' + (budgetContent.includes('All Categories') ? '✅' : '❌'));
    console.log('   Income Budget section: ' + (budgetContent.includes('Income Budget') ? '✅' : '❌'));
    console.log('   Expense Budget section: ' + (budgetContent.includes('Expense Budget') ? '✅' : '❌'));
    
    // Reports page
    console.log('\n3. Reports Page...');
    await page.goto('https://church-solar-app.vercel.app/finance/reports');
    await new Promise(r => setTimeout(r, 4000));
    const reportsContent = await page.content();
    console.log('   Title: ' + (reportsContent.includes('Financial Reports') ? '✅ Financial Reports' : '❌ Not found'));
    console.log('   Weekly Report: ' + (reportsContent.includes('Weekly Report') ? '✅' : '❌'));
    console.log('   Income Statement: ' + (reportsContent.includes('Income Statement') ? '✅' : '❌'));
    console.log('   Monthly Comparison: ' + (reportsContent.includes('Monthly Comparison') ? '✅' : '❌'));
    console.log('   Category Breakdown: ' + (reportsContent.includes('Category Breakdown') ? '✅' : '❌'));
    console.log('   This Week btn: ' + (reportsContent.includes('This Week') ? '✅' : '❌'));
    console.log('   Last Week btn: ' + (reportsContent.includes('Last Week') ? '✅' : '❌'));
    
    // Income page
    console.log('\n4. Income Page Categories...');
    await page.goto('https://church-solar-app.vercel.app/finance/income');
    await new Promise(r => setTimeout(r, 4000));
    const incomeOptions = await page.$$eval('select option', opts => opts.length);
    console.log(`   Dropdown options: ${incomeOptions} ${incomeOptions > 10 ? '✅' : '⚠️'}`);
    
    // Expenses page
    console.log('\n5. Expenses Page Categories...');
    await page.goto('https://church-solar-app.vercel.app/finance/expenses');
    await new Promise(r => setTimeout(r, 4000));
    const expenseOptions = await page.$$eval('select option', opts => opts.length);
    console.log(`   Dropdown options: ${expenseOptions} ${expenseOptions > 10 ? '✅' : '⚠️'}`);
    
    console.log('\n=== ALL TESTS COMPLETE ===\n');
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
