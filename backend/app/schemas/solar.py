"""
Pydantic Schemas for SOLAR Framework API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SOLARDimensionEnum(str, Enum):
    """The 5 SOLAR dimensions"""
    SPIRITUAL_VITALITY = "S"
    ORGANISATIONAL_GOVERNANCE = "O"
    LOVE_AND_CARE = "L"
    ADVANCEMENT = "A"
    RESOURCES = "R"


class AssessmentStatusEnum(str, Enum):
    """Status of assessment"""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REVIEWED = "reviewed"


# ============================================================================
# KPI Schemas
# ============================================================================

class KPIDefinitionBase(BaseModel):
    """Base schema for KPI Definition"""
    code: str
    name: str
    description: Optional[str] = None
    dimension: SOLARDimensionEnum
    sub_dimension: str
    measurement_type: str
    target_value: Optional[float] = None
    target_unit: Optional[str] = None
    excellent_threshold: Optional[float] = None
    good_threshold: Optional[float] = None
    fair_threshold: Optional[float] = None
    weight: float = 1.0
    collection_frequency: str = "monthly"


class KPIDefinitionResponse(KPIDefinitionBase):
    """Response schema for KPI Definition"""
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True


class KPIScoreCreate(BaseModel):
    """Schema for recording a KPI score"""
    kpi_definition_id: int
    actual_value: float
    notes: Optional[str] = None
    evidence: Optional[Dict[str, Any]] = None


class KPIScoreResponse(BaseModel):
    """Response schema for KPI Score"""
    id: int
    kpi_definition_id: int
    actual_value: float
    score: float
    grade: str
    previous_value: Optional[float] = None
    change_percentage: Optional[float] = None
    trend: Optional[str] = None
    notes: Optional[str] = None
    recorded_at: datetime
    
    # Include KPI definition details
    kpi_code: Optional[str] = None
    kpi_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# Dimension Assessment Schemas
# ============================================================================

class DimensionAssessmentCreate(BaseModel):
    """Schema for creating a dimension assessment"""
    dimension: SOLARDimensionEnum
    sub_dimension_scores: Dict[str, float]
    vivid_image: Optional[str] = None
    current_state: Optional[str] = None
    desired_state: Optional[str] = None
    gap_analysis: Optional[str] = None
    focus_programs: Optional[List[str]] = None
    observations: Optional[str] = None
    action_items: Optional[List[Dict[str, Any]]] = None


class DimensionAssessmentResponse(BaseModel):
    """Response schema for dimension assessment"""
    id: int
    dimension: SOLARDimensionEnum
    score: float
    grade: Optional[str] = None
    sub_dimension_scores: Optional[Dict[str, float]] = None
    vivid_image: Optional[str] = None
    current_state: Optional[str] = None
    desired_state: Optional[str] = None
    gap_analysis: Optional[str] = None
    focus_programs: Optional[List[str]] = None
    observations: Optional[str] = None
    action_items: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# SOLAR Assessment Schemas
# ============================================================================

class SOLARAssessmentCreate(BaseModel):
    """Schema for creating a new SOLAR assessment"""
    church_id: int
    assessment_period: str = Field(..., description="e.g., 'Q1 2026', 'Annual 2025'")


class SOLARAssessmentUpdate(BaseModel):
    """Schema for updating a SOLAR assessment"""
    status: Optional[AssessmentStatusEnum] = None
    executive_summary: Optional[str] = None
    strengths: Optional[List[str]] = None
    areas_for_improvement: Optional[List[str]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None


class SOLARScoresUpdate(BaseModel):
    """Schema for updating SOLAR dimension scores"""
    spiritual_vitality_score: Optional[float] = Field(None, ge=0, le=100)
    organisational_governance_score: Optional[float] = Field(None, ge=0, le=100)
    love_care_score: Optional[float] = Field(None, ge=0, le=100)
    advancement_score: Optional[float] = Field(None, ge=0, le=100)
    resources_score: Optional[float] = Field(None, ge=0, le=100)


class SOLARAssessmentSummary(BaseModel):
    """Summary schema for SOLAR assessment (list view)"""
    id: int
    church_id: int
    assessment_date: datetime
    assessment_period: str
    status: AssessmentStatusEnum
    overall_score: float
    overall_grade: Optional[str] = None
    spiritual_vitality_score: float
    organisational_governance_score: float
    love_care_score: float
    advancement_score: float
    resources_score: float
    
    class Config:
        from_attributes = True


class SOLARAssessmentResponse(SOLARAssessmentSummary):
    """Full response schema for SOLAR assessment"""
    executive_summary: Optional[str] = None
    strengths: Optional[List[str]] = None
    areas_for_improvement: Optional[List[str]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    dimension_assessments: Optional[List[DimensionAssessmentResponse]] = None
    kpi_scores: Optional[List[KPIScoreResponse]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# SOLAR Dashboard Schemas
# ============================================================================

class DimensionScore(BaseModel):
    """Score for a single dimension"""
    dimension: SOLARDimensionEnum
    name: str
    score: float
    grade: str
    icon: str
    color: str
    trend: Optional[str] = None  # improving, stable, declining
    change: Optional[float] = None


class SOLARDashboard(BaseModel):
    """Dashboard data for SOLAR visualization"""
    church_id: int
    church_name: str
    assessment_period: str
    assessment_date: datetime
    overall_score: float
    overall_grade: str
    
    # Dimension scores for radar chart
    dimensions: List[DimensionScore]
    
    # Trend data (last 4 assessments)
    trend_data: Optional[List[Dict[str, Any]]] = None
    
    # Top strengths and areas for improvement
    top_strengths: Optional[List[str]] = None
    priority_improvements: Optional[List[str]] = None
    
    # Benchmark comparison
    benchmark_comparison: Optional[Dict[str, float]] = None


class SOLARRadarData(BaseModel):
    """Data formatted for radar chart visualization"""
    labels: List[str]  # ["Spiritual", "Organisational", "Love & Care", "Advancement", "Resources"]
    current_scores: List[float]  # Current assessment scores
    previous_scores: Optional[List[float]] = None  # Previous period for comparison
    benchmark_scores: Optional[List[float]] = None  # Industry/denominational benchmark
    target_scores: Optional[List[float]] = None  # Church's target scores


# ============================================================================
# SOLAR Goal Schemas
# ============================================================================

class SOLARGoalCreate(BaseModel):
    """Schema for creating a SOLAR goal"""
    church_id: int
    title: str
    description: Optional[str] = None
    dimension: SOLARDimensionEnum
    sub_dimension: Optional[str] = None
    target_score: float = Field(..., ge=0, le=100)
    baseline_score: float = Field(..., ge=0, le=100)
    target_date: datetime
    milestones: Optional[List[Dict[str, Any]]] = None
    action_plan: Optional[List[Dict[str, Any]]] = None


class SOLARGoalUpdate(BaseModel):
    """Schema for updating a SOLAR goal"""
    title: Optional[str] = None
    description: Optional[str] = None
    target_score: Optional[float] = Field(None, ge=0, le=100)
    current_score: Optional[float] = Field(None, ge=0, le=100)
    target_date: Optional[datetime] = None
    status: Optional[str] = None
    progress_percentage: Optional[float] = Field(None, ge=0, le=100)
    milestones: Optional[List[Dict[str, Any]]] = None
    action_plan: Optional[List[Dict[str, Any]]] = None


class SOLARGoalResponse(BaseModel):
    """Response schema for SOLAR goal"""
    id: int
    church_id: int
    title: str
    description: Optional[str] = None
    dimension: SOLARDimensionEnum
    sub_dimension: Optional[str] = None
    target_score: float
    baseline_score: float
    current_score: float
    start_date: datetime
    target_date: datetime
    completed_date: Optional[datetime] = None
    status: str
    progress_percentage: float
    milestones: Optional[List[Dict[str, Any]]] = None
    action_plan: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# Program Assessment Schemas
# ============================================================================

class ProgramAssessmentCreate(BaseModel):
    """Schema for creating a program assessment"""
    program_name: str
    program_description: Optional[str] = None
    dimension: SOLARDimensionEnum
    spiritual_impact_score: float = Field(..., ge=0, le=100)
    participation_quality_score: float = Field(..., ge=0, le=100)
    transformation_evidence_score: float = Field(..., ge=0, le=100)
    team_preparedness_score: float = Field(..., ge=0, le=100)
    excellence_definition: Optional[str] = None
    current_state: Optional[str] = None
    barriers: Optional[List[str]] = None
    motivators: Optional[List[str]] = None
    enhancement_areas: Optional[List[Dict[str, Any]]] = None
    specific_actions: Optional[List[Dict[str, Any]]] = None
    success_measures: Optional[List[Dict[str, Any]]] = None
    is_priority: bool = False
    priority_rank: Optional[int] = Field(None, ge=1, le=3)


class ProgramAssessmentResponse(BaseModel):
    """Response schema for program assessment"""
    id: int
    program_name: str
    program_description: Optional[str] = None
    dimension: SOLARDimensionEnum
    spiritual_impact_score: float
    participation_quality_score: float
    transformation_evidence_score: float
    team_preparedness_score: float
    overall_score: float
    excellence_definition: Optional[str] = None
    current_state: Optional[str] = None
    barriers: Optional[List[str]] = None
    motivators: Optional[List[str]] = None
    enhancement_areas: Optional[List[Dict[str, Any]]] = None
    specific_actions: Optional[List[Dict[str, Any]]] = None
    success_measures: Optional[List[Dict[str, Any]]] = None
    is_priority: bool
    priority_rank: Optional[int] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# Report Schemas
# ============================================================================

class SOLARReportRequest(BaseModel):
    """Request schema for generating SOLAR report"""
    church_id: int
    assessment_id: Optional[int] = None
    report_type: str = "comprehensive"  # comprehensive, summary, dimension, comparison
    include_benchmarks: bool = True
    include_trends: bool = True
    include_recommendations: bool = True
    dimensions: Optional[List[SOLARDimensionEnum]] = None  # For dimension-specific reports
    comparison_assessment_ids: Optional[List[int]] = None  # For comparison reports


class SOLARTrendData(BaseModel):
    """Trend data for SOLAR assessments over time"""
    assessment_periods: List[str]
    overall_scores: List[float]
    dimension_scores: Dict[str, List[float]]


class SOLARBenchmarkComparison(BaseModel):
    """Comparison against benchmarks"""
    church_score: float
    benchmark_score: float
    difference: float
    percentile: Optional[float] = None
