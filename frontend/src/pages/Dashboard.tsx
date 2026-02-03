/**
 * SOLAR Church Health Dashboard
 * 
 * Main dashboard showing overall church health across all 5 SOLAR dimensions:
 * - S: Spiritual Vitality
 * - O: Organisational Governance
 * - L: Love & Care
 * - A: Advancement
 * - R: Resources
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// SOLAR Dimensions configuration
const SOLAR_DIMENSIONS = [
  {
    key: 'S',
    name: 'Spiritual Vitality',
    fullName: 'Spiritual Vitality',
    description: 'The Soul - A measure of the living, inner spiritual pulse',
    icon: '🙏',
    color: '#8B5CF6',
    bgColor: 'bg-purple-500',
    href: '/solar/spiritual',
  },
  {
    key: 'O',
    name: 'Organisational',
    fullName: 'Organisational Governance',
    description: 'The Crux - The structural backbone that enables mission',
    icon: '🏛️',
    color: '#3B82F6',
    bgColor: 'bg-blue-500',
    href: '/solar/organisational',
  },
  {
    key: 'L',
    name: 'Love & Care',
    fullName: 'Love & Care',
    description: 'The Heart - The relational health of the community',
    icon: '❤️',
    color: '#EF4444',
    bgColor: 'bg-red-500',
    href: '/solar/love-care',
  },
  {
    key: 'A',
    name: 'Advancement',
    fullName: 'Advancement',
    description: 'The Outreach - The outward movement of mission',
    icon: '🚀',
    color: '#10B981',
    bgColor: 'bg-green-500',
    href: '/solar/advancement',
  },
  {
    key: 'R',
    name: 'Resources',
    fullName: 'Resources',
    description: 'The Fuel - The capacity to fuel vision and mission',
    icon: '💰',
    color: '#F59E0B',
    bgColor: 'bg-amber-500',
    href: '/solar/resources',
  },
];

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-600';
  if (grade.startsWith('B')) return 'text-blue-600';
  if (grade.startsWith('C')) return 'text-amber-600';
  return 'text-red-600';
}

function getTrendIcon(trend: string): string {
  if (trend === 'improving') return '↑';
  if (trend === 'declining') return '↓';
  return '→';
}

function getTrendColor(trend: string): string {
  if (trend === 'improving') return 'text-green-600';
  if (trend === 'declining') return 'text-red-600';
  return 'text-gray-500';
}

// Empty initial state - no mock data
const emptySOLARData = {
  overallScore: 0,
  overallGrade: 'N/A',
  assessmentPeriod: 'Not assessed',
  dimensions: {
    S: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
    O: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
    L: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
    A: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
    R: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
  },
  strengths: [],
  priorities: [],
  hasAssessment: false,
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [solarData, setSolarData] = useState(emptySOLARData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSOLARData = async () => {
      try {
        // Get church_id from auth store or localStorage
        const authData = localStorage.getItem('church-auth-storage');
        let churchId = 1;
        if (authData) {
          const parsed = JSON.parse(authData);
          churchId = parsed?.state?.user?.church_id || 1;
        }
        
        const response = await fetch(`/api/v1/solar/dashboard/${churchId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch SOLAR data');
        }
        const data = await response.json();
        
        // Transform dimensions array to object format
        const dimensionsObj: any = {
          S: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
          O: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
          L: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
          A: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
          R: { score: 0, grade: 'N/A', trend: 'stable', change: 0 },
        };
        
        // API returns array of dimensions
        if (Array.isArray(data.dimensions)) {
          data.dimensions.forEach((dim: any) => {
            if (dim.dimension && dimensionsObj[dim.dimension]) {
              dimensionsObj[dim.dimension] = {
                score: dim.score || 0,
                grade: dim.grade || 'N/A',
                trend: dim.trend || 'stable',
                change: dim.change || 0,
              };
            }
          });
        }
        
        // Check if there's any real assessment data (not all zeros)
        const hasRealData = Object.values(dimensionsObj).some((d: any) => d.score > 0);
        
        setSolarData({
          overallScore: data.overall_score || 0,
          overallGrade: data.overall_grade || 'N/A',
          assessmentPeriod: data.assessment_period || 'Not assessed',
          dimensions: dimensionsObj,
          strengths: data.strengths || [],
          priorities: data.improvements || data.priorities || [],
          hasAssessment: hasRealData,
        });
      } catch (err) {
        console.error('Error fetching SOLAR data:', err);
        setError('Unable to load church health data');
        setSolarData({ ...emptySOLARData, hasAssessment: false });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSOLARData();
  }, []);

  // Radar chart data
  const radarData = {
    labels: SOLAR_DIMENSIONS.map(d => d.name),
    datasets: [
      {
        label: 'Current Score',
        data: SOLAR_DIMENSIONS.map(d => solarData.dimensions[d.key as keyof typeof solarData.dimensions].score),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: SOLAR_DIMENSIONS.map(d => d.color),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: SOLAR_DIMENSIONS.map(d => d.color),
      },
      {
        label: 'Target (80%)',
        data: [80, 80, 80, 80, 80],
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderColor: 'rgba(156, 163, 175, 0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { size: 10 },
        },
        pointLabels: {
          font: { size: 12, weight: 'bold' as const },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Church Health Dashboard</h1>
          <p className="text-gray-600">
            SOLAR Assessment Overview • {solarData.assessmentPeriod}
          </p>
        </div>
        <Link
          to="/solar/assessment"
          className="btn-primary inline-flex items-center gap-2"
        >
          <span>📋</span> New Assessment
        </Link>
      </div>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-blue-100 text-sm font-medium">Overall Church Health Score</p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl font-bold">{solarData.overallScore}%</span>
              <span className="text-3xl font-semibold text-blue-200">Grade: {solarData.overallGrade}</span>
            </div>
            <p className="text-blue-100 mt-2">
              Based on assessment across all 5 SOLAR dimensions
            </p>
          </div>
          <div className="text-6xl">☀️</div>
        </div>
      </div>

      {/* SOLAR Dimensions Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SOLAR Dimensions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SOLAR_DIMENSIONS.map((dimension) => {
            const data = solarData.dimensions[dimension.key as keyof typeof solarData.dimensions];
            return (
              <Link
                key={dimension.key}
                to={dimension.href}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{dimension.icon}</span>
                  <span className={`text-2xl font-bold ${getGradeColor(data.grade)}`}>
                    {data.grade}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {dimension.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-gray-900">{data.score}%</span>
                  </div>
                  <span className={`text-sm font-medium ${getTrendColor(data.trend)}`}>
                    {getTrendIcon(data.trend)} {data.change > 0 ? '+' : ''}{data.change}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${data.score}%`,
                      backgroundColor: dimension.color,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts and Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">SOLAR Health Radar</h3>
          <div className="h-80">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Strengths & Priorities */}
        <div className="space-y-4">
          {/* Strengths */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-green-500">✓</span> Key Strengths
            </h3>
            <ul className="space-y-2">
              {solarData.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Priority Areas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-amber-500">⚡</span> Priority Improvements
            </h3>
            <ul className="space-y-2">
              {solarData.priorities.map((priority, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {priority}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {SOLAR_DIMENSIONS.map((dimension) => (
            <Link
              key={dimension.key}
              to={`/solar/assessment?dimension=${dimension.key}`}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center group"
            >
              <span className="text-2xl block mb-2">{dimension.icon}</span>
              <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">
                Assess {dimension.key}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity / Dimension Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Dimension Details</h3>
          <Link to="/solar/dashboard" className="text-sm text-blue-600 hover:underline">
            View Full Report →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dimension</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Score</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Grade</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Trend</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {SOLAR_DIMENSIONS.map((dimension) => {
                const data = solarData.dimensions[dimension.key as keyof typeof solarData.dimensions];
                return (
                  <tr key={dimension.key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{dimension.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{dimension.fullName}</p>
                          <p className="text-xs text-gray-500">{dimension.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-gray-900">{data.score}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${getGradeColor(data.grade)}`}>{data.grade}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm ${getTrendColor(data.trend)}`}>
                        {getTrendIcon(data.trend)} {data.trend}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={dimension.href}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
