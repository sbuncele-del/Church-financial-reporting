"""
Vercel Serverless Function - FastAPI Backend
"""
import sys
import os

# Add backend to Python path BEFORE importing anything from app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Now import FastAPI app
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Create a new FastAPI app for Vercel
app = FastAPI(title="Church SOLAR API", version="1.0.0")

# CORS - allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include our routers
try:
    from app.api.routes import auth, users, members, churches, finance, reports, solar
    from app.core.database import init_db
    
    # Initialize database
    init_db()
    
    # Include all routers
    app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
    app.include_router(users.router, prefix="/api/v1", tags=["users"])
    app.include_router(churches.router, prefix="/api/v1", tags=["churches"])
    app.include_router(members.router, prefix="/api/v1", tags=["members"])
    app.include_router(finance.router, prefix="/api/v1", tags=["finance"])
    app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
    app.include_router(solar.router, prefix="/api/v1", tags=["solar"])
    
    BACKEND_LOADED = True
except Exception as e:
    BACKEND_LOADED = False
    BACKEND_ERROR = str(e)

@app.get("/api")
@app.get("/api/")
async def api_root():
    return {
        "message": "Church SOLAR API",
        "version": "1.0.0",
        "backend_loaded": BACKEND_LOADED,
        "docs": "/api/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "backend_loaded": BACKEND_LOADED,
        "error": BACKEND_ERROR if not BACKEND_LOADED else None
    }

# This is the handler Vercel looks for
handler = app
