/**
 * Spiritual Vitality (S) - Landing Page
 * 
 * The Soul - A measure of the living, inner spiritual pulse of the congregation
 * 
 * Sub-Dimensions:
 * 1. Spiritual Growth & Maturity
 * 2. Transformational Worship
 * 3. Discipleship Pathway Strength
 * 4. Evidence of Personal Transformation
 * 5. Spiritual Atmosphere & Corporate Anointing
 * 6. Biblical Assimilation & Doctrinal Soundness
 */

import { Link } from 'react-router-dom';

const subDimensions = [
  {
    key: 'spiritual_growth',
    name: 'Spiritual Growth & Maturity',
    description: 'Measuring the deepening walk with God across the congregation',
    icon: '📈',
    href: '/solar/spiritual/growth',
  },
  {
    key: 'transformational_worship',
    name: 'Transformational Worship',
    description: 'Every service is a divine encounter where God\'s presence is tangible',
    icon: '🎵',
    href: '/solar/spiritual/worship',
  },
  {
    key: 'discipleship_pathway',
    name: 'Discipleship Pathway Strength',
    description: 'Clear pathways for believers to grow from new converts to mature disciples',
    icon: '🛤️',
    href: '/solar/spiritual/discipleship',
  },
  {
    key: 'personal_transformation',
    name: 'Evidence of Personal Transformation',
    description: 'Testimonies of changed lives and breakthrough moments',
    icon: '✨',
    href: '/solar/spiritual/transformation',
  },
  {
    key: 'spiritual_atmosphere',
    name: 'Spiritual Atmosphere & Corporate Anointing',
    description: 'The tangible presence and power of God in gatherings',
    icon: '🔥',
    href: '/solar/spiritual/atmosphere',
  },
  {
    key: 'biblical_assimilation',
    name: 'Biblical Assimilation & Doctrinal Soundness',
    description: 'Grounding in Scripture and sound theological understanding',
    icon: '📖',
    href: '/solar/spiritual/doctrine',
  },
];

export default function SpiritualVitality() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">🙏</span>
          <div>
            <h1 className="text-3xl font-bold">Spiritual Vitality</h1>
            <p className="text-purple-200 text-lg">The Soul</p>
          </div>
        </div>
        <p className="text-purple-100 max-w-3xl">
          A measure of the living, inner spiritual pulse of the congregation. This dimension
          captures the heart of what the church is called to be — a community deeply connected
          to God and growing in faith.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Overall Score</p>
          <p className="text-3xl font-bold text-purple-600">78%</p>
          <p className="text-xs text-green-600 mt-1">↑ 3.5% from last quarter</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Grade</p>
          <p className="text-3xl font-bold text-purple-600">B+</p>
          <p className="text-xs text-gray-500 mt-1">Strong performance</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active KPIs</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subDimensions.map((sub) => (
            <Link
              key={sub.key}
              to={sub.href}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{sub.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
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
          to="/solar/assessment?dimension=S"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
        >
          Start Assessment
        </Link>
        <Link
          to="/solar/spiritual/reports"
          className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          View Reports
        </Link>
      </div>
    </div>
  );
}
