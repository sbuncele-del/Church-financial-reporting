"""
Vercel Serverless Function - Church SOLAR API
Using HTTP handler (Vercel doesn't support ASGI/FastAPI directly)
"""
from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add backend to path for database access
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Mock SOLAR data for demo
SOLAR_DASHBOARD = {
    "church_id": 1,
    "church_name": "Demo Church",
    "assessment_period": "Q1 2026",
    "overall_score": 72.5,
    "dimension_scores": {
        "S": {"score": 78, "name": "Spiritual Vitality", "color": "#8B5CF6"},
        "O": {"score": 65, "name": "Organisational Governance", "color": "#3B82F6"},
        "L": {"score": 82, "name": "Love & Care", "color": "#EC4899"},
        "A": {"score": 68, "name": "Advancement", "color": "#10B981"},
        "R": {"score": 70, "name": "Resources", "color": "#F59E0B"}
    },
    "strengths": ["Strong prayer culture", "Active small groups", "Excellent pastoral care"],
    "improvements": ["Financial systems need updating", "Youth ministry growth needed"],
    "trend": "improving"
}

SOLAR_KPI_SUMMARY = {
    "total_kpis": 50,
    "dimensions": {
        "S": {"name": "Spiritual Vitality", "kpi_count": 10, "avg_score": 78},
        "O": {"name": "Organisational Governance", "kpi_count": 10, "avg_score": 65},
        "L": {"name": "Love & Care", "kpi_count": 10, "avg_score": 82},
        "A": {"name": "Advancement", "kpi_count": 10, "avg_score": 68},
        "R": {"name": "Resources", "kpi_count": 10, "avg_score": 70}
    }
}

class handler(BaseHTTPRequestHandler):
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_GET(self):
        path = self.path.split('?')[0]  # Remove query params
        
        # Route handling
        if path in ['/api', '/api/']:
            self.send_json({"message": "Church SOLAR API", "version": "1.0.0"})
        
        elif path == '/api/health':
            self.send_json({"status": "healthy", "version": "1.0.0"})
        
        elif path.startswith('/api/v1/solar/dashboard'):
            self.send_json(SOLAR_DASHBOARD)
        
        elif path == '/api/v1/solar/kpis/summary':
            self.send_json(SOLAR_KPI_SUMMARY)
        
        elif path == '/api/v1/members':
            self.send_json({
                "members": [
                    {"id": 1, "first_name": "John", "last_name": "Doe", "email": "john@church.org", "member_status": "active"},
                    {"id": 2, "first_name": "Jane", "last_name": "Smith", "email": "jane@church.org", "member_status": "active"},
                ],
                "total": 2, "page": 1, "per_page": 20
            })
        
        elif path == '/api/v1/finance/summary':
            self.send_json({
                "total_income": 125000,
                "total_expenses": 98000,
                "net": 27000,
                "currency": "ZAR"
            })
        
        else:
            self.send_json({"error": "Not found", "path": path}, 404)
        
        return

    def do_POST(self):
        path = self.path.split('?')[0]
        
        if path == '/api/v1/auth/login':
            # Mock login - always succeed for demo
            self.send_json({
                "access_token": "demo_token_12345",
                "refresh_token": "demo_refresh_12345",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": "demo@church.org",
                    "first_name": "Demo",
                    "last_name": "User",
                    "role": "admin",
                    "church_id": 1,
                    "is_active": True,
                    "is_verified": True
                }
            })
        else:
            self.send_json({"message": "POST received", "path": path})
        return
