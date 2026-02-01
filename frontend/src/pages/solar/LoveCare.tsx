/**
 * Love & Care (L) - Landing Page
 * 
 * The relational health of the community
 * 
 * Sub-Dimensions:
 * 1. Community — The Church as a Family Within
 * 2. Family Group Ecosystem
 * 3. Love & Care Ministry
 * 4. Relational Health of the Community
 * 5. Pastoral Care Integration
 * 6. Unity, Honour & Church Culture of Love
 */

import { Link } from 'react-router-dom';

const subDimensions = [
  {
    key: 'community',
    name: 'Community — Church as Family',
    description: 'Building authentic family relationships within the congregation',
    icon: '👨‍👩‍👧‍👦',
    href: '/solar/love-care/community',
  },
  {
    key: 'family_groups',
    name: 'Family Group Ecosystem',
    description: 'Church away from church - primary relational system for members',
    icon: '🏠',
    href: '/solar/love-care/family-groups',
  },
  {
    key: 'love_care_ministry',
    name: 'Love & Care Ministry',
    description: 'Organised support for those in need within the congregation',
    icon: '💝',
    href: '/solar/love-care/ministry',
  },
  {
    key: 'relational_health',
    name: 'Relational Health',
    description: 'The quality of relationships across the community',
    icon: '🤝',
    href: '/solar/love-care/relational-health',
  },
  {
    key: 'pastoral_care',
    name: 'Pastoral Care Integration',
    description: 'Professional pastoral support and counselling services',
    icon: '🩺',
    href: '/solar/love-care/pastoral-care',
  },
  {
    key: 'unity_honour',
    name: 'Unity, Honour & Culture of Love',
    description: 'Cultivating honour, unity, and love as core cultural values',
    icon: '💕',
    href: '/solar/love-care/unity',
  },
];

const quickActions = [
  { name: 'Members Directory', href: '/solar/love-care/members', icon: '👥' },
  { name: 'Family Groups', href: '/solar/love-care/family-groups', icon: '🏠' },
  { name: 'Care Requests', href: '/solar/love-care/requests', icon: '🙋' },
  { name: 'Visitation Schedule', href: '/solar/love-care/visitation', icon: '📅' },
];

export default function LoveCare() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">❤️</span>
          <div>
            <h1 className="text-3xl font-bold">Love & Care</h1>
            <p className="text-red-200 text-lg">The Relational Heart</p>
          </div>
        </div>
        <p className="text-red-100 max-w-3xl">
          The relational health of the community. This dimension measures how well the church
          functions as a loving family where every member feels known, valued, and cared for.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Overall Score</p>
          <p className="text-3xl font-bold text-red-500">80%</p>
          <p className="text-xs text-green-600 mt-1">↑ 2.0% from last quarter</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Grade</p>
          <p className="text-3xl font-bold text-red-500">B+</p>
          <p className="text-xs text-gray-500 mt-1">Strong performance</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Members</p>
          <p className="text-3xl font-bold text-gray-900">1,247</p>
          <p className="text-xs text-gray-500 mt-1">In the community</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Family Groups</p>
          <p className="text-3xl font-bold text-gray-900">48</p>
          <p className="text-xs text-gray-500 mt-1">Active groups</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-medium text-gray-900">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Sub-Dimensions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sub-Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subDimensions.map((sub) => (
            <Link
              key={sub.key}
              to={sub.href}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{sub.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-500 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{sub.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          to="/solar/assessment?dimension=L"
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
        >
          Start Assessment
        </Link>
        <Link
          to="/solar/love-care/reports"
          className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          View Reports
        </Link>
      </div>
    </div>
  );
}
