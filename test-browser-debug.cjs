const puppeteer = require('puppeteer');

const BASE_URL = 'https://church-solar-app.vercel.app';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Capture all console messages
  page.on('console', msg => {
    const type = msg.type();
    if (['error', 'warn', 'log'].includes(type)) {
      console.log(`[BROWSER ${type.toUpperCase()}]`, msg.text());
    }
  });

  // Capture network requests and responses
  page.on('requestfailed', request => {
    console.log(`[NET FAIL] ${request.method()} ${request.url()} - ${request.failure().errorText}`);
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) {
      const corsHeader = response.headers()['access-control-allow-origin'] || 'MISSING';
      console.log(`[API ${response.status()}] ${response.request().method()} ${url.replace(BASE_URL, '')} | CORS: ${corsHeader}`);
    }
  });

  try {
    // Step 1: Load the login page
    console.log('\n=== STEP 1: Loading login page ===');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());
    
    // Take screenshot to see what's visible
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
    console.log('Body HTML:', bodyHTML);

    // Step 2: Login
    console.log('\n=== STEP 2: Logging in ===');
    // Wait longer and try different selectors
    await new Promise(r => setTimeout(r, 5000));
    
    const formExists = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      return Array.from(inputs).map(i => ({ type: i.type, name: i.name, id: i.id, placeholder: i.placeholder }));
    });
    console.log('Inputs found:', JSON.stringify(formExists));
    
    // If no login form, maybe we need to navigate through landing page
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({ href: a.href, text: a.textContent.trim() })).slice(0, 10);
    });
    console.log('Links found:', JSON.stringify(links));
    
    // Try waiting for the form
    const emailInput = await page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 10000 }).catch(() => null);
    if (!emailInput) {
      // Maybe there's a login button/link on the landing page
      console.log('No email input found, checking page state...');
      const pageText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
      console.log('Page text:', pageText);
      
      // Try clicking a login link if exists
      const loginLink = await page.$('a[href*="login"]');
      if (loginLink) {
        await loginLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 3000));
        console.log('After clicking login link, URL:', page.url());
      }
    }
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'e2e@newchurch.org');
    await page.type('input[type="password"]', 'E2eTest2026!');
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));
    console.log('After login URL:', page.url());

    // Check localStorage for auth data
    const authData = await page.evaluate(() => {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hasToken: !!parsed?.state?.token,
          hasUser: !!parsed?.state?.user,
          churchId: parsed?.state?.user?.church_id,
          email: parsed?.state?.user?.email,
        };
      }
      return null;
    });
    console.log('Auth state:', JSON.stringify(authData));

    // Step 3: Navigate to Expenses page
    console.log('\n=== STEP 3: Loading Expenses page ===');
    await page.goto(`${BASE_URL}/finance/expenses`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000)); // Extra wait for API calls

    console.log('Current URL:', page.url());

    // Check for error toasts
    const toasts = await page.evaluate(() => {
      const toastElements = document.querySelectorAll('[role="status"], .go685806154');
      return Array.from(toastElements).map(el => el.textContent);
    });
    console.log('Toast messages:', toasts);

    // Check page content
    const pageContent = await page.evaluate(() => {
      return {
        bodyText: document.body.innerText.substring(0, 500),
        hasExpensesTitle: document.body.innerText.includes('Expenses'),
        hasCategoryDropdown: !!document.querySelector('select'),
      };
    });
    console.log('Page has Expenses title:', pageContent.hasExpensesTitle);
    console.log('Page has category dropdown:', pageContent.hasCategoryDropdown);
    console.log('Page text (first 500 chars):', pageContent.bodyText);

    // Step 4: Navigate to Budget page
    console.log('\n=== STEP 4: Loading Budget page ===');
    await page.goto(`${BASE_URL}/finance/budget`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));

    const budgetContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        incomeMatch: text.match(/Income categories:\s*(\d+)/)?.[0] || 'not found',
        expenseMatch: text.match(/Expense categories:\s*(\d+)/)?.[0] || 'not found',
        bodyText: text.substring(0, 500),
      };
    });
    console.log('Income categories text:', budgetContent.incomeMatch);
    console.log('Expense categories text:', budgetContent.expenseMatch);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
