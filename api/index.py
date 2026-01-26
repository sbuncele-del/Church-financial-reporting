"""
Vercel Serverless Function - Church SOLAR API
Using Mangum to adapt FastAPI for Vercel's serverless environment
"""
import os
import sys
from pathlib import Path

# Add backend to Python path - handle both local and Vercel environments
api_dir = Path(__file__).parent
project_root = api_dir.parent
backend_dir = project_root / "backend"

# Add both project root and backend to path
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(backend_dir))

# Set environment variables for database
if not os.environ.get('DATABASE_URL'):
    os.environ['DATABASE_URL'] = 'sqlite:///./church_management.db'

# Now import FastAPI app
try:
    from mangum import Mangum
    from app.main import app
    
    # Create the handler for Vercel
    handler = Mangum(app, lifespan="off")
except ImportError as e:
    # Fallback: Simple handler for debugging
    from http.server import BaseHTTPRequestHandler
    import json
    
    class handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_info = {
                "error": "Import failed",
                "message": str(e),
                "python_path": sys.path[:5],
                "backend_exists": backend_dir.exists(),
                "app_exists": (backend_dir / "app").exists(),
            }
            self.wfile.write(json.dumps(error_info).encode())
