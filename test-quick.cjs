const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  
  console.log('\n=== QUICK TEST ===\n');
  
  try {
    // Login
    console.log('1. Login...');
    await page.goto('https://church-solar-app.vercel.app/login');
    await new Promise(r => setTimeout(r, 3000));
    await page.type('input[type="email"]', 'pastor@gracechurch.org');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 6000));
    
    const urlAfterLogin = page.url();
    console.log('   URL after login:', urlAfterLogin);
    
    // Budget page
    console.log('\n2. Budget Page...');
    await page.goto('https://church-solar-app.vercel.app/finance/budget');
    await new Promise(r => setTimeout(r, 5000));
    
    const budgetUrl = page.url();
    console.log('   Current URL:', budgetUrl);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/budget-screenshot.png' });
    console.log('   Screenshot saved to /tmp/budget-screenshot.png');
    
    const content = await page.content();
    console.log('   Content length:', content.length);
    console.log('   Contains "Budget":', content.includes('Budget'));
    console.log('   Contains "Login":', content.includes('Sign In') || content.includes('Login'));
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
