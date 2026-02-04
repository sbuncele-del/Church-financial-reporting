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
import { useAuthStore } from '../../stores/authStore';

// Empty initial state - no mock data
const emptyDashboardData: SOLARDashboardData = {
  churchId: 0,
  churchName: '',
  assessmentPeriod: 'Not assessed',
  assessmentDate: '',
  overallScore: 0,
  overallGrade: 'N/A',
  dimensions: [
    { dimension: 'S', name: 'Spiritual Vitality', score: 0, grade: 'N/A', icon: '🙏', color: '#8B5CF6', trend: 'stable', change: 0 },
    { dimension: 'O', name: 'Organisational Governance', score: 0, grade: 'N/A', icon: '🏛️', color: '#3B82F6', trend: 'stable', change: 0 },
    { dimension: 'L', name: 'Love & Care', score: 0, grade: 'N/A', icon: '❤️', color: '#EF4444', trend: 'stable', change: 0 },
    { dimension: 'A', name: 'Advancement', score: 0, grade: 'N/A', icon: '🚀', color: '#10B981', trend: 'stable', change: 0 },
    { dimension: 'R', name: 'Resources', score: 0, grade: 'N/A', icon: '💰', color: '#F59E0B', trend: 'stable', change: 0 },
  ],
  topStrengths: [],
  priorityImprovements: [],
  benchmarkComparison: {
    S: 0,
    O: 0,
    L: 0,
    A: 0,
    R: 0,
  },
};

export default function SOLARDashboard() {
  const [dashboardData, setDashboardData] = useState<SOLARDashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<SOLARDimension | null>(null);
  const [hasAssessment, setHasAssessment] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const churchId = user?.church_id || 1;
        const response = await fetch(`/api/v1/solar/dashboard/${churchId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch SOLAR data');
        }
        
        const data = await response.json();
        
        // Map API response to expected format
        const dimensionIcons: Record<string, string> = {
          S: '🙏', O: '🏛️', L: '❤️', A: '🚀', R: '💰'
        };
        const dimensionColors: Record<string, string> = {
          S: '#8B5CF6', O: '#3B82F6', L: '#EF4444', A: '#10B981', R: '#F59E0B'
        };
        
        // Transform dimensions if returned as array or object
        let dimensions: DimensionScore[] = [];
        if (Array.isArray(data.dimensions)) {
          dimensions = data.dimensions.map((dim: any) => ({
            dimension: dim.dimension || dim.key,
            name: dim.name || (SOLAR_DIMENSIONS[dim.dimension as SOLARDimension]?.fullName) || dim.dimension,
            score: dim.score || 0,
            grade: dim.grade || 'N/A',
            icon: dimensionIcons[dim.dimension] || '📊',
            color: dimensionColors[dim.dimension] || '#6B7280',
            trend: dim.trend || 'stable',
            change: dim.change || 0,
          }));
        } else if (data.dimension_scores) {
          // Handle object format from API
          dimensions = Object.entries(data.dimension_scores).map(([key, value]: [string, any]) => ({
            dimension: key as SOLARDimension,
            name: value.name || SOLAR_DIMENSIONS[key as SOLARDimension]?.fullName || key,
            score: value.score || 0,
            grade: value.grade || 'N/A',
            icon: dimensionIcons[key] || '📊',
            color: value.color || dimensionColors[key] || '#6B7280',
            trend: value.trend || 'stable',
            change: value.change || 0,
          }));
        } else {
          // Use empty dimensions if no data
          dimensions = emptyDashboardData.dimensions;
        }
        
        // Check if there's any real data
        const hasData = dimensions.some((d) => d.score > 0);
        setHasAssessment(hasData);
        
        setDashboardData({
          churchId: data.church_id || churchId,
          churchName: data.church_name || 'Your Church',
          assessmentPeriod: data.assessment_period || 'Not assessed',
          assessmentDate: data.assessment_date || '',
          overallScore: data.overall_score || 0,
          overallGrade: data.overall_grade || 'N/A',
          dimensions,
          topStrengths: data.strengths || data.top_strengths || [],
          priorityImprovements: data.improvements || data.priority_improvements || [],
          benchmarkComparison: data.benchmark_comparison || emptyDashboardData.benchmarkComparison,
        });
      } catch (error) {
        console.error('Failed to fetch SOLAR dashboard data:', error);
        setHasAssessment(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAssessment) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-12 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-6">⛪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No SOLAR Assessment Yet</h2>
          <p className="text-gray-600 mb-8">
            Complete your first SOLAR assessment to measure your church's health across the five key dimensions:
            Spiritual Vitality, Organisational Governance, Love & Care, Advancement, and Resources.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['🙏 Spiritual', '🏛️ Governance', '❤️ Love & Care', '🚀 Advancement', '💰 Resources'].map((dim) => (
              <span key={dim} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{dim}</span>
            ))}
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            Start First Assessment
          </button>
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
