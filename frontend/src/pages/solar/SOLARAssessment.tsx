/**
 * SOLAR Assessment Page
 * 
 * Interactive assessment tool for evaluating church health
 * across the 5 SOLAR dimensions with KPI tracking.
 */

import { useState } from 'react';
import {
  SOLAR_DIMENSIONS,
  SOLARDimension,
  getGradeFromScore,
  getGradeColor,
} from '../../types/solar';

interface SubDimensionScore {
  key: string;
  name: string;
  score: number;
  notes: string;
}

interface DimensionAssessmentState {
  score: number;
  subDimensions: SubDimensionScore[];
  vividImage: string;
  currentState: string;
  desiredState: string;
  focusPrograms: string[];
  actionItems: string[];
}

// Sub-dimensions for each SOLAR dimension
const SUB_DIMENSIONS: Record<SOLARDimension, Array<{ key: string; name: string }>> = {
  S: [
    { key: 'transformational_worship', name: 'Transformational Worship' },
    { key: 'prayer_culture', name: 'Prayer Culture' },
    { key: 'word_and_teaching', name: 'Word & Teaching' },
    { key: 'spiritual_disciplines', name: 'Spiritual Disciplines' },
    { key: 'altar_ministry', name: 'Altar Ministry' },
  ],
  O: [
    { key: 'organisational_culture', name: 'Organisational Culture' },
    { key: 'leadership_development', name: 'Leadership Development' },
    { key: 'governance_structures', name: 'Governance Structures' },
    { key: 'policies_compliance', name: 'Policies & Compliance' },
    { key: 'strategic_planning', name: 'Strategic Planning' },
  ],
  L: [
    { key: 'family_groups', name: 'Family Group Ecosystem' },
    { key: 'member_care', name: 'Member Care' },
    { key: 'discipleship', name: 'Discipleship' },
    { key: 'new_believers', name: 'New Believers Integration' },
    { key: 'pastoral_care', name: 'Pastoral Care' },
  ],
  A: [
    { key: 'outreach', name: 'Outreach Engagements' },
    { key: 'community_impact', name: 'Local Community Impact' },
    { key: 'digital_mission', name: 'Digital Mission & Media' },
    { key: 'global_mission', name: 'Global Mission' },
    { key: 'compassion', name: 'Compassion & Humanitarian' },
  ],
  R: [
    { key: 'financial_health', name: 'Financial Health & Stewardship' },
    { key: 'human_resources', name: 'Human Resources' },
    { key: 'volunteer_systems', name: 'Volunteer Systems' },
    { key: 'investment_strategy', name: 'Investment Strategy' },
    { key: 'infrastructure', name: 'Infrastructure & Technology' },
  ],
};

export default function SOLARAssessment() {
  const [currentDimension, setCurrentDimension] = useState<SOLARDimension>('S');
  const [assessments, setAssessments] = useState<Record<SOLARDimension, DimensionAssessmentState>>(
    initializeAssessments()
  );
  const [assessmentPeriod] = useState('Q1 2026');

  function initializeAssessments(): Record<SOLARDimension, DimensionAssessmentState> {
    const initial: Record<string, DimensionAssessmentState> = {};
    
    Object.keys(SOLAR_DIMENSIONS).forEach((dim) => {
      const dimension = dim as SOLARDimension;
      initial[dimension] = {
        score: 0,
        subDimensions: SUB_DIMENSIONS[dimension].map((sub) => ({
          key: sub.key,
          name: sub.name,
          score: 0,
          notes: '',
        })),
        vividImage: '',
        currentState: '',
        desiredState: '',
        focusPrograms: [],
        actionItems: [],
      };
    });
    
    return initial as Record<SOLARDimension, DimensionAssessmentState>;
  }

  const updateSubDimensionScore = (subKey: string, score: number) => {
    setAssessments((prev) => {
      const dimAssessment = { ...prev[currentDimension] };
      dimAssessment.subDimensions = dimAssessment.subDimensions.map((sub) =>
        sub.key === subKey ? { ...sub, score } : sub
      );
      // Recalculate dimension score
      const validScores = dimAssessment.subDimensions.filter((s) => s.score > 0);
      dimAssessment.score = validScores.length > 0
        ? validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length
        : 0;
      
      return { ...prev, [currentDimension]: dimAssessment };
    });
  };

  const updateTextField = (field: keyof DimensionAssessmentState, value: string) => {
    setAssessments((prev) => ({
      ...prev,
      [currentDimension]: {
        ...prev[currentDimension],
        [field]: value,
      },
    }));
  };

  const calculateOverallScore = (): number => {
    const scores = Object.values(assessments).map((a) => a.score).filter((s) => s > 0);
    return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  };

  const currentAssessment = assessments[currentDimension];
  const overallScore = calculateOverallScore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SOLAR Assessment</h1>
              <p className="text-gray-600">Period: {assessmentPeriod}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="text-2xl font-bold" style={{ color: getGradeColor(getGradeFromScore(overallScore)) }}>
                  {overallScore.toFixed(1)}
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Progress
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Complete Assessment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {(Object.keys(SOLAR_DIMENSIONS) as SOLARDimension[]).map((dim) => {
              const info = SOLAR_DIMENSIONS[dim];
              const dimScore = assessments[dim].score;
              
              return (
                <button
                  key={dim}
                  onClick={() => setCurrentDimension(dim)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition ${
                    currentDimension === dim
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <span className="font-medium">{info.name}</span>
                  {dimScore > 0 && (
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `${getGradeColor(getGradeFromScore(dimScore))}20`,
                        color: getGradeColor(getGradeFromScore(dimScore))
                      }}
                    >
                      {dimScore.toFixed(0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sub-dimension Scoring */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dimension Header */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{SOLAR_DIMENSIONS[currentDimension].icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {SOLAR_DIMENSIONS[currentDimension].fullName}
                  </h2>
                  <p className="text-gray-600">
                    {SOLAR_DIMENSIONS[currentDimension].description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Dimension Score</p>
                  <p className="text-3xl font-bold" style={{ color: SOLAR_DIMENSIONS[currentDimension].color }}>
                    {currentAssessment.score.toFixed(1)}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grade</p>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: getGradeColor(getGradeFromScore(currentAssessment.score)) }}
                  >
                    {getGradeFromScore(currentAssessment.score)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-dimension Scoring */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sub-Dimensions Assessment</h3>
              <div className="space-y-6">
                {currentAssessment.subDimensions.map((sub) => (
                  <div key={sub.key} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium text-gray-900">{sub.name}</label>
                      <span 
                        className="text-lg font-bold"
                        style={{ color: getGradeColor(getGradeFromScore(sub.score)) }}
                      >
                        {sub.score}/100
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sub.score}
                      onChange={(e) => updateSubDimensionScore(sub.key, Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${SOLAR_DIMENSIONS[currentDimension].color} ${sub.score}%, #E5E7EB ${sub.score}%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Poor</span>
                      <span>Fair</span>
                      <span>Good</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vivid Image of Excellence */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vivid Image of Operational Excellence
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                What does operational excellence look like in {SOLAR_DIMENSIONS[currentDimension].fullName}?
              </p>
              <textarea
                value={currentAssessment.vividImage}
                onChange={(e) => updateTextField('vividImage', e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the ideal state of excellence..."
              />
            </div>

            {/* Gap Analysis */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gap Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current State
                  </label>
                  <textarea
                    value={currentAssessment.currentState}
                    onChange={(e) => updateTextField('currentState', e.target.value)}
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Where are we now?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired State
                  </label>
                  <textarea
                    value={currentAssessment.desiredState}
                    onChange={(e) => updateTextField('desiredState', e.target.value)}
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Where do we want to be?"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Score Summary */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
              <div className="space-y-3">
                {(Object.keys(SOLAR_DIMENSIONS) as SOLARDimension[]).map((dim) => {
                  const info = SOLAR_DIMENSIONS[dim];
                  const score = assessments[dim].score;
                  
                  return (
                    <div key={dim} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{info.icon}</span>
                        <span className="text-sm">{info.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ 
                              width: `${score}%`,
                              backgroundColor: info.color
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{score.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Overall Score</span>
                  <span className="text-xl font-bold">{overallScore.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">Grade</span>
                  <span 
                    className="text-xl font-bold"
                    style={{ color: getGradeColor(getGradeFromScore(overallScore)) }}
                  >
                    {getGradeFromScore(overallScore)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Assessment Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Be honest in your evaluation</li>
                <li>• Consider evidence and data</li>
                <li>• Involve multiple perspectives</li>
                <li>• Focus on improvement, not just scores</li>
                <li>• Document specific examples</li>
              </ul>
            </div>

            {/* Help Card */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                The SOLAR framework helps assess church health across 5 key dimensions.
              </p>
              <button className="w-full py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                View SOLAR Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
