import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { financeService } from '../../services/financeService';
import { formatCurrency } from '../../utils/currency';

interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
  incomeCount: number;
  expenseCount: number;
  topIncomeCategory: string;
  topExpenseCategory: string;
}

export default function FinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netPosition: 0,
    incomeCount: 0,
    expenseCount: 0,
    topIncomeCategory: 'N/A',
    topExpenseCategory: 'N/A',
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const [incomeData, expenseData] = await Promise.all([
        financeService.getIncomes({ per_page: 100 }),
        financeService.getExpenses({ per_page: 100 }),
      ]);

      const totalIncome = typeof incomeData.total_amount === 'number' 
        ? incomeData.total_amount 
        : parseFloat(incomeData.total_amount || '0');
      const totalExpenses = typeof expenseData.total_amount === 'number'
        ? expenseData.total_amount
        : parseFloat(expenseData.total_amount || '0');

      setStats({
        totalIncome,
        totalExpenses,
        netPosition: totalIncome - totalExpenses,
        incomeCount: incomeData.total || 0,
        expenseCount: expenseData.total || 0,
        topIncomeCategory: 'Tithes & Offerings',
        topExpenseCategory: 'Salaries & Benefits',
      });
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      name: 'Income',
      description: 'Track tithes, offerings, and donations',
      href: '/solar/resources/financial/income',
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
      stat: formatCurrency(stats.totalIncome),
      count: `${stats.incomeCount} transactions`,
    },
    {
      name: 'Expenses',
      description: 'Monitor spending and payments',
      href: '/solar/resources/financial/expenses',
      icon: ArrowTrendingDownIcon,
      color: 'bg-red-500',
      stat: formatCurrency(stats.totalExpenses),
      count: `${stats.expenseCount} transactions`,
    },
    {
      name: 'Budget',
      description: 'Plan and allocate resources',
      href: '/solar/resources/financial/budget',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      stat: 'View Allocations',
      count: 'Manage budgets',
    },
    {
      name: 'Reports',
      description: 'Financial analysis and insights',
      href: '/solar/resources/financial/reports',
      icon: DocumentChartBarIcon,
      color: 'bg-purple-500',
      stat: 'Generate Reports',
      count: 'Export data',
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Financial Health Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of church financial position and activities
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/solar/resources/financial/income"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Income
          </Link>
          <Link
            to="/solar/resources/financial/expenses"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Expense
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                  <dd className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs text-gray-500">{stats.incomeCount} transactions</span>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                  <dd className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs text-gray-500">{stats.expenseCount} transactions</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className={`h-6 w-6 ${stats.netPosition >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Net Position</dt>
                  <dd className={`text-2xl font-bold ${stats.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.netPosition)}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs text-gray-500">
                {stats.netPosition >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards - Horizontal Layout */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Financial Modules</h2>
          <p className="mt-1 text-sm text-gray-500">Quick access to all financial management tools</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative group bg-white p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <span className={`inline-flex p-3 ${link.color} rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      {link.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">{link.description}</p>
                    <div className="mt-3">
                      <p className="text-xl font-bold text-gray-900">{link.stat}</p>
                      <p className="text-xs text-gray-500 mt-1">{link.count}</p>
                    </div>
                  </div>
                  <span
                    className="absolute top-6 right-6 text-gray-400 group-hover:text-blue-600"
                    aria-hidden="true"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Income Overview</h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Top Category</dt>
                <dd className="text-sm font-bold text-gray-900">{stats.topIncomeCategory}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Total Transactions</dt>
                <dd className="text-sm font-bold text-gray-900">{stats.incomeCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Average per Transaction</dt>
                <dd className="text-sm font-bold text-gray-900">
                  {formatCurrency(stats.incomeCount > 0 ? stats.totalIncome / stats.incomeCount : 0)}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <Link
                to="/solar/resources/financial/income"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all income →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Expense Overview</h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Top Category</dt>
                <dd className="text-sm font-bold text-gray-900">{stats.topExpenseCategory}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Total Transactions</dt>
                <dd className="text-sm font-bold text-gray-900">{stats.expenseCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Average per Transaction</dt>
                <dd className="text-sm font-bold text-gray-900">
                  {formatCurrency(stats.expenseCount > 0 ? stats.totalExpenses / stats.expenseCount : 0)}
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <Link
                to="/solar/resources/financial/expenses"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all expenses →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
