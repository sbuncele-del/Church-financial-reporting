/**
 * Debug rendering issue
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
    
    console.log('3. Navigate to Income...');
    await page.goto('https://church-solar-app.vercel.app/solar/resources/financial/income', { 
      waitUntil: 'networkidle0', 
      timeout: 60000 
    });
    
    // Wait 10 seconds
    await new Promise(r => setTimeout(r, 10000));
    
    // Check what we have
    const url = await page.url();
    const html = await page.content();
    const text = await page.evaluate(() => document.body.innerText);
    
    console.log('4. URL:', url);
    console.log('5. HTML length:', html.length);
    console.log('6. Text length:', text.length);
    console.log('7. First 500 chars of text:', text.substring(0, 500));
    
    // Check for React root
    const reactRoot = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.length : 0;
    });
    console.log('8. React root content length:', reactRoot);
    
    // Check for any buttons
    const allButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim());
    });
    console.log('9. All buttons:', allButtons);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
