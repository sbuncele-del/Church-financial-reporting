"""
Vercel Serverless Function - Church SOLAR API
Simple HTTP handler first to verify Vercel works
"""
from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

# SOLAR Data
SOLAR_DIMENSIONS = [
    {"dimension": "S", "name": "Spiritual Vitality", "score": 85.5, "grade": "B+", "color": "#8B5CF6", "icon": "🙏"},
    {"dimension": "O", "name": "Organisational Governance", "score": 78.0, "grade": "B", "color": "#3B82F6", "icon": "⚙️"},
    {"dimension": "L", "name": "Love & Care", "score": 92.0, "grade": "A-", "color": "#EC4899", "icon": "❤️"},
    {"dimension": "A", "name": "Advancement", "score": 70.5, "grade": "B-", "color": "#10B981", "icon": "🚀"},
    {"dimension": "R", "name": "Resources", "score": 82.0, "grade": "B", "color": "#F59E0B", "icon": "💰"},
]

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
        path = self.path.split('?')[0]
        
        if path in ['/', '/api', '/api/']:
            self.send_json({"message": "Church SOLAR API", "version": "1.0.0", "status": "healthy"})
        
        elif path.startswith('/api/v1/solar/dashboard'):
            overall = sum(d["score"] for d in SOLAR_DIMENSIONS) / len(SOLAR_DIMENSIONS)
            self.send_json({
                "church_id": 1,
                "church_name": "Grace Baptist Church",
                "assessment_period": "Q1 2026",
                "overall_score": round(overall, 1),
                "overall_grade": "B+",
                "dimensions": SOLAR_DIMENSIONS,
                "strengths": ["Strong spiritual vitality", "Excellent member care"],
                "improvements": ["Digital outreach", "Youth ministry"],
                "trend": "improving"
            })
        
        elif path == '/api/v1/solar/kpis/summary':
            self.send_json({
                "total_kpis": 50,
                "dimensions": {
                    "S": {"name": "Spiritual Vitality", "kpi_count": 10, "avg_score": 85.5},
                    "O": {"name": "Organisational Governance", "kpi_count": 10, "avg_score": 78.0},
                    "L": {"name": "Love & Care", "kpi_count": 10, "avg_score": 92.0},
                    "A": {"name": "Advancement", "kpi_count": 10, "avg_score": 70.5},
                    "R": {"name": "Resources", "kpi_count": 10, "avg_score": 82.0}
                }
            })
        
        elif path == '/api/v1/solar/assessments':
            self.send_json([{
                "id": 1,
                "church_id": 1,
                "assessment_period": "Q1 2026",
                "status": "completed",
                "overall_score": 81.6,
                "overall_grade": "B+",
                "spiritual_vitality_score": 85.5,
                "organisational_governance_score": 78.0,
                "love_care_score": 92.0,
                "advancement_score": 70.5,
                "resources_score": 82.0,
            }])
        
        elif path == '/api/v1/members':
            self.send_json({
                "members": [
                    {"id": 1, "first_name": "John", "last_name": "Doe", "full_name": "John Doe", "email": "john@church.org", "member_status": "active"},
                    {"id": 2, "first_name": "Mary", "last_name": "Smith", "full_name": "Mary Smith", "email": "mary@church.org", "member_status": "active"},
                ],
                "total": 2
            })
        
        elif path == '/api/v1/finance/summary':
            self.send_json({
                "total_income": 125000.00,
                "total_expenses": 98000.00,
                "net": 27000.00,
                "currency": "ZAR"
            })
        
        else:
            self.send_json({"error": "Not found", "path": path}, 404)
    
    def do_POST(self):
        path = self.path.split('?')[0]
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode() if content_length else '{}'
        
        try:
            data = json.loads(body)
        except:
            data = {}
        
        if path == '/api/v1/auth/login':
            self.send_json({
                "access_token": f"jwt_token_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                "refresh_token": "refresh_token",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": data.get("email", "user@church.org"),
                    "first_name": "Demo",
                    "last_name": "User",
                    "role": "admin",
                    "church_id": 1,
                    "is_active": True
                }
            })
        
        elif path == '/api/v1/auth/register':
            self.send_json({
                "id": 1,
                "email": data.get("email", "new@church.org"),
                "first_name": data.get("first_name", "New"),
                "last_name": data.get("last_name", "User"),
                "role": "member",
                "is_active": True
            })
        
        else:
            self.send_json({"message": "Endpoint not implemented", "path": path}, 404)
