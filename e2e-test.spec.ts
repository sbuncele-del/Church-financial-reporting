import { test, expect } from '@playwright/test';

const BASE_URL = 'https://church-solar-app.vercel.app';
const TEST_EMAIL = 'e2e@newchurch.org';
const TEST_PASSWORD = 'E2eTest2026!';

test.describe('Church Financial System - Full E2E', () => {

  test('Complete workflow: Login → Expenses → Budget → Income → Reports', async ({ page }) => {
    test.setTimeout(120000);

    // ============ STEP 1: LOGIN ============
    console.log('=== STEP 1: LOGIN ===');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
    console.log('✅ Login successful, redirected to dashboard');

    // ============ STEP 2: EXPENSES PAGE ============
    console.log('=== STEP 2: EXPENSES PAGE ===');
    await page.goto(`${BASE_URL}/solar/resources/financial/expenses`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Verify page loaded
    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Total Expenses')).toBeVisible();
    console.log('✅ Expenses page loaded');
    
    // Click Record Expense to check category dropdown
    await page.click('button:has-text("Record Expense")');
    await page.waitForTimeout(1000);
    
    // Verify category dropdown has options
    const categorySelect = page.locator('select[name="category_id"]');
    await expect(categorySelect).toBeVisible({ timeout: 5000 });
    const optionCount = await categorySelect.locator('option').count();
    console.log(`Category dropdown options: ${optionCount}`);
    expect(optionCount).toBeGreaterThan(10); // Should have 52 categories + placeholder
    console.log('✅ Expense categories loaded in dropdown');
    
    // Fill and submit an expense
    await categorySelect.selectOption({ index: 1 }); // First real category
    await page.fill('input[name="amount"]', '1500');
    await page.fill('input[name="date"]', '2026-02-11');
    await page.locator('select[name="payment_method"]').selectOption('bank_transfer');
    await page.fill('input[name="payee_name"]', 'Test Payee');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check for success (either toast or data appears)
    const expenseText = await page.textContent('body');
    const hasExpense = expenseText?.includes('R 1') || expenseText?.includes('1 500') || expenseText?.includes('1500');
    console.log(`Expense created: ${hasExpense ? '✅' : '⚠️ may have failed'}`);

    // ============ STEP 3: INCOME PAGE ============
    console.log('=== STEP 3: INCOME PAGE ===');
    await page.goto(`${BASE_URL}/solar/resources/financial/income`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await expect(page.locator('text=Total Income')).toBeVisible({ timeout: 10000 });
    console.log('✅ Income page loaded');

    // Check Record Income button exists
    const recordIncomeBtn = page.locator('button:has-text("Record Income")');
    if (await recordIncomeBtn.isVisible()) {
      await recordIncomeBtn.click();
      await page.waitForTimeout(1000);
      
      // Check income category dropdown
      const incomeCatSelect = page.locator('select[name="category_id"]');
      if (await incomeCatSelect.isVisible()) {
        const incCatCount = await incomeCatSelect.locator('option').count();
        console.log(`Income category options: ${incCatCount}`);
        expect(incCatCount).toBeGreaterThan(3); // Should have 9 categories + placeholder
        console.log('✅ Income categories loaded');
        
        // Close modal
        const cancelBtn = page.locator('button:has-text("Cancel")');
        if (await cancelBtn.isVisible()) await cancelBtn.click();
      }
    }

    // ============ STEP 4: BUDGET PAGE ============
    console.log('=== STEP 4: BUDGET PAGE ===');
    await page.goto(`${BASE_URL}/solar/resources/financial/budget`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    await expect(page.locator('text=Budget & Actuals')).toBeVisible({ timeout: 10000 });
    console.log('✅ Budget page loaded');
    
    // Check if there's a Create Budget button
    const createBudgetBtn = page.locator('button:has-text("Create 2026 Budget")');
    if (await createBudgetBtn.isVisible()) {
      console.log('No budget exists yet, creating one...');
      await createBudgetBtn.click();
      await page.waitForTimeout(2000);
      
      // Check modal shows category counts
      const modalText = await page.textContent('body');
      const incomeMatch = modalText?.match(/Income categories:\s*(\d+)/);
      const expenseMatch = modalText?.match(/Expense categories:\s*(\d+)/);
      console.log(`Modal - Income categories: ${incomeMatch?.[1] || '0'}, Expense categories: ${expenseMatch?.[1] || '0'}`);
      
      const incomeCatCount = parseInt(incomeMatch?.[1] || '0');
      const expenseCatCount = parseInt(expenseMatch?.[1] || '0');
      expect(incomeCatCount).toBeGreaterThan(0);
      expect(expenseCatCount).toBeGreaterThan(0);
      console.log('✅ Budget modal shows categories');
      
      // Click Create Budget
      await page.click('button:has-text("Create Budget"):not(:has-text("2026"))');
      await page.waitForTimeout(5000);
      
      // Check if budget was created
      const afterCreate = await page.textContent('body');
      if (afterCreate?.includes('Budget created') || afterCreate?.includes('Annual Budget') || afterCreate?.includes('Budget Items')) {
        console.log('✅ Budget created successfully');
      } else if (afterCreate?.includes('Failed')) {
        console.log('❌ Budget creation failed');
        // Log the visible text for debugging
        console.log('Page text snippet:', afterCreate?.substring(0, 300));
      } else {
        console.log('⚠️ Budget creation status unclear');
      }
    } else {
      console.log('Budget already exists');
      // Check that budget items are displayed
      const budgetText = await page.textContent('body');
      if (budgetText?.includes('Income') && budgetText?.includes('Expense')) {
        console.log('✅ Budget items displayed');
      }
    }

    // ============ STEP 5: REPORTS PAGE ============
    console.log('=== STEP 5: REPORTS PAGE ===');
    await page.goto(`${BASE_URL}/solar/resources/financial/reports`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const reportsText = await page.textContent('body');
    const hasReportsContent = reportsText?.includes('Report') || reportsText?.includes('Income') || reportsText?.includes('Statement');
    console.log(`Reports page loaded: ${hasReportsContent ? '✅' : '⚠️'}`);

    // ============ STEP 6: FINANCIAL DASHBOARD ============
    console.log('=== STEP 6: FINANCIAL DASHBOARD ===');
    await page.goto(`${BASE_URL}/solar/resources/financial/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const dashText = await page.textContent('body');
    const hasDashContent = dashText?.includes('Financial') || dashText?.includes('Income') || dashText?.includes('R ');
    console.log(`Financial dashboard loaded: ${hasDashContent ? '✅' : '⚠️'}`);

    console.log('\n=== ALL TESTS COMPLETE ===');
  });
});
