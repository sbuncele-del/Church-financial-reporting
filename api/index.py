"""
Vercel Serverless Function - Church SOLAR API with Neon PostgreSQL
Version: 2.5.0 - Added POST handlers for income and expense entries
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import hashlib
import hmac
import secrets
from datetime import datetime
from urllib.parse import parse_qs, urlparse

# Password hashing using PBKDF2 (stdlib, no dependencies)
HASH_ITERATIONS = 260000
HASH_ALGO = 'sha256'

def hash_password(password: str, salt: str = None) -> str:
    """Hash a password with PBKDF2-SHA256. Returns 'salt$hash'."""
    if salt is None:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(HASH_ALGO, password.encode(), salt.encode(), HASH_ITERATIONS)
    return f"{salt}${dk.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored 'salt$hash' string.
    Also accepts legacy SHA256 hashes for migration."""
    if '$' in stored_hash:
        salt, _ = stored_hash.split('$', 1)
        return hmac.compare_digest(hash_password(password, salt), stored_hash)
    else:
        # Legacy SHA256 fallback for existing accounts
        legacy = hashlib.sha256(password.encode()).hexdigest()
        return hmac.compare_digest(legacy, stored_hash)

def get_database_url():
    return os.environ.get('DATABASE_URL', os.environ.get('POSTGRES_URL', ''))

def is_demo_mode():
    db_url = get_database_url()
    allow_demo = os.environ.get('ALLOW_DEMO_DATA', 'false').lower() == 'true'
    return (not db_url) and allow_demo

def is_demo_disabled():
    db_url = get_database_url()
    allow_demo = os.environ.get('ALLOW_DEMO_DATA', 'false').lower() == 'true'
    return (not db_url) and (not allow_demo)

# Demo data
DEMO_DATA = {
    'churches': [
        {'id': 1, 'name': 'Grace Community Church', 'city': 'Johannesburg', 'country': 'South Africa'}
    ],
    'users': [
        {'id': 1, 'email': 'pastor@gracechurch.org', 'password_hash': hash_password(os.environ.get('DEMO_PASSWORD', 'ChangeMeBeforeProduction1!')),
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

# Database connection - NOTE: Serverless functions should use fresh connections
_db_error = None

def get_db():
    """Get a fresh database connection for each request"""
    global _db_error
    db_url = get_database_url()
    if not db_url:
        _db_error = "No DATABASE_URL"
        return None
    try:
        import psycopg2
        import psycopg2.extras
        
        # Create a fresh connection for each request (serverless best practice)
        conn = psycopg2.connect(db_url)
        _db_error = None
        return conn
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
                name VARCHAR(255),
                description TEXT,
                year INTEGER NOT NULL,
                start_date DATE,
                end_date DATE,
                is_active BOOLEAN DEFAULT TRUE,
                is_approved BOOLEAN DEFAULT FALSE,
                approved_by INTEGER,
                approved_at TIMESTAMP,
                created_by INTEGER,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP
            )
        """)
        # Add columns that may be missing from older schema
        for col, coltype in [
            ('name', 'VARCHAR(255)'),
            ('description', 'TEXT'),
            ('start_date', 'DATE'),
            ('end_date', 'DATE'),
            ('is_active', 'BOOLEAN DEFAULT TRUE'),
            ('is_approved', 'BOOLEAN DEFAULT FALSE'),
            ('approved_by', 'INTEGER'),
            ('approved_at', 'TIMESTAMP'),
            ('created_by', 'INTEGER'),
            ('updated_at', 'TIMESTAMP'),
        ]:
            try:
                cur.execute(f"ALTER TABLE budgets ADD COLUMN IF NOT EXISTS {col} {coltype}")
            except Exception:
                pass

        # Budget items table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS budget_items (
                id SERIAL PRIMARY KEY,
                budget_id INTEGER REFERENCES budgets(id) ON DELETE CASCADE,
                income_category_id INTEGER,
                expense_category_id INTEGER,
                is_income BOOLEAN DEFAULT FALSE,
                annual_amount DECIMAL(12,2) DEFAULT 0,
                jan_amount DECIMAL(12,2) DEFAULT 0,
                feb_amount DECIMAL(12,2) DEFAULT 0,
                mar_amount DECIMAL(12,2) DEFAULT 0,
                apr_amount DECIMAL(12,2) DEFAULT 0,
                may_amount DECIMAL(12,2) DEFAULT 0,
                jun_amount DECIMAL(12,2) DEFAULT 0,
                jul_amount DECIMAL(12,2) DEFAULT 0,
                aug_amount DECIMAL(12,2) DEFAULT 0,
                sep_amount DECIMAL(12,2) DEFAULT 0,
                oct_amount DECIMAL(12,2) DEFAULT 0,
                nov_amount DECIMAL(12,2) DEFAULT 0,
                dec_amount DECIMAL(12,2) DEFAULT 0,
                notes TEXT
            )
        """)
        # Add columns that may be missing from older budget_items schema
        for col, coltype in [
            ('income_category_id', 'INTEGER'),
            ('expense_category_id', 'INTEGER'),
            ('is_income', 'BOOLEAN DEFAULT FALSE'),
            ('annual_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('jan_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('feb_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('mar_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('apr_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('may_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('jun_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('jul_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('aug_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('sep_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('oct_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('nov_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('dec_amount', 'DECIMAL(12,2) DEFAULT 0'),
            ('notes', 'TEXT'),
        ]:
            try:
                cur.execute(f"ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS {col} {coltype}")
            except Exception:
                pass
        
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

def get_allowed_origins():
    """Get allowed CORS origins from environment variable."""
    origins = os.environ.get('ALLOWED_ORIGINS', '')
    if origins:
        return [o.strip() for o in origins.split(',')]
    # Default: allow common Vercel and local origins
    return [
        'https://church-solar-app.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
    ]

def get_cors_origin(request_origin):
    """Return the origin if it's allowed, otherwise the default origin."""
    allowed = get_allowed_origins()
    if not request_origin:
        # Same-origin request (no Origin header) - allow it
        return allowed[0] if allowed else '*'
    if request_origin in allowed:
        return request_origin
    # Also allow any *.vercel.app subdomain for preview deployments
    if request_origin.endswith('.vercel.app'):
        return request_origin
    return ''

class handler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        request_origin = self.headers.get('Origin', '')
        origin = get_cors_origin(request_origin)
        if origin:
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Access-Control-Allow-Credentials', 'true')
        else:
            # Fallback: allow without credentials
            self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Vary', 'Origin')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def get_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length:
            try:
                return json.loads(self.rfile.read(content_length).decode())
            except (json.JSONDecodeError, UnicodeDecodeError):
                return None
        return {}

    def _require_church_id(self, query):
        """Extract church_id from query params. Returns (church_id, error_sent).
        If church_id is missing, sends a 400 error and returns (None, True)."""
        values = query.get('church_id', [])
        if not values or not values[0]:
            return None, True
        return values[0], False

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
        # DB mode: look up user from session token
        try:
            conn = get_db()
            cur = get_dict_cursor(conn)
            cur.execute("SELECT u.* FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.token = %s", (token,))
            user = cur.fetchone()
            cur.close()
            conn.close()
            return dict(user) if user else None
        except Exception:
            return None

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
            if path in ['', '/api', '/api/v1', '/api/v1/health']:
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
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                cur.execute("""
                    SELECT * FROM solar_assessments 
                    WHERE church_id = %s 
                    ORDER BY created_at DESC
                """, (church_id,))
                assessments = cur.fetchall()
                self.send_json([dict(a) for a in assessments])
            
            # List Members
            elif path == '/api/v1/members':
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                cur.execute("""
                    SELECT id, first_name, last_name, email, phone, member_status,
                           first_name || ' ' || last_name as full_name
                    FROM members 
                    WHERE church_id = %s
                    ORDER BY last_name, first_name
                """, (church_id,))
                members = cur.fetchall()
                self.send_json({"members": [dict(m) for m in members], "total": len(members)})
            
            # Members Summary (for dropdowns)
            elif path == '/api/v1/members/summary':
                # Always prefer query params (frontend sends them); fall back to auth user
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    user = self.get_auth_user()
                    church_id = user.get('church_id') if user else None
                if not church_id:
                    self.send_json([], 200)  # Return empty list instead of 400
                    cur.close()
                    conn.close()
                    return
                cur.execute("""
                    SELECT id, first_name, last_name
                    FROM members 
                    WHERE church_id = %s AND member_status = 'active'
                    ORDER BY last_name, first_name
                """, (church_id,))
                members = cur.fetchall()
                self.send_json([dict(m) for m in members])
            
            # List users in church (admin only)
            elif path == '/api/v1/users':
                auth_user = self.get_auth_user()
                if not auth_user:
                    self.send_json({"error": "Authentication required"}, 401)
                elif auth_user['role'] not in ('admin', 'super_admin'):
                    self.send_json({"error": "Admin access required"}, 403)
                else:
                    cur.execute("""
                        SELECT id, email, first_name, last_name, role, is_active, created_at
                        FROM users WHERE church_id = %s ORDER BY first_name, last_name
                    """, (auth_user['church_id'],))
                    rows = cur.fetchall()
                    self.send_json([dict(r) for r in rows])

            # Current user profile
            elif path == '/api/v1/users/me':
                user = self.get_auth_user()
                if not user:
                    self.send_json({"error": "Authentication required"}, 401)
                else:
                    cur.execute("""
                        SELECT u.id, u.email, u.first_name, u.last_name, u.role,
                               u.church_id, u.is_active, u.created_at,
                               c.name AS church_name
                        FROM users u
                        LEFT JOIN churches c ON c.id = u.church_id
                        WHERE u.id = %s
                    """, (user['id'],))
                    u = cur.fetchone()
                    self.send_json(dict(u) if u else {"error": "User not found"}, 200 if u else 404)

            # ── PLATFORM / GOD'S EYE ENDPOINTS ──────────────────────────
            elif path == '/api/v1/platform/overview':
                user = self.get_auth_user()
                if not user or user.get('role') != 'super_admin':
                    self.send_json({"error": "Super admin access required"}, 403)
                else:
                    from datetime import date
                    today = date.today()
                    month_start = today.replace(day=1).isoformat()
                    year_start  = today.replace(month=1, day=1).isoformat()

                    cur.execute("SELECT COUNT(*) AS n FROM churches")
                    total_churches = cur.fetchone()['n']

                    cur.execute("SELECT COUNT(*) AS n FROM users WHERE role != 'super_admin'")
                    total_users = cur.fetchone()['n']

                    cur.execute("SELECT COUNT(*) AS n FROM members")
                    total_members = cur.fetchone()['n']

                    cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM income_entries WHERE date >= %s", (month_start,))
                    income_mtd = float(cur.fetchone()['t'])

                    cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM expense_entries WHERE date >= %s", (month_start,))
                    expenses_mtd = float(cur.fetchone()['t'])

                    cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM income_entries WHERE date >= %s", (year_start,))
                    income_ytd = float(cur.fetchone()['t'])

                    cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM expense_entries WHERE date >= %s", (year_start,))
                    expenses_ytd = float(cur.fetchone()['t'])

                    self.send_json({
                        "total_churches": total_churches,
                        "total_users": total_users,
                        "total_members": total_members,
                        "income_mtd": income_mtd,
                        "expenses_mtd": expenses_mtd,
                        "net_mtd": income_mtd - expenses_mtd,
                        "income_ytd": income_ytd,
                        "expenses_ytd": expenses_ytd,
                        "net_ytd": income_ytd - expenses_ytd,
                    })

            elif path == '/api/v1/platform/churches':
                user = self.get_auth_user()
                if not user or user.get('role') != 'super_admin':
                    self.send_json({"error": "Super admin access required"}, 403)
                else:
                    from datetime import date
                    today = date.today()
                    month_start = today.replace(day=1).isoformat()
                    year_start  = today.replace(month=1, day=1).isoformat()

                    cur.execute("SELECT id, name, city, country, created_at FROM churches ORDER BY name")
                    churches_raw = cur.fetchall()
                    result = []
                    for c in churches_raw:
                        ch = dict(c)
                        cid = ch['id']

                        cur.execute("SELECT COUNT(*) AS n FROM members WHERE church_id=%s", (cid,))
                        ch['member_count'] = cur.fetchone()['n']

                        cur.execute("SELECT COUNT(*) AS n FROM users WHERE church_id=%s AND role!='super_admin'", (cid,))
                        ch['user_count'] = cur.fetchone()['n']

                        cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM income_entries WHERE church_id=%s AND date>=%s", (cid, month_start))
                        ch['income_mtd'] = float(cur.fetchone()['t'])

                        cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM expense_entries WHERE church_id=%s AND date>=%s", (cid, month_start))
                        ch['expenses_mtd'] = float(cur.fetchone()['t'])

                        ch['net_mtd'] = ch['income_mtd'] - ch['expenses_mtd']

                        cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM income_entries WHERE church_id=%s AND date>=%s", (cid, year_start))
                        ch['income_ytd'] = float(cur.fetchone()['t'])

                        cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM expense_entries WHERE church_id=%s AND date>=%s", (cid, year_start))
                        ch['expenses_ytd'] = float(cur.fetchone()['t'])

                        ch['net_ytd'] = ch['income_ytd'] - ch['expenses_ytd']
                        result.append(ch)
                    self.send_json(result)

            elif path.startswith('/api/v1/platform/church/'):
                user = self.get_auth_user()
                if not user or user.get('role') != 'super_admin':
                    self.send_json({"error": "Super admin access required"}, 403)
                else:
                    parts = path.split('/')
                    # /api/v1/platform/church/{id}/summary|income|expenses|income-statement
                    church_id = parts[5] if len(parts) > 5 else None
                    sub = parts[6] if len(parts) > 6 else 'summary'

                    if not church_id:
                        self.send_json({"error": "church_id required"}, 400)
                    elif sub == 'summary':
                        from datetime import date
                        today = date.today()
                        month_start = today.replace(day=1).isoformat()
                        year_start  = today.replace(month=1, day=1).isoformat()

                        cur.execute("SELECT id, name, city, country, created_at FROM churches WHERE id=%s", (church_id,))
                        church = cur.fetchone()
                        if not church:
                            self.send_json({"error": "Church not found"}, 404)
                        else:
                            ch = dict(church)
                            cur.execute("SELECT COUNT(*) AS n FROM members WHERE church_id=%s", (church_id,))
                            ch['member_count'] = cur.fetchone()['n']
                            cur.execute("SELECT COUNT(*) AS n FROM users WHERE church_id=%s", (church_id,))
                            ch['user_count'] = cur.fetchone()['n']
                            cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM income_entries WHERE church_id=%s AND date>=%s", (church_id, month_start))
                            ch['income_mtd'] = float(cur.fetchone()['t'])
                            cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM expense_entries WHERE church_id=%s AND date>=%s", (church_id, month_start))
                            ch['expenses_mtd'] = float(cur.fetchone()['t'])
                            ch['net_mtd'] = ch['income_mtd'] - ch['expenses_mtd']
                            cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM income_entries WHERE church_id=%s AND date>=%s", (church_id, year_start))
                            ch['income_ytd'] = float(cur.fetchone()['t'])
                            cur.execute("SELECT COALESCE(SUM(amount),0) AS t FROM expense_entries WHERE church_id=%s AND date>=%s", (church_id, year_start))
                            ch['expenses_ytd'] = float(cur.fetchone()['t'])
                            ch['net_ytd'] = ch['income_ytd'] - ch['expenses_ytd']
                            self.send_json(ch)

                    elif sub == 'income':
                        start = query.get('start_date', [date.today().replace(day=1).isoformat() if True else ''])[0] if True else ''
                        end   = query.get('end_date', [date.today().isoformat()])[0]
                        from datetime import date as dt
                        if not start:
                            start = dt.today().replace(day=1).isoformat()
                        if not end:
                            end = dt.today().isoformat()
                        cur.execute("""
                            SELECT ie.id, ie.amount, ie.date, ie.payment_method, ie.description,
                                   ie.is_anonymous, ic.name AS category
                            FROM income_entries ie
                            LEFT JOIN income_categories ic ON ie.category_id = ic.id
                            WHERE ie.church_id=%s AND ie.date>=%s AND ie.date<=%s
                            ORDER BY ie.date DESC
                        """, (church_id, start, end))
                        rows = [dict(r) for r in cur.fetchall()]
                        self.send_json(rows)

                    elif sub == 'expenses':
                        start = query.get('start_date', [''])[0]
                        end   = query.get('end_date', [''])[0]
                        from datetime import date as dt
                        if not start:
                            start = dt.today().replace(day=1).isoformat()
                        if not end:
                            end = dt.today().isoformat()
                        cur.execute("""
                            SELECT ee.id, ee.amount, ee.date, ee.payment_method, ee.vendor, ee.description,
                                   ec.name AS category
                            FROM expense_entries ee
                            LEFT JOIN expense_categories ec ON ee.category_id = ec.id
                            WHERE ee.church_id=%s AND ee.date>=%s AND ee.date<=%s
                            ORDER BY ee.date DESC
                        """, (church_id, start, end))
                        rows = [dict(r) for r in cur.fetchall()]
                        self.send_json(rows)

                    elif sub == 'income-statement':
                        start = query.get('start_date', [''])[0]
                        end   = query.get('end_date', [''])[0]
                        from datetime import date as dt
                        if not start: start = dt.today().replace(month=1, day=1).isoformat()
                        if not end:   end   = dt.today().isoformat()

                        cur.execute("""
                            SELECT ic.name AS category, COALESCE(SUM(ie.amount),0) AS amount
                            FROM income_categories ic
                            LEFT JOIN income_entries ie ON ic.id=ie.category_id
                                AND ie.church_id=%s AND ie.date>=%s AND ie.date<=%s
                            WHERE ic.church_id=%s
                            GROUP BY ic.name HAVING COALESCE(SUM(ie.amount),0)>0
                            ORDER BY amount DESC
                        """, (church_id, start, end, church_id))
                        inc = cur.fetchall()
                        total_inc = sum(float(r['amount']) for r in inc)

                        cur.execute("""
                            SELECT ec.name AS category, COALESCE(SUM(ee.amount),0) AS amount
                            FROM expense_categories ec
                            LEFT JOIN expense_entries ee ON ec.id=ee.category_id
                                AND ee.church_id=%s AND ee.date>=%s AND ee.date<=%s
                            WHERE ec.church_id=%s
                            GROUP BY ec.name HAVING COALESCE(SUM(ee.amount),0)>0
                            ORDER BY amount DESC
                        """, (church_id, start, end, church_id))
                        exp = cur.fetchall()
                        total_exp = sum(float(r['amount']) for r in exp)

                        self.send_json({
                            "report_type": "Income Statement",
                            "period": {"start": start, "end": end},
                            "income": [{"category": r['category'], "amount": float(r['amount'])} for r in inc],
                            "expenses": [{"category": r['category'], "amount": float(r['amount'])} for r in exp],
                            "summary": {
                                "total_income": total_inc,
                                "total_expenses": total_exp,
                                "net_income": total_inc - total_exp,
                            }
                        })
                    else:
                        self.send_json({"error": "Unknown sub-resource"}, 404)
            # ── END PLATFORM ENDPOINTS ────────────────────────────────────

            # List Churches
            elif path == '/api/v1/churches':
                cur.execute("SELECT * FROM churches ORDER BY name")
                churches = cur.fetchall()
                self.send_json([dict(c) for c in churches])
            
            # Finance Summary - Real database query
            elif path == '/api/v1/finance/summary':
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                
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
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return

                # Get income by category from real data
                cur.execute("""
                    SELECT ic.name as category, COALESCE(SUM(ie.amount), 0) as amount
                    FROM income_categories ic
                    LEFT JOIN income_entries ie ON ic.id = ie.category_id
                        AND ie.church_id = %s
                        AND ie.date >= %s AND ie.date <= %s
                    WHERE ic.church_id = %s
                    GROUP BY ic.name
                    HAVING COALESCE(SUM(ie.amount), 0) > 0
                    ORDER BY amount DESC
                """, (church_id, start_date, end_date, church_id))
                income_rows = cur.fetchall()
                total_income = sum(float(r['amount']) for r in income_rows)

                # Get expenses by category from real data
                cur.execute("""
                    SELECT ec.name as category, COALESCE(SUM(ee.amount), 0) as amount
                    FROM expense_categories ec
                    LEFT JOIN expense_entries ee ON ec.id = ee.category_id
                        AND ee.church_id = %s
                        AND ee.date >= %s AND ee.date <= %s
                    WHERE ec.church_id = %s
                    GROUP BY ec.name
                    HAVING COALESCE(SUM(ee.amount), 0) > 0
                    ORDER BY amount DESC
                """, (church_id, start_date, end_date, church_id))
                expense_rows = cur.fetchall()
                total_expenses = sum(float(r['amount']) for r in expense_rows)

                income_list = [
                    {"category": r['category'], "amount": float(r['amount']),
                     "percentage": round(float(r['amount']) / total_income * 100) if total_income > 0 else 0}
                    for r in income_rows
                ]
                expense_list = [
                    {"category": r['category'], "amount": float(r['amount']),
                     "percentage": round(float(r['amount']) / total_expenses * 100) if total_expenses > 0 else 0}
                    for r in expense_rows
                ]
                net_income = total_income - total_expenses

                self.send_json({
                    "report_type": "Income Statement",
                    "generated_at": datetime.now().isoformat(),
                    "period": {
                        "start": start_date,
                        "end": end_date
                    },
                    "currency": "ZAR",
                    "income": income_list,
                    "expenses": expense_list,
                    "net_income": net_income,
                    "summary": {
                        "total_income": total_income,
                        "total_expenses": total_expenses,
                        "net_income": net_income,
                        "margin_percentage": round(net_income / total_income * 100) if total_income > 0 else 0
                    }
                })
            
            # Reports - Monthly Comparison
            elif path == '/api/v1/reports/monthly-comparison':
                year = int(query.get('year', ['2026'])[0])
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return

                months = []
                month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

                for i in range(1, 13):
                    month_name = month_names[i-1]
                    # Calculate last day of month
                    if i == 12:
                        next_month_start = f"{year + 1}-01-01"
                    else:
                        next_month_start = f"{year}-{i+1:02d}-01"
                    month_start = f"{year}-{i:02d}-01"

                    # Get actual income for this month
                    cur.execute("""
                        SELECT COALESCE(SUM(amount), 0) as total
                        FROM income_entries
                        WHERE church_id = %s AND date >= %s AND date < %s
                    """, (church_id, month_start, next_month_start))
                    month_income = float(cur.fetchone()['total'])

                    # Get actual expenses for this month
                    cur.execute("""
                        SELECT COALESCE(SUM(amount), 0) as total
                        FROM expense_entries
                        WHERE church_id = %s AND date >= %s AND date < %s
                    """, (church_id, month_start, next_month_start))
                    month_expenses = float(cur.fetchone()['total'])

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
                    "api_version": "2.5.0",
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
                start_date = query.get('start_date', ['2026-01-01'])[0]
                end_date = query.get('end_date', ['2026-12-31'])[0]
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                tx_type = query.get('transaction_type', ['all'])[0]

                self.send_response(200)
                self.send_header('Content-type', 'text/csv')
                self.send_header('Content-Disposition', f'attachment; filename="transactions_{start_date}_{end_date}.csv"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                csv_content = "Date,Type,Category,Description,Amount\n"

                if tx_type in ('all', 'income'):
                    cur.execute("""
                        SELECT ie.date, ic.name as category, ie.description, ie.amount
                        FROM income_entries ie
                        LEFT JOIN income_categories ic ON ie.category_id = ic.id
                        WHERE ie.church_id = %s AND ie.date >= %s AND ie.date <= %s
                        ORDER BY ie.date
                    """, (church_id, start_date, end_date))
                    for row in cur.fetchall():
                        desc = (row['description'] or '').replace(',', ' ')
                        csv_content += f"{row['date']},Income,{row['category']},{desc},{row['amount']}\n"

                if tx_type in ('all', 'expense'):
                    cur.execute("""
                        SELECT ee.date, ec.name as category, ee.description, ee.amount
                        FROM expense_entries ee
                        LEFT JOIN expense_categories ec ON ee.category_id = ec.id
                        WHERE ee.church_id = %s AND ee.date >= %s AND ee.date <= %s
                        ORDER BY ee.date
                    """, (church_id, start_date, end_date))
                    for row in cur.fetchall():
                        desc = (row['description'] or '').replace(',', ' ')
                        csv_content += f"{row['date']},Expense,{row['category']},{desc},{row['amount']}\n"

                self.wfile.write(csv_content.encode())
                return
            
            # Finance - Income Categories
            elif path == '/api/v1/finance/income-categories':
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                cur.execute("SELECT * FROM income_categories WHERE church_id = %s ORDER BY sort_order", (church_id,))
                categories = cur.fetchall()
                if not categories:
                    # Auto-seed default income categories into the database
                    default_income = [
                        ('Tithes', True, 1), ('First Fruits', True, 2), ('Regular Seed', True, 3),
                        ('Alms', True, 4), ('Special Seed', True, 5), ('Offerings', True, 6),
                        ('Missions', True, 7), ('Building Fund', True, 8), ('Other Income', True, 99),
                    ]
                    for name, tax_ded, sort_order in default_income:
                        cur.execute(
                            "INSERT INTO income_categories (name, church_id, is_tax_deductible, sort_order) VALUES (%s, %s, %s, %s)",
                            (name, church_id, tax_ded, sort_order)
                        )
                    conn.commit()
                    cur.execute("SELECT * FROM income_categories WHERE church_id = %s ORDER BY sort_order", (church_id,))
                    categories = cur.fetchall()
                self.send_json([dict(c) for c in categories])
            
            # Finance - Expense Categories
            elif path == '/api/v1/finance/expense-categories':
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                cur.execute("SELECT * FROM expense_categories WHERE church_id = %s ORDER BY sort_order", (church_id,))
                categories = cur.fetchall()
                # If fewer than 10 categories, auto-seed comprehensive list into the database
                if not categories or len(categories) < 10:
                    # Delete any existing sparse categories first
                    cur.execute("DELETE FROM expense_categories WHERE church_id = %s", (church_id,))
                    comprehensive = [
                        ('Senior Pastor Salary', 1), ('Associate Pastor Salary', 2), ('Staff Salaries', 3),
                        ('Payroll Taxes & UIF', 4), ('Staff Benefits', 5), ('Housing Allowance', 6), ('Transport Allowance', 7),
                        ('Rent/Mortgage', 10), ('Electricity', 11), ('Water & Rates', 12), ('Security', 13),
                        ('Cleaning & Maintenance', 14), ('Repairs & Renovations', 15), ('Insurance', 16), ('Garden & Grounds', 17),
                        ('Office Supplies', 20), ('Printing & Stationery', 21), ('Telephone & Internet', 22),
                        ('Postage & Courier', 23), ('Bank Charges', 24), ('Accounting & Audit', 25),
                        ('Legal Fees', 26), ('Software & Subscriptions', 27),
                        ('Youth Ministry Expenses', 30), ('Children Ministry Expenses', 31), ('Women Ministry Expenses', 32),
                        ('Men Ministry Expenses', 33), ('Small Groups & Cell Ministry', 34), ('Discipleship & Training', 35),
                        ('Worship Equipment', 40), ('Sound & AV Equipment', 41), ('Music Licensing (CCLI)', 42),
                        ('Livestream & Media', 43), ('Website & Social Media', 44),
                        ('Missions Support', 50), ('Outreach Programs', 51), ('Evangelism Materials', 52), ('Community Projects', 53),
                        ('Benevolence - Members', 60), ('Benevolence - Community', 61), ('Funeral Assistance', 62), ('Food Parcels & Relief', 63),
                        ('Church Events', 70), ('Conferences & Seminars', 71), ('Hospitality & Catering', 72), ('Guest Speakers', 73),
                        ('Vehicle Expenses', 80), ('Fuel', 81), ('Travel & Accommodation', 82),
                        ('Denominational Dues', 90), ('Books & Resources', 91), ('Miscellaneous Expenses', 99),
                    ]
                    for name, sort_order in comprehensive:
                        cur.execute(
                            "INSERT INTO expense_categories (name, church_id, sort_order) VALUES (%s, %s, %s)",
                            (name, church_id, sort_order)
                        )
                    conn.commit()
                    cur.execute("SELECT * FROM expense_categories WHERE church_id = %s ORDER BY sort_order", (church_id,))
                    categories = cur.fetchall()
                self.send_json([dict(c) for c in categories])
            
            # Finance - Income entries (filtered by church_id)
            elif path == '/api/v1/finance/income':
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
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
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                cur.execute("""
                    SELECT ee.*, ec.name as category_name 
                    FROM expense_entries ee 
                    LEFT JOIN expense_categories ec ON ee.category_id = ec.id 
                    WHERE ee.church_id = %s
                    ORDER BY ee.date DESC
                """, (church_id,))
                entries = cur.fetchall()
                self.send_json([dict(e) for e in entries] if entries else [])
            
            # Admin: Seed comprehensive expense categories (GET for easy testing)
            elif path == '/api/v1/admin/seed-categories':
                # Require admin authentication
                auth_header = self.headers.get('Authorization', '')
                if not auth_header.startswith('Bearer '):
                    self.send_json({"error": "Authentication required"}, 401)
                    cur.close()
                    conn.close()
                    return

                # Verify user is admin
                token = auth_header[7:]
                cur.execute("SELECT role FROM users WHERE id = (SELECT user_id FROM sessions WHERE token = %s)", (token,))
                auth_user = cur.fetchone()
                if not auth_user or auth_user['role'] != 'admin':
                    self.send_json({"error": "Admin access required"}, 403)
                    cur.close()
                    conn.close()
                    return

                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return

                # Comprehensive expense categories
                comprehensive_categories = [
                    ('Senior Pastor Salary', 1), ('Associate Pastor Salary', 2), ('Staff Salaries', 3),
                    ('Payroll Taxes & UIF', 4), ('Staff Benefits', 5), ('Housing Allowance', 6), ('Transport Allowance', 7),
                    ('Rent/Mortgage', 10), ('Electricity', 11), ('Water & Rates', 12), ('Security', 13),
                    ('Cleaning & Maintenance', 14), ('Repairs & Renovations', 15), ('Insurance', 16), ('Garden & Grounds', 17),
                    ('Office Supplies', 20), ('Printing & Stationery', 21), ('Telephone & Internet', 22),
                    ('Postage & Courier', 23), ('Bank Charges', 24), ('Accounting & Audit', 25),
                    ('Legal Fees', 26), ('Software & Subscriptions', 27),
                    ('Youth Ministry Expenses', 30), ('Children Ministry Expenses', 31), ('Women Ministry Expenses', 32),
                    ('Men Ministry Expenses', 33), ('Small Groups & Cell Ministry', 34), ('Discipleship & Training', 35),
                    ('Worship Equipment', 40), ('Sound & AV Equipment', 41), ('Music Licensing (CCLI)', 42),
                    ('Livestream & Media', 43), ('Website & Social Media', 44),
                    ('Missions Support', 50), ('Outreach Programs', 51), ('Evangelism Materials', 52), ('Community Projects', 53),
                    ('Benevolence - Members', 60), ('Benevolence - Community', 61), ('Funeral Assistance', 62), ('Food Parcels & Relief', 63),
                    ('Church Events', 70), ('Conferences & Seminars', 71), ('Hospitality & Catering', 72), ('Guest Speakers', 73),
                    ('Vehicle Expenses', 80), ('Fuel', 81), ('Travel & Accommodation', 82),
                    ('Denominational Dues', 90), ('Books & Resources', 91), ('Miscellaneous Expenses', 99),
                ]

                # Clear existing and insert new
                cur.execute("DELETE FROM expense_categories WHERE church_id = %s", (church_id,))
                for name, sort_order in comprehensive_categories:
                    cur.execute("INSERT INTO expense_categories (name, church_id, sort_order) VALUES (%s, %s, %s)", (name, church_id, sort_order))
                conn.commit()

                self.send_json({"message": f"Seeded {len(comprehensive_categories)} categories for church {church_id}", "count": len(comprehensive_categories)})

            # Finance - Budget list
            elif path == '/api/v1/finance/budgets':
                church_id = query.get('church_id', [None])[0]
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                year = query.get('year', [None])[0]

                if year:
                    cur.execute("""
                        SELECT * FROM budgets
                        WHERE church_id = %s AND year = %s
                        ORDER BY year DESC
                    """, (church_id, year))
                else:
                    cur.execute("""
                        SELECT * FROM budgets
                        WHERE church_id = %s
                        ORDER BY year DESC
                    """, (church_id,))

                budgets_raw = cur.fetchall()
                result = []
                for b in budgets_raw:
                    budget = dict(b)
                    # Get items for this budget
                    cur.execute("SELECT * FROM budget_items WHERE budget_id = %s", (budget['id'],))
                    items = [dict(item) for item in cur.fetchall()]
                    # Resolve category names
                    for item in items:
                        if item.get('income_category_id'):
                            cur.execute("SELECT name FROM income_categories WHERE id = %s", (item['income_category_id'],))
                            cat = cur.fetchone()
                            item['category_name'] = cat['name'] if cat else None
                        elif item.get('expense_category_id'):
                            cur.execute("SELECT name FROM expense_categories WHERE id = %s", (item['expense_category_id'],))
                            cat = cur.fetchone()
                            item['category_name'] = cat['name'] if cat else None
                    budget['items'] = items
                    result.append(budget)
                self.send_json(result)

            # Finance - Single budget
            elif '/api/v1/finance/budgets/' in path and path.split('/')[-1].isdigit():
                budget_id = path.split('/')[-1]
                cur.execute("SELECT * FROM budgets WHERE id = %s", (budget_id,))
                budget = cur.fetchone()
                if not budget:
                    self.send_json({"error": "Budget not found"}, 404)
                else:
                    budget = dict(budget)
                    cur.execute("SELECT * FROM budget_items WHERE budget_id = %s", (budget_id,))
                    items = [dict(item) for item in cur.fetchall()]
                    for item in items:
                        if item.get('income_category_id'):
                            cur.execute("SELECT name FROM income_categories WHERE id = %s", (item['income_category_id'],))
                            cat = cur.fetchone()
                            item['category_name'] = cat['name'] if cat else None
                        elif item.get('expense_category_id'):
                            cur.execute("SELECT name FROM expense_categories WHERE id = %s", (item['expense_category_id'],))
                            cat = cur.fetchone()
                            item['category_name'] = cat['name'] if cat else None
                    budget['items'] = items
                    self.send_json(budget)
            
            else:
                self.send_json({"error": "Not found", "path": path}, 404)
            
            cur.close()
            conn.close()
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"GET Error: {str(e)}\n{error_trace}")
            self.send_json({"error": "An internal server error occurred"}, 500)
            try:
                if conn:
                    conn.close()
            except:
                pass
    
    def do_POST(self):
        path = self.path.split('?')[0].rstrip('/')
        data = self.get_body()

        if data is None:
            self.send_json({"error": "Invalid JSON in request body"}, 400)
            return
        
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
            
            # Admin: create a new user in the church
            if path == '/api/v1/users':
                auth_user = self.get_auth_user()
                if not auth_user:
                    self.send_json({"error": "Authentication required"}, 401)
                elif auth_user['role'] not in ('admin', 'super_admin'):
                    self.send_json({"error": "Admin access required"}, 403)
                else:
                    email = data.get('email', '').strip().lower()
                    password = data.get('password', '')
                    first_name = data.get('first_name', '').strip()
                    last_name = data.get('last_name', '').strip()
                    role = data.get('role', 'member')
                    if not all([email, password, first_name, last_name]):
                        self.send_json({"error": "Email, password, first name and last name are required"}, 400)
                    elif role not in ('admin', 'finance', 'leader', 'member'):
                        self.send_json({"error": "Invalid role"}, 400)
                    elif len(password) < 6:
                        self.send_json({"error": "Password must be at least 6 characters"}, 400)
                    else:
                        try:
                            password_hash = hash_password(password)
                            cur.execute("""
                                INSERT INTO users (email, password_hash, first_name, last_name, role, church_id)
                                VALUES (%s, %s, %s, %s, %s, %s)
                                RETURNING id, email, first_name, last_name, role, church_id, is_active, created_at
                            """, (email, password_hash, first_name, last_name, role, auth_user['church_id']))
                            conn.commit()
                            new_user = cur.fetchone()
                            self.send_json(dict(new_user), 201)
                        except Exception as e:
                            conn.rollback()
                            if 'duplicate key' in str(e) and 'email' in str(e):
                                self.send_json({"error": "A user with this email already exists"}, 409)
                            else:
                                self.send_json({"error": str(e)}, 500)

            # Login
            elif path == '/api/v1/auth/login':
                email = data.get('email', '').strip().lower()
                password = data.get('password', '')

                cur.execute("""
                    SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name,
                           u.role, u.church_id, u.is_active, c.name AS church_name
                    FROM users u
                    LEFT JOIN churches c ON c.id = u.church_id
                    WHERE LOWER(u.email) = %s
                """, (email,))
                user = cur.fetchone()

                if user and user['is_active'] and verify_password(password, user['password_hash']):
                    token = secrets.token_hex(32)
                    refresh = secrets.token_hex(32)
                    cur.execute(
                        "INSERT INTO sessions (token, user_id) VALUES (%s, %s)",
                        (token, user['id'])
                    )
                    conn.commit()
                    user_data = dict(user)
                    del user_data['password_hash']
                    self.send_json({
                        "access_token": token,
                        "refresh_token": refresh,
                        "token_type": "bearer",
                        "user": user_data
                    })
                else:
                    self.send_json({"error": "Invalid email or password"}, 401)
            
            # Register
            elif path == '/api/v1/auth/register':
                email = data.get('email', '')
                password = data.get('password', '')
                if not email or not password:
                    self.send_json({"error": "Email and password are required"}, 400)
                    cur.close()
                    conn.close()
                    return
                if len(password) < 8:
                    self.send_json({"error": "Password must be at least 8 characters"}, 400)
                    cur.close()
                    conn.close()
                    return
                password_hashed = hash_password(password)
                church_name = data.get('church_name', 'My Church')
                
                # Create church first
                cur.execute("""
                    INSERT INTO churches (name, city, country)
                    VALUES (%s, %s, %s)
                    RETURNING id, name, city, country
                """, (church_name, '', 'South Africa'))
                church = cur.fetchone()
                church_id = church['id']
                
                # Seed default income categories for the new church
                income_categories = [
                    ('Tithes', True, 1), ('First Fruits', True, 2), ('Regular Seed', True, 3),
                    ('Alms', True, 4), ('Special Seed', True, 5), ('Offerings', True, 6),
                    ('Missions', True, 7), ('Building Fund', True, 8), ('Other Income', True, 99),
                ]
                for name, tax_ded, sort_order in income_categories:
                    cur.execute("""
                        INSERT INTO income_categories (name, church_id, is_tax_deductible, sort_order)
                        VALUES (%s, %s, %s, %s)
                    """, (name, church_id, tax_ded, sort_order))
                
                # Seed comprehensive expense categories for the new church
                expense_categories = [
                    ('Senior Pastor Salary', 1), ('Associate Pastor Salary', 2), ('Staff Salaries', 3),
                    ('Payroll Taxes & UIF', 4), ('Staff Benefits', 5), ('Housing Allowance', 6), ('Transport Allowance', 7),
                    ('Rent/Mortgage', 10), ('Electricity', 11), ('Water & Rates', 12), ('Security', 13),
                    ('Cleaning & Maintenance', 14), ('Repairs & Renovations', 15), ('Insurance', 16), ('Garden & Grounds', 17),
                    ('Office Supplies', 20), ('Printing & Stationery', 21), ('Telephone & Internet', 22),
                    ('Postage & Courier', 23), ('Bank Charges', 24), ('Accounting & Audit', 25),
                    ('Legal Fees', 26), ('Software & Subscriptions', 27),
                    ('Youth Ministry Expenses', 30), ('Children Ministry Expenses', 31), ('Women Ministry Expenses', 32),
                    ('Men Ministry Expenses', 33), ('Small Groups & Cell Ministry', 34), ('Discipleship & Training', 35),
                    ('Worship Equipment', 40), ('Sound & AV Equipment', 41), ('Music Licensing (CCLI)', 42),
                    ('Livestream & Media', 43), ('Website & Social Media', 44),
                    ('Missions Support', 50), ('Outreach Programs', 51), ('Evangelism Materials', 52), ('Community Projects', 53),
                    ('Benevolence - Members', 60), ('Benevolence - Community', 61), ('Funeral Assistance', 62), ('Food Parcels & Relief', 63),
                    ('Church Events', 70), ('Conferences & Seminars', 71), ('Hospitality & Catering', 72), ('Guest Speakers', 73),
                    ('Vehicle Expenses', 80), ('Fuel', 81), ('Travel & Accommodation', 82),
                    ('Denominational Dues', 90), ('Books & Resources', 91), ('Miscellaneous Expenses', 99),
                ]
                for name, sort_order in expense_categories:
                    cur.execute("""
                        INSERT INTO expense_categories (name, church_id, sort_order)
                        VALUES (%s, %s, %s)
                    """, (name, church_id, sort_order))
                
                # Create user
                cur.execute("""
                    INSERT INTO users (email, password_hash, first_name, last_name, role, church_id)
                    VALUES (%s, %s, %s, %s, 'admin', %s)
                    RETURNING id, email, first_name, last_name, role, church_id, is_active
                """, (email, password_hashed, data.get('first_name', ''), data.get('last_name', ''), church_id))
                user = cur.fetchone()
                conn.commit()
                
                # Generate token, persist session, and return
                token = secrets.token_urlsafe(32)
                cur.execute(
                    "INSERT INTO sessions (token, user_id) VALUES (%s, %s)",
                    (token, user['id'])
                )
                conn.commit()
                self.send_json({
                    "access_token": token,
                    "token_type": "bearer",
                    "user": dict(user),
                    "church": dict(church)
                })
            
            # Create Assessment
            elif path == '/api/v1/solar/assessments':
                church_id = data.get('church_id')
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
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
                church_id = data.get('church_id')
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                category_id = data.get('category_id')
                amount = data.get('amount', 0)
                try:
                    amount = float(amount)
                except (TypeError, ValueError):
                    self.send_json({"error": "Invalid amount"}, 400)
                    cur.close()
                    conn.close()
                    return
                if amount <= 0 or amount > 999999999.99:
                    self.send_json({"error": "Amount must be between 0.01 and 999,999,999.99"}, 400)
                    cur.close()
                    conn.close()
                    return
                if not category_id:
                    self.send_json({"error": "category_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
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
                church_id = data.get('church_id')
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                category_id = data.get('category_id')
                amount = data.get('amount', 0)
                try:
                    amount = float(amount)
                except (TypeError, ValueError):
                    self.send_json({"error": "Invalid amount"}, 400)
                    cur.close()
                    conn.close()
                    return
                if amount <= 0 or amount > 999999999.99:
                    self.send_json({"error": "Amount must be between 0.01 and 999,999,999.99"}, 400)
                    cur.close()
                    conn.close()
                    return
                if not category_id:
                    self.send_json({"error": "category_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                description = data.get('description', '')
                date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
                
                # Auto-approve when admin or finance user records the expense
                auth_user = self.get_auth_user()
                auto_approve = auth_user and auth_user.get('role') in ('admin', 'finance')
                cur.execute("""
                    INSERT INTO expense_entries (church_id, category_id, amount, description, date, is_approved)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING *
                """, (church_id, category_id, amount, description, date, auto_approve))
                entry = cur.fetchone()
                conn.commit()
                self.send_json(dict(entry))
            
            # Seed comprehensive expense categories for a church
            elif path == '/api/v1/admin/seed-expense-categories':
                # Require admin authentication
                auth_header = self.headers.get('Authorization', '')
                if not auth_header.startswith('Bearer '):
                    self.send_json({"error": "Authentication required"}, 401)
                    cur.close()
                    conn.close()
                    return

                # Verify user is admin
                token = auth_header[7:]
                cur.execute("SELECT role FROM users WHERE id = (SELECT user_id FROM sessions WHERE token = %s)", (token,))
                auth_user = cur.fetchone()
                if not auth_user or auth_user['role'] != 'admin':
                    self.send_json({"error": "Admin access required"}, 403)
                    cur.close()
                    conn.close()
                    return

                church_id = data.get('church_id')
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return

                # Comprehensive expense categories for churches
                comprehensive_categories = [
                    ('Senior Pastor Salary', 1), ('Associate Pastor Salary', 2), ('Staff Salaries', 3),
                    ('Payroll Taxes & UIF', 4), ('Staff Benefits', 5), ('Housing Allowance', 6), ('Transport Allowance', 7),
                    ('Rent/Mortgage', 10), ('Electricity', 11), ('Water & Rates', 12), ('Security', 13),
                    ('Cleaning & Maintenance', 14), ('Repairs & Renovations', 15), ('Insurance', 16), ('Garden & Grounds', 17),
                    ('Office Supplies', 20), ('Printing & Stationery', 21), ('Telephone & Internet', 22),
                    ('Postage & Courier', 23), ('Bank Charges', 24), ('Accounting & Audit', 25),
                    ('Legal Fees', 26), ('Software & Subscriptions', 27),
                    ('Youth Ministry Expenses', 30), ('Children Ministry Expenses', 31), ('Women Ministry Expenses', 32),
                    ('Men Ministry Expenses', 33), ('Small Groups & Cell Ministry', 34), ('Discipleship & Training', 35),
                    ('Worship Equipment', 40), ('Sound & AV Equipment', 41), ('Music Licensing (CCLI)', 42),
                    ('Livestream & Media', 43), ('Website & Social Media', 44),
                    ('Missions Support', 50), ('Outreach Programs', 51), ('Evangelism Materials', 52), ('Community Projects', 53),
                    ('Benevolence - Members', 60), ('Benevolence - Community', 61), ('Funeral Assistance', 62), ('Food Parcels & Relief', 63),
                    ('Church Events', 70), ('Conferences & Seminars', 71), ('Hospitality & Catering', 72), ('Guest Speakers', 73),
                    ('Vehicle Expenses', 80), ('Fuel', 81), ('Travel & Accommodation', 82),
                    ('Denominational Dues', 90), ('Books & Resources', 91), ('Miscellaneous Expenses', 99),
                ]

                cur.execute("DELETE FROM expense_categories WHERE church_id = %s", (church_id,))
                for name, sort_order in comprehensive_categories:
                    cur.execute("""
                        INSERT INTO expense_categories (name, church_id, sort_order)
                        VALUES (%s, %s, %s)
                    """, (name, church_id, sort_order))

                conn.commit()
                self.send_json({
                    "message": f"Seeded {len(comprehensive_categories)} expense categories for church {church_id}",
                    "count": len(comprehensive_categories)
                })

            # Create Budget
            elif path == '/api/v1/finance/budgets':
                church_id = data.get('church_id')
                if not church_id:
                    self.send_json({"error": "church_id is required"}, 400)
                    cur.close()
                    conn.close()
                    return
                cur.execute("""
                    INSERT INTO budgets (church_id, name, description, year, start_date, end_date, is_active, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, TRUE, NOW())
                    RETURNING *
                """, (
                    church_id,
                    data.get('name', f"{data.get('year', 2026)} Annual Budget"),
                    data.get('description', ''),
                    data.get('year', 2026),
                    data.get('start_date'),
                    data.get('end_date'),
                ))
                budget = dict(cur.fetchone())

                # Create budget items
                items = data.get('items', [])
                budget_items = []
                for item in items:
                    cur.execute("""
                        INSERT INTO budget_items (budget_id, income_category_id, expense_category_id, is_income, annual_amount)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING *
                    """, (
                        budget['id'],
                        item.get('income_category_id'),
                        item.get('expense_category_id'),
                        item.get('is_income', False),
                        item.get('annual_amount', 0),
                    ))
                    bi = dict(cur.fetchone())
                    # Resolve category name
                    if bi.get('income_category_id'):
                        cur.execute("SELECT name FROM income_categories WHERE id = %s", (bi['income_category_id'],))
                        cat = cur.fetchone()
                        bi['category_name'] = cat['name'] if cat else None
                    elif bi.get('expense_category_id'):
                        cur.execute("SELECT name FROM expense_categories WHERE id = %s", (bi['expense_category_id'],))
                        cat = cur.fetchone()
                        bi['category_name'] = cat['name'] if cat else None
                    budget_items.append(bi)

                conn.commit()
                budget['items'] = budget_items
                self.send_json(budget, 201)

            # Add budget item
            elif '/api/v1/finance/budgets/' in path and path.endswith('/items'):
                budget_id = path.split('/')[-2]
                cur.execute("""
                    INSERT INTO budget_items (budget_id, income_category_id, expense_category_id, is_income, annual_amount)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING *
                """, (
                    budget_id,
                    data.get('income_category_id'),
                    data.get('expense_category_id'),
                    data.get('is_income', False),
                    data.get('annual_amount', 0),
                ))
                item = dict(cur.fetchone())
                if item.get('income_category_id'):
                    cur.execute("SELECT name FROM income_categories WHERE id = %s", (item['income_category_id'],))
                    cat = cur.fetchone()
                    item['category_name'] = cat['name'] if cat else None
                elif item.get('expense_category_id'):
                    cur.execute("SELECT name FROM expense_categories WHERE id = %s", (item['expense_category_id'],))
                    cat = cur.fetchone()
                    item['category_name'] = cat['name'] if cat else None
                conn.commit()
                self.send_json(item, 201)
            
            else:
                self.send_json({"error": "Not found", "path": path}, 404)
            
            cur.close()
            conn.close()
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"POST Error: {str(e)}\n{error_trace}")
            self.send_json({"error": "An internal server error occurred", "detail": str(e)}, 500)
            if conn:
                conn.rollback()
                conn.close()

    def do_PUT(self):
        path = self.path.split('?')[0].rstrip('/')
        data = self.get_body()

        if data is None:
            self.send_json({"error": "Invalid JSON in request body"}, 400)
            return
        
        conn = get_db()
        if not conn:
            self.send_json({"error": "Database not configured"}, 500)
            return
        
        try:
            cur = get_dict_cursor(conn)
            
            # Admin: update a user (role, active status, password reset)
            if re.match(r'^/api/v1/users/\d+$', path):
                user_id = int(path.split('/')[-1])
                auth_user = self.get_auth_user()
                if not auth_user:
                    self.send_json({"error": "Authentication required"}, 401)
                elif auth_user['role'] not in ('admin', 'super_admin'):
                    self.send_json({"error": "Admin access required"}, 403)
                else:
                    cur.execute("SELECT id, church_id FROM users WHERE id = %s", (user_id,))
                    target = cur.fetchone()
                    if not target or (auth_user['role'] != 'super_admin' and target['church_id'] != auth_user['church_id']):
                        self.send_json({"error": "User not found"}, 404)
                    else:
                        updates, values = [], []
                        if 'first_name' in data:
                            updates.append("first_name = %s"); values.append(data['first_name'])
                        if 'last_name' in data:
                            updates.append("last_name = %s"); values.append(data['last_name'])
                        if 'role' in data and data['role'] in ('admin', 'finance', 'leader', 'member'):
                            updates.append("role = %s"); values.append(data['role'])
                        if 'is_active' in data:
                            updates.append("is_active = %s"); values.append(bool(data['is_active']))
                        if 'password' in data and data['password']:
                            updates.append("password_hash = %s"); values.append(hash_password(data['password']))
                        if not updates:
                            self.send_json({"error": "No fields to update"}, 400)
                        else:
                            values.append(user_id)
                            cur.execute(
                                f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id, email, first_name, last_name, role, is_active",
                                tuple(values)
                            )
                            conn.commit()
                            updated = cur.fetchone()
                            self.send_json(dict(updated) if updated else {"error": "Update failed"})

            # Update Assessment Scores
            elif '/api/v1/solar/assessments/' in path and '/scores' in path:
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

            # Update budget item
            elif '/api/v1/finance/budgets/' in path and '/items/' in path:
                parts = path.split('/')
                item_id = parts[-1]
                cur.execute("""
                    UPDATE budget_items SET
                        income_category_id = %s,
                        expense_category_id = %s,
                        is_income = %s,
                        annual_amount = %s,
                        notes = %s
                    WHERE id = %s
                    RETURNING *
                """, (
                    data.get('income_category_id'),
                    data.get('expense_category_id'),
                    data.get('is_income', False),
                    data.get('annual_amount', 0),
                    data.get('notes'),
                    item_id,
                ))
                item = cur.fetchone()
                if not item:
                    self.send_json({"error": "Budget item not found"}, 404)
                else:
                    item = dict(item)
                    if item.get('income_category_id'):
                        cur.execute("SELECT name FROM income_categories WHERE id = %s", (item['income_category_id'],))
                        cat = cur.fetchone()
                        item['category_name'] = cat['name'] if cat else None
                    elif item.get('expense_category_id'):
                        cur.execute("SELECT name FROM expense_categories WHERE id = %s", (item['expense_category_id'],))
                        cat = cur.fetchone()
                        item['category_name'] = cat['name'] if cat else None
                    conn.commit()
                    self.send_json(item)

            # Approve / update expense entry
            elif re.match(r'^/api/v1/finance/expenses/\d+$', path):
                expense_id = int(path.split('/')[-1])
                auth_user = self.get_auth_user()
                if not auth_user:
                    self.send_json({"error": "Authentication required"}, 401)
                elif auth_user['role'] not in ('admin', 'finance'):
                    self.send_json({"error": "Admin or finance access required"}, 403)
                else:
                    cur.execute("SELECT id, church_id FROM expense_entries WHERE id = %s", (expense_id,))
                    entry = cur.fetchone()
                    if not entry or entry['church_id'] != auth_user['church_id']:
                        self.send_json({"error": "Expense not found"}, 404)
                    else:
                        updates, values = [], []
                        if 'is_approved' in data:
                            updates.append("is_approved = %s"); values.append(bool(data['is_approved']))
                        if 'amount' in data:
                            updates.append("amount = %s"); values.append(data['amount'])
                        if 'description' in data:
                            updates.append("description = %s"); values.append(data['description'])
                        if 'date' in data:
                            updates.append("date = %s"); values.append(data['date'])
                        if not updates:
                            self.send_json({"error": "No fields to update"}, 400)
                        else:
                            values.append(expense_id)
                            cur.execute(
                                f"UPDATE expense_entries SET {', '.join(updates)} WHERE id = %s RETURNING *",
                                tuple(values)
                            )
                            updated = cur.fetchone()
                            conn.commit()
                            self.send_json(dict(updated) if updated else {"error": "Update failed"})

            # Update budget
            elif '/api/v1/finance/budgets/' in path:
                budget_id = path.split('/')[-1]
                fields = []
                values = []
                for key in ('name', 'description', 'is_active', 'is_approved'):
                    if key in data:
                        fields.append(f"{key} = %s")
                        values.append(data[key])
                if fields:
                    fields.append("updated_at = NOW()")
                    values.append(budget_id)
                    cur.execute(f"UPDATE budgets SET {', '.join(fields)} WHERE id = %s RETURNING *", values)
                    budget = cur.fetchone()
                    conn.commit()
                    self.send_json(dict(budget) if budget else {"error": "Not found"})
                else:
                    self.send_json({"error": "No fields to update"}, 400)
            
            else:
                self.send_json({"error": "Not found", "path": path}, 404)
            
            cur.close()
            conn.close()
            
        except Exception as e:
            import traceback
            print(f"PUT Error: {str(e)}\n{traceback.format_exc()}")
            self.send_json({"error": "An internal server error occurred"}, 500)
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

            # Delete budget item
            elif '/api/v1/finance/budgets/' in path and '/items/' in path:
                item_id = path.split('/')[-1]
                cur.execute("DELETE FROM budget_items WHERE id = %s", (item_id,))
                conn.commit()
                self.send_json({"message": "Deleted"})

            # Delete budget (cascade deletes items)
            elif '/api/v1/finance/budgets/' in path:
                budget_id = path.split('/')[-1]
                cur.execute("DELETE FROM budget_items WHERE budget_id = %s", (budget_id,))
                cur.execute("DELETE FROM budgets WHERE id = %s", (budget_id,))
                conn.commit()
                self.send_json({"message": "Deleted"})
            
            else:
                self.send_json({"error": "Not found", "path": path}, 404)
            
            cur.close()
            conn.close()
            
        except Exception as e:
            import traceback
            print(f"DELETE Error: {str(e)}\n{traceback.format_exc()}")
            self.send_json({"error": "An internal server error occurred"}, 500)
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

            for user in DEMO_DATA['users']:
                if user['email'] == email and verify_password(password, user['password_hash']):
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
            password_hash = hash_password(password)
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
