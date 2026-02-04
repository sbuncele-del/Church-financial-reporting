const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('Income Page') || msg.text().includes('API') || msg.text().includes('Error')) {
      console.log('BROWSER:', msg.text());
    }
  });
  
  console.log('1. Login...');
  await page.goto('https://church-solar-app.vercel.app/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'sipho@solarchurch.org');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('2. Go to income page...');
  await page.goto('https://church-solar-app.vercel.app/solar/resources/financial/income', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Take screenshot of the page
  await page.screenshot({ path: 'test-results/income-page-debug.png', fullPage: true });
  console.log('Screenshot 1 saved');
  
  // Check for any buttons
  const pageContent = await page.content();
  const hasRecordButton = pageContent.includes('Record Income');
  console.log('Has Record Income button:', hasRecordButton);
  
  // Try clicking the button
  try {
    await page.click('button.btn-primary');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'test-results/income-modal-debug.png', fullPage: true });
    console.log('Screenshot 2 saved - modal');
    
    // Count select options
    const selectOptions = await page.$$eval('select option', opts => opts.map(o => o.textContent));
    console.log('SELECT OPTIONS:', selectOptions.length);
    console.log('First 10:', selectOptions.slice(0, 10));
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
  console.log('Done');
})();
