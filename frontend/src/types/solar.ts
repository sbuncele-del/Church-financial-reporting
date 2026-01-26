/**
 * SOLAR Framework Types
 * 
 * SOLAR = Spiritual, Organisational, Love & Care, Advancement, Resources
 * Based on the "Building Anchored on the Blessing" Mental Models framework.
 */

export type SOLARDimension = 'S' | 'O' | 'L' | 'A' | 'R';

export interface DimensionInfo {
  key: SOLARDimension;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
}

export const SOLAR_DIMENSIONS: Record<SOLARDimension, DimensionInfo> = {
  S: {
    key: 'S',
    name: 'Spiritual',
    fullName: 'Spiritual Vitality',
    description: 'The spiritual health and vibrancy of the church community',
    icon: '🙏',
    color: '#8B5CF6', // Purple
  },
  O: {
    key: 'O',
    name: 'Organisational',
    fullName: 'Organisational Governance',
    description: 'The structural health and leadership effectiveness of the church',
    icon: '🏛️',
    color: '#3B82F6', // Blue
  },
  L: {
    key: 'L',
    name: 'Love & Care',
    fullName: 'Love & Care',
    description: 'The relational health and care systems of the church',
    icon: '❤️',
    color: '#EF4444', // Red
  },
  A: {
    key: 'A',
    name: 'Advancement',
    fullName: 'Advancement',
    description: 'The outward movement of mission and community impact',
    icon: '🚀',
    color: '#10B981', // Green
  },
  R: {
    key: 'R',
    name: 'Resources',
    fullName: 'Resources',
    description: 'The capacity to fuel vision and mission through financial and human resources',
    icon: '💰',
    color: '#F59E0B', // Amber
  },
};

export interface DimensionScore {
  dimension: SOLARDimension;
  name: string;
  score: number;
  grade: string;
  icon: string;
  color: string;
  trend?: 'improving' | 'stable' | 'declining';
  change?: number;
}

export interface SOLARAssessment {
  id: number;
  churchId: number;
  assessmentDate: string;
  assessmentPeriod: string;
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed';
  overallScore: number;
  overallGrade: string;
  spiritualVitalityScore: number;
  organisationalGovernanceScore: number;
  loveCareScore: number;
  advancementScore: number;
  resourcesScore: number;
  executiveSummary?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  recommendations?: Recommendation[];
}

export interface Recommendation {
  priority: number;
  dimension: SOLARDimension;
  area: string;
  action: string;
  timeline: string;
}

export interface SOLARDashboardData {
  churchId: number;
  churchName: string;
  assessmentPeriod: string;
  assessmentDate: string;
  overallScore: number;
  overallGrade: string;
  dimensions: DimensionScore[];
  trendData?: TrendDataPoint[];
  topStrengths?: string[];
  priorityImprovements?: string[];
  benchmarkComparison?: Record<SOLARDimension, number>;
}

export interface TrendDataPoint {
  period: string;
  overallScore: number;
  dimensionScores: Record<SOLARDimension, number>;
}

export interface SOLARRadarData {
  labels: string[];
  currentScores: number[];
  previousScores?: number[];
  benchmarkScores?: number[];
  targetScores?: number[];
}

export interface KPIDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  dimension: SOLARDimension;
  subDimension: string;
  measurementType: string;
  targetValue: number;
  targetUnit: string;
  excellentThreshold: number;
  goodThreshold: number;
  fairThreshold: number;
  weight: number;
  collectionFrequency: string;
}

export interface KPIScore {
  id: number;
  kpiDefinitionId: number;
  actualValue: number;
  score: number;
  grade: string;
  previousValue?: number;
  changePercentage?: number;
  trend?: 'improving' | 'stable' | 'declining';
  notes?: string;
  recordedAt: string;
  kpiCode?: string;
  kpiName?: string;
}

export interface SOLARGoal {
  id: number;
  churchId: number;
  title: string;
  description?: string;
  dimension: SOLARDimension;
  subDimension?: string;
  targetScore: number;
  baselineScore: number;
  currentScore: number;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  progressPercentage: number;
  milestones?: Milestone[];
  actionPlan?: ActionItem[];
}

export interface Milestone {
  title: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
}

export interface ActionItem {
  action: string;
  responsible?: string;
  dueDate?: string;
  completed: boolean;
}

export interface ProgramAssessment {
  id: number;
  programName: string;
  programDescription?: string;
  dimension: SOLARDimension;
  spiritualImpactScore: number;
  participationQualityScore: number;
  transformationEvidenceScore: number;
  teamPreparednessScore: number;
  overallScore: number;
  excellenceDefinition?: string;
  currentState?: string;
  barriers?: string[];
  motivators?: string[];
  enhancementAreas?: EnhancementArea[];
  specificActions?: ActionItem[];
  successMeasures?: SuccessMeasure[];
  isPriority: boolean;
  priorityRank?: number;
}

export interface EnhancementArea {
  area: string;
  description: string;
  actions: string[];
}

export interface SuccessMeasure {
  measure: string;
  target: string;
  currentValue?: string;
}

// Utility function to get grade color
export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#10B981'; // Green
  if (grade.startsWith('B')) return '#3B82F6'; // Blue
  if (grade.startsWith('C')) return '#F59E0B'; // Amber
  if (grade.startsWith('D')) return '#F97316'; // Orange
  return '#EF4444'; // Red for F
}

// Utility function to get trend icon
export function getTrendIcon(trend?: string): string {
  switch (trend) {
    case 'improving': return '📈';
    case 'declining': return '📉';
    default: return '➡️';
  }
}

// Utility function to calculate overall score from dimension scores
export function calculateOverallScore(dimensions: DimensionScore[]): number {
  if (dimensions.length === 0) return 0;
  const total = dimensions.reduce((sum, d) => sum + d.score, 0);
  return Math.round((total / dimensions.length) * 10) / 10;
}

// Utility function to get grade from score
export function getGradeFromScore(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}
