"""
Vercel Serverless Function - Church SOLAR API
Using Mangum to adapt FastAPI for Vercel's serverless environment
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Set environment variables for database
# These will be overridden by Vercel environment variables in production
if not os.environ.get('DATABASE_URL'):
    os.environ['DATABASE_URL'] = 'sqlite:///./church_management.db'

from mangum import Mangum
from app.main import app

# Create the handler for Vercel
handler = Mangum(app, lifespan="off")
