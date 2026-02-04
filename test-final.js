/**
 * Final test with correct selectors
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
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
    
    console.log('3. Go to Income page...');
    await page.goto('https://church-solar-app.vercel.app/finance/income', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 4000));
    
    const currentUrl = await page.url();
    console.log('4. Current URL:', currentUrl);
    
    // Check what's on the page
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('5. Page content preview:', pageText.replace(/\n/g, ' ').substring(0, 200));
    
    // Find and click Record Income
    const recordBtnText = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Record Income'));
      return btn ? btn.textContent : 'NOT FOUND';
    });
    console.log('6. Record Income button:', recordBtnText);
    
    if (recordBtnText !== 'NOT FOUND') {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent?.includes('Record Income'));
        if (btn) btn.click();
      });
      console.log('7. Clicked Record Income');
      
      await new Promise(r => setTimeout(r, 2000));
      
      // Get modal selects
      const selects = await page.evaluate(() => {
        const sels = Array.from(document.querySelectorAll('select'));
        return sels.map(s => ({
          options: Array.from(s.options).map(o => o.text)
        }));
      });
      
      console.log('8. Selects in modal:', selects.length);
      selects.forEach((s, i) => {
        if (s.options.length > 0) {
          console.log(`   Select ${i}: [${s.options.join(', ')}]`);
        }
      });
      
      // Find category select (first one should be categories)
      const firstSelect = selects[0];
      if (firstSelect && firstSelect.options.length > 1) {
        const hasCategories = firstSelect.options.some(o => 
          o.includes('Tithe') || o.includes('Offering') || o.includes('category')
        );
        console.log('9. RESULT:', hasCategories ? '✅ Categories showing!' : '❌ Categories NOT showing');
        console.log('   Options:', firstSelect.options);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
