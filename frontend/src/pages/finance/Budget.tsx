import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  type: 'income' | 'expense';
}

export default function Budget() {
  const [loading, setLoading] = useState(true);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');

  useEffect(() => {
    loadBudgetData();
  }, [selectedPeriod]);

  const loadBudgetData = async () => {
    setLoading(true);
    try {
      // Mock budget data - will be replaced with API call
      const categories: BudgetCategory[] = [
        // Income categories
        { id: '1', name: 'Tithes & Offerings', budgeted: 150000, actual: 142500, variance: -7500, variancePercent: -5, type: 'income' },
        { id: '2', name: 'Donations', budgeted: 25000, actual: 28000, variance: 3000, variancePercent: 12, type: 'income' },
        { id: '3', name: 'Events Income', budgeted: 15000, actual: 12000, variance: -3000, variancePercent: -20, type: 'income' },
        { id: '4', name: 'Other Income', budgeted: 5000, actual: 6500, variance: 1500, variancePercent: 30, type: 'income' },
        // Expense categories
        { id: '5', name: 'Pastoral Salaries', budgeted: 60000, actual: 60000, variance: 0, variancePercent: 0, type: 'expense' },
        { id: '6', name: 'Ministry Programs', budgeted: 35000, actual: 38500, variance: -3500, variancePercent: -10, type: 'expense' },
        { id: '7', name: 'Facilities & Utilities', budgeted: 28000, actual: 26000, variance: 2000, variancePercent: 7.1, type: 'expense' },
        { id: '8', name: 'Outreach & Missions', budgeted: 20000, actual: 18000, variance: 2000, variancePercent: 10, type: 'expense' },
        { id: '9', name: 'Administrative', budgeted: 15000, actual: 14000, variance: 1000, variancePercent: 6.7, type: 'expense' },
        { id: '10', name: 'Equipment & Supplies', budgeted: 8000, actual: 9500, variance: -1500, variancePercent: -18.75, type: 'expense' },
      ];
      
      setBudgetCategories(categories);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const incomeCategories = budgetCategories.filter(c => c.type === 'income');
  const expenseCategories = budgetCategories.filter(c => c.type === 'expense');

  const totalBudgetedIncome = incomeCategories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActualIncome = incomeCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalBudgetedExpenses = expenseCategories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActualExpenses = expenseCategories.reduce((sum, c) => sum + c.actual, 0);

  const netBudgeted = totalBudgetedIncome - totalBudgetedExpenses;
  const netActual = totalActualIncome - totalActualExpenses;

  const getStatusIcon = (variancePercent: number, type: 'income' | 'expense') => {
    const isPositive = type === 'income' ? variancePercent >= 0 : variancePercent > 0;
    if (Math.abs(variancePercent) < 5) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (isPositive) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else {
      return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
    }
  };

  const getVarianceColor = (variancePercent: number, type: 'income' | 'expense') => {
    const isPositive = type === 'income' ? variancePercent >= 0 : variancePercent > 0;
    if (Math.abs(variancePercent) < 5) return 'text-gray-600';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage church financial budgets and allocations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="2024">2024 Annual Budget</option>
            <option value="2024-Q1">Q1 2024</option>
            <option value="2024-Q2">Q2 2024</option>
            <option value="2024-Q3">Q3 2024</option>
            <option value="2024-Q4">Q4 2024</option>
          </select>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Budget Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Budgeted Income</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(totalBudgetedIncome)}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">Actual: </span>
              <span className={`text-sm font-medium ${totalActualIncome >= totalBudgetedIncome ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalActualIncome)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Budgeted Expenses</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(totalBudgetedExpenses)}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">Actual: </span>
              <span className={`text-sm font-medium ${totalActualExpenses <= totalBudgetedExpenses ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalActualExpenses)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Budgeted Net</dt>
                  <dd className="text-lg font-semibold text-gray-900">{formatCurrency(netBudgeted)}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">Actual Net: </span>
              <span className={`text-sm font-medium ${netActual >= netBudgeted ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netActual)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Budget Utilization</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {((totalActualExpenses / totalBudgetedExpenses) * 100).toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${totalActualExpenses <= totalBudgetedExpenses ? 'bg-blue-600' : 'bg-red-600'}`}
                style={{ width: `${Math.min((totalActualExpenses / totalBudgetedExpenses) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Budget */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-green-50 border-b border-green-100">
            <h3 className="text-lg font-medium text-green-800">Income Budget</h3>
            <p className="mt-1 text-sm text-green-600">Expected vs Actual Income</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budgeted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomeCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(category.budgeted)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(category.actual)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${getVarianceColor(category.variancePercent, 'income')}`}>
                      {formatCurrency(category.variance)} ({category.variancePercent > 0 ? '+' : ''}{category.variancePercent}%)
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {getStatusIcon(category.variancePercent, 'income')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-green-50 font-semibold">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-800">Total Income</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-800 text-right">{formatCurrency(totalBudgetedIncome)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-800 text-right">{formatCurrency(totalActualIncome)}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${totalActualIncome >= totalBudgetedIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalActualIncome - totalBudgetedIncome)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {totalActualIncome >= totalBudgetedIncome ? 
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" /> : 
                      <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mx-auto" />
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Budget */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-red-50 border-b border-red-100">
            <h3 className="text-lg font-medium text-red-800">Expense Budget</h3>
            <p className="mt-1 text-sm text-red-600">Planned vs Actual Expenses</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budgeted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenseCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(category.budgeted)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(category.actual)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${getVarianceColor(category.variancePercent, 'expense')}`}>
                      {formatCurrency(category.variance)} ({category.variancePercent > 0 ? '+' : ''}{category.variancePercent}%)
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {getStatusIcon(category.variancePercent, 'expense')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-red-50 font-semibold">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-red-800">Total Expenses</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-red-800 text-right">{formatCurrency(totalBudgetedExpenses)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-red-800 text-right">{formatCurrency(totalActualExpenses)}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${totalActualExpenses <= totalBudgetedExpenses ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalBudgetedExpenses - totalActualExpenses)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {totalActualExpenses <= totalBudgetedExpenses ? 
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" /> : 
                      <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mx-auto" />
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Budget Allocation Chart */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Budget Allocation Overview</h3>
          <p className="mt-1 text-sm text-gray-500">Visual breakdown of budget categories</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {expenseCategories.map((category) => {
              const utilization = (category.actual / category.budgeted) * 100;
              
              return (
                <div key={category.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(category.actual)} / {formatCurrency(category.budgeted)} ({utilization.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`absolute top-0 left-0 h-4 rounded-full ${utilization > 100 ? 'bg-red-500' : utilization > 90 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                    {utilization > 100 && (
                      <div
                        className="absolute top-0 h-4 rounded-r-full bg-red-600"
                        style={{ left: '100%', width: `${Math.min(utilization - 100, 20)}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
