/**
 * Test with proper waiting for React to render
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
    if (text.includes('Income') || text.includes('categories')) {
      console.log('LOG:', text);
    }
  });

  try {
    console.log('1. Login...');
    await page.goto('https://church-solar-app.vercel.app/login', { waitUntil: 'networkidle0', timeout: 60000 });
    await page.type('input[type="email"]', 'e2e_complete_test@example.com');
    await page.type('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    await page.waitForFunction(() => !window.location.pathname.includes('login'), { timeout: 30000 });
    console.log('2. Logged in!');
    
    // Navigate with networkidle0 for complete page load
    console.log('3. Navigate to Income...');
    await page.goto('https://church-solar-app.vercel.app/solar/resources/financial/income', { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    });
    
    // Wait for React to fully render
    await page.waitForFunction(() => {
      const body = document.body.innerText;
      return body.includes('Income') || body.includes('Record');
    }, { timeout: 30000 });
    
    console.log('4. Page loaded!');
    
    // Now check for the button
    const hasBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent?.includes('Record Income'));
    });
    console.log('5. Has Record Income button:', hasBtn);
    
    if (hasBtn) {
      // Click it
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent?.includes('Record Income'));
        btn?.click();
      });
      
      // Wait for modal
      await page.waitForSelector('select', { timeout: 5000 });
      console.log('6. Modal opened!');
      
      // Get categories
      const firstSelect = await page.evaluate(() => {
        const sel = document.querySelector('select');
        if (!sel) return [];
        return Array.from(sel.options).map(o => o.text);
      });
      
      console.log('7. First select options:', firstSelect);
      
      if (firstSelect.length > 1 && (firstSelect.some(o => o.includes('Tithe')) || firstSelect.some(o => o.includes('First')))) {
        console.log('✅✅✅ SUCCESS! Categories are showing in dropdown!');
      } else {
        console.log('❌ Categories not showing. Options:', firstSelect);
      }
    } else {
      // Debug what's on the page
      const pageText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
      console.log('Page content:', pageText);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('Screenshot saved to error-screenshot.png');
  } finally {
    await browser.close();
  }
})();
