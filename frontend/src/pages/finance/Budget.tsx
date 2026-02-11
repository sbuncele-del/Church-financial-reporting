import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';
import { financeService } from '../../services/financeService';
import { useAuthStore } from '../../stores/authStore';
import type { Budget as BudgetType, BudgetItemCreate, IncomeCategory, ExpenseCategory } from '../../types';

export default function Budget() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [activeBudget, setActiveBudget] = useState<BudgetType | null>(null);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const { user } = useAuthStore();
  const churchId = user?.church_id;

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  useEffect(() => {
    loadData();
  }, [selectedYear, churchId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const [cats1, cats2, summary, budgetList] = await Promise.all([
        financeService.getIncomeCategories(churchId),
        financeService.getExpenseCategories(churchId),
        financeService.getSummary(startDate, endDate, churchId),
        financeService.getBudgets(selectedYear).catch((err) => {
          console.error('Failed to load budgets:', err);
          toast.error('Failed to load budgets');
          return [] as BudgetType[];
        }),
      ]);

      setIncomeCategories(cats1);
      setExpenseCategories(cats2);
      setFinanceSummary(summary);
      setBudgets(budgetList);

      // Auto-select the active budget for this year
      const active = budgetList.find((b: BudgetType) => b.is_active && b.year === selectedYear);
      setActiveBudget(active || budgetList[0] || null);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    try {
      // Build items from all categories
      const items: BudgetItemCreate[] = [];

      for (const cat of incomeCategories) {
        items.push({
          income_category_id: cat.id,
          is_income: true,
          annual_amount: 0,
        });
      }

      for (const cat of expenseCategories) {
        items.push({
          expense_category_id: cat.id,
          is_income: false,
          annual_amount: 0,
        });
      }

      const newBudget = await financeService.createBudget({
        name: `${selectedYear} Annual Budget`,
        description: `Annual budget for ${selectedYear}`,
        year: selectedYear,
        start_date: `${selectedYear}-01-01`,
        end_date: `${selectedYear}-12-31`,
        items,
      });

      toast.success('Budget created successfully');
      setShowCreateModal(false);
      await loadData();
      setActiveBudget(newBudget);
    } catch (error) {
      toast.error('Failed to create budget');
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await financeService.deleteBudget(budgetId);
      toast.success('Budget deleted');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const handleSaveAmount = async (itemId: number, item: any) => {
    if (!activeBudget) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0 || amount > 999999999.99) {
      toast.error('Please enter a valid amount (0 to 999,999,999.99)');
      return;
    }
    try {
      await financeService.updateBudgetItem(activeBudget.id, itemId, {
        income_category_id: item.income_category_id,
        expense_category_id: item.expense_category_id,
        is_income: item.is_income,
        annual_amount: amount,
      });
      toast.success('Budget updated');
      setEditingItemId(null);
      setEditAmount('');
      await loadData();
    } catch (error) {
      toast.error('Failed to update budget amount');
    }
  };

  const handleAddItem = async (categoryId: number, isIncome: boolean) => {
    if (!activeBudget) return;
    try {
      const data: BudgetItemCreate = {
        is_income: isIncome,
        annual_amount: 0,
        ...(isIncome ? { income_category_id: categoryId } : { expense_category_id: categoryId }),
      };
      await financeService.addBudgetItem(activeBudget.id, data);
      toast.success('Category added to budget');
      setShowAddItemModal(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  // Get actuals from the financial summary
  const getActualForCategory = (categoryName: string, isIncome: boolean): number => {
    if (!financeSummary) return 0;
    if (isIncome) {
      return financeSummary.income_by_category?.[categoryName] || 0;
    }
    return financeSummary.expenses_by_category?.[categoryName] || 0;
  };

  // Compute budget vs actual data
  const incomeItems = activeBudget?.items.filter(i => i.is_income) || [];
  const expenseItems = activeBudget?.items.filter(i => !i.is_income) || [];

  const totalBudgetedIncome = incomeItems.reduce((s, i) => s + Number(i.annual_amount || 0), 0);
  const totalBudgetedExpenses = expenseItems.reduce((s, i) => s + Number(i.annual_amount || 0), 0);
  const totalActualIncome = financeSummary?.total_income ? Number(financeSummary.total_income) : 0;
  const totalActualExpenses = financeSummary?.total_expenses ? Number(financeSummary.total_expenses) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget & Actuals</h1>
          <p className="text-gray-600">Track financial performance against budget targets</p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input w-32"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {!activeBudget && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create Budget
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Budgeted Income</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalBudgetedIncome)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Actual: {formatCurrency(totalActualIncome)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Budgeted Expenses</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalBudgetedExpenses)}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Actual: {formatCurrency(totalActualExpenses)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Budget</p>
              <p className={`text-xl font-bold ${totalBudgetedIncome - totalBudgetedExpenses >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(totalBudgetedIncome - totalBudgetedExpenses)}
              </p>
            </div>
            <div className={`p-2 rounded-full ${totalBudgetedIncome - totalBudgetedExpenses >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <CurrencyDollarIcon className={`h-5 w-5 ${totalBudgetedIncome - totalBudgetedExpenses >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Actual: {formatCurrency(totalActualIncome - totalActualExpenses)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Budget Status</p>
              <p className="text-xl font-bold text-gray-800">
                {activeBudget ? (activeBudget.is_approved ? 'Approved' : 'Draft') : 'No Budget'}
              </p>
            </div>
            <div className={`p-2 rounded-full ${activeBudget?.is_approved ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <ChartBarIcon className={`h-5 w-5 ${activeBudget?.is_approved ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
          </div>
          {activeBudget && (
            <p className="text-xs text-gray-400 mt-2">{activeBudget.name}</p>
          )}
        </div>
      </div>

      {/* No Budget State */}
      {!activeBudget ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget for {selectedYear}</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create an annual budget to set financial targets and track performance against them.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            Create {selectedYear} Budget
          </button>
        </div>
      ) : (
        <>
          {/* Budget Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">{activeBudget.name}</h2>
              {activeBudget.is_approved && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                  Approved
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteBudget(activeBudget.id)}
                className="btn-secondary flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Income Budget Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <h2 className="text-lg font-semibold text-green-800">Income Budget</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budgeted</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-20">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {incomeItems.map((item) => {
                    const budgeted = Number(item.annual_amount || 0);
                    const actual = getActualForCategory(item.category_name || '', true);
                    const variance = actual - budgeted;
                    const pct = budgeted > 0 ? ((actual / budgeted) * 100) : (actual > 0 ? 100 : 0);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-700">{item.category_name}</td>
                        <td className="px-6 py-3 text-sm text-right">
                          {editingItemId === item.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="input w-28 text-right text-sm py-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveAmount(item.id, item);
                                  if (e.key === 'Escape') { setEditingItemId(null); setEditAmount(''); }
                                }}
                              />
                              <button onClick={() => handleSaveAmount(item.id, item)} className="text-green-600 hover:text-green-800">
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => { setEditingItemId(null); setEditAmount(''); }} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-medium">{formatCurrency(budgeted)}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-right text-green-600">{formatCurrency(actual)}</td>
                        <td className={`px-6 py-3 text-sm text-right font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(variance)}
                        </td>
                        <td className={`px-6 py-3 text-sm text-right ${pct >= 100 ? 'text-green-600' : pct >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {pct.toFixed(0)}%
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => { setEditingItemId(item.id); setEditAmount(String(budgeted)); }}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-green-50">
                  <tr className="font-bold">
                    <td className="px-6 py-3 text-sm text-green-800">Total Income</td>
                    <td className="px-6 py-3 text-sm text-right text-green-800">{formatCurrency(totalBudgetedIncome)}</td>
                    <td className="px-6 py-3 text-sm text-right text-green-700">{formatCurrency(totalActualIncome)}</td>
                    <td className={`px-6 py-3 text-sm text-right ${totalActualIncome - totalBudgetedIncome >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {formatCurrency(totalActualIncome - totalBudgetedIncome)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-green-700">
                      {totalBudgetedIncome > 0 ? ((totalActualIncome / totalBudgetedIncome) * 100).toFixed(0) : 0}%
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Expense Budget Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100">
              <h2 className="text-lg font-semibold text-red-800">Expense Budget</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budgeted</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-20">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenseItems.map((item) => {
                    const budgeted = Number(item.annual_amount || 0);
                    const actual = getActualForCategory(item.category_name || '', false);
                    const remaining = budgeted - actual;
                    const pct = budgeted > 0 ? ((actual / budgeted) * 100) : (actual > 0 ? 100 : 0);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-700">{item.category_name}</td>
                        <td className="px-6 py-3 text-sm text-right">
                          {editingItemId === item.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="input w-28 text-right text-sm py-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveAmount(item.id, item);
                                  if (e.key === 'Escape') { setEditingItemId(null); setEditAmount(''); }
                                }}
                              />
                              <button onClick={() => handleSaveAmount(item.id, item)} className="text-green-600 hover:text-green-800">
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => { setEditingItemId(null); setEditAmount(''); }} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-medium">{formatCurrency(budgeted)}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-right text-red-600">{formatCurrency(actual)}</td>
                        <td className={`px-6 py-3 text-sm text-right font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(remaining)}
                        </td>
                        <td className={`px-6 py-3 text-sm text-right ${pct <= 75 ? 'text-green-600' : pct <= 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {pct.toFixed(0)}%
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => { setEditingItemId(item.id); setEditAmount(String(budgeted)); }}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-red-50">
                  <tr className="font-bold">
                    <td className="px-6 py-3 text-sm text-red-800">Total Expenses</td>
                    <td className="px-6 py-3 text-sm text-right text-red-800">{formatCurrency(totalBudgetedExpenses)}</td>
                    <td className="px-6 py-3 text-sm text-right text-red-700">{formatCurrency(totalActualExpenses)}</td>
                    <td className={`px-6 py-3 text-sm text-right ${totalBudgetedExpenses - totalActualExpenses >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(totalBudgetedExpenses - totalActualExpenses)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-red-700">
                      {totalBudgetedExpenses > 0 ? ((totalActualExpenses / totalBudgetedExpenses) * 100).toFixed(0) : 0}%
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create {selectedYear} Budget</h3>
              <p className="text-sm text-gray-600 mb-6">
                This will create an annual budget with all your income and expense categories.
                You can then set budget targets for each category.
              </p>
              <div className="text-sm text-gray-500 mb-4 bg-gray-50 rounded p-3">
                <p><strong>Income categories:</strong> {incomeCategories.length}</p>
                <p><strong>Expense categories:</strong> {expenseCategories.length}</p>
                <p><strong>Period:</strong> Jan 1 - Dec 31, {selectedYear}</p>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleCreateBudget} className="btn-primary">
                  Create Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
