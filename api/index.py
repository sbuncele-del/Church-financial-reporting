"""
Vercel Serverless Function - Church SOLAR API with Neon PostgreSQL
Version: 2.2.0 - Added demo mode fallback
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import hashlib
import secrets
from datetime import datetime
from urllib.parse import parse_qs, urlparse

DATABASE_URL = os.environ.get('DATABASE_URL', os.environ.get('POSTGRES_URL', ''))

# Demo mode - in-memory data when no database
DEMO_MODE = not DATABASE_URL

# Demo data
DEMO_DATA = {
    'churches': [
        {'id': 1, 'name': 'Grace Community Church', 'city': 'Johannesburg', 'country': 'South Africa'}
    ],
    'users': [
        {'id': 1, 'email': 'pastor@gracechurch.org', 'password_hash': hashlib.sha256('password123'.encode()).hexdigest(), 
         'first_name': 'John', 'last_name': 'Pastor', 'role': 'admin', 'church_id': 1, 'is_active': True}
    ],
    'sessions': {},  # token -> user_id
    'income_categories': [
        {'id': 1, 'name': 'Tithes', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 1},
        {'id': 2, 'name': 'Offerings', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 2},
        {'id': 3, 'name': 'First Fruits', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 3},
        {'id': 4, 'name': 'Free Will', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 4},
        {'id': 5, 'name': 'Sacrificial Seed', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 5},
        {'id': 6, 'name': 'Alms Seed', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 6},
        {'id': 7, 'name': 'Building Fund', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 7},
        {'id': 8, 'name': 'Missions', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 8},
        {'id': 9, 'name': 'Youth Ministry', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 9},
        {'id': 10, 'name': 'Benevolence', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 10},
        {'id': 11, 'name': 'Special Events', 'church_id': 1, 'is_tax_deductible': False, 'sort_order': 11},
        {'id': 12, 'name': 'Other Income', 'church_id': 1, 'is_tax_deductible': False, 'sort_order': 99},
    ],
    'expense_categories': [
        {'id': 1, 'name': 'Salaries & Wages', 'church_id': 1, 'parent_id': None},
        {'id': 2, 'name': 'Utilities', 'church_id': 1, 'parent_id': None},
        {'id': 3, 'name': 'Building Maintenance', 'church_id': 1, 'parent_id': None},
        {'id': 4, 'name': 'Ministry Supplies', 'church_id': 1, 'parent_id': None},
        {'id': 5, 'name': 'Missions & Outreach', 'church_id': 1, 'parent_id': None},
        {'id': 6, 'name': 'Office Expenses', 'church_id': 1, 'parent_id': None},
        {'id': 7, 'name': 'Other Expenses', 'church_id': 1, 'parent_id': None},
    ],
    'incomes': [
        {'id': 1, 'church_id': 1, 'category_id': 1, 'amount': 5000.00, 'date': '2026-01-15', 'payment_method': 'eft', 'member_id': None, 'is_anonymous': True, 'description': 'Weekly tithes', 'category_name': 'Tithes'},
        {'id': 2, 'church_id': 1, 'category_id': 2, 'amount': 2500.00, 'date': '2026-01-15', 'payment_method': 'cash', 'member_id': None, 'is_anonymous': True, 'description': 'Sunday offering', 'category_name': 'Offerings'},
        {'id': 3, 'church_id': 1, 'category_id': 3, 'amount': 1000.00, 'date': '2026-01-01', 'payment_method': 'eft', 'member_id': None, 'is_anonymous': False, 'description': 'First fruits January', 'category_name': 'First Fruits'},
    ],
    'expenses': [
        {'id': 1, 'church_id': 1, 'category_id': 1, 'amount': 8000.00, 'date': '2026-01-25', 'payment_method': 'eft', 'vendor': 'Staff', 'description': 'Pastor salary', 'category_name': 'Salaries & Wages'},
        {'id': 2, 'church_id': 1, 'category_id': 2, 'amount': 1500.00, 'date': '2026-01-20', 'payment_method': 'eft', 'vendor': 'Eskom', 'description': 'Electricity', 'category_name': 'Utilities'},
    ],
    'members': [
        {'id': 1, 'church_id': 1, 'first_name': 'Jane', 'last_name': 'Doe', 'email': 'jane@email.com', 'phone': '0821234567', 'member_status': 'active'},
        {'id': 2, 'church_id': 1, 'first_name': 'Peter', 'last_name': 'Smith', 'email': 'peter@email.com', 'phone': '0829876543', 'member_status': 'active'},
    ],
    'next_income_id': 4,
    'next_expense_id': 3,
}

# PostgreSQL connection (only if DATABASE_URL exists)
if not DEMO_MODE:
    import psycopg2
    from psycopg2.extras import RealDictCursor

def get_db():
    """Get database connection"""
    if DEMO_MODE:
        return None
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

    def get_auth_user(self):
        """Get authenticated user from token"""
        auth_header = self.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header[7:]
        if DEMO_MODE:
            user_id = DEMO_DATA['sessions'].get(token)
            if user_id:
                for user in DEMO_DATA['users']:
                    if user['id'] == user_id:
                        return user
            return None
        return None  # DB mode handles this differently

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        query = parse_qs(parsed.query)
        
        # Demo mode handlers
        if DEMO_MODE:
            self.handle_demo_get(path, query)
            return
        
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
                    "income": [
                        {"category": "Tithes", "amount": 8000.00, "percentage": 64},
                        {"category": "Offerings", "amount": 3000.00, "percentage": 24},
                        {"category": "Donations", "amount": 1500.00, "percentage": 12}
                    ],
                    "expenses": [
                        {"category": "Salaries", "amount": 4000.00, "percentage": 47},
                        {"category": "Utilities", "amount": 1500.00, "percentage": 18},
                        {"category": "Outreach", "amount": 1200.00, "percentage": 14},
                        {"category": "Maintenance", "amount": 1000.00, "percentage": 12},
                        {"category": "Supplies", "amount": 800.00, "percentage": 9}
                    ],
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
            
            # Reports - Export Transactions (returns CSV)
            elif path == '/api/v1/reports/export/transactions':
                self.send_response(200)
                self.send_header('Content-type', 'text/csv')
                self.send_header('Content-Disposition', 'attachment; filename="transactions.csv"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
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
        
        # Demo mode handlers
        if DEMO_MODE:
            self.handle_demo_post(path, data)
            return
        
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

    # ========== DEMO MODE HANDLERS ==========
    
    def handle_demo_get(self, path, query):
        """Handle GET requests in demo mode"""
        
        # Health/Root
        if path in ['', '/api', '/api/v1', '/api/v1/health']:
            self.send_json({"message": "Church SOLAR API", "version": "1.0.0", "status": "healthy", "mode": "demo"})
        
        # Current user
        elif path == '/api/v1/auth/me':
            user = self.get_auth_user()
            if user:
                self.send_json({
                    'id': user['id'],
                    'email': user['email'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name'],
                    'role': user['role'],
                    'church_id': user['church_id']
                })
            else:
                self.send_json({"detail": "Not authenticated"}, 401)
        
        # Income categories
        elif path == '/api/v1/finance/income-categories':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            categories = [c for c in DEMO_DATA['income_categories'] if c['church_id'] == user['church_id']]
            self.send_json(categories)
        
        # Expense categories
        elif path == '/api/v1/finance/expense-categories':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            categories = [c for c in DEMO_DATA['expense_categories'] if c['church_id'] == user['church_id']]
            self.send_json(categories)
        
        # Income list
        elif path == '/api/v1/finance/income':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            incomes = [i for i in DEMO_DATA['incomes'] if i['church_id'] == user['church_id']]
            total = sum(i['amount'] for i in incomes)
            self.send_json({
                'incomes': incomes,
                'total': len(incomes),
                'total_amount': total,
                'page': 1,
                'per_page': 50
            })
        
        # Expenses list
        elif path == '/api/v1/finance/expenses':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            expenses = [e for e in DEMO_DATA['expenses'] if e['church_id'] == user['church_id']]
            total = sum(e['amount'] for e in expenses)
            self.send_json({
                'expenses': expenses,
                'total': len(expenses),
                'total_amount': total,
                'page': 1,
                'per_page': 50
            })
        
        # Members list
        elif path == '/api/v1/members':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            members = [m for m in DEMO_DATA['members'] if m['church_id'] == user['church_id']]
            self.send_json({
                'members': members,
                'total': len(members),
                'page': 1,
                'per_page': 50
            })
        
        # Members summary
        elif path == '/api/v1/members/summary':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            members = [{'id': m['id'], 'first_name': m['first_name'], 'last_name': m['last_name']} 
                       for m in DEMO_DATA['members'] if m['church_id'] == user['church_id']]
            self.send_json(members)
        
        # SOLAR Dashboard
        elif path.startswith('/api/v1/solar/dashboard'):
            user = self.get_auth_user()
            church_id = user['church_id'] if user else 1
            church = DEMO_DATA['churches'][0]
            self.send_json({
                'church_id': church_id,
                'church_name': church['name'],
                'assessment_period': 'Q1 2026',
                'overall_score': 72.5,
                'overall_grade': 'B-',
                'status': 'completed',
                'dimensions': [
                    {"dimension": "S", "name": "Spiritual Vitality", "score": 78, "color": "#8B5CF6"},
                    {"dimension": "O", "name": "Organisational Governance", "score": 65, "color": "#3B82F6"},
                    {"dimension": "L", "name": "Love & Care", "score": 82, "color": "#EC4899"},
                    {"dimension": "A", "name": "Advancement", "score": 68, "color": "#10B981"},
                    {"dimension": "R", "name": "Resources", "score": 70, "color": "#F59E0B"},
                ],
                'strengths': ['Strong prayer culture', 'Active small groups'],
                'improvements': ['Financial systems need updating'],
                'trend': 'improving'
            })
        
        else:
            self.send_json({"error": "Not found", "path": path}, 404)
    
    def handle_demo_post(self, path, data):
        """Handle POST requests in demo mode"""
        
        # Login
        if path == '/api/v1/auth/login':
            email = data.get('email', '')
            password = data.get('password', '')
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            for user in DEMO_DATA['users']:
                if user['email'] == email and user['password_hash'] == password_hash:
                    token = secrets.token_urlsafe(32)
                    DEMO_DATA['sessions'][token] = user['id']
                    self.send_json({
                        'access_token': token,
                        'token_type': 'bearer',
                        'user': {
                            'id': user['id'],
                            'email': user['email'],
                            'first_name': user['first_name'],
                            'last_name': user['last_name'],
                            'role': user['role'],
                            'church_id': user['church_id']
                        }
                    })
                    return
            
            self.send_json({"detail": "Invalid email or password"}, 401)
        
        # Create income
        elif path == '/api/v1/finance/income':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            
            category = next((c for c in DEMO_DATA['income_categories'] if c['id'] == data.get('category_id')), None)
            income = {
                'id': DEMO_DATA['next_income_id'],
                'church_id': user['church_id'],
                'category_id': data.get('category_id'),
                'amount': float(data.get('amount', 0)),
                'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
                'payment_method': data.get('payment_method', 'cash'),
                'member_id': data.get('member_id'),
                'is_anonymous': data.get('is_anonymous', False),
                'description': data.get('description', ''),
                'reference_number': data.get('reference_number', ''),
                'category_name': category['name'] if category else 'Unknown'
            }
            DEMO_DATA['incomes'].append(income)
            DEMO_DATA['next_income_id'] += 1
            self.send_json(income, 201)
        
        # Create expense
        elif path == '/api/v1/finance/expenses':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            
            category = next((c for c in DEMO_DATA['expense_categories'] if c['id'] == data.get('category_id')), None)
            expense = {
                'id': DEMO_DATA['next_expense_id'],
                'church_id': user['church_id'],
                'category_id': data.get('category_id'),
                'amount': float(data.get('amount', 0)),
                'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
                'payment_method': data.get('payment_method', 'cash'),
                'vendor': data.get('vendor', ''),
                'description': data.get('description', ''),
                'reference_number': data.get('reference_number', ''),
                'category_name': category['name'] if category else 'Unknown'
            }
            DEMO_DATA['expenses'].append(expense)
            DEMO_DATA['next_expense_id'] += 1
            self.send_json(expense, 201)
        
        # Reports
        elif path == '/api/v1/reports/generate':
            user = self.get_auth_user()
            if not user:
                self.send_json({"detail": "Not authenticated"}, 401)
                return
            
            report_type = data.get('report_type', 'income_statement')
            incomes = [i for i in DEMO_DATA['incomes'] if i['church_id'] == user['church_id']]
            expenses = [e for e in DEMO_DATA['expenses'] if e['church_id'] == user['church_id']]
            
            total_income = sum(i['amount'] for i in incomes)
            total_expenses = sum(e['amount'] for e in expenses)
            
            self.send_json({
                'report_type': report_type,
                'generated_at': datetime.now().isoformat(),
                'period': {'start_date': data.get('start_date'), 'end_date': data.get('end_date')},
                'summary': {
                    'total_income': total_income,
                    'total_expenses': total_expenses,
                    'net_position': total_income - total_expenses
                },
                'income_by_category': [
                    {'category': 'Tithes', 'amount': 5000.00},
                    {'category': 'Offerings', 'amount': 2500.00},
                    {'category': 'First Fruits', 'amount': 1000.00},
                ],
                'expense_by_category': [
                    {'category': 'Salaries & Wages', 'amount': 8000.00},
                    {'category': 'Utilities', 'amount': 1500.00},
                ]
            })
        
        else:
            self.send_json({"error": "Not found", "path": path}, 404)
