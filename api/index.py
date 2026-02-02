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

def get_db():
    return None


def init_db():
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
            incomes = DEMO_DATA['incomes']
            expenses = DEMO_DATA['expenses']
            
            # January has data
            jan_income = sum(i['amount'] for i in incomes)
            jan_expenses = sum(e['amount'] for e in expenses)
            
            months = []
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            for i in range(12):
                if i == 0:  # January has demo data
                    months.append({
                        "month": month_names[i],
                        "month_number": i + 1,
                        "income": jan_income,
                        "expenses": jan_expenses,
                        "net": jan_income - jan_expenses
                    })
                else:
                    months.append({
                        "month": month_names[i],
                        "month_number": i + 1,
                        "income": 0,
                        "expenses": 0,
                        "net": 0
                    })
            
            self.send_json({
                "report_type": "Monthly Comparison",
                "year": year,
                "currency": "ZAR",
                "months": months,
                "totals": {
                    "income": jan_income,
                    "expenses": jan_expenses,
                    "net": jan_income - jan_expenses
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
