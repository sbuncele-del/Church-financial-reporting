import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';
import { financeService } from '../../services/financeService';
import { useAuthStore } from '../../stores/authStore';

interface BudgetItem {
  id: number;
  category_id: number;
  category_name: string;
  budgeted: number;
  actual: number;
  variance: number;
  type: 'income' | 'expense';
}

export default function Budget() {
  const [loading, setLoading] = useState(true);
  const [incomeItems, setIncomeItems] = useState<BudgetItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<BudgetItem[]>([]);
  const [selectedYear, setSelectedYear] = useState('2026');
  const { user } = useAuthStore();
  const churchId = user?.church_id || 1;

  useEffect(() => {
    loadBudgetData();
  }, [selectedYear, churchId]);

  const loadBudgetData = async () => {
    setLoading(true);
    try {
      // Get date range for the selected year
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      // Fetch real data from API
      const [incomeCategories, expenseCategories, financeSummary] = await Promise.all([
        financeService.getIncomeCategories(churchId),
        financeService.getExpenseCategories(churchId),
        financeService.getSummary(startDate, endDate, churchId),
      ]);

      // Build income items with actual amounts from summary
      const incomeByCategory = financeSummary?.income_by_category || {};
      const incomeData: BudgetItem[] = incomeCategories.map((cat: any) => {
        const actual = incomeByCategory[cat.name] || 0;
        return {
          id: cat.id,
          category_id: cat.id,
          category_name: cat.name,
          budgeted: 0,
          actual,
          variance: actual,
          type: 'income' as const,
        };
      });

      // Build expense items with actual amounts from summary
      const expensesByCategory = financeSummary?.expenses_by_category || {};
      const expenseData: BudgetItem[] = expenseCategories.map((cat: any) => {
        const actual = expensesByCategory[cat.name] || 0;
        return {
          id: cat.id,
          category_id: cat.id,
          category_name: cat.name,
          budgeted: 0,
          actual,
          variance: -actual,
          type: 'expense' as const,
        };
      });

      setIncomeItems(incomeData);
      setExpenseItems(expenseData);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalActualIncome = incomeItems.reduce((sum, item) => sum + item.actual, 0);
  const totalActualExpenses = expenseItems.reduce((sum, item) => sum + item.actual, 0);
  const netPosition = totalActualIncome - totalActualExpenses;

  const activeIncomeItems = incomeItems.filter(item => item.actual > 0);
  const activeExpenseItems = expenseItems.filter(item => item.actual > 0);
  const hasData = activeIncomeItems.length > 0 || activeExpenseItems.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget & Actuals</h1>
          <p className="text-gray-600">Track financial performance against budget</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="input w-32"
        >
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalActualIncome)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalActualExpenses)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Position</p>
              <p className={`text-2xl font-bold ${netPosition >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(netPosition)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${netPosition >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <CurrencyDollarIcon className={`h-6 w-6 ${netPosition >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Data Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start recording income and expenses to see your budget performance here.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/solar/resources/financial/income" className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <PlusIcon className="h-5 w-5" />
              Record Income
            </a>
            <a href="/solar/resources/financial/expenses" className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              <PlusIcon className="h-5 w-5" />
              Record Expense
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <h2 className="text-lg font-semibold text-green-800">Income by Category</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {activeIncomeItems.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No income recorded yet</p>
              ) : (
                activeIncomeItems.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex justify-between items-center">
                    <span className="text-gray-700">{item.category_name}</span>
                    <span className="font-medium text-green-600">{formatCurrency(item.actual)}</span>
                  </div>
                ))
              )}
              {activeIncomeItems.length > 0 && (
                <div className="px-6 py-4 bg-green-50 flex justify-between items-center font-bold">
                  <span className="text-green-800">Total Income</span>
                  <span className="text-green-700">{formatCurrency(totalActualIncome)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100">
              <h2 className="text-lg font-semibold text-red-800">Expenses by Category</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {activeExpenseItems.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No expenses recorded yet</p>
              ) : (
                activeExpenseItems.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex justify-between items-center">
                    <span className="text-gray-700">{item.category_name}</span>
                    <span className="font-medium text-red-600">{formatCurrency(item.actual)}</span>
                  </div>
                ))
              )}
              {activeExpenseItems.length > 0 && (
                <div className="px-6 py-4 bg-red-50 flex justify-between items-center font-bold">
                  <span className="text-red-800">Total Expenses</span>
                  <span className="text-red-700">{formatCurrency(totalActualExpenses)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Budget targets are not yet configured. Currently showing actual income and expenses only.
        </p>
      </div>
    </div>
  );
}
