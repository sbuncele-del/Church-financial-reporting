"""
Vercel Serverless Function Entry Point
"""
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Simple health check
        if self.path == '/api/health' or self.path == '/api':
            response = {"status": "healthy", "message": "Church SOLAR API"}
        elif self.path.startswith('/api/v1/solar/kpis'):
            response = {"kpis": [], "message": "SOLAR KPIs endpoint"}
        else:
            response = {"path": self.path, "message": "API endpoint"}
        
        self.wfile.write(json.dumps(response).encode())
        return
