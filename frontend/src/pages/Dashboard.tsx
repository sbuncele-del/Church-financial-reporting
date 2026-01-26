import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { financeService } from '../services/financeService';
import type { FinancialSummary } from '../types';

// Chart components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const now = new Date();
      const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(now), 'yyyy-MM-dd');
      
      const data = await financeService.getSummary(startDate, endDate);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Stats cards data
  const stats = [
    {
      name: 'Total Income',
      value: summary ? formatCurrency(summary.total_income) : '$0.00',
      change: '+12.5%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Expenses',
      value: summary ? formatCurrency(summary.total_expenses) : '$0.00',
      change: '+5.2%',
      changeType: 'negative',
      icon: ArrowTrendingDownIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Net Balance',
      value: summary ? formatCurrency(summary.net_balance) : '$0.00',
      change: '+8.1%',
      changeType: summary && summary.net_balance >= 0 ? 'positive' : 'negative',
      icon: BanknotesIcon,
      color: 'bg-primary-500',
    },
    {
      name: 'Active Members',
      value: '156',
      change: '+3',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
  ];

  // Chart data for income by category
  const incomeChartData = {
    labels: summary ? Object.keys(summary.income_by_category) : [],
    datasets: [
      {
        data: summary ? Object.values(summary.income_by_category) : [],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Chart data for expense comparison
  const expenseChartData = {
    labels: summary ? Object.keys(summary.expenses_by_category).slice(0, 6) : [],
    datasets: [
      {
        label: 'Expenses by Category',
        data: summary ? Object.values(summary.expenses_by_category).slice(0, 6) : [],
        backgroundColor: '#ef4444',
        borderRadius: 8,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Financial overview for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/finance/income" className="btn-primary">
            + Record Income
          </Link>
          <Link to="/finance/expenses" className="btn-secondary">
            + Record Expense
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <div className="card">
          <h3 className="card-header">Income by Category</h3>
          {summary && Object.keys(summary.income_by_category).length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={incomeChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BanknotesIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No income data for this period</p>
                <Link to="/finance/income" className="text-primary-600 hover:underline text-sm">
                  Record your first income
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="card">
          <h3 className="card-header">Top Expense Categories</h3>
          {summary && Object.keys(summary.expenses_by_category).length > 0 ? (
            <div className="h-64">
              <Bar
                data={expenseChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ArrowTrendingDownIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No expense data for this period</p>
                <Link to="/finance/expenses" className="text-primary-600 hover:underline text-sm">
                  Record your first expense
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="card-header">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/finance/income"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <ArrowTrendingUpIcon className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Record Income</span>
          </Link>
          <Link
            to="/finance/expenses"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <ArrowTrendingDownIcon className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Record Expense</span>
          </Link>
          <Link
            to="/members"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <UsersIcon className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Member</span>
          </Link>
          <Link
            to="/finance/reports"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <BanknotesIcon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
