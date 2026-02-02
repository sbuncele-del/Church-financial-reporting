import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';
import api from '../../services/api';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  type: 'income' | 'expense';
  group?: string;
}

interface CategoryGroup {
  name: string;
  categories: BudgetCategory[];
  totalBudgeted: number;
  totalActual: number;
}

// Income category groups mapping (aligned with API categories)
const INCOME_GROUPS: Record<string, string[]> = {
  'Tithes & Offerings': ['Tithes', 'Offerings', 'First Fruits', 'Free Will Offering', 'Sacrificial Seed', 'Alms Seed', 'Thanksgiving Offering', 'Love Offering'],
  'Ministry Specific': ['Building Fund', 'Missions', 'Youth Ministry', 'Children Ministry', 'Women Ministry', 'Men Ministry', 'Worship & Music Ministry', 'Outreach & Evangelism'],
  'Welfare & Support': ['Benevolence Fund', 'Funeral Fund', 'Sick Fund', 'Community Support'],
  'Events & Programs': ['Special Events', 'Conferences & Seminars', 'Camp Registration', 'Marriage Ceremony Fees'],
  'Other Income': ['Rental Income', 'Interest Income', 'Bookshop Sales', 'Donations - General', 'Grants Received', 'Other Income'],
};

// Expense category groups mapping (aligned with API categories)
const EXPENSE_GROUPS: Record<string, string[]> = {
  'Personnel & Salaries': ['Senior Pastor Salary', 'Associate Pastor Salary', 'Staff Salaries', 'Payroll Taxes & UIF', 'Staff Benefits', 'Housing Allowance', 'Transport Allowance'],
  'Facilities': ['Rent/Mortgage', 'Electricity', 'Water & Rates', 'Security', 'Cleaning & Maintenance', 'Repairs & Renovations', 'Insurance', 'Garden & Grounds'],
  'Administration': ['Office Supplies', 'Printing & Stationery', 'Telephone & Internet', 'Postage & Courier', 'Bank Charges', 'Accounting & Audit', 'Legal Fees', 'Software & Subscriptions'],
  'Ministry Programs': ['Youth Ministry Expenses', 'Children Ministry Expenses', 'Women Ministry Expenses', 'Men Ministry Expenses', 'Small Groups & Cell Ministry', 'Discipleship & Training'],
  'Worship & Media': ['Worship Equipment', 'Sound & AV Equipment', 'Music Licensing (CCLI)', 'Livestream & Media', 'Website & Social Media'],
  'Outreach & Missions': ['Missions Support', 'Outreach Programs', 'Evangelism Materials', 'Community Projects'],
  'Welfare & Benevolence': ['Benevolence - Members', 'Benevolence - Community', 'Funeral Assistance', 'Food Parcels & Relief'],
  'Events & Hospitality': ['Church Events', 'Conferences & Seminars', 'Hospitality & Catering', 'Guest Speakers'],
  'Transport & Travel': ['Vehicle Expenses', 'Fuel', 'Travel & Accommodation'],
  'Other': ['Denominational Dues', 'Books & Resources', 'Miscellaneous Expenses'],
};

export default function Budget() {
  const [loading, setLoading] = useState(true);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('2025');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  useEffect(() => {
    loadBudgetData();
  }, [selectedPeriod]);

  const loadBudgetData = async () => {
    setLoading(true);
    try {
      // Fetch categories from API
      const [incomeRes, expenseRes] = await Promise.all([
        api.get('/api/finance/categories?type=income').catch(() => ({ data: [] })),
        api.get('/api/finance/categories?type=expense').catch(() => ({ data: [] })),
      ]);

      const incomeCategories = Array.isArray(incomeRes.data) ? incomeRes.data : [];
      const expenseCategories = Array.isArray(expenseRes.data) ? expenseRes.data : [];

      // Build budget categories with realistic sample data
      const categories: BudgetCategory[] = [];
      
      // Generate budget for each income category
      incomeCategories.forEach((cat: any, index: number) => {
        const budgeted = getBudgetAmount(cat.name, 'income');
        const actual = Math.round(budgeted * (0.85 + Math.random() * 0.3)); // 85-115% of budget
        const variance = actual - budgeted;
        const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;
        const group = Object.entries(INCOME_GROUPS).find(([_, cats]) => cats.includes(cat.name))?.[0] || 'Other';
        
        categories.push({
          id: `income-${cat.id || index}`,
          name: cat.name,
          budgeted,
          actual,
          variance,
          variancePercent: Math.round(variancePercent * 10) / 10,
          type: 'income',
          group,
        });
      });

      // Generate budget for each expense category
      expenseCategories.forEach((cat: any, index: number) => {
        const budgeted = getBudgetAmount(cat.name, 'expense');
        const actual = Math.round(budgeted * (0.75 + Math.random() * 0.4)); // 75-115% of budget
        const variance = budgeted - actual; // For expenses, under budget is positive
        const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;
        const group = Object.entries(EXPENSE_GROUPS).find(([_, cats]) => cats.includes(cat.name))?.[0] || 'Other';
        
        categories.push({
          id: `expense-${cat.id || index}`,
          name: cat.name,
          budgeted,
          actual,
          variance,
          variancePercent: Math.round(variancePercent * 10) / 10,
          type: 'expense',
          group,
        });
      });

      setBudgetCategories(categories);
      
      // Expand first groups by default
      const defaultExpanded: Record<string, boolean> = {};
      Object.keys(INCOME_GROUPS).slice(0, 2).forEach(g => defaultExpanded[`income-${g}`] = true);
      Object.keys(EXPENSE_GROUPS).slice(0, 2).forEach(g => defaultExpanded[`expense-${g}`] = true);
      setExpandedGroups(defaultExpanded);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate realistic budget amounts based on category name
  const getBudgetAmount = (name: string, type: 'income' | 'expense'): number => {
    if (type === 'income') {
      if (name === 'Tithes') return 180000;
      if (name === 'Offerings') return 85000;
      if (name === 'First Fruits') return 25000;
      if (name === 'Building Fund') return 45000;
      if (name === 'Missions') return 20000;
      if (name.includes('Ministry')) return 8000;
      if (name.includes('Fund')) return 12000;
      if (name.includes('Events') || name.includes('Conference')) return 15000;
      return 5000;
    } else {
      if (name.includes('Senior Pastor')) return 96000;
      if (name.includes('Associate Pastor')) return 72000;
      if (name.includes('Staff Salaries')) return 120000;
      if (name.includes('Rent') || name.includes('Mortgage')) return 48000;
      if (name.includes('Electricity')) return 24000;
      if (name.includes('Security')) return 18000;
      if (name.includes('Insurance')) return 12000;
      if (name.includes('Ministry Expenses')) return 15000;
      if (name.includes('Missions')) return 24000;
      if (name.includes('Events') || name.includes('Conference')) return 20000;
      if (name.includes('Equipment')) return 8000;
      return 6000;
    }
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const incomeCategories = budgetCategories.filter(c => c.type === 'income');
  const expenseCategories = budgetCategories.filter(c => c.type === 'expense');

  const totalBudgetedIncome = incomeCategories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActualIncome = incomeCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalBudgetedExpenses = expenseCategories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActualExpenses = expenseCategories.reduce((sum, c) => sum + c.actual, 0);

  const netBudgeted = totalBudgetedIncome - totalBudgetedExpenses;
  const netActual = totalActualIncome - totalActualExpenses;

  // Group categories by their group name
  const groupCategories = (categories: BudgetCategory[], groups: Record<string, string[]>): CategoryGroup[] => {
    return Object.keys(groups).map(groupName => {
      const groupCats = categories.filter(c => c.group === groupName);
      return {
        name: groupName,
        categories: groupCats,
        totalBudgeted: groupCats.reduce((sum, c) => sum + c.budgeted, 0),
        totalActual: groupCats.reduce((sum, c) => sum + c.actual, 0),
      };
    }).filter(g => g.categories.length > 0);
  };

  const incomeGroups = groupCategories(incomeCategories, INCOME_GROUPS);
  const expenseGroups = groupCategories(expenseCategories, EXPENSE_GROUPS);

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

  const renderGroupedTable = (groups: CategoryGroup[], type: 'income' | 'expense') => {
    const bgColor = type === 'income' ? 'bg-green-50' : 'bg-red-50';
    const headerColor = type === 'income' ? 'text-green-800' : 'text-red-800';
    const borderColor = type === 'income' ? 'border-green-200' : 'border-red-200';
    
    return (
      <div className="space-y-2">
        {groups.map(group => {
          const groupKey = `${type}-${group.name}`;
          const isExpanded = expandedGroups[groupKey];
          const groupVariance = type === 'income' 
            ? group.totalActual - group.totalBudgeted 
            : group.totalBudgeted - group.totalActual;
          const groupVariancePercent = group.totalBudgeted > 0 
            ? (groupVariance / group.totalBudgeted) * 100 
            : 0;
          
          return (
            <div key={groupKey} className={`border ${borderColor} rounded-lg overflow-hidden`}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className={`w-full ${bgColor} px-4 py-3 flex items-center justify-between hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={`font-semibold ${headerColor}`}>{group.name}</span>
                  <span className="text-xs text-gray-500">({group.categories.length} categories)</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-600">Budget: {formatCurrency(group.totalBudgeted)}</span>
                  <span className="text-gray-800 font-medium">Actual: {formatCurrency(group.totalActual)}</span>
                  <span className={getVarianceColor(groupVariancePercent, type)}>
                    {groupVariancePercent >= 0 ? '+' : ''}{groupVariancePercent.toFixed(1)}%
                  </span>
                </div>
              </button>
              
              {/* Group Categories */}
              {isExpanded && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Budgeted</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {group.categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{cat.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 text-right">{formatCurrency(cat.budgeted)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(cat.actual)}</td>
                        <td className={`px-4 py-2 text-sm text-right ${getVarianceColor(cat.variancePercent, type)}`}>
                          {formatCurrency(Math.abs(cat.variance))} ({cat.variancePercent > 0 ? '+' : ''}{cat.variancePercent}%)
                        </td>
                        <td className="px-4 py-2 text-center">{getStatusIcon(cat.variancePercent, type)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    );
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
            Track and manage church financial budgets across {incomeCategories.length} income and {expenseCategories.length} expense categories
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'grouped' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Grouped
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                viewMode === 'flat' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="2025">2025 Annual Budget</option>
            <option value="2025-Q1">Q1 2025</option>
            <option value="2025-Q2">Q2 2025</option>
            <option value="2025-Q3">Q3 2025</option>
            <option value="2025-Q4">Q4 2025</option>
            <option value="2024">2024 Annual Budget</option>
          </select>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Budget
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-green-800">Income Budget</h3>
                <p className="mt-1 text-sm text-green-600">
                  {incomeGroups.length} groups • {incomeCategories.length} categories
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Total Budget</p>
                <p className="text-lg font-bold text-green-800">{formatCurrency(totalBudgetedIncome)}</p>
              </div>
            </div>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {viewMode === 'grouped' ? (
              renderGroupedTable(incomeGroups, 'income')
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(category.budgeted)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(category.actual)}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${getVarianceColor(category.variancePercent, 'income')}`}>
                        {formatCurrency(category.variance)} ({category.variancePercent > 0 ? '+' : ''}{category.variancePercent}%)
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {getStatusIcon(category.variancePercent, 'income')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-4 py-3 bg-green-50 border-t border-green-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-green-800">Total Income</span>
              <div className="flex gap-6 text-sm">
                <span>Budget: {formatCurrency(totalBudgetedIncome)}</span>
                <span className="font-medium">Actual: {formatCurrency(totalActualIncome)}</span>
                <span className={totalActualIncome >= totalBudgetedIncome ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(totalActualIncome - totalBudgetedIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Budget */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-red-50 border-b border-red-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-red-800">Expense Budget</h3>
                <p className="mt-1 text-sm text-red-600">
                  {expenseGroups.length} groups • {expenseCategories.length} categories
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-600">Total Budget</p>
                <p className="text-lg font-bold text-red-800">{formatCurrency(totalBudgetedExpenses)}</p>
              </div>
            </div>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {viewMode === 'grouped' ? (
              renderGroupedTable(expenseGroups, 'expense')
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(category.budgeted)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(category.actual)}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${getVarianceColor(category.variancePercent, 'expense')}`}>
                        {formatCurrency(Math.abs(category.variance))} ({category.variancePercent > 0 ? '+' : ''}{category.variancePercent}%)
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {getStatusIcon(category.variancePercent, 'expense')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-4 py-3 bg-red-50 border-t border-red-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-red-800">Total Expenses</span>
              <div className="flex gap-6 text-sm">
                <span>Budget: {formatCurrency(totalBudgetedExpenses)}</span>
                <span className="font-medium">Actual: {formatCurrency(totalActualExpenses)}</span>
                <span className={totalActualExpenses <= totalBudgetedExpenses ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(totalBudgetedExpenses - totalActualExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Allocation Chart - By Groups */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Budget Allocation by Department</h3>
          <p className="mt-1 text-sm text-gray-500">Visual breakdown of expense categories by group</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {expenseGroups.map((group) => {
              const utilization = group.totalBudgeted > 0 ? (group.totalActual / group.totalBudgeted) * 100 : 0;
              
              return (
                <div key={group.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{group.name}</span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(group.totalActual)} / {formatCurrency(group.totalBudgeted)} ({utilization.toFixed(0)}%)
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

      {/* Net Position Summary */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-blue-100">
          <h3 className="text-lg font-medium text-blue-800">Net Position Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalActualIncome)}</p>
              <p className="text-xs text-green-600 mt-1">vs {formatCurrency(totalBudgetedIncome)} budget</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalActualExpenses)}</p>
              <p className="text-xs text-red-600 mt-1">vs {formatCurrency(totalBudgetedExpenses)} budget</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${netActual >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <p className={`text-sm mb-1 ${netActual >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Position</p>
              <p className={`text-2xl font-bold ${netActual >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {formatCurrency(netActual)}
              </p>
              <p className={`text-xs mt-1 ${netActual >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                vs {formatCurrency(netBudgeted)} budgeted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
