"""
SOLAR Framework Models for Church Health Assessment

SOLAR stands for:
- S: Spiritual Vitality
- O: Organisational Governance  
- L: Love & Care
- A: Advancement
- R: Resources

Based on the "Building Anchored on the Blessing" Mental Models framework.
Each dimension has sub-dimensions with measurable KPIs.
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class SOLARDimension(str, enum.Enum):
    """The 5 SOLAR dimensions of church health"""
    SPIRITUAL_VITALITY = "S"
    ORGANISATIONAL_GOVERNANCE = "O"
    LOVE_AND_CARE = "L"
    ADVANCEMENT = "A"
    RESOURCES = "R"


class AssessmentStatus(str, enum.Enum):
    """Status of a SOLAR assessment"""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REVIEWED = "reviewed"


# ============================================================================
# SPIRITUAL VITALITY (S) - Sub-dimensions
# ============================================================================

class SpiritualVitalityArea(str, enum.Enum):
    """Sub-dimensions of Spiritual Vitality"""
    TRANSFORMATIONAL_WORSHIP = "transformational_worship"
    PRAYER_CULTURE = "prayer_culture"
    WORD_AND_TEACHING = "word_and_teaching"
    SPIRITUAL_DISCIPLINES = "spiritual_disciplines"
    ALTAR_MINISTRY = "altar_ministry"
    PROPHETIC_CULTURE = "prophetic_culture"
    REVIVAL_AND_RENEWAL = "revival_and_renewal"


# ============================================================================
# ORGANISATIONAL GOVERNANCE (O) - Sub-dimensions
# ============================================================================

class OrganisationalArea(str, enum.Enum):
    """Sub-dimensions of Organisational Governance"""
    ORGANISATIONAL_CULTURE = "organisational_culture"
    LEADERSHIP_DEVELOPMENT = "leadership_development"
    GOVERNANCE_STRUCTURES = "governance_structures"
    POLICIES_AND_COMPLIANCE = "policies_and_compliance"
    STRATEGIC_PLANNING = "strategic_planning"
    ACCOUNTABILITY_SYSTEMS = "accountability_systems"
    SUCCESSION_PLANNING = "succession_planning"


# ============================================================================
# LOVE & CARE (L) - Sub-dimensions
# ============================================================================

class LoveCareArea(str, enum.Enum):
    """Sub-dimensions of Love & Care"""
    FAMILY_GROUPS = "family_groups"
    MEMBER_CARE = "member_care"
    DISCIPLESHIP = "discipleship"
    NEW_BELIEVERS_INTEGRATION = "new_believers_integration"
    PASTORAL_CARE = "pastoral_care"
    CRISIS_SUPPORT = "crisis_support"
    FELLOWSHIP_COMMUNITY = "fellowship_community"
    CHILDREN_MINISTRY = "children_ministry"
    YOUTH_MINISTRY = "youth_ministry"
    WOMEN_MINISTRY = "women_ministry"
    MEN_MINISTRY = "men_ministry"
    MARRIAGE_MINISTRY = "marriage_ministry"


# ============================================================================
# ADVANCEMENT (A) - Sub-dimensions
# ============================================================================

class AdvancementArea(str, enum.Enum):
    """Sub-dimensions of Advancement"""
    OUTREACH_ENGAGEMENTS = "outreach_engagements"
    LOCAL_COMMUNITY_IMPACT = "local_community_impact"
    TRANSFORMATIONAL_PRESENCE = "transformational_presence"
    GLOBAL_MISSION = "global_mission"
    MARKETPLACE_OUTREACH = "marketplace_outreach"
    DIGITAL_MISSION = "digital_mission"
    MEDIA_INFLUENCE = "media_influence"
    COMPASSION_HUMANITARIAN = "compassion_humanitarian"
    EDUCATION_YOUTH_EMPOWERMENT = "education_youth_empowerment"
    CHURCH_COMMUNITY_PARTNERSHIPS = "church_community_partnerships"


# ============================================================================
# RESOURCES (R) - Sub-dimensions
# ============================================================================

class ResourcesArea(str, enum.Enum):
    """Sub-dimensions of Resources"""
    FINANCIAL_HEALTH = "financial_health"
    STEWARDSHIP = "stewardship"
    HUMAN_RESOURCES = "human_resources"
    RELATIONAL_CAPITAL = "relational_capital"
    INFRASTRUCTURE = "infrastructure"
    INCOME_GENERATION = "income_generation"
    RESOURCE_ALLOCATION = "resource_allocation"
    VOLUNTEER_SYSTEMS = "volunteer_systems"
    OPERATIONAL_EFFICIENCY = "operational_efficiency"
    INVESTMENT_STRATEGY = "investment_strategy"
    DONOR_DEVELOPMENT = "donor_development"


# ============================================================================
# DATABASE MODELS
# ============================================================================

class SOLARAssessment(Base):
    """
    A complete SOLAR assessment for a church at a point in time.
    This captures the overall church health across all 5 dimensions.
    """
    __tablename__ = "solar_assessments"

    id = Column(Integer, primary_key=True, index=True)
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    
    # Assessment metadata
    assessment_date = Column(DateTime, default=datetime.utcnow)
    assessment_period = Column(String(50))  # e.g., "Q1 2026", "Annual 2025"
    status = Column(Enum(AssessmentStatus), default=AssessmentStatus.DRAFT)
    
    # Overall scores (calculated from dimension scores)
    overall_score = Column(Float, default=0.0)  # 0-100 scale
    overall_grade = Column(String(2))  # A+, A, B+, B, C+, C, D, F
    
    # Individual dimension scores (0-100 scale)
    spiritual_vitality_score = Column(Float, default=0.0)
    organisational_governance_score = Column(Float, default=0.0)
    love_care_score = Column(Float, default=0.0)
    advancement_score = Column(Float, default=0.0)
    resources_score = Column(Float, default=0.0)
    
    # Assessment notes and recommendations
    executive_summary = Column(Text)
    strengths = Column(JSON)  # List of identified strengths
    areas_for_improvement = Column(JSON)  # List of areas needing attention
    recommendations = Column(JSON)  # List of actionable recommendations
    
    # Assessor information
    assessed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    church = relationship("Church", back_populates="solar_assessments")
    dimension_assessments = relationship("DimensionAssessment", back_populates="solar_assessment")
    kpi_scores = relationship("KPIScore", back_populates="solar_assessment")


class DimensionAssessment(Base):
    """
    Detailed assessment for a single SOLAR dimension.
    Contains sub-dimension scores and detailed metrics.
    """
    __tablename__ = "dimension_assessments"

    id = Column(Integer, primary_key=True, index=True)
    solar_assessment_id = Column(Integer, ForeignKey("solar_assessments.id"), nullable=False)
    
    dimension = Column(Enum(SOLARDimension), nullable=False)
    
    # Dimension score (0-100)
    score = Column(Float, default=0.0)
    grade = Column(String(2))
    
    # Sub-dimension scores stored as JSON
    # e.g., {"transformational_worship": 85, "prayer_culture": 72, ...}
    sub_dimension_scores = Column(JSON)
    
    # Qualitative assessments
    vivid_image = Column(Text)  # What does operational excellence look like?
    current_state = Column(Text)  # Where are we now?
    desired_state = Column(Text)  # Where do we want to be?
    gap_analysis = Column(Text)  # What's the gap?
    
    # Selected focus areas (top 3 programs as per the framework)
    focus_programs = Column(JSON)  # List of top 3 priority programs
    
    # Evidence and observations
    evidence = Column(JSON)  # Supporting evidence for the assessment
    observations = Column(Text)
    
    # Action items
    action_items = Column(JSON)  # List of specific actions to take
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    solar_assessment = relationship("SOLARAssessment", back_populates="dimension_assessments")


class KPIDefinition(Base):
    """
    Definition of a Key Performance Indicator for church health.
    These are the standard KPIs used across all assessments.
    """
    __tablename__ = "kpi_definitions"

    id = Column(Integer, primary_key=True, index=True)
    
    # KPI identification
    code = Column(String(20), unique=True, nullable=False)  # e.g., "S-TW-001"
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Categorization
    dimension = Column(Enum(SOLARDimension), nullable=False)
    sub_dimension = Column(String(50))  # The specific sub-dimension
    
    # Measurement details
    measurement_type = Column(String(50))  # percentage, count, ratio, scale, boolean
    target_value = Column(Float)  # The target/benchmark value
    target_unit = Column(String(50))  # %, people, ratio, etc.
    
    # Scoring thresholds
    excellent_threshold = Column(Float)  # Score >= this = Excellent
    good_threshold = Column(Float)  # Score >= this = Good
    fair_threshold = Column(Float)  # Score >= this = Fair
    # Below fair_threshold = Poor
    
    # Weight for calculating dimension score
    weight = Column(Float, default=1.0)
    
    # Data collection guidance
    data_source = Column(String(200))  # Where to get this data
    collection_frequency = Column(String(50))  # weekly, monthly, quarterly, annually
    collection_method = Column(Text)  # How to collect/calculate this KPI
    
    # Status
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    scores = relationship("KPIScore", back_populates="kpi_definition")


class KPIScore(Base):
    """
    Actual KPI score recorded during an assessment.
    Links a specific assessment to a KPI with the recorded value.
    """
    __tablename__ = "kpi_scores"

    id = Column(Integer, primary_key=True, index=True)
    
    solar_assessment_id = Column(Integer, ForeignKey("solar_assessments.id"), nullable=False)
    kpi_definition_id = Column(Integer, ForeignKey("kpi_definitions.id"), nullable=False)
    
    # Recorded values
    actual_value = Column(Float)  # The actual measured value
    score = Column(Float)  # Normalized score (0-100)
    grade = Column(String(2))  # A+, A, B+, B, C+, C, D, F
    
    # Comparison with previous period
    previous_value = Column(Float, nullable=True)
    change_percentage = Column(Float, nullable=True)
    trend = Column(String(20))  # improving, stable, declining
    
    # Notes and evidence
    notes = Column(Text)
    evidence = Column(JSON)  # Supporting documentation/evidence
    
    recorded_at = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    solar_assessment = relationship("SOLARAssessment", back_populates="kpi_scores")
    kpi_definition = relationship("KPIDefinition", back_populates="scores")


class SOLARGoal(Base):
    """
    Goals and targets set for improving SOLAR dimensions.
    Tracks progress toward church health objectives.
    """
    __tablename__ = "solar_goals"

    id = Column(Integer, primary_key=True, index=True)
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    
    # Goal details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Categorization
    dimension = Column(Enum(SOLARDimension), nullable=False)
    sub_dimension = Column(String(50), nullable=True)
    
    # Target metrics
    target_score = Column(Float)  # Target SOLAR score
    baseline_score = Column(Float)  # Score when goal was set
    current_score = Column(Float)  # Latest score
    
    # Timeline
    start_date = Column(DateTime, default=datetime.utcnow)
    target_date = Column(DateTime)
    completed_date = Column(DateTime, nullable=True)
    
    # Status tracking
    status = Column(String(50), default="active")  # active, completed, on_hold, cancelled
    progress_percentage = Column(Float, default=0.0)
    
    # Milestones stored as JSON
    milestones = Column(JSON)  # List of milestones with dates and status
    
    # Action plan
    action_plan = Column(JSON)  # List of action items
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    church = relationship("Church", back_populates="solar_goals")


class SOLARBenchmark(Base):
    """
    Benchmarks for comparing church performance.
    Can be industry standards, denominational averages, or peer comparisons.
    """
    __tablename__ = "solar_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Benchmark type
    benchmark_type = Column(String(50))  # industry, denomination, peer_group, custom
    
    # Dimension scores
    spiritual_vitality_benchmark = Column(Float)
    organisational_governance_benchmark = Column(Float)
    love_care_benchmark = Column(Float)
    advancement_benchmark = Column(Float)
    resources_benchmark = Column(Float)
    
    # Overall benchmark
    overall_benchmark = Column(Float)
    
    # Applicability
    church_size_min = Column(Integer, nullable=True)  # Minimum church size
    church_size_max = Column(Integer, nullable=True)  # Maximum church size
    denomination = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    
    # Validity period
    valid_from = Column(DateTime)
    valid_until = Column(DateTime, nullable=True)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProgramAssessment(Base):
    """
    Assessment of specific church programs within each dimension.
    Based on the workshop framework for evaluating operational excellence.
    """
    __tablename__ = "program_assessments"

    id = Column(Integer, primary_key=True, index=True)
    
    solar_assessment_id = Column(Integer, ForeignKey("solar_assessments.id"), nullable=False)
    dimension = Column(Enum(SOLARDimension), nullable=False)
    
    # Program details
    program_name = Column(String(200), nullable=False)
    program_description = Column(Text)
    
    # Assessment scores
    spiritual_impact_score = Column(Float)  # 0-100
    participation_quality_score = Column(Float)  # 0-100
    transformation_evidence_score = Column(Float)  # 0-100
    team_preparedness_score = Column(Float)  # 0-100
    overall_score = Column(Float)  # Calculated average
    
    # Qualitative assessment
    excellence_definition = Column(Text)  # What does excellence look like?
    current_state = Column(Text)
    barriers = Column(JSON)  # List of barriers to excellence
    motivators = Column(JSON)  # What motivates participation
    
    # Action plan
    enhancement_areas = Column(JSON)  # Areas needing enhancement
    specific_actions = Column(JSON)  # Specific actions to take
    success_measures = Column(JSON)  # How to measure success
    
    # Priority ranking
    is_priority = Column(Boolean, default=False)  # Is this a top 3 priority?
    priority_rank = Column(Integer, nullable=True)  # 1, 2, or 3
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
