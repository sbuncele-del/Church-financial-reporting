"""
Vercel Serverless Function - Minimal Test
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Church SOLAR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
async def root():
    return {"message": "API is working!"}

@app.get("/api/health")
async def health():
    return {"status": "ok"}

handler = app
