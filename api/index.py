"""
Vercel Serverless Function - Church SOLAR API with Neon PostgreSQL
Version: 2.5.0 - Added POST handlers for income and expense entries
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import hashlib
import secrets
from datetime import datetime
from urllib.parse import parse_qs, urlparse

def get_database_url():
    return os.environ.get('DATABASE_URL', os.environ.get('POSTGRES_URL', ''))

def is_demo_mode():
    db_url = get_database_url()
    allow_demo = os.environ.get('ALLOW_DEMO_DATA', 'true').lower() == 'true'
    return (not db_url) and allow_demo

def is_demo_disabled():
    db_url = get_database_url()
    allow_demo = os.environ.get('ALLOW_DEMO_DATA', 'true').lower() == 'true'
    return (not db_url) and (not allow_demo)

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
        {'id': 2, 'name': 'First Fruits', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 2},
        {'id': 3, 'name': 'Regular Seed', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 3},
        {'id': 4, 'name': 'Alms', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 4},
        {'id': 5, 'name': 'Special Seed', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 5},
        {'id': 6, 'name': 'Offerings', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 6},
        {'id': 7, 'name': 'Building Fund', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 10},
        {'id': 8, 'name': 'Missions', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 11},
        {'id': 9, 'name': 'Youth Ministry', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 12},
        {'id': 10, 'name': 'Other Income', 'church_id': 1, 'is_tax_deductible': False, 'sort_order': 99},
    ],
    'expense_categories': [
        {'id': 1, 'name': 'Senior Pastor Salary', 'church_id': 1, 'parent_id': None, 'sort_order': 1},
        {'id': 2, 'name': 'Associate Pastor Salary', 'church_id': 1, 'parent_id': None, 'sort_order': 2},
        {'id': 3, 'name': 'Staff Salaries', 'church_id': 1, 'parent_id': None, 'sort_order': 3},
        {'id': 4, 'name': 'Payroll Taxes & UIF', 'church_id': 1, 'parent_id': None, 'sort_order': 4},
        {'id': 5, 'name': 'Staff Benefits', 'church_id': 1, 'parent_id': None, 'sort_order': 5},
        {'id': 6, 'name': 'Housing Allowance', 'church_id': 1, 'parent_id': None, 'sort_order': 6},
        {'id': 7, 'name': 'Transport Allowance', 'church_id': 1, 'parent_id': None, 'sort_order': 7},
        {'id': 8, 'name': 'Rent/Mortgage', 'church_id': 1, 'parent_id': None, 'sort_order': 10},
        {'id': 9, 'name': 'Electricity', 'church_id': 1, 'parent_id': None, 'sort_order': 11},
        {'id': 10, 'name': 'Water & Rates', 'church_id': 1, 'parent_id': None, 'sort_order': 12},
        {'id': 11, 'name': 'Security', 'church_id': 1, 'parent_id': None, 'sort_order': 13},
        {'id': 12, 'name': 'Cleaning & Maintenance', 'church_id': 1, 'parent_id': None, 'sort_order': 14},
        {'id': 13, 'name': 'Repairs & Renovations', 'church_id': 1, 'parent_id': None, 'sort_order': 15},
        {'id': 14, 'name': 'Insurance', 'church_id': 1, 'parent_id': None, 'sort_order': 16},
        {'id': 15, 'name': 'Garden & Grounds', 'church_id': 1, 'parent_id': None, 'sort_order': 17},
        {'id': 16, 'name': 'Office Supplies', 'church_id': 1, 'parent_id': None, 'sort_order': 20},
        {'id': 17, 'name': 'Printing & Stationery', 'church_id': 1, 'parent_id': None, 'sort_order': 21},
        {'id': 18, 'name': 'Telephone & Internet', 'church_id': 1, 'parent_id': None, 'sort_order': 22},
        {'id': 19, 'name': 'Postage & Courier', 'church_id': 1, 'parent_id': None, 'sort_order': 23},
        {'id': 20, 'name': 'Bank Charges', 'church_id': 1, 'parent_id': None, 'sort_order': 24},
        {'id': 21, 'name': 'Accounting & Audit', 'church_id': 1, 'parent_id': None, 'sort_order': 25},
        {'id': 22, 'name': 'Legal Fees', 'church_id': 1, 'parent_id': None, 'sort_order': 26},
        {'id': 23, 'name': 'Software & Subscriptions', 'church_id': 1, 'parent_id': None, 'sort_order': 27},
        {'id': 24, 'name': 'Youth Ministry Expenses', 'church_id': 1, 'parent_id': None, 'sort_order': 30},
        {'id': 25, 'name': 'Children Ministry Expenses', 'church_id': 1, 'parent_id': None, 'sort_order': 31},
        {'id': 26, 'name': 'Women Ministry Expenses', 'church_id': 1, 'parent_id': None, 'sort_order': 32},
        {'id': 27, 'name': 'Men Ministry Expenses', 'church_id': 1, 'parent_id': None, 'sort_order': 33},
        {'id': 28, 'name': 'Small Groups & Cell Ministry', 'church_id': 1, 'parent_id': None, 'sort_order': 34},
        {'id': 29, 'name': 'Discipleship & Training', 'church_id': 1, 'parent_id': None, 'sort_order': 35},
        {'id': 30, 'name': 'Worship Equipment', 'church_id': 1, 'parent_id': None, 'sort_order': 40},
        {'id': 31, 'name': 'Sound & AV Equipment', 'church_id': 1, 'parent_id': None, 'sort_order': 41},
        {'id': 32, 'name': 'Music Licensing (CCLI)', 'church_id': 1, 'parent_id': None, 'sort_order': 42},
        {'id': 33, 'name': 'Livestream & Media', 'church_id': 1, 'parent_id': None, 'sort_order': 43},
        {'id': 34, 'name': 'Website & Social Media', 'church_id': 1, 'parent_id': None, 'sort_order': 44},
        {'id': 35, 'name': 'Missions Support', 'church_id': 1, 'parent_id': None, 'sort_order': 50},
        {'id': 36, 'name': 'Outreach Programs', 'church_id': 1, 'parent_id': None, 'sort_order': 51},
        {'id': 37, 'name': 'Evangelism Materials', 'church_id': 1, 'parent_id': None, 'sort_order': 52},
        {'id': 38, 'name': 'Community Projects', 'church_id': 1, 'parent_id': None, 'sort_order': 53},
        {'id': 39, 'name': 'Benevolence - Members', 'church_id': 1, 'parent_id': None, 'sort_order': 60},
        {'id': 40, 'name': 'Benevolence - Community', 'church_id': 1, 'parent_id': None, 'sort_order': 61},
        {'id': 41, 'name': 'Funeral Assistance', 'church_id': 1, 'parent_id': None, 'sort_order': 62},
        {'id': 42, 'name': 'Food Parcels & Relief', 'church_id': 1, 'parent_id': None, 'sort_order': 63},
        {'id': 43, 'name': 'Church Events', 'church_id': 1, 'parent_id': None, 'sort_order': 70},
        {'id': 44, 'name': 'Conferences & Seminars', 'church_id': 1, 'parent_id': None, 'sort_order': 71},
        {'id': 45, 'name': 'Hospitality & Catering', 'church_id': 1, 'parent_id': None, 'sort_order': 72},
        {'id': 46, 'name': 'Guest Speakers', 'church_id': 1, 'parent_id': None, 'sort_order': 73},
        {'id': 47, 'name': 'Vehicle Expenses', 'church_id': 1, 'parent_id': None, 'sort_order': 80},
        {'id': 48, 'name': 'Fuel', 'church_id': 1, 'parent_id': None, 'sort_order': 81},
        {'id': 49, 'name': 'Travel & Accommodation', 'church_id': 1, 'parent_id': None, 'sort_order': 82},
        {'id': 50, 'name': 'Denominational Dues', 'church_id': 1, 'parent_id': None, 'sort_order': 90},
        {'id': 51, 'name': 'Books & Resources', 'church_id': 1, 'parent_id': None, 'sort_order': 91},
        {'id': 52, 'name': 'Miscellaneous Expenses', 'church_id': 1, 'parent_id': None, 'sort_order': 99},
    ],
    'incomes': [
        {'id': 1, 'church_id': 1, 'category_id': 1, 'amount': 6200.00, 'date': '2026-01-15', 'payment_method': 'eft', 'member_id': None, 'is_anonymous': True, 'description': 'Weekly tithes', 'category_name': 'Tithes'},
        {'id': 2, 'church_id': 1, 'category_id': 2, 'amount': 1800.00, 'date': '2026-01-08', 'payment_method': 'cash', 'member_id': None, 'is_anonymous': False, 'description': 'January first fruits', 'category_name': 'First Fruits'},
        {'id': 3, 'church_id': 1, 'category_id': 3, 'amount': 950.00, 'date': '2026-01-20', 'payment_method': 'eft', 'member_id': None, 'is_anonymous': False, 'description': 'Regular seed mid-month', 'category_name': 'Regular Seed'},
        {'id': 4, 'church_id': 1, 'category_id': 4, 'amount': 400.00, 'date': '2026-01-05', 'payment_method': 'cash', 'member_id': None, 'is_anonymous': True, 'description': 'Alms and relief', 'category_name': 'Alms'},
        {'id': 5, 'church_id': 1, 'category_id': 5, 'amount': 2200.00, 'date': '2026-01-28', 'payment_method': 'eft', 'member_id': None, 'is_anonymous': False, 'description': 'Special seed for building', 'category_name': 'Special Seed'},
    ],
    'expenses': [
        {'id': 1, 'church_id': 1, 'category_id': 1, 'amount': 8000.00, 'date': '2026-01-25', 'payment_method': 'eft', 'vendor': 'Staff', 'description': 'Pastor salary', 'category_name': 'Salaries & Wages'},
        {'id': 2, 'church_id': 1, 'category_id': 2, 'amount': 1500.00, 'date': '2026-01-20', 'payment_method': 'eft', 'vendor': 'Eskom', 'description': 'Electricity', 'category_name': 'Utilities'},
    ],
    'members': [
        {'id': 1, 'church_id': 1, 'first_name': 'Jane', 'last_name': 'Doe', 'email': 'jane@email.com', 'phone': '0821234567', 'member_status': 'active'},
        {'id': 2, 'church_id': 1, 'first_name': 'Peter', 'last_name': 'Smith', 'email': 'peter@email.com', 'phone': '0829876543', 'member_status': 'active'},
    ],
    'next_income_id': 6,
    'next_expense_id': 3,
}

# Database connection
_db_connection = None
_db_error = None

def get_db():
    global _db_connection, _db_error
    db_url = get_database_url()
    if not db_url:
        _db_error = "No DATABASE_URL"
        return None
    try:
        import psycopg2
        import psycopg2.extras
        if _db_connection is None or _db_connection.closed:
            _db_connection = psycopg2.connect(db_url)
            _db_error = None
        return _db_connection
    except Exception as e:
        _db_error = str(e)
        print(f"Database connection error: {e}")
        return None

def get_dict_cursor(conn):
    """Get a cursor that returns dictionaries"""
    import psycopg2.extras
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

def get_db_error():
    return _db_error


def init_db():
    """Initialize database tables if they don't exist"""
    conn = get_db()
    if not conn:
        return False
    try:
        cur = get_dict_cursor(conn)
        
        # Churches table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS churches (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(255),
                country VARCHAR(255) DEFAULT 'South Africa',
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                role VARCHAR(50) DEFAULT 'member',
                church_id INTEGER REFERENCES churches(id),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Sessions table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                token VARCHAR(255) UNIQUE NOT NULL,
                user_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT NOW(),
                expires_at TIMESTAMP
            )
        """)
        
        # Income categories table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS income_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                church_id INTEGER REFERENCES churches(id),
                is_tax_deductible BOOLEAN DEFAULT TRUE,
                sort_order INTEGER DEFAULT 0
            )
        """)
        
        # Expense categories table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS expense_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                church_id INTEGER REFERENCES churches(id),
                parent_id INTEGER,
                sort_order INTEGER DEFAULT 0
            )
        """)
        
        # Income entries table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS income_entries (
                id SERIAL PRIMARY KEY,
                church_id INTEGER REFERENCES churches(id),
                category_id INTEGER REFERENCES income_categories(id),
                amount DECIMAL(12,2) NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Expense entries table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS expense_entries (
                id SERIAL PRIMARY KEY,
                church_id INTEGER REFERENCES churches(id),
                category_id INTEGER REFERENCES expense_categories(id),
                amount DECIMAL(12,2) NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                vendor VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Budgets table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS budgets (
                id SERIAL PRIMARY KEY,
                church_id INTEGER REFERENCES churches(id),
                category_type VARCHAR(50) NOT NULL,
                category_id INTEGER NOT NULL,
                year INTEGER NOT NULL,
                month INTEGER NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                UNIQUE(church_id, category_type, category_id, year, month)
            )
        """)
        
        # SOLAR assessments table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS solar_assessments (
                id SERIAL PRIMARY KEY,
                church_id INTEGER REFERENCES churches(id),
                assessment_date DATE NOT NULL,
                spiritual_score DECIMAL(5,2),
                organisational_score DECIMAL(5,2),
                love_care_score DECIMAL(5,2),
                advancement_score DECIMAL(5,2),
                resources_score DECIMAL(5,2),
                overall_score DECIMAL(5,2),
                grade VARCHAR(2),
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Members table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS members (
                id SERIAL PRIMARY KEY,
                church_id INTEGER REFERENCES churches(id),
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                member_status VARCHAR(50) DEFAULT 'active',
                joined_date DATE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Database init error: {e}")
        conn.rollback()
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
        if is_demo_mode():
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
        if is_demo_disabled():
            self.send_json({
                "error": "Demo data is disabled. Please configure DATABASE_URL to accept updates.",
                "path": path
            }, 503)
            return

        
        # If demo data is explicitly disabled and no database is configured, stop early
        if is_demo_disabled():
            self.send_json({
                "error": "Demo data is disabled. Please configure DATABASE_URL to use the API.",
                "path": path
            }, 503)
            return

        # Demo mode handlers
        if is_demo_mode():
            self.handle_demo_get(path, query)
            return
        
        # Initialize DB on first request
        init_db()
        
        conn = get_db()
        if not conn:
            db_url = get_database_url()
            self.send_json({
                "error": "Database connection failed",
                "has_db_url": bool(db_url),
                "db_url_len": len(db_url) if db_url else 0,
                "db_error": get_db_error()
            }, 500)
            return
        
        try:
            cur = get_dict_cursor(conn)
            
            # Health/Root
            if path in ['', '/api', '/api/v1']:
                self.send_json({"message": "Church SOLAR API", "version": "2.5.0", "status": "healthy", "database": "connected"})
            
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
            
            # Finance Summary - Real database query
            elif path == '/api/v1/finance/summary':
                church_id = query.get('church_id', ['1'])[0]
                
                # Get total income for this church
                cur.execute("""
                    SELECT COALESCE(SUM(amount), 0) as total 
                    FROM income_entries 
                    WHERE church_id = %s
                """, (church_id,))
                total_income = float(cur.fetchone()['total'])
                
                # Get total expenses for this church
                cur.execute("""
                    SELECT COALESCE(SUM(amount), 0) as total 
                    FROM expense_entries 
                    WHERE church_id = %s
                """, (church_id,))
                total_expenses = float(cur.fetchone()['total'])
                
                # Get income by category
                cur.execute("""
                    SELECT ic.name, COALESCE(SUM(ie.amount), 0) as total
                    FROM income_categories ic
                    LEFT JOIN income_entries ie ON ic.id = ie.category_id AND ie.church_id = %s
                    WHERE ic.church_id = %s OR ic.church_id IS NULL
                    GROUP BY ic.name
                    HAVING COALESCE(SUM(ie.amount), 0) > 0
                """, (church_id, church_id))
                income_by_cat = {row['name']: float(row['total']) for row in cur.fetchall()}
                
                # Get expenses by category
                cur.execute("""
                    SELECT ec.name, COALESCE(SUM(ee.amount), 0) as total
                    FROM expense_categories ec
                    LEFT JOIN expense_entries ee ON ec.id = ee.category_id AND ee.church_id = %s
                    WHERE ec.church_id = %s OR ec.church_id IS NULL
                    GROUP BY ec.name
                    HAVING COALESCE(SUM(ee.amount), 0) > 0
                """, (church_id, church_id))
                expenses_by_cat = {row['name']: float(row['total']) for row in cur.fetchall()}
                
                self.send_json({
                    "total_income": total_income,
                    "total_expenses": total_expenses,
                    "net_balance": total_income - total_expenses,
                    "income_by_category": income_by_cat,
                    "expenses_by_category": expenses_by_cat,
                    "period": "Current",
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
                
                # Generate monthly data from actual income/expense records
                months = []
                month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                
                for i in range(1, 13):
                    month_name = month_names[i-1]
                    month_str = f"{year}-{i:02d}"
                    
                    # Sum income for this month
                    month_income = sum(
                        inc['amount'] for inc in DEMO_DATA.get('incomes', [])
                        if inc['date'].startswith(month_str)
                    )
                    
                    # Sum expenses for this month
                    month_expenses = sum(
                        exp['amount'] for exp in DEMO_DATA.get('expenses', [])
                        if exp['date'].startswith(month_str)
                    )
                    
                    # If no actual data, generate realistic demo data for past months
                    if month_income == 0 and month_expenses == 0:
                        # Generate data for months up to current (Feb 2026)
                        if year < 2026 or (year == 2026 and i <= 2):
                            base_income = 45000 + (i * 2000) + ((i * 7) % 5000)
                            base_expense = 32000 + (i * 1500) + ((i * 13) % 3000)
                            month_income = base_income
                            month_expenses = base_expense
                    
                    months.append({
                        "month": month_name,
                        "month_number": i,
                        "income": month_income,
                        "expenses": month_expenses,
                        "net": month_income - month_expenses
                    })
                
                self.send_json({
                    "report_type": "Monthly Comparison",
                    "year": year,
                    "generated_at": datetime.now().isoformat(),
                    "currency": "ZAR",
                    "api_version": "2.3.0",
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
            
            # Finance - Income Categories
            elif path == '/api/v1/finance/income-categories':
                cur.execute("SELECT * FROM income_categories ORDER BY sort_order")
                categories = cur.fetchall()
                if not categories:
                    # Return default categories if none exist
                    default_cats = [
                        {'id': 1, 'name': 'Tithes', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 1},
                        {'id': 2, 'name': 'First Fruits', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 2},
                        {'id': 3, 'name': 'Regular Seed', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 3},
                        {'id': 4, 'name': 'Alms', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 4},
                        {'id': 5, 'name': 'Special Seed', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 5},
                        {'id': 6, 'name': 'Offerings', 'church_id': 1, 'is_tax_deductible': True, 'sort_order': 6},
                    ]
                    self.send_json(default_cats)
                else:
                    self.send_json([dict(c) for c in categories])
            
            # Finance - Expense Categories
            elif path == '/api/v1/finance/expense-categories':
                cur.execute("SELECT * FROM expense_categories ORDER BY sort_order")
                categories = cur.fetchall()
                if not categories:
                    default_cats = [
                        {'id': 1, 'name': 'Salaries', 'church_id': 1, 'sort_order': 1},
                        {'id': 2, 'name': 'Utilities', 'church_id': 1, 'sort_order': 2},
                        {'id': 3, 'name': 'Rent/Mortgage', 'church_id': 1, 'sort_order': 3},
                        {'id': 4, 'name': 'Ministry Expenses', 'church_id': 1, 'sort_order': 4},
                        {'id': 5, 'name': 'Maintenance', 'church_id': 1, 'sort_order': 5},
                    ]
                    self.send_json(default_cats)
                else:
                    self.send_json([dict(c) for c in categories])
            
            # Finance - Income entries (filtered by church_id)
            elif path == '/api/v1/finance/income':
                church_id = query.get('church_id', ['1'])[0]
                cur.execute("""
                    SELECT ie.*, ic.name as category_name 
                    FROM income_entries ie 
                    LEFT JOIN income_categories ic ON ie.category_id = ic.id 
                    WHERE ie.church_id = %s
                    ORDER BY ie.date DESC
                """, (church_id,))
                entries = cur.fetchall()
                self.send_json([dict(e) for e in entries] if entries else [])
            
            # Finance - Expense entries (filtered by church_id)
            elif path == '/api/v1/finance/expenses':
                church_id = query.get('church_id', ['1'])[0]
                cur.execute("""
                    SELECT ee.*, ec.name as category_name 
                    FROM expense_entries ee 
                    LEFT JOIN expense_categories ec ON ee.category_id = ec.id 
                    WHERE ee.church_id = %s
                    ORDER BY ee.date DESC
                """, (church_id,))
                entries = cur.fetchall()
                self.send_json([dict(e) for e in entries] if entries else [])
            
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
        
        if is_demo_disabled():
            self.send_json({
                "error": "Demo data is disabled. Please configure DATABASE_URL to accept writes.",
                "path": path
            }, 503)
            return

        # Demo mode handlers
        if is_demo_mode():
            self.handle_demo_post(path, data)
            return
        
        init_db()
        conn = get_db()
        if not conn:
            self.send_json({"error": "Database not configured"}, 500)
            return
        
        try:
            cur = get_dict_cursor(conn)
            
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
                    # Invalid credentials - return error
                    self.send_json({
                        "error": "Invalid email or password"
                    }, 401)
            
            # Register
            elif path == '/api/v1/auth/register':
                email = data.get('email', '')
                password = data.get('password', 'password123')
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                church_name = data.get('church_name', 'My Church')
                
                # Create church first
                cur.execute("""
                    INSERT INTO churches (name, city, country)
                    VALUES (%s, %s, %s)
                    RETURNING id, name, city, country
                """, (church_name, '', 'South Africa'))
                church = cur.fetchone()
                church_id = church['id']
                
                # Create user
                cur.execute("""
                    INSERT INTO users (email, password_hash, first_name, last_name, role, church_id)
                    VALUES (%s, %s, %s, %s, 'admin', %s)
                    RETURNING id, email, first_name, last_name, role, church_id, is_active
                """, (email, password_hash, data.get('first_name', ''), data.get('last_name', ''), church_id))
                user = cur.fetchone()
                conn.commit()
                
                # Generate token and return
                token = secrets.token_urlsafe(32)
                self.send_json({
                    "access_token": token,
                    "token_type": "bearer",
                    "user": dict(user),
                    "church": dict(church)
                })
            
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
            
            # Create Income Entry
            elif path == '/api/v1/finance/income':
                church_id = data.get('church_id', 1)
                category_id = data.get('category_id', 1)
                amount = data.get('amount', 0)
                description = data.get('description', '')
                date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
                
                cur.execute("""
                    INSERT INTO income_entries (church_id, category_id, amount, description, date)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING *
                """, (church_id, category_id, amount, description, date))
                entry = cur.fetchone()
                conn.commit()
                self.send_json(dict(entry))
            
            # Create Expense Entry
            elif path == '/api/v1/finance/expenses':
                church_id = data.get('church_id', 1)
                category_id = data.get('category_id', 1)
                amount = data.get('amount', 0)
                description = data.get('description', '')
                date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
                
                cur.execute("""
                    INSERT INTO expense_entries (church_id, category_id, amount, description, date)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING *
                """, (church_id, category_id, amount, description, date))
                entry = cur.fetchone()
                conn.commit()
                self.send_json(dict(entry))
            
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
            cur = get_dict_cursor(conn)
            
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

        if is_demo_disabled():
            self.send_json({
                "error": "Demo data is disabled. Please configure DATABASE_URL to delete records.",
                "path": path
            }, 503)
            return

        if is_demo_mode():
            self.send_json({"error": "Delete not supported in demo mode"}, 400)
            return
        
        conn = get_db()
        if not conn:
            self.send_json({"error": "Database not configured"}, 500)
            return
        
        try:
            cur = get_dict_cursor(conn)
            
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
        
        # Debug endpoint to check env vars (temporary)
        if path == '/api/v1/debug':
            env_keys = [k for k in os.environ.keys() if 'PG' in k or 'POSTGRES' in k or 'DATABASE' in k or 'NEON' in k]
            self.send_json({
                "env_keys": env_keys,
                "database_url_set": bool(DATABASE_URL),
                "database_url_len": len(DATABASE_URL) if DATABASE_URL else 0
            })
            return
        
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
        
        # Income categories - no auth required (categories are not sensitive)
        elif path == '/api/v1/finance/income-categories':
            categories = DEMO_DATA['income_categories']
            self.send_json(categories)
        
        # Expense categories - no auth required
        elif path == '/api/v1/finance/expense-categories':
            categories = DEMO_DATA['expense_categories']
            self.send_json(categories)
        
        # Budget data - returns budgeted vs actual amounts per category
        elif path == '/api/v1/finance/budget' or path == '/api/v1/finance/budgets':
            year = query.get('year', ['2026'])[0]
            period = query.get('period', ['annual'])[0]
            
            # Generate budget data from categories with actual spend from transactions
            income_cats = DEMO_DATA['income_categories']
            expense_cats = DEMO_DATA['expense_categories']
            incomes = DEMO_DATA['incomes']
            expenses = DEMO_DATA['expenses']
            
            # Calculate actual amounts per income category
            income_actuals = {}
            for inc in incomes:
                cat_id = inc['category_id']
                income_actuals[cat_id] = income_actuals.get(cat_id, 0) + inc['amount']
            
            # Calculate actual amounts per expense category
            expense_actuals = {}
            for exp in expenses:
                cat_id = exp['category_id']
                expense_actuals[cat_id] = expense_actuals.get(cat_id, 0) + exp['amount']
            
            # Build budget items with realistic budgeted amounts
            budget_items = []
            
            # Income budget items
            income_budgets = {
                'Tithes': 180000, 'First Fruits': 25000, 'Regular Seed': 30000,
                'Alms': 15000, 'Special Seed': 40000, 'Offerings': 85000,
                'Building Fund': 45000, 'Missions': 20000, 'Youth Ministry': 8000,
                'Other Income': 5000
            }
            for cat in income_cats:
                budgeted = income_budgets.get(cat['name'], 5000)
                actual = income_actuals.get(cat['id'], 0)
                variance = actual - budgeted
                budget_items.append({
                    'id': f"income-{cat['id']}",
                    'category_id': cat['id'],
                    'category_name': cat['name'],
                    'type': 'income',
                    'budgeted': budgeted,
                    'actual': actual,
                    'variance': variance,
                    'variance_percent': round((variance / budgeted * 100) if budgeted > 0 else 0, 1)
                })
            
            # Expense budget items
            expense_budgets = {
                'Senior Pastor Salary': 96000, 'Associate Pastor Salary': 72000,
                'Staff Salaries': 120000, 'Rent/Mortgage': 48000, 'Electricity': 24000,
                'Security': 18000, 'Insurance': 12000, 'Missions Support': 24000,
            }
            for cat in expense_cats:
                budgeted = expense_budgets.get(cat['name'], 6000)
                actual = expense_actuals.get(cat['id'], 0)
                variance = budgeted - actual  # For expenses, under budget is positive
                budget_items.append({
                    'id': f"expense-{cat['id']}",
                    'category_id': cat['id'],
                    'category_name': cat['name'],
                    'type': 'expense',
                    'budgeted': budgeted,
                    'actual': actual,
                    'variance': variance,
                    'variance_percent': round((variance / budgeted * 100) if budgeted > 0 else 0, 1)
                })
            
            total_income_budgeted = sum(b['budgeted'] for b in budget_items if b['type'] == 'income')
            total_income_actual = sum(b['actual'] for b in budget_items if b['type'] == 'income')
            total_expense_budgeted = sum(b['budgeted'] for b in budget_items if b['type'] == 'expense')
            total_expense_actual = sum(b['actual'] for b in budget_items if b['type'] == 'expense')
            
            self.send_json({
                'year': year,
                'period': period,
                'items': budget_items,
                'summary': {
                    'total_income_budgeted': total_income_budgeted,
                    'total_income_actual': total_income_actual,
                    'total_expense_budgeted': total_expense_budgeted,
                    'total_expense_actual': total_expense_actual,
                    'net_budgeted': total_income_budgeted - total_expense_budgeted,
                    'net_actual': total_income_actual - total_expense_actual,
                }
            })
        
        # Finance summary
        elif path == '/api/v1/finance/summary':
            incomes = DEMO_DATA['incomes']
            expenses = DEMO_DATA['expenses']
            total_income = sum(i['amount'] for i in incomes)
            total_expenses = sum(e['amount'] for e in expenses)
            
            self.send_json({
                'total_income': total_income,
                'total_expenses': total_expenses,
                'net_balance': total_income - total_expenses,
                'period': 'January 2026',
                'currency': 'ZAR'
            })
        
        # Income list - no auth for demo (serverless doesn't persist sessions)
        elif path == '/api/v1/finance/income':
            incomes = DEMO_DATA['incomes']
            total = sum(i['amount'] for i in incomes)
            self.send_json({
                'incomes': incomes,
                'total': len(incomes),
                'total_amount': total,
                'page': 1,
                'per_page': 50
            })
        
        # Expenses list - no auth for demo
        elif path == '/api/v1/finance/expenses':
            expenses = DEMO_DATA['expenses']
            total = sum(e['amount'] for e in expenses)
            self.send_json({
                'expenses': expenses,
                'total': len(expenses),
                'total_amount': total,
                'page': 1,
                'per_page': 50
            })
        
        # Members list - no auth for demo
        elif path == '/api/v1/members':
            members = DEMO_DATA['members']
            self.send_json({
                'members': members,
                'total': len(members),
                'page': 1,
                'per_page': 50
            })
        
        # Members summary - no auth for demo
        elif path == '/api/v1/members/summary':
            members = [{'id': m['id'], 'first_name': m['first_name'], 'last_name': m['last_name']} 
                       for m in DEMO_DATA['members']]
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
        
        # Reports - Income Statement
        elif path == '/api/v1/reports/income-statement':
            incomes = DEMO_DATA['incomes']
            expenses = DEMO_DATA['expenses']
            
            # Group by category
            income_by_cat = {}
            for inc in incomes:
                cat = inc.get('category_name', 'Other')
                income_by_cat[cat] = income_by_cat.get(cat, 0) + inc['amount']
            
            expense_by_cat = {}
            for exp in expenses:
                cat = exp.get('category_name', 'Other')
                expense_by_cat[cat] = expense_by_cat.get(cat, 0) + exp['amount']
            
            total_income = sum(income_by_cat.values())
            total_expenses = sum(expense_by_cat.values())
            
            income_list = [{"category": k, "amount": v, "percentage": round(v/total_income*100) if total_income else 0} 
                           for k, v in income_by_cat.items()]
            expense_list = [{"category": k, "amount": v, "percentage": round(v/total_expenses*100) if total_expenses else 0} 
                            for k, v in expense_by_cat.items()]
            
            self.send_json({
                "report_type": "Income Statement",
                "generated_at": datetime.now().isoformat(),
                "period": {"start": "2026-01-01", "end": "2026-01-31"},
                "currency": "ZAR",
                "income": income_list,
                "expenses": expense_list,
                "net_income": total_income - total_expenses,
                "summary": {
                    "total_income": total_income,
                    "total_expenses": total_expenses,
                    "net_income": total_income - total_expenses,
                    "margin_percentage": round((total_income - total_expenses) / total_income * 100) if total_income else 0
                }
            })
        
        # Reports - Monthly Comparison
        elif path == '/api/v1/reports/monthly-comparison':
            year = int(query.get('year', ['2026'])[0])
            
            # Generate monthly data
            months = []
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            for i in range(1, 13):
                month_name = month_names[i-1]
                month_str = f"{year}-{i:02d}"
                
                # Sum income for this month from DEMO_DATA
                month_income = sum(
                    inc['amount'] for inc in DEMO_DATA.get('incomes', [])
                    if inc['date'].startswith(month_str)
                )
                
                # Sum expenses for this month from DEMO_DATA
                month_expenses = sum(
                    exp['amount'] for exp in DEMO_DATA.get('expenses', [])
                    if exp['date'].startswith(month_str)
                )
                
                # If no actual data, generate realistic demo data for past months
                if month_income == 0 and month_expenses == 0:
                    # Generate data for months up to current (Feb 2026)
                    if year < 2026 or (year == 2026 and i <= 2):
                        base_income = 45000 + (i * 2000) + ((i * 7) % 5000)
                        base_expense = 32000 + (i * 1500) + ((i * 13) % 3000)
                        month_income = base_income
                        month_expenses = base_expense
                
                months.append({
                    "month": month_name,
                    "month_number": i,
                    "income": month_income,
                    "expenses": month_expenses,
                    "net": month_income - month_expenses
                })
            
            total_income = sum(m['income'] for m in months)
            total_expenses = sum(m['expenses'] for m in months)
            
            self.send_json({
                "report_type": "Monthly Comparison",
                "year": year,
                "generated_at": datetime.now().isoformat(),
                "currency": "ZAR",
                "months": months,
                "totals": {
                    "income": total_income,
                    "expenses": total_expenses,
                    "net": total_income - total_expenses
                },
                "averages": {
                    "income": total_income / 12,
                    "expenses": total_expenses / 12,
                    "net": (total_income - total_expenses) / 12
                }
            })
        
        # Reports - Export Transactions
        elif path == '/api/v1/reports/export/transactions':
            incomes = DEMO_DATA['incomes']
            expenses = DEMO_DATA['expenses']
            
            transactions = []
            for inc in incomes:
                transactions.append({
                    "date": inc['date'],
                    "type": "Income",
                    "category": inc.get('category_name', 'Other'),
                    "amount": inc['amount'],
                    "description": inc.get('description', '')
                })
            for exp in expenses:
                transactions.append({
                    "date": exp['date'],
                    "type": "Expense",
                    "category": exp.get('category_name', 'Other'),
                    "amount": exp['amount'],
                    "description": exp.get('description', '')
                })
            
            self.send_json({
                "transactions": transactions,
                "total": len(transactions)
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
        
        # Register new user
        elif path == '/api/v1/auth/register':
            email = data.get('email', '')
            password = data.get('password', '')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            church_name = data.get('church_name', 'My Church')
            
            # Check if email already exists
            for user in DEMO_DATA['users']:
                if user['email'] == email:
                    self.send_json({"detail": "Email already registered"}, 400)
                    return
            
            # Create new church
            new_church_id = max(c['id'] for c in DEMO_DATA['churches']) + 1
            new_church = {
                'id': new_church_id,
                'name': church_name,
                'city': '',
                'country': 'South Africa'
            }
            DEMO_DATA['churches'].append(new_church)
            
            # Create new user
            new_user_id = max(u['id'] for u in DEMO_DATA['users']) + 1
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            new_user = {
                'id': new_user_id,
                'email': email,
                'password_hash': password_hash,
                'first_name': first_name,
                'last_name': last_name,
                'role': 'admin',
                'church_id': new_church_id,
                'is_active': True
            }
            DEMO_DATA['users'].append(new_user)
            
            # Auto-login the new user
            token = secrets.token_urlsafe(32)
            DEMO_DATA['sessions'][token] = new_user_id
            
            self.send_json({
                'access_token': token,
                'token_type': 'bearer',
                'user': {
                    'id': new_user['id'],
                    'email': new_user['email'],
                    'first_name': new_user['first_name'],
                    'last_name': new_user['last_name'],
                    'role': new_user['role'],
                    'church_id': new_user['church_id']
                },
                'church': new_church
            }, 201)
        
        # Create income - allow without auth in demo mode
        elif path == '/api/v1/finance/income':
            user = self.get_auth_user()
            church_id = user['church_id'] if user else 1  # Default to church 1 in demo
            
            category = next((c for c in DEMO_DATA['income_categories'] if c['id'] == data.get('category_id')), None)
            income = {
                'id': DEMO_DATA['next_income_id'],
                'church_id': church_id,
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
        
        # Create expense - allow without auth in demo mode
        elif path == '/api/v1/finance/expenses':
            user = self.get_auth_user()
            church_id = user['church_id'] if user else 1  # Default to church 1 in demo
            
            category = next((c for c in DEMO_DATA['expense_categories'] if c['id'] == data.get('category_id')), None)
            expense = {
                'id': DEMO_DATA['next_expense_id'],
                'church_id': church_id,
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
