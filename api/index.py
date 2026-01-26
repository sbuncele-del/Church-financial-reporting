"""
Vercel Serverless Function - Church SOLAR API
Standalone FastAPI app with Mangum adapter
"""
import os
import sys
from datetime import datetime
from typing import List, Optional, Dict, Any

# FastAPI and dependencies
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mangum import Mangum

# Create FastAPI app
app = FastAPI(
    title="Church SOLAR API",
    description="Church Health Assessment using SOLAR Framework",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Pydantic Models
# ============================================================================

class DimensionScore(BaseModel):
    dimension: str
    name: str
    score: float
    grade: Optional[str] = None
    color: str
    icon: str

class SOLARDashboard(BaseModel):
    church_id: int
    church_name: str
    assessment_period: str
    overall_score: float
    overall_grade: str
    dimensions: List[DimensionScore]
    strengths: List[str]
    improvements: List[str]
    trend: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: Dict[str, Any]

# ============================================================================
# Mock Data
# ============================================================================

SOLAR_DIMENSIONS = [
    DimensionScore(dimension="S", name="Spiritual Vitality", score=85.5, grade="B+", color="#8B5CF6", icon="🙏"),
    DimensionScore(dimension="O", name="Organisational Governance", score=78.0, grade="B", color="#3B82F6", icon="⚙️"),
    DimensionScore(dimension="L", name="Love & Care", score=92.0, grade="A-", color="#EC4899", icon="❤️"),
    DimensionScore(dimension="A", name="Advancement", score=70.5, grade="B-", color="#10B981", icon="🚀"),
    DimensionScore(dimension="R", name="Resources", score=82.0, grade="B", color="#F59E0B", icon="💰"),
]

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    return {"message": "Church SOLAR API", "version": "1.0.0", "status": "healthy"}

@app.get("/api")
async def api_root():
    return {"message": "Church SOLAR API", "version": "1.0.0"}

@app.get("/api/v1/solar/dashboard/{church_id}")
async def get_solar_dashboard(church_id: int):
    overall = sum(d.score for d in SOLAR_DIMENSIONS) / len(SOLAR_DIMENSIONS)
    return {
        "church_id": church_id,
        "church_name": "Grace Baptist Church",
        "assessment_period": "Q1 2026",
        "assessment_date": datetime.utcnow().isoformat(),
        "overall_score": round(overall, 1),
        "overall_grade": "B+",
        "dimensions": [d.dict() for d in SOLAR_DIMENSIONS],
        "strengths": [
            "Strong spiritual vitality and worship culture",
            "Excellent member care and pastoral support",
            "Good financial stewardship"
        ],
        "improvements": [
            "Digital outreach needs development",
            "Youth ministry growth opportunities"
        ],
        "trend": "improving"
    }

@app.get("/api/v1/solar/kpis/summary")
async def get_kpi_summary():
    return {
        "total_kpis": 50,
        "dimensions": {
            "S": {"name": "Spiritual Vitality", "kpi_count": 10, "avg_score": 85.5},
            "O": {"name": "Organisational Governance", "kpi_count": 10, "avg_score": 78.0},
            "L": {"name": "Love & Care", "kpi_count": 10, "avg_score": 92.0},
            "A": {"name": "Advancement", "kpi_count": 10, "avg_score": 70.5},
            "R": {"name": "Resources", "kpi_count": 10, "avg_score": 82.0}
        }
    }

@app.get("/api/v1/solar/assessments")
async def list_assessments(church_id: int):
    return [
        {
            "id": 1,
            "church_id": church_id,
            "assessment_period": "Q1 2026",
            "assessment_date": "2026-01-26T12:00:00",
            "status": "completed",
            "overall_score": 81.6,
            "overall_grade": "B+",
            "spiritual_vitality_score": 85.5,
            "organisational_governance_score": 78.0,
            "love_care_score": 92.0,
            "advancement_score": 70.5,
            "resources_score": 82.0,
        }
    ]

@app.get("/api/v1/members")
async def list_members():
    return {
        "members": [
            {"id": 1, "first_name": "John", "last_name": "Doe", "email": "john@church.org", "member_status": "active", "full_name": "John Doe"},
            {"id": 2, "first_name": "Mary", "last_name": "Smith", "email": "mary@church.org", "member_status": "active", "full_name": "Mary Smith"},
            {"id": 3, "first_name": "Peter", "last_name": "Johnson", "email": "peter@church.org", "member_status": "active", "full_name": "Peter Johnson"},
        ],
        "total": 3,
        "page": 1,
        "per_page": 20
    }

@app.get("/api/v1/finance/summary")
async def finance_summary():
    return {
        "total_income": 125000.00,
        "total_expenses": 98000.00,
        "net": 27000.00,
        "currency": "ZAR",
        "period": "Q1 2026"
    }

@app.post("/api/v1/auth/login")
async def login(request: LoginRequest):
    # Mock authentication - accept any credentials for demo
    return {
        "access_token": "demo_jwt_token_" + datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        "refresh_token": "demo_refresh_token",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": request.email,
            "first_name": "Demo",
            "last_name": "User",
            "role": "admin",
            "church_id": 1,
            "is_active": True
        }
    }

@app.post("/api/v1/auth/register")
async def register():
    return {
        "id": 1,
        "email": "new@church.org",
        "first_name": "New",
        "last_name": "User",
        "role": "member",
        "is_active": True
    }

# Vercel handler
handler = Mangum(app, lifespan="off")
