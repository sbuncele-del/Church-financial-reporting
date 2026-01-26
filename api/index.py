"""
Vercel Serverless Function - Church SOLAR API with Neon PostgreSQL
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import hashlib
import secrets
from datetime import datetime
from urllib.parse import parse_qs, urlparse

# PostgreSQL connection
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', os.environ.get('POSTGRES_URL', ''))

def get_db():
    """Get database connection"""
    if not DATABASE_URL:
        return None
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    """Initialize database tables"""
    conn = get_db()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                role VARCHAR(50) DEFAULT 'member',
                church_id INTEGER,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Churches table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS churches (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(100),
                country VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # SOLAR Assessments table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS solar_assessments (
                id SERIAL PRIMARY KEY,
                church_id INTEGER REFERENCES churches(id),
                assessment_period VARCHAR(50),
                status VARCHAR(50) DEFAULT 'draft',
                spiritual_vitality_score DECIMAL(5,2) DEFAULT 0,
                organisational_governance_score DECIMAL(5,2) DEFAULT 0,
                love_care_score DECIMAL(5,2) DEFAULT 0,
                advancement_score DECIMAL(5,2) DEFAULT 0,
                resources_score DECIMAL(5,2) DEFAULT 0,
                overall_score DECIMAL(5,2) DEFAULT 0,
                overall_grade VARCHAR(5),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Members table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS members (
                id SERIAL PRIMARY KEY,
                church_id INTEGER REFERENCES churches(id),
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                member_status VARCHAR(50) DEFAULT 'active',
                join_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert default church if none exists
        cur.execute("SELECT COUNT(*) as count FROM churches")
        if cur.fetchone()['count'] == 0:
            cur.execute("""
                INSERT INTO churches (name, city, country) 
                VALUES ('Grace Baptist Church', 'Johannesburg', 'South Africa')
            """)
        
        # Insert default admin user if none exists
        cur.execute("SELECT COUNT(*) as count FROM users")
        if cur.fetchone()['count'] == 0:
            password_hash = hashlib.sha256('admin123'.encode()).hexdigest()
            cur.execute("""
                INSERT INTO users (email, password_hash, first_name, last_name, role, church_id) 
                VALUES ('admin@church.org', %s, 'Admin', 'User', 'admin', 1)
            """, (password_hash,))
        
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"DB Init Error: {e}")
        conn.rollback()
        conn.close()
        return False

def calculate_grade(score):
    """Calculate letter grade from score"""
    if score >= 90: return 'A'
    if score >= 85: return 'A-'
    if score >= 80: return 'B+'
    if score >= 75: return 'B'
    if score >= 70: return 'B-'
    if score >= 65: return 'C+'
    if score >= 60: return 'C'
    if score >= 55: return 'C-'
    if score >= 50: return 'D'
    return 'F'

class handler(BaseHTTPRequestHandler):
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def get_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length:
            return json.loads(self.rfile.read(content_length).decode())
        return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        query = parse_qs(parsed.query)
        
        # Initialize DB on first request
        init_db()
        
        conn = get_db()
        if not conn:
            self.send_json({"error": "Database not configured"}, 500)
            return
        
        try:
            cur = conn.cursor()
            
            # Health/Root
            if path in ['', '/api', '/api/v1']:
                self.send_json({"message": "Church SOLAR API", "version": "1.0.0", "status": "healthy", "database": "connected"})
            
            # SOLAR Dashboard
            elif path.startswith('/api/v1/solar/dashboard'):
                church_id = path.split('/')[-1] if path.split('/')[-1].isdigit() else '1'
                
                cur.execute("SELECT * FROM churches WHERE id = %s", (church_id,))
                church = cur.fetchone()
                
                cur.execute("""
                    SELECT * FROM solar_assessments 
                    WHERE church_id = %s 
                    ORDER BY created_at DESC LIMIT 1
                """, (church_id,))
                assessment = cur.fetchone()
                
                if assessment:
                    dimensions = [
                        {"dimension": "S", "name": "Spiritual Vitality", "score": float(assessment['spiritual_vitality_score'] or 0), "color": "#8B5CF6", "icon": "🙏"},
                        {"dimension": "O", "name": "Organisational Governance", "score": float(assessment['organisational_governance_score'] or 0), "color": "#3B82F6", "icon": "⚙️"},
                        {"dimension": "L", "name": "Love & Care", "score": float(assessment['love_care_score'] or 0), "color": "#EC4899", "icon": "❤️"},
                        {"dimension": "A", "name": "Advancement", "score": float(assessment['advancement_score'] or 0), "color": "#10B981", "icon": "🚀"},
                        {"dimension": "R", "name": "Resources", "score": float(assessment['resources_score'] or 0), "color": "#F59E0B", "icon": "💰"},
                    ]
                    for d in dimensions:
                        d['grade'] = calculate_grade(d['score'])
                    
                    self.send_json({
                        "church_id": int(church_id),
                        "church_name": church['name'] if church else "Unknown Church",
                        "assessment_period": assessment['assessment_period'],
                        "overall_score": float(assessment['overall_score'] or 0),
                        "overall_grade": assessment['overall_grade'] or calculate_grade(float(assessment['overall_score'] or 0)),
                        "dimensions": dimensions,
                        "strengths": ["Good spiritual foundation"],
                        "improvements": ["Continue developing all areas"],
                        "trend": "stable"
                    })
                else:
                    # Return empty assessment structure
                    self.send_json({
                        "church_id": int(church_id),
                        "church_name": church['name'] if church else "Unknown Church",
                        "assessment_period": "Q1 2026",
                        "overall_score": 0,
                        "overall_grade": "N/A",
                        "dimensions": [
                            {"dimension": "S", "name": "Spiritual Vitality", "score": 0, "grade": "N/A", "color": "#8B5CF6", "icon": "🙏"},
                            {"dimension": "O", "name": "Organisational Governance", "score": 0, "grade": "N/A", "color": "#3B82F6", "icon": "⚙️"},
                            {"dimension": "L", "name": "Love & Care", "score": 0, "grade": "N/A", "color": "#EC4899", "icon": "❤️"},
                            {"dimension": "A", "name": "Advancement", "score": 0, "grade": "N/A", "color": "#10B981", "icon": "🚀"},
                            {"dimension": "R", "name": "Resources", "score": 0, "grade": "N/A", "color": "#F59E0B", "icon": "💰"},
                        ],
                        "strengths": [],
                        "improvements": ["Create your first assessment"],
                        "trend": "new"
                    })
            
            # List Assessments
            elif path == '/api/v1/solar/assessments':
                church_id = query.get('church_id', ['1'])[0]
                cur.execute("""
                    SELECT * FROM solar_assessments 
                    WHERE church_id = %s 
                    ORDER BY created_at DESC
                """, (church_id,))
                assessments = cur.fetchall()
                self.send_json([dict(a) for a in assessments])
            
            # List Members
            elif path == '/api/v1/members':
                church_id = query.get('church_id', ['1'])[0]
                cur.execute("""
                    SELECT id, first_name, last_name, email, phone, member_status,
                           first_name || ' ' || last_name as full_name
                    FROM members 
                    WHERE church_id = %s
                    ORDER BY last_name, first_name
                """, (church_id,))
                members = cur.fetchall()
                self.send_json({"members": [dict(m) for m in members], "total": len(members)})
            
            # List Churches
            elif path == '/api/v1/churches':
                cur.execute("SELECT * FROM churches ORDER BY name")
                churches = cur.fetchall()
                self.send_json([dict(c) for c in churches])
            
            # Finance Summary
            elif path == '/api/v1/finance/summary':
                self.send_json({
                    "total_income": 12500.00,
                    "total_expenses": 8500.00,
                    "net_balance": 4000.00,
                    "income_by_category": {
                        "Tithes": 8000.00,
                        "Offerings": 3000.00,
                        "Donations": 1500.00
                    },
                    "expenses_by_category": {
                        "Utilities": 1500.00,
                        "Salaries": 4000.00,
                        "Maintenance": 1000.00,
                        "Supplies": 800.00,
                        "Outreach": 1200.00
                    },
                    "period": "January 2026",
                    "currency": "ZAR"
                })
            
            # Reports - Income Statement
            elif path == '/api/v1/reports/income-statement':
                start_date = query.get('start_date', ['2026-01-01'])[0]
                end_date = query.get('end_date', ['2026-01-31'])[0]
                
                self.send_json({
                    "report_type": "Income Statement",
                    "generated_at": datetime.now().isoformat(),
                    "period": {
                        "start": start_date,
                        "end": end_date
                    },
                    "currency": "ZAR",
                    "income": {
                        "total": 12500.00,
                        "categories": [
                            {"name": "Tithes", "amount": 8000.00, "percentage": 64},
                            {"name": "Offerings", "amount": 3000.00, "percentage": 24},
                            {"name": "Donations", "amount": 1500.00, "percentage": 12}
                        ]
                    },
                    "expenses": {
                        "total": 8500.00,
                        "categories": [
                            {"name": "Salaries", "amount": 4000.00, "percentage": 47},
                            {"name": "Utilities", "amount": 1500.00, "percentage": 18},
                            {"name": "Outreach", "amount": 1200.00, "percentage": 14},
                            {"name": "Maintenance", "amount": 1000.00, "percentage": 12},
                            {"name": "Supplies", "amount": 800.00, "percentage": 9}
                        ]
                    },
                    "net_income": 4000.00,
                    "summary": {
                        "total_income": 12500.00,
                        "total_expenses": 8500.00,
                        "net_income": 4000.00,
                        "margin_percentage": 32
                    }
                })
            
            # Reports - Monthly Comparison
            elif path == '/api/v1/reports/monthly-comparison':
                year = int(query.get('year', ['2026'])[0])
                
                # Generate monthly data
                months = []
                for i in range(1, 13):
                    month_name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i-1]
                    # Only show data for past/current months in 2026
                    if year == 2026 and i > 1:
                        income = 0
                        expenses = 0
                    else:
                        income = 10000 + (i * 500) + ((i * 7) % 1000)
                        expenses = 7000 + (i * 300) + ((i * 13) % 800)
                    
                    months.append({
                        "month": month_name,
                        "month_number": i,
                        "income": income,
                        "expenses": expenses,
                        "net": income - expenses
                    })
                
                self.send_json({
                    "report_type": "Monthly Comparison",
                    "year": year,
                    "generated_at": datetime.now().isoformat(),
                    "currency": "ZAR",
                    "months": months,
                    "totals": {
                        "income": sum(m['income'] for m in months),
                        "expenses": sum(m['expenses'] for m in months),
                        "net": sum(m['net'] for m in months)
                    },
                    "averages": {
                        "income": sum(m['income'] for m in months) / 12,
                        "expenses": sum(m['expenses'] for m in months) / 12,
                        "net": sum(m['net'] for m in months) / 12
                    }
                })
            
            # Reports - Export Transactions (returns empty for now)
            elif path == '/api/v1/reports/export/transactions':
                # Return CSV-like response
                self.send_headers(200, "text/csv")
                csv_content = "Date,Type,Category,Description,Amount\n"
                csv_content += "2026-01-05,Income,Tithes,Sunday Service Collection,8000.00\n"
                csv_content += "2026-01-12,Income,Offerings,Sunday Offering,3000.00\n"
                csv_content += "2026-01-15,Income,Donations,General Donation,1500.00\n"
                csv_content += "2026-01-01,Expense,Salaries,Staff Salaries,4000.00\n"
                csv_content += "2026-01-10,Expense,Utilities,Electricity,1500.00\n"
                csv_content += "2026-01-15,Expense,Outreach,Community Program,1200.00\n"
                csv_content += "2026-01-20,Expense,Maintenance,Building Repair,1000.00\n"
                csv_content += "2026-01-25,Expense,Supplies,Office Supplies,800.00\n"
                self.wfile.write(csv_content.encode())
                return
            
            else:
                self.send_json({"error": "Not found", "path": path}, 404)
            
            cur.close()
            conn.close()
            
        except Exception as e:
            self.send_json({"error": str(e)}, 500)
            if conn:
                conn.close()
    
    def do_POST(self):
        path = self.path.split('?')[0].rstrip('/')
        data = self.get_body()
        
        init_db()
        conn = get_db()
        if not conn:
            self.send_json({"error": "Database not configured"}, 500)
            return
        
        try:
            cur = conn.cursor()
            
            # Login
            if path == '/api/v1/auth/login':
                email = data.get('email', '')
                password = data.get('password', '')
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                cur.execute("""
                    SELECT id, email, first_name, last_name, role, church_id, is_active
                    FROM users WHERE email = %s AND password_hash = %s
                """, (email, password_hash))
                user = cur.fetchone()
                
                if user:
                    token = secrets.token_hex(32)
                    self.send_json({
                        "access_token": token,
                        "refresh_token": secrets.token_hex(32),
                        "token_type": "bearer",
                        "user": dict(user)
                    })
                else:
                    # Demo mode: accept any login
                    self.send_json({
                        "access_token": secrets.token_hex(32),
                        "refresh_token": secrets.token_hex(32),
                        "token_type": "bearer",
                        "user": {
                            "id": 1,
                            "email": email,
                            "first_name": "Demo",
                            "last_name": "User",
                            "role": "admin",
                            "church_id": 1,
                            "is_active": True
                        }
                    })
            
            # Register
            elif path == '/api/v1/auth/register':
                email = data.get('email', '')
                password = data.get('password', 'password123')
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                cur.execute("""
                    INSERT INTO users (email, password_hash, first_name, last_name, church_id)
                    VALUES (%s, %s, %s, %s, 1)
                    RETURNING id, email, first_name, last_name, role, church_id, is_active
                """, (email, password_hash, data.get('first_name', ''), data.get('last_name', '')))
                user = cur.fetchone()
                conn.commit()
                self.send_json(dict(user))
            
            # Create Assessment
            elif path == '/api/v1/solar/assessments':
                church_id = data.get('church_id', 1)
                period = data.get('assessment_period', 'Q1 2026')
                
                cur.execute("""
                    INSERT INTO solar_assessments (church_id, assessment_period, status)
                    VALUES (%s, %s, 'draft')
                    RETURNING *
                """, (church_id, period))
                assessment = cur.fetchone()
                conn.commit()
                self.send_json(dict(assessment))
            
            # Create Member
            elif path == '/api/v1/members':
                cur.execute("""
                    INSERT INTO members (church_id, first_name, last_name, email, phone, member_status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING *
                """, (
                    data.get('church_id', 1),
                    data.get('first_name', ''),
                    data.get('last_name', ''),
                    data.get('email'),
                    data.get('phone'),
                    data.get('member_status', 'active')
                ))
                member = cur.fetchone()
                conn.commit()
                self.send_json(dict(member))
            
            # Create Church
            elif path == '/api/v1/churches':
                cur.execute("""
                    INSERT INTO churches (name, city, country)
                    VALUES (%s, %s, %s)
                    RETURNING *
                """, (data.get('name', ''), data.get('city', ''), data.get('country', '')))
                church = cur.fetchone()
                conn.commit()
                self.send_json(dict(church))
            
            else:
                self.send_json({"error": "Not found", "path": path}, 404)
            
            cur.close()
            conn.close()
            
        except Exception as e:
            self.send_json({"error": str(e)}, 500)
            if conn:
                conn.rollback()
                conn.close()
    
    def do_PUT(self):
        path = self.path.split('?')[0].rstrip('/')
        data = self.get_body()
        
        conn = get_db()
        if not conn:
            self.send_json({"error": "Database not configured"}, 500)
            return
        
        try:
            cur = conn.cursor()
            
            # Update Assessment Scores
            if '/api/v1/solar/assessments/' in path and '/scores' in path:
                assessment_id = path.split('/')[-2]
                
                # Calculate overall score
                scores = [
                    float(data.get('spiritual_vitality_score', 0)),
                    float(data.get('organisational_governance_score', 0)),
                    float(data.get('love_care_score', 0)),
                    float(data.get('advancement_score', 0)),
                    float(data.get('resources_score', 0))
                ]
                overall = sum(scores) / len(scores) if scores else 0
                grade = calculate_grade(overall)
                
                cur.execute("""
                    UPDATE solar_assessments SET
                        spiritual_vitality_score = %s,
                        organisational_governance_score = %s,
                        love_care_score = %s,
                        advancement_score = %s,
                        resources_score = %s,
                        overall_score = %s,
                        overall_grade = %s,
                        status = 'completed',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING *
                """, (
                    data.get('spiritual_vitality_score', 0),
                    data.get('organisational_governance_score', 0),
                    data.get('love_care_score', 0),
                    data.get('advancement_score', 0),
                    data.get('resources_score', 0),
                    overall,
                    grade,
                    assessment_id
                ))
                assessment = cur.fetchone()
                conn.commit()
                self.send_json(dict(assessment) if assessment else {"error": "Not found"})
            
            else:
                self.send_json({"error": "Not found", "path": path}, 404)
            
            cur.close()
            conn.close()
            
        except Exception as e:
            self.send_json({"error": str(e)}, 500)
            if conn:
                conn.rollback()
                conn.close()
    
    def do_DELETE(self):
        path = self.path.split('?')[0].rstrip('/')
        
        conn = get_db()
        if not conn:
            self.send_json({"error": "Database not configured"}, 500)
            return
        
        try:
            cur = conn.cursor()
            
            # Delete Member
            if '/api/v1/members/' in path:
                member_id = path.split('/')[-1]
                cur.execute("DELETE FROM members WHERE id = %s", (member_id,))
                conn.commit()
                self.send_json({"message": "Deleted"})
            
            # Delete Assessment
            elif '/api/v1/solar/assessments/' in path:
                assessment_id = path.split('/')[-1]
                cur.execute("DELETE FROM solar_assessments WHERE id = %s", (assessment_id,))
                conn.commit()
                self.send_json({"message": "Deleted"})
            
            else:
                self.send_json({"error": "Not found", "path": path}, 404)
            
            cur.close()
            conn.close()
            
        except Exception as e:
            self.send_json({"error": str(e)}, 500)
            if conn:
                conn.rollback()
                conn.close()
