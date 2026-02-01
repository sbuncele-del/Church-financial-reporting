/**
 * Organisational Governance (O) - Landing Page
 * 
 * The Crux - The structural backbone that enables mission
 * 
 * Sub-Dimensions:
 * 1. Vision
 * 2. Leadership
 * 3. Management
 * 4. Governance
 * 5. Processes & Systems
 * 6. Accountability
 * 7. Deployments
 * 8. Organisational Culture
 */

import { Link } from 'react-router-dom';

const subDimensions = [
  {
    key: 'vision',
    name: 'Vision',
    description: 'Clear, compelling vision that guides all church activities',
    icon: '🎯',
    href: '/solar/organisational/vision',
  },
  {
    key: 'leadership',
    name: 'Leadership',
    description: 'Effective leadership development and succession planning',
    icon: '👥',
    href: '/solar/organisational/leadership',
  },
  {
    key: 'management',
    name: 'Management',
    description: 'Day-to-day operational management excellence',
    icon: '📋',
    href: '/solar/organisational/management',
  },
  {
    key: 'governance',
    name: 'Governance',
    description: 'Board effectiveness and oversight structures',
    icon: '⚖️',
    href: '/solar/organisational/governance',
  },
  {
    key: 'processes_systems',
    name: 'Processes & Systems',
    description: 'Efficient workflows and technology systems',
    icon: '⚙️',
    href: '/solar/organisational/processes',
  },
  {
    key: 'accountability',
    name: 'Accountability',
    description: 'Clear accountability structures and reporting',
    icon: '📊',
    href: '/solar/organisational/accountability',
  },
  {
    key: 'deployments',
    name: 'Deployments',
    description: 'Strategic deployment of people and resources',
    icon: '🚀',
    href: '/solar/organisational/deployments',
  },
  {
    key: 'organisational_culture',
    name: 'Organisational Culture',
    description: 'Shared behaviours and values rooted in Christ-like character',
    icon: '💫',
    href: '/solar/organisational/culture',
  },
];

export default function OrganisationalGovernance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">🏛️</span>
          <div>
            <h1 className="text-3xl font-bold">Organisational Governance</h1>
            <p className="text-blue-200 text-lg">The Crux</p>
          </div>
        </div>
        <p className="text-blue-100 max-w-3xl">
          The structural backbone that enables mission. This dimension ensures the church has
          the organisational health, leadership capacity, and systems needed to fulfill its calling.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Overall Score</p>
          <p className="text-3xl font-bold text-blue-600">72%</p>
          <p className="text-xs text-gray-500 mt-1">Stable from last quarter</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Grade</p>
          <p className="text-3xl font-bold text-blue-600">B</p>
          <p className="text-xs text-gray-500 mt-1">Good performance</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active KPIs</p>
          <p className="text-3xl font-bold text-gray-900">15</p>
          <p className="text-xs text-gray-500 mt-1">Being tracked</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Last Assessment</p>
          <p className="text-3xl font-bold text-gray-900">Q1</p>
          <p className="text-xs text-gray-500 mt-1">2026</p>
        </div>
      </div>

      {/* Sub-Dimensions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sub-Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subDimensions.map((sub) => (
            <Link
              key={sub.key}
              to={sub.href}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{sub.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{sub.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          to="/solar/assessment?dimension=O"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Start Assessment
        </Link>
        <Link
          to="/solar/organisational/reports"
          className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          View Reports
        </Link>
      </div>
    </div>
  );
}
