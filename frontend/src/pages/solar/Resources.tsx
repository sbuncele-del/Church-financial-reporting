/**
 * Resources (R) - Landing Page
 * 
 * The capacity to fuel vision and mission
 * 
 * Sub-Dimensions:
 * 1. Financial Health & Stewardship
 * 2. Human Resources & Personal Capacity
 * 3. Relational & Network Capital
 * 4. Infrastructure, Facilities & Technology
 * 5. Income Generation, Projects & Sustainability
 * 6. Resource Allocation & Strategic Budgeting
 * 7. Volunteer Systems & Workforce Mobilisation
 * 8. Operational Efficiency & Cost Optimization
 * 9. Investment Strategy & Asset Growth
 * 10. Donor Development & Cultivation
 */

import { Link } from 'react-router-dom';

const subDimensions = [
  {
    key: 'financial_health',
    name: 'Financial Health & Stewardship',
    description: 'Sound financial management and biblical stewardship',
    icon: '💰',
    href: '/solar/resources/financial',
    highlight: true,
  },
  {
    key: 'human_resources',
    name: 'Human Resources & Capacity',
    description: 'Staff and leadership capacity management',
    icon: '👔',
    href: '/solar/resources/hr',
  },
  {
    key: 'relational_capital',
    name: 'Relational & Network Capital',
    description: 'Strategic relationships and partnerships',
    icon: '🔗',
    href: '/solar/resources/network',
  },
  {
    key: 'infrastructure',
    name: 'Infrastructure & Facilities',
    description: 'Physical and technological resources',
    icon: '🏢',
    href: '/solar/resources/infrastructure',
  },
  {
    key: 'income_generation',
    name: 'Income Generation & Projects',
    description: 'Sustainable income beyond tithes and offerings',
    icon: '📈',
    href: '/solar/resources/income-generation',
  },
  {
    key: 'resource_allocation',
    name: 'Resource Allocation & Budgeting',
    description: 'Strategic deployment of financial resources',
    icon: '📊',
    href: '/solar/resources/budgeting',
  },
  {
    key: 'volunteer_systems',
    name: 'Volunteer Systems',
    description: 'Mobilising and managing the volunteer workforce',
    icon: '🙋',
    href: '/solar/resources/volunteers',
  },
  {
    key: 'operational_efficiency',
    name: 'Operational Efficiency',
    description: 'Cost optimization and process improvement',
    icon: '⚡',
    href: '/solar/resources/efficiency',
  },
  {
    key: 'investment_strategy',
    name: 'Investment Strategy & Assets',
    description: 'Beyond donations - assets finance the church\'s work',
    icon: '🏦',
    href: '/solar/resources/investments',
  },
  {
    key: 'donor_development',
    name: 'Donor Development',
    description: 'Growing the giving base and partnership',
    icon: '💝',
    href: '/solar/resources/donors',
  },
];

const financialQuickLinks = [
  { name: 'Income', href: '/solar/resources/financial/income', icon: '📥', color: 'green' },
  { name: 'Expenses', href: '/solar/resources/financial/expenses', icon: '📤', color: 'red' },
  { name: 'Budget', href: '/solar/resources/financial/budget', icon: '📋', color: 'blue' },
  { name: 'Reports', href: '/solar/resources/financial/reports', icon: '📊', color: 'purple' },
];

export default function Resources() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">💰</span>
          <div>
            <h1 className="text-3xl font-bold">Resources</h1>
            <p className="text-amber-200 text-lg">The Fuel for Mission</p>
          </div>
        </div>
        <p className="text-amber-100 max-w-3xl">
          The capacity to fuel vision and mission. This dimension encompasses all the resources
          needed to advance God's kingdom — financial, human, relational, and physical assets.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Overall Score</p>
          <p className="text-3xl font-bold text-amber-600">70%</p>
          <p className="text-xs text-gray-500 mt-1">Stable from last quarter</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Grade</p>
          <p className="text-3xl font-bold text-amber-600">B-</p>
          <p className="text-xs text-gray-500 mt-1">Developing</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Budget Health</p>
          <p className="text-3xl font-bold text-green-600">94%</p>
          <p className="text-xs text-gray-500 mt-1">On track</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Reserve</p>
          <p className="text-3xl font-bold text-gray-900">3.2</p>
          <p className="text-xs text-gray-500 mt-1">Months operating</p>
        </div>
      </div>

      {/* Financial Quick Access */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>💰</span> Financial Health & Stewardship
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {financialQuickLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-3"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="font-medium text-gray-900">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Sub-Dimensions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Resource Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {subDimensions.map((sub) => (
            <Link
              key={sub.key}
              to={sub.href}
              className={`bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-all group ${
                sub.highlight ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-100 hover:border-amber-200'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl mb-2">{sub.icon}</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors text-sm">
                  {sub.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{sub.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          to="/solar/assessment?dimension=R"
          className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
        >
          Start Assessment
        </Link>
        <Link
          to="/solar/resources/reports"
          className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          View All Reports
        </Link>
      </div>
    </div>
  );
}
