/**
 * Test Expense categories
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  try {
    console.log('1. Login...');
    await page.goto('https://church-solar-app.vercel.app/login', { waitUntil: 'networkidle0', timeout: 60000 });
    await page.type('input[type="email"]', 'e2e_complete_test@example.com');
    await page.type('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !window.location.pathname.includes('login'), { timeout: 30000 });
    console.log('2. Logged in!');
    
    console.log('3. Navigate to Expenses...');
    await page.goto('https://church-solar-app.vercel.app/solar/resources/financial/expenses', { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    });
    
    await page.waitForFunction(() => {
      const body = document.body.innerText;
      return body.includes('Expense') || body.includes('Record');
    }, { timeout: 30000 });
    console.log('4. Page loaded!');
    
    const hasBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent?.includes('Record Expense'));
    });
    console.log('5. Has Record Expense button:', hasBtn);
    
    if (hasBtn) {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent?.includes('Record Expense'));
        btn?.click();
      });
      
      await page.waitForSelector('select', { timeout: 5000 });
      console.log('6. Modal opened!');
      
      const firstSelect = await page.evaluate(() => {
        const sel = document.querySelector('select');
        if (!sel) return [];
        return Array.from(sel.options).map(o => o.text);
      });
      
      console.log('7. Expense categories:', firstSelect.length, 'options');
      console.log('   First 10:', firstSelect.slice(0, 10));
      
      if (firstSelect.length > 5) {
        console.log('✅✅✅ SUCCESS! Expense categories are showing!');
      } else {
        console.log('❌ Only', firstSelect.length, 'expense categories');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
