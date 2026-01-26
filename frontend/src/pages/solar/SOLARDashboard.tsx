/**
 * SOLAR Dashboard Page
 * 
 * Main dashboard for viewing church health across the 5 SOLAR dimensions:
 * - Spiritual Vitality
 * - Organisational Governance
 * - Love & Care
 * - Advancement
 * - Resources
 */

import { useState, useEffect } from 'react';
import {
  SOLAR_DIMENSIONS,
  SOLARDimension,
  DimensionScore,
  SOLARDashboardData,
  getGradeColor,
  getTrendIcon,
} from '../../types/solar';

// Mock data for demonstration
const mockDashboardData: SOLARDashboardData = {
  churchId: 1,
  churchName: 'Grace Community Church',
  assessmentPeriod: 'Q1 2026',
  assessmentDate: '2026-01-15',
  overallScore: 72.5,
  overallGrade: 'B',
  dimensions: [
    { dimension: 'S', name: 'Spiritual Vitality', score: 78, grade: 'B+', icon: '🙏', color: '#8B5CF6', trend: 'improving', change: 3.5 },
    { dimension: 'O', name: 'Organisational Governance', score: 72, grade: 'B', icon: '🏛️', color: '#3B82F6', trend: 'stable', change: 0.5 },
    { dimension: 'L', name: 'Love & Care', score: 80, grade: 'B+', icon: '❤️', color: '#EF4444', trend: 'improving', change: 2.0 },
    { dimension: 'A', name: 'Advancement', score: 65, grade: 'C+', icon: '🚀', color: '#10B981', trend: 'improving', change: 5.0 },
    { dimension: 'R', name: 'Resources', score: 70, grade: 'B-', icon: '💰', color: '#F59E0B', trend: 'stable', change: 1.0 },
  ],
  topStrengths: [
    'Strong worship culture with high engagement',
    'Active family group system',
    'Healthy organizational culture',
  ],
  priorityImprovements: [
    'Digital mission and media influence',
    'Investment strategy for sustainability',
    'New believer integration process',
  ],
  benchmarkComparison: {
    S: 70,
    O: 68,
    L: 75,
    A: 65,
    R: 72,
  },
};

export default function SOLARDashboard() {
  const [dashboardData, setDashboardData] = useState<SOLARDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<SOLARDimension | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No assessment data available. Create your first SOLAR assessment to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SOLAR Church Health Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {dashboardData.churchName} • {dashboardData.assessmentPeriod}
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          New Assessment
        </button>
      </div>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Overall Church Health Score</p>
            <div className="flex items-baseline mt-2">
              <span className="text-5xl font-bold">{dashboardData.overallScore}</span>
              <span className="text-2xl ml-2 opacity-80">/100</span>
            </div>
            <p className="mt-2 text-blue-100">
              Grade: <span className="font-semibold text-white">{dashboardData.overallGrade}</span>
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">⛪</div>
            <p className="text-sm text-blue-100">Building Anchored on the Blessing</p>
          </div>
        </div>
      </div>

      {/* SOLAR Dimension Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">SOLAR Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {dashboardData.dimensions.map((dim) => (
            <DimensionCard
              key={dim.dimension}
              dimension={dim}
              benchmark={dashboardData.benchmarkComparison?.[dim.dimension]}
              onClick={() => setSelectedDimension(dim.dimension)}
              isSelected={selectedDimension === dim.dimension}
            />
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">💪</span>
            Top Strengths
          </h3>
          <ul className="space-y-3">
            {dashboardData.topStrengths?.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            Priority Improvements
          </h3>
          <ul className="space-y-3">
            {dashboardData.priorityImprovements?.map((improvement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-amber-500 mr-2">→</span>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SOLAR Radar Chart Placeholder */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SOLAR Health Visualization</h3>
        <div className="flex justify-center">
          <SOLARRadarChart dimensions={dashboardData.dimensions} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton icon="📊" label="Full Report" onClick={() => {}} />
          <ActionButton icon="📝" label="Record KPIs" onClick={() => {}} />
          <ActionButton icon="🎯" label="Set Goals" onClick={() => {}} />
          <ActionButton icon="📈" label="View Trends" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
}

// Dimension Card Component
interface DimensionCardProps {
  dimension: DimensionScore;
  benchmark?: number;
  onClick: () => void;
  isSelected: boolean;
}

function DimensionCard({ dimension, benchmark, onClick, isSelected }: DimensionCardProps) {
  const vsBenchmark = benchmark ? dimension.score - benchmark : null;
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{dimension.icon}</span>
        <span className="text-sm" title={dimension.trend}>
          {getTrendIcon(dimension.trend)}
        </span>
      </div>
      
      <h4 className="font-semibold text-gray-900 text-sm mb-2">
        {SOLAR_DIMENSIONS[dimension.dimension].fullName}
      </h4>
      
      <div className="flex items-baseline">
        <span className="text-2xl font-bold" style={{ color: dimension.color }}>
          {dimension.score}
        </span>
        <span className="text-gray-400 text-sm ml-1">/100</span>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <span
          className="text-xs font-medium px-2 py-1 rounded"
          style={{ 
            backgroundColor: `${getGradeColor(dimension.grade)}20`,
            color: getGradeColor(dimension.grade)
          }}
        >
          Grade: {dimension.grade}
        </span>
        
        {vsBenchmark !== null && (
          <span className={`text-xs ${vsBenchmark >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {vsBenchmark >= 0 ? '+' : ''}{vsBenchmark.toFixed(1)} vs avg
          </span>
        )}
      </div>
      
      {dimension.change !== undefined && (
        <div className="mt-2 text-xs text-gray-500">
          {dimension.change >= 0 ? '↑' : '↓'} {Math.abs(dimension.change).toFixed(1)} from last period
        </div>
      )}
    </div>
  );
}

// Simple Radar Chart Component (CSS-based visualization)
interface SOLARRadarChartProps {
  dimensions: DimensionScore[];
}

function SOLARRadarChart({ dimensions }: SOLARRadarChartProps) {
  // Create a simple visual representation
  const maxScore = 100;
  
  return (
    <div className="relative w-80 h-80">
      {/* Background circles */}
      {[20, 40, 60, 80, 100].map((level) => (
        <div
          key={level}
          className="absolute border border-gray-200 rounded-full"
          style={{
            width: `${(level / maxScore) * 100}%`,
            height: `${(level / maxScore) * 100}%`,
            top: `${50 - (level / maxScore) * 50}%`,
            left: `${50 - (level / maxScore) * 50}%`,
          }}
        />
      ))}
      
      {/* Dimension labels */}
      {dimensions.map((dim, index) => {
        const angle = (index * 360) / dimensions.length - 90;
        const radians = (angle * Math.PI) / 180;
        const x = 50 + 45 * Math.cos(radians);
        const y = 50 + 45 * Math.sin(radians);
        
        return (
          <div
            key={dim.dimension}
            className="absolute text-center"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="text-2xl">{dim.icon}</div>
            <div className="text-xs font-medium text-gray-600">{dim.score}</div>
          </div>
        );
      })}
      
      {/* Score visualization */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <polygon
          points={dimensions.map((dim, index) => {
            const angle = (index * 360) / dimensions.length - 90;
            const radians = (angle * Math.PI) / 180;
            const distance = (dim.score / maxScore) * 35;
            const x = 50 + distance * Math.cos(radians);
            const y = 50 + distance * Math.sin(radians);
            return `${x},${y}`;
          }).join(' ')}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3B82F6"
          strokeWidth="2"
        />
      </svg>
      
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">SOLAR</div>
          <div className="text-sm text-gray-500">Health Score</div>
        </div>
      </div>
    </div>
  );
}

// Action Button Component
interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}
