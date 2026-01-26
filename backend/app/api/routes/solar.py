"""
SOLAR Framework API Routes

This module provides API endpoints for:
- SOLAR Assessments (create, read, update)
- KPI Management
- Dashboard data
- Goals and tracking
- Reports
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.solar import (
    SOLARAssessmentCreate,
    SOLARAssessmentUpdate,
    SOLARAssessmentResponse,
    SOLARAssessmentSummary,
    SOLARScoresUpdate,
    DimensionAssessmentCreate,
    DimensionAssessmentResponse,
    KPIDefinitionResponse,
    KPIScoreCreate,
    KPIScoreResponse,
    SOLARDashboard,
    SOLARRadarData,
    SOLARGoalCreate,
    SOLARGoalUpdate,
    SOLARGoalResponse,
    ProgramAssessmentCreate,
    ProgramAssessmentResponse,
    SOLARReportRequest,
    SOLARDimensionEnum,
    DimensionScore,
)
from app.models.solar import (
    SOLARAssessment,
    DimensionAssessment,
    KPIDefinition,
    KPIScore,
    SOLARGoal,
    SOLARDimension,
    AssessmentStatus,
)
from app.models.solar_kpis import SOLAR_KPI_DEFINITIONS, get_dimension_summary, get_all_kpi_definitions

router = APIRouter(prefix="/solar", tags=["SOLAR Framework"])


# ============================================================================
# SOLAR Assessment Endpoints
# ============================================================================

@router.post("/assessments", response_model=SOLARAssessmentResponse)
async def create_assessment(
    assessment: SOLARAssessmentCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new SOLAR assessment for a church.
    This initializes all 5 dimension assessments.
    """
    # Create the assessment in database
    db_assessment = SOLARAssessment(
        church_id=assessment.church_id,
        assessment_period=assessment.assessment_period,
        status=AssessmentStatus.DRAFT,
        overall_score=0.0,
        spiritual_vitality_score=0.0,
        organisational_governance_score=0.0,
        love_care_score=0.0,
        advancement_score=0.0,
        resources_score=0.0,
        strengths=[],
        areas_for_improvement=[],
        recommendations=[],
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    # Create dimension assessments for each SOLAR dimension
    for dimension in SOLARDimension:
        dim_assessment = DimensionAssessment(
            solar_assessment_id=db_assessment.id,
            dimension=dimension,
            score=0.0,
            sub_dimension_scores={},
        )
        db.add(dim_assessment)
    db.commit()
    
    # Refresh to get relationships
    db.refresh(db_assessment)
    
    return _format_assessment_response(db_assessment)


@router.get("/assessments", response_model=List[SOLARAssessmentSummary])
async def list_assessments(
    church_id: int,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List all SOLAR assessments for a church.
    """
    assessments = db.query(SOLARAssessment).filter(
        SOLARAssessment.church_id == church_id
    ).order_by(SOLARAssessment.assessment_date.desc()).offset(offset).limit(limit).all()
    
    return [_format_assessment_summary(a) for a in assessments]


@router.get("/assessments/{assessment_id}", response_model=SOLARAssessmentResponse)
async def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific SOLAR assessment with all details.
    """
    assessment = db.query(SOLARAssessment).filter(SOLARAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    return _format_assessment_response(assessment)


@router.put("/assessments/{assessment_id}", response_model=SOLARAssessmentResponse)
async def update_assessment(
    assessment_id: int,
    update_data: SOLARAssessmentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a SOLAR assessment (status, summary, recommendations).
    """
    assessment = db.query(SOLARAssessment).filter(SOLARAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Update fields if provided
    if update_data.status is not None:
        assessment.status = update_data.status
    if update_data.executive_summary is not None:
        assessment.executive_summary = update_data.executive_summary
    if update_data.strengths is not None:
        assessment.strengths = update_data.strengths
    if update_data.areas_for_improvement is not None:
        assessment.areas_for_improvement = update_data.areas_for_improvement
    if update_data.recommendations is not None:
        assessment.recommendations = update_data.recommendations
    
    assessment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(assessment)
    
    return _format_assessment_response(assessment)


@router.put("/assessments/{assessment_id}/scores", response_model=SOLARAssessmentResponse)
async def update_assessment_scores(
    assessment_id: int,
    scores: SOLARScoresUpdate,
    db: Session = Depends(get_db)
):
    """
    Update dimension scores for a SOLAR assessment.
    Automatically recalculates overall score and grade.
    """
    assessment = db.query(SOLARAssessment).filter(SOLARAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Update scores if provided
    if scores.spiritual_vitality_score is not None:
        assessment.spiritual_vitality_score = scores.spiritual_vitality_score
    if scores.organisational_governance_score is not None:
        assessment.organisational_governance_score = scores.organisational_governance_score
    if scores.love_care_score is not None:
        assessment.love_care_score = scores.love_care_score
    if scores.advancement_score is not None:
        assessment.advancement_score = scores.advancement_score
    if scores.resources_score is not None:
        assessment.resources_score = scores.resources_score
    
    # Recalculate overall score
    assessment.overall_score = calculate_overall_score(
        assessment.spiritual_vitality_score,
        assessment.organisational_governance_score,
        assessment.love_care_score,
        assessment.advancement_score,
        assessment.resources_score,
    )
    assessment.overall_grade = calculate_grade(assessment.overall_score)
    assessment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(assessment)
    
    return _format_assessment_response(assessment)


# ============================================================================
# Dimension Assessment Endpoints
# ============================================================================

@router.post("/assessments/{assessment_id}/dimensions", response_model=DimensionAssessmentResponse)
async def create_dimension_assessment(
    assessment_id: int,
    dimension_data: DimensionAssessmentCreate,
    db: Session = Depends(get_db)
):
    """
    Add or update a dimension assessment within a SOLAR assessment.
    """
    # Check assessment exists
    assessment = db.query(SOLARAssessment).filter(SOLARAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Check if dimension assessment already exists
    dim_assessment = db.query(DimensionAssessment).filter(
        DimensionAssessment.solar_assessment_id == assessment_id,
        DimensionAssessment.dimension == dimension_data.dimension.value
    ).first()
    
    # Calculate dimension score from sub-dimension scores
    sub_scores = dimension_data.sub_dimension_scores or {}
    if sub_scores:
        avg_score = sum(sub_scores.values()) / len(sub_scores)
    else:
        avg_score = 0.0
    grade = calculate_grade(avg_score)
    
    if dim_assessment:
        # Update existing
        dim_assessment.score = avg_score
        dim_assessment.grade = grade
        dim_assessment.sub_dimension_scores = sub_scores
        dim_assessment.vivid_image = dimension_data.vivid_image
        dim_assessment.current_state = dimension_data.current_state
        dim_assessment.desired_state = dimension_data.desired_state
        dim_assessment.gap_analysis = dimension_data.gap_analysis
        dim_assessment.focus_programs = dimension_data.focus_programs
        dim_assessment.observations = dimension_data.observations
        dim_assessment.action_items = dimension_data.action_items
        dim_assessment.updated_at = datetime.utcnow()
    else:
        # Create new
        dim_assessment = DimensionAssessment(
            solar_assessment_id=assessment_id,
            dimension=dimension_data.dimension.value,
            score=avg_score,
            grade=grade,
            sub_dimension_scores=sub_scores,
            vivid_image=dimension_data.vivid_image,
            current_state=dimension_data.current_state,
            desired_state=dimension_data.desired_state,
            gap_analysis=dimension_data.gap_analysis,
            focus_programs=dimension_data.focus_programs,
            observations=dimension_data.observations,
            action_items=dimension_data.action_items,
        )
        db.add(dim_assessment)
    
    # Update the parent assessment's dimension score
    _update_assessment_dimension_score(db, assessment, dimension_data.dimension.value, avg_score)
    
    db.commit()
    db.refresh(dim_assessment)
    
    return _format_dimension_response(dim_assessment)


@router.get("/assessments/{assessment_id}/dimensions/{dimension}", response_model=DimensionAssessmentResponse)
async def get_dimension_assessment(
    assessment_id: int,
    dimension: SOLARDimensionEnum,
    db: Session = Depends(get_db)
):
    """
    Get a specific dimension assessment.
    """
    dim_assessment = db.query(DimensionAssessment).filter(
        DimensionAssessment.solar_assessment_id == assessment_id,
        DimensionAssessment.dimension == dimension.value
    ).first()
    
    if not dim_assessment:
        raise HTTPException(status_code=404, detail="Dimension assessment not found")
    
    return _format_dimension_response(dim_assessment)


# ============================================================================
# KPI Endpoints
# ============================================================================

@router.get("/kpis", response_model=List[KPIDefinitionResponse])
async def list_kpi_definitions(
    dimension: Optional[SOLARDimensionEnum] = None,
    sub_dimension: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all KPI definitions, optionally filtered by dimension.
    """
    all_kpis = get_all_kpi_definitions()
    
    # Filter by dimension if specified
    if dimension:
        all_kpis = [k for k in all_kpis if k["dimension"] == dimension.value]
    
    # Filter by sub_dimension if specified
    if sub_dimension:
        all_kpis = [k for k in all_kpis if k["sub_dimension"] == sub_dimension]
    
    # Add mock IDs for response
    for i, kpi in enumerate(all_kpis, 1):
        kpi["id"] = i
        kpi["is_active"] = True
        kpi["dimension"] = SOLARDimensionEnum(kpi["dimension"])
    
    return all_kpis


@router.get("/kpis/summary")
async def get_kpi_summary():
    """
    Get a summary of KPIs grouped by dimension.
    """
    return get_dimension_summary()


@router.post("/assessments/{assessment_id}/kpi-scores", response_model=KPIScoreResponse)
async def record_kpi_score(
    assessment_id: int,
    score_data: KPIScoreCreate,
    db: Session = Depends(get_db)
):
    """
    Record a KPI score for an assessment.
    """
    # TODO: Implement KPI score recording
    # Calculate normalized score based on thresholds
    # Determine grade
    # Track trend from previous value
    
    return {
        "id": 1,
        "kpi_definition_id": score_data.kpi_definition_id,
        "actual_value": score_data.actual_value,
        "score": 75.0,  # Mock normalized score
        "grade": "B+",
        "previous_value": None,
        "change_percentage": None,
        "trend": None,
        "notes": score_data.notes,
        "recorded_at": datetime.utcnow(),
        "kpi_code": "S-TW-001",
        "kpi_name": "Worship Attendance Rate",
    }


@router.get("/assessments/{assessment_id}/kpi-scores", response_model=List[KPIScoreResponse])
async def list_kpi_scores(
    assessment_id: int,
    dimension: Optional[SOLARDimensionEnum] = None,
    db: Session = Depends(get_db)
):
    """
    List all KPI scores for an assessment.
    """
    return []


# ============================================================================
# Dashboard Endpoints
# ============================================================================

@router.get("/dashboard/{church_id}", response_model=SOLARDashboard)
async def get_solar_dashboard(
    church_id: int,
    db: Session = Depends(get_db)
):
    """
    Get SOLAR dashboard data for a church.
    Returns the latest assessment with visualization-ready data.
    """
    dim_summary = get_dimension_summary()
    
    # Mock data for demonstration
    dimensions = []
    for key, data in dim_summary.items():
        dimensions.append(DimensionScore(
            dimension=SOLARDimensionEnum(key),
            name=data["name"],
            score=72.5,  # Mock score
            grade="B",
            icon=data["icon"],
            color=data["color"],
            trend="improving",
            change=3.5
        ))
    
    return {
        "church_id": church_id,
        "church_name": "Sample Church",
        "assessment_period": "Q1 2026",
        "assessment_date": datetime.utcnow(),
        "overall_score": 72.5,
        "overall_grade": "B",
        "dimensions": dimensions,
        "trend_data": [],
        "top_strengths": ["Strong worship culture", "Active family groups"],
        "priority_improvements": ["Digital presence", "Investment strategy"],
        "benchmark_comparison": {
            "S": 70.0,
            "O": 68.0,
            "L": 75.0,
            "A": 65.0,
            "R": 72.0
        }
    }


@router.get("/dashboard/{church_id}/radar", response_model=SOLARRadarData)
async def get_radar_chart_data(
    church_id: int,
    assessment_id: Optional[int] = None,
    compare_to: Optional[int] = None,  # Previous assessment ID
    include_benchmark: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get data formatted for radar chart visualization.
    """
    return {
        "labels": ["Spiritual Vitality", "Organisational", "Love & Care", "Advancement", "Resources"],
        "current_scores": [78.0, 72.0, 80.0, 65.0, 70.0],
        "previous_scores": [75.0, 70.0, 78.0, 60.0, 68.0] if compare_to else None,
        "benchmark_scores": [70.0, 68.0, 75.0, 65.0, 72.0] if include_benchmark else None,
        "target_scores": [85.0, 80.0, 85.0, 80.0, 80.0]
    }


# ============================================================================
# Goals Endpoints
# ============================================================================

@router.post("/goals", response_model=SOLARGoalResponse)
async def create_goal(
    goal: SOLARGoalCreate,
    db: Session = Depends(get_db)
):
    """
    Create a SOLAR improvement goal.
    """
    db_goal = SOLARGoal(
        church_id=goal.church_id,
        title=goal.title,
        description=goal.description,
        dimension=goal.dimension.value,
        sub_dimension=goal.sub_dimension,
        target_score=goal.target_score,
        baseline_score=goal.baseline_score,
        current_score=goal.baseline_score,
        target_date=goal.target_date,
        status="active",
        progress_percentage=0.0,
        milestones=goal.milestones,
        action_plan=goal.action_plan,
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    return _format_goal_response(db_goal)


@router.get("/goals", response_model=List[SOLARGoalResponse])
async def list_goals(
    church_id: int,
    dimension: Optional[SOLARDimensionEnum] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all SOLAR goals for a church.
    """
    query = db.query(SOLARGoal).filter(SOLARGoal.church_id == church_id)
    
    if dimension:
        query = query.filter(SOLARGoal.dimension == dimension.value)
    if status:
        query = query.filter(SOLARGoal.status == status)
    
    goals = query.order_by(SOLARGoal.created_at.desc()).all()
    return [_format_goal_response(g) for g in goals]


@router.get("/goals/{goal_id}", response_model=SOLARGoalResponse)
async def get_goal(
    goal_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific SOLAR goal.
    """
    goal = db.query(SOLARGoal).filter(SOLARGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return _format_goal_response(goal)


@router.put("/goals/{goal_id}", response_model=SOLARGoalResponse)
async def update_goal(
    goal_id: int,
    update_data: SOLARGoalUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a SOLAR goal's progress.
    """
    goal = db.query(SOLARGoal).filter(SOLARGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Update fields if provided
    if update_data.current_score is not None:
        goal.current_score = update_data.current_score
        # Calculate progress
        if goal.target_score and goal.baseline_score:
            total_gap = goal.target_score - goal.baseline_score
            if total_gap > 0:
                progress = ((goal.current_score - goal.baseline_score) / total_gap) * 100
                goal.progress_percentage = min(100, max(0, progress))
    
    if update_data.status is not None:
        goal.status = update_data.status
        if update_data.status == "completed":
            goal.completed_date = datetime.utcnow()
    
    if update_data.milestones is not None:
        goal.milestones = update_data.milestones
    if update_data.action_plan is not None:
        goal.action_plan = update_data.action_plan
    
    goal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(goal)
    
    return _format_goal_response(goal)


@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a SOLAR goal.
    """
    goal = db.query(SOLARGoal).filter(SOLARGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}


# ============================================================================
# Program Assessment Endpoints
# ============================================================================

@router.post("/assessments/{assessment_id}/programs", response_model=ProgramAssessmentResponse)
async def create_program_assessment(
    assessment_id: int,
    program: ProgramAssessmentCreate,
    db: Session = Depends(get_db)
):
    """
    Add a program assessment to a SOLAR assessment.
    """
    # Calculate overall score
    overall_score = (
        program.spiritual_impact_score +
        program.participation_quality_score +
        program.transformation_evidence_score +
        program.team_preparedness_score
    ) / 4
    
    return {
        "id": 1,
        "program_name": program.program_name,
        "program_description": program.program_description,
        "dimension": program.dimension,
        "spiritual_impact_score": program.spiritual_impact_score,
        "participation_quality_score": program.participation_quality_score,
        "transformation_evidence_score": program.transformation_evidence_score,
        "team_preparedness_score": program.team_preparedness_score,
        "overall_score": overall_score,
        "excellence_definition": program.excellence_definition,
        "current_state": program.current_state,
        "barriers": program.barriers,
        "motivators": program.motivators,
        "enhancement_areas": program.enhancement_areas,
        "specific_actions": program.specific_actions,
        "success_measures": program.success_measures,
        "is_priority": program.is_priority,
        "priority_rank": program.priority_rank,
    }


@router.get("/assessments/{assessment_id}/programs", response_model=List[ProgramAssessmentResponse])
async def list_program_assessments(
    assessment_id: int,
    dimension: Optional[SOLARDimensionEnum] = None,
    priority_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    List all program assessments for a SOLAR assessment.
    """
    return []


# ============================================================================
# Reports Endpoints
# ============================================================================

@router.post("/reports/generate")
async def generate_solar_report(
    report_request: SOLARReportRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a comprehensive SOLAR report.
    Returns report data that can be rendered as PDF/Excel.
    """
    dim_summary = get_dimension_summary()
    
    return {
        "report_type": report_request.report_type,
        "generated_at": datetime.utcnow(),
        "church_id": report_request.church_id,
        "dimensions": dim_summary,
        "overall_score": 72.5,
        "overall_grade": "B",
        "dimension_scores": {
            "S": {"score": 78.0, "grade": "B+", "name": "Spiritual Vitality"},
            "O": {"score": 72.0, "grade": "B", "name": "Organisational Governance"},
            "L": {"score": 80.0, "grade": "B+", "name": "Love & Care"},
            "A": {"score": 65.0, "grade": "C+", "name": "Advancement"},
            "R": {"score": 70.0, "grade": "B-", "name": "Resources"},
        },
        "executive_summary": "The church demonstrates strong spiritual health with excellent worship experiences. Areas for growth include digital outreach and investment strategy development.",
        "strengths": [
            "Transformational worship services with high engagement",
            "Strong family group system with good participation",
            "Healthy organizational culture",
        ],
        "areas_for_improvement": [
            "Digital mission and media influence needs development",
            "Investment strategy for sustainable financing",
            "New believer integration could be enhanced",
        ],
        "recommendations": [
            {
                "priority": 1,
                "dimension": "A",
                "area": "Digital Mission",
                "action": "Develop comprehensive social media strategy",
                "timeline": "90 days",
            },
            {
                "priority": 2,
                "dimension": "R",
                "area": "Investment Strategy",
                "action": "Form investment committee and develop policy",
                "timeline": "60 days",
            },
        ],
    }


@router.get("/reports/trend/{church_id}")
async def get_trend_report(
    church_id: int,
    periods: int = Query(4, ge=1, le=12),
    db: Session = Depends(get_db)
):
    """
    Get trend data for SOLAR assessments over time.
    """
    return {
        "church_id": church_id,
        "periods": ["Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026"],
        "overall_scores": [68.0, 70.5, 71.0, 72.5],
        "dimension_trends": {
            "S": [72.0, 74.0, 76.0, 78.0],
            "O": [68.0, 70.0, 71.0, 72.0],
            "L": [75.0, 77.0, 78.0, 80.0],
            "A": [58.0, 60.0, 62.0, 65.0],
            "R": [65.0, 66.0, 68.0, 70.0],
        },
        "analysis": {
            "best_improvement": {"dimension": "S", "improvement": 6.0},
            "needs_attention": {"dimension": "A", "reason": "Slowest growth"},
            "overall_trend": "improving",
        }
    }


# ============================================================================
# Utility Functions
# ============================================================================

def calculate_grade(score: float) -> str:
    """Calculate letter grade from numeric score."""
    if score >= 97:
        return "A+"
    elif score >= 93:
        return "A"
    elif score >= 90:
        return "A-"
    elif score >= 87:
        return "B+"
    elif score >= 83:
        return "B"
    elif score >= 80:
        return "B-"
    elif score >= 77:
        return "C+"
    elif score >= 73:
        return "C"
    elif score >= 70:
        return "C-"
    elif score >= 67:
        return "D+"
    elif score >= 63:
        return "D"
    elif score >= 60:
        return "D-"
    else:
        return "F"


def calculate_overall_score(
    s_score: float,
    o_score: float,
    l_score: float,
    a_score: float,
    r_score: float,
    weights: dict = None
) -> float:
    """
    Calculate weighted overall SOLAR score.
    Default weights are equal (20% each).
    """
    if weights is None:
        weights = {"S": 0.2, "O": 0.2, "L": 0.2, "A": 0.2, "R": 0.2}
    
    return (
        s_score * weights["S"] +
        o_score * weights["O"] +
        l_score * weights["L"] +
        a_score * weights["A"] +
        r_score * weights["R"]
    )


# ============================================================================
# Helper Functions for Formatting Responses
# ============================================================================

def _format_assessment_response(assessment: SOLARAssessment) -> dict:
    """Format SOLARAssessment model to response dict."""
    return {
        "id": assessment.id,
        "church_id": assessment.church_id,
        "assessment_date": assessment.assessment_date,
        "assessment_period": assessment.assessment_period,
        "status": assessment.status.value if assessment.status else "draft",
        "overall_score": assessment.overall_score or 0.0,
        "overall_grade": assessment.overall_grade,
        "spiritual_vitality_score": assessment.spiritual_vitality_score or 0.0,
        "organisational_governance_score": assessment.organisational_governance_score or 0.0,
        "love_care_score": assessment.love_care_score or 0.0,
        "advancement_score": assessment.advancement_score or 0.0,
        "resources_score": assessment.resources_score or 0.0,
        "executive_summary": assessment.executive_summary,
        "strengths": assessment.strengths or [],
        "areas_for_improvement": assessment.areas_for_improvement or [],
        "recommendations": assessment.recommendations or [],
        "dimension_assessments": [
            _format_dimension_response(d) for d in (assessment.dimension_assessments or [])
        ],
        "kpi_scores": [
            _format_kpi_score_response(k) for k in (assessment.kpi_scores or [])
        ],
        "created_at": assessment.created_at,
        "updated_at": assessment.updated_at,
    }


def _format_assessment_summary(assessment: SOLARAssessment) -> dict:
    """Format SOLARAssessment model to summary dict."""
    return {
        "id": assessment.id,
        "church_id": assessment.church_id,
        "assessment_date": assessment.assessment_date,
        "assessment_period": assessment.assessment_period,
        "status": assessment.status.value if assessment.status else "draft",
        "overall_score": assessment.overall_score or 0.0,
        "overall_grade": assessment.overall_grade,
        "spiritual_vitality_score": assessment.spiritual_vitality_score or 0.0,
        "organisational_governance_score": assessment.organisational_governance_score or 0.0,
        "love_care_score": assessment.love_care_score or 0.0,
        "advancement_score": assessment.advancement_score or 0.0,
        "resources_score": assessment.resources_score or 0.0,
    }


def _format_dimension_response(dim: DimensionAssessment) -> dict:
    """Format DimensionAssessment model to response dict."""
    return {
        "id": dim.id,
        "dimension": dim.dimension.value if hasattr(dim.dimension, 'value') else dim.dimension,
        "score": dim.score or 0.0,
        "grade": dim.grade,
        "sub_dimension_scores": dim.sub_dimension_scores or {},
        "vivid_image": dim.vivid_image,
        "current_state": dim.current_state,
        "desired_state": dim.desired_state,
        "gap_analysis": dim.gap_analysis,
        "focus_programs": dim.focus_programs,
        "observations": dim.observations,
        "action_items": dim.action_items,
    }


def _format_kpi_score_response(kpi_score: KPIScore) -> dict:
    """Format KPIScore model to response dict."""
    return {
        "id": kpi_score.id,
        "kpi_definition_id": kpi_score.kpi_definition_id,
        "actual_value": kpi_score.actual_value,
        "score": kpi_score.score,
        "grade": kpi_score.grade,
        "previous_value": kpi_score.previous_value,
        "change_percentage": kpi_score.change_percentage,
        "trend": kpi_score.trend,
        "notes": kpi_score.notes,
        "recorded_at": kpi_score.recorded_at,
        "kpi_code": kpi_score.kpi_definition.code if kpi_score.kpi_definition else None,
        "kpi_name": kpi_score.kpi_definition.name if kpi_score.kpi_definition else None,
    }


def _format_goal_response(goal: SOLARGoal) -> dict:
    """Format SOLARGoal model to response dict."""
    return {
        "id": goal.id,
        "church_id": goal.church_id,
        "title": goal.title,
        "description": goal.description,
        "dimension": goal.dimension.value if hasattr(goal.dimension, 'value') else goal.dimension,
        "sub_dimension": goal.sub_dimension,
        "target_score": goal.target_score,
        "baseline_score": goal.baseline_score,
        "current_score": goal.current_score,
        "start_date": goal.start_date,
        "target_date": goal.target_date,
        "completed_date": goal.completed_date,
        "status": goal.status,
        "progress_percentage": goal.progress_percentage,
        "milestones": goal.milestones or [],
        "action_plan": goal.action_plan or [],
    }


def _update_assessment_dimension_score(db: Session, assessment: SOLARAssessment, dimension: str, score: float):
    """Update the assessment's dimension score and recalculate overall."""
    if dimension == "S":
        assessment.spiritual_vitality_score = score
    elif dimension == "O":
        assessment.organisational_governance_score = score
    elif dimension == "L":
        assessment.love_care_score = score
    elif dimension == "A":
        assessment.advancement_score = score
    elif dimension == "R":
        assessment.resources_score = score
    
    # Recalculate overall score
    assessment.overall_score = calculate_overall_score(
        assessment.spiritual_vitality_score or 0.0,
        assessment.organisational_governance_score or 0.0,
        assessment.love_care_score or 0.0,
        assessment.advancement_score or 0.0,
        assessment.resources_score or 0.0,
    )
    assessment.overall_grade = calculate_grade(assessment.overall_score)
    assessment.updated_at = datetime.utcnow()
