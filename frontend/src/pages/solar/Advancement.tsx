/**
 * Advancement (A) - Landing Page
 * 
 * The outward movement of mission
 * 
 * Sub-Dimensions:
 * 1. Outreach Engagements
 * 2. Local Community Impact
 * 3. Transformational Presence
 * 4. Global Mission
 * 5. Marketplace as an Outreach Strategy
 * 6. Digital Mission & Media Influence
 * 7. Compassion & Humanitarian Response
 * 8. Education & Youth Empowerment Outreach
 * 9. Church-Government-Community Partnerships
 */

import { Link } from 'react-router-dom';

const subDimensions = [
  {
    key: 'outreach',
    name: 'Outreach Engagements',
    description: 'Intentional evangelism and community outreach programs',
    icon: '📢',
    href: '/solar/advancement/outreach',
  },
  {
    key: 'local_impact',
    name: 'Local Community Impact',
    description: 'Tangible difference made in the surrounding community',
    icon: '🏘️',
    href: '/solar/advancement/local-impact',
  },
  {
    key: 'transformational_presence',
    name: 'Transformational Presence',
    description: 'Being salt and light that transforms society',
    icon: '💡',
    href: '/solar/advancement/presence',
  },
  {
    key: 'global_mission',
    name: 'Global Mission',
    description: 'International missions and cross-cultural ministry',
    icon: '🌍',
    href: '/solar/advancement/global-mission',
  },
  {
    key: 'marketplace',
    name: 'Marketplace Outreach',
    description: 'Ministry in the workplace and business spheres',
    icon: '💼',
    href: '/solar/advancement/marketplace',
  },
  {
    key: 'digital_mission',
    name: 'Digital Mission & Media',
    description: 'Leveraging digital platforms to advance the kingdom',
    icon: '📱',
    href: '/solar/advancement/digital',
  },
  {
    key: 'compassion',
    name: 'Compassion & Humanitarian',
    description: 'Meeting physical needs in Jesus\' name',
    icon: '🤲',
    href: '/solar/advancement/compassion',
  },
  {
    key: 'education_youth',
    name: 'Education & Youth Empowerment',
    description: 'Investing in the next generation through education',
    icon: '🎓',
    href: '/solar/advancement/education',
  },
  {
    key: 'partnerships',
    name: 'Community Partnerships',
    description: 'Church-Government-Community strategic partnerships',
    icon: '🤝',
    href: '/solar/advancement/partnerships',
  },
];

export default function Advancement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">🚀</span>
          <div>
            <h1 className="text-3xl font-bold">Advancement</h1>
            <p className="text-green-200 text-lg">The Outward Movement</p>
          </div>
        </div>
        <p className="text-green-100 max-w-3xl">
          The outward movement of mission. This dimension captures how effectively the church
          reaches beyond its walls to impact the community, nation, and world for Christ.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Overall Score</p>
          <p className="text-3xl font-bold text-green-600">65%</p>
          <p className="text-xs text-green-600 mt-1">↑ 5.0% from last quarter</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Grade</p>
          <p className="text-3xl font-bold text-green-600">C+</p>
          <p className="text-xs text-gray-500 mt-1">Growing area</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Lives Reached</p>
          <p className="text-3xl font-bold text-gray-900">2.4K</p>
          <p className="text-xs text-gray-500 mt-1">This quarter</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Outreaches</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-xs text-gray-500 mt-1">Programs running</p>
        </div>
      </div>

      {/* Sub-Dimensions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sub-Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subDimensions.map((sub) => (
            <Link
              key={sub.key}
              to={sub.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{sub.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
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
          to="/solar/assessment?dimension=A"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          Start Assessment
        </Link>
        <Link
          to="/solar/advancement/reports"
          className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          View Reports
        </Link>
      </div>
    </div>
  );
}
