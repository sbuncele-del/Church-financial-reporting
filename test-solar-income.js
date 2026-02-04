/**
 * Test with correct SOLAR URL
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Income') || text.includes('Error') || text.includes('categories')) {
      console.log('BROWSER:', text);
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/v1/')) {
      const status = response.status();
      const path = url.split('/api/v1/')[1]?.split('?')[0] || 'unknown';
      if (status !== 200 && status !== 201) {
        console.log(`❌ [${status}] /${path}`);
      } else {
        console.log(`✅ [${status}] /${path}`);
      }
    }
  });

  try {
    console.log('1. Login...');
    await page.goto('https://church-solar-app.vercel.app/login', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.type('input[type="email"]', 'e2e_complete_test@example.com');
    await page.type('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('dashboard'), { timeout: 30000 });
    console.log('2. Logged in!');
    
    // Use the correct SOLAR URL
    console.log('3. Go to SOLAR Income page...');
    await page.goto('https://church-solar-app.vercel.app/solar/resources/financial/income', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));
    
    const currentUrl = await page.url();
    console.log('4. Current URL:', currentUrl);
    
    // Check page content
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('5. Page has "Income" text:', pageText.includes('Income'));
    console.log('6. Page has "Record" text:', pageText.includes('Record'));
    console.log('7. Page preview:', pageText.substring(0, 300).replace(/\n/g, ' | '));
    
    // Find Record Income button
    const recordBtnExists = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent?.includes('Record Income'));
    });
    console.log('8. Record Income button exists:', recordBtnExists);
    
    if (recordBtnExists) {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent?.includes('Record Income'));
        if (btn) btn.click();
      });
      console.log('9. Clicked Record Income');
      
      await new Promise(r => setTimeout(r, 2000));
      
      // Get all selects
      const selects = await page.evaluate(() => {
        const sels = Array.from(document.querySelectorAll('select'));
        return sels.map(s => Array.from(s.options).map(o => o.text));
      });
      
      console.log('10. Number of selects:', selects.length);
      selects.forEach((opts, i) => {
        console.log(`    Select ${i+1}:`, opts.length > 0 ? opts : '(empty)');
      });
      
      // Check first select for categories
      if (selects.length > 0 && selects[0].length > 1) {
        const hasCategories = selects[0].some(o => o.includes('Tithe') || o.includes('First Fruit') || o.includes('Offering'));
        if (hasCategories) {
          console.log('11. ✅✅✅ SUCCESS! Income categories ARE showing!');
          console.log('    Categories:', selects[0]);
        } else {
          console.log('11. ❌ Categories not showing. First select options:', selects[0]);
        }
      } else {
        console.log('11. ❌ No select elements or empty select');
      }
    } else {
      console.log('9. ❌ Record Income button NOT found');
      // Debug: list all buttons
      const allBtns = await page.evaluate(() => 
        Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim())
      );
      console.log('   All buttons on page:', allBtns);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
