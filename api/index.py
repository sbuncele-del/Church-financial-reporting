"""
Vercel Serverless Function - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(title="Church SOLAR API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track if backend loaded
BACKEND_LOADED = False
BACKEND_ERROR = None

# Try to import backend
try:
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
    
    from app.api.routes import solar
    from app.core.database import init_db
    
    init_db()
    app.include_router(solar.router, prefix="/api/v1", tags=["solar"])
    BACKEND_LOADED = True
except Exception as e:
    BACKEND_ERROR = str(e)

@app.get("/api")
@app.get("/api/")
async def api_root():
    return {
        "message": "Church SOLAR API",
        "version": "1.0.0",
        "backend_loaded": BACKEND_LOADED,
        "error": BACKEND_ERROR
    }

@app.get("/api/health")
async def health():
    return {"status": "ok", "backend": BACKEND_LOADED, "error": BACKEND_ERROR}

# Vercel handler
handler = app
