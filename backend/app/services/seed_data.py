"""
Seed data for initializing a new church with default categories.
"""
from sqlalchemy.orm import Session
from app.models.finance import IncomeCategory, ExpenseCategory


def seed_default_categories(db: Session, church_id: int):
    """
    Create default income and expense categories for a new church.
    """
    # Default Income Categories (aligned to requested seeds)
    income_categories = [
        {"name": "Tithes", "description": "Regular tithes from members", "is_tax_deductible": True, "sort_order": 1},
        {"name": "First Fruits", "description": "First fruits offerings", "is_tax_deductible": True, "sort_order": 2},
        {"name": "Regular Seed", "description": "General seed offerings", "is_tax_deductible": True, "sort_order": 3},
        {"name": "Alms", "description": "Alms and relief support", "is_tax_deductible": True, "sort_order": 4},
        {"name": "Special Seed", "description": "Special or sacrificial seeds", "is_tax_deductible": True, "sort_order": 5},
        {"name": "Other Income", "description": "Miscellaneous income", "is_tax_deductible": True, "sort_order": 99},
    ]
    
    for cat_data in income_categories:
        category = IncomeCategory(church_id=church_id, **cat_data)
        db.add(category)
    
    # Comprehensive Expense Categories
    expense_categories = [
        # Personnel & Salaries (1-9)
        {"name": "Senior Pastor Salary", "description": "Senior pastor compensation", "sort_order": 1},
        {"name": "Associate Pastor Salary", "description": "Associate pastor compensation", "sort_order": 2},
        {"name": "Staff Salaries", "description": "Other staff compensation", "sort_order": 3},
        {"name": "Payroll Taxes & UIF", "description": "Employer payroll taxes and UIF", "sort_order": 4},
        {"name": "Staff Benefits", "description": "Health insurance, retirement, etc.", "sort_order": 5},
        {"name": "Housing Allowance", "description": "Pastoral housing allowance", "sort_order": 6},
        {"name": "Transport Allowance", "description": "Staff transport allowance", "sort_order": 7},
        # Facilities (10-19)
        {"name": "Rent/Mortgage", "description": "Building payment", "sort_order": 10},
        {"name": "Electricity", "description": "Electricity costs", "sort_order": 11},
        {"name": "Water & Rates", "description": "Water and municipal rates", "sort_order": 12},
        {"name": "Security", "description": "Security services", "sort_order": 13},
        {"name": "Cleaning & Maintenance", "description": "Cleaning services and building maintenance", "sort_order": 14},
        {"name": "Repairs & Renovations", "description": "Building repairs and renovations", "sort_order": 15},
        {"name": "Insurance", "description": "Property and liability insurance", "sort_order": 16},
        {"name": "Garden & Grounds", "description": "Landscaping and grounds maintenance", "sort_order": 17},
        # Office & Admin (20-29)
        {"name": "Office Supplies", "description": "Paper, printing, etc.", "sort_order": 20},
        {"name": "Printing & Stationery", "description": "Printing and stationery costs", "sort_order": 21},
        {"name": "Telephone & Internet", "description": "Phone and internet services", "sort_order": 22},
        {"name": "Postage & Courier", "description": "Postage and courier services", "sort_order": 23},
        {"name": "Bank Charges", "description": "Banking fees and charges", "sort_order": 24},
        {"name": "Accounting & Audit", "description": "Accounting and audit fees", "sort_order": 25},
        {"name": "Legal Fees", "description": "Legal services", "sort_order": 26},
        {"name": "Software & Subscriptions", "description": "Software licenses and subscriptions", "sort_order": 27},
        # Ministry Departments (30-39)
        {"name": "Youth Ministry Expenses", "description": "Youth group expenses", "sort_order": 30},
        {"name": "Children Ministry Expenses", "description": "Sunday school, VBS, etc.", "sort_order": 31},
        {"name": "Women Ministry Expenses", "description": "Women's ministry activities", "sort_order": 32},
        {"name": "Men Ministry Expenses", "description": "Men's ministry activities", "sort_order": 33},
        {"name": "Small Groups & Cell Ministry", "description": "Small group expenses", "sort_order": 34},
        {"name": "Discipleship & Training", "description": "Discipleship programs", "sort_order": 35},
        # Worship & Media (40-49)
        {"name": "Worship Equipment", "description": "Musical instruments and worship supplies", "sort_order": 40},
        {"name": "Sound & AV Equipment", "description": "Audio-visual equipment", "sort_order": 41},
        {"name": "Music Licensing (CCLI)", "description": "Music licensing fees", "sort_order": 42},
        {"name": "Livestream & Media", "description": "Livestreaming and media production", "sort_order": 43},
        {"name": "Website & Social Media", "description": "Website and social media costs", "sort_order": 44},
        # Outreach & Missions (50-59)
        {"name": "Missions Support", "description": "Missionary support", "sort_order": 50},
        {"name": "Outreach Programs", "description": "Community outreach programs", "sort_order": 51},
        {"name": "Evangelism Materials", "description": "Evangelism materials and resources", "sort_order": 52},
        {"name": "Community Projects", "description": "Community development projects", "sort_order": 53},
        # Benevolence (60-69)
        {"name": "Benevolence - Members", "description": "Assistance to church members", "sort_order": 60},
        {"name": "Benevolence - Community", "description": "Assistance to community", "sort_order": 61},
        {"name": "Funeral Assistance", "description": "Funeral support and assistance", "sort_order": 62},
        {"name": "Food Parcels & Relief", "description": "Food parcels and relief aid", "sort_order": 63},
        # Events (70-79)
        {"name": "Church Events", "description": "Church events and functions", "sort_order": 70},
        {"name": "Conferences & Seminars", "description": "Conferences and seminars", "sort_order": 71},
        {"name": "Hospitality & Catering", "description": "Hospitality and catering", "sort_order": 72},
        {"name": "Guest Speakers", "description": "Guest speaker honorariums", "sort_order": 73},
        # Transport & Travel (80-89)
        {"name": "Vehicle Expenses", "description": "Church vehicle expenses", "sort_order": 80},
        {"name": "Fuel", "description": "Fuel costs", "sort_order": 81},
        {"name": "Travel & Accommodation", "description": "Travel and accommodation costs", "sort_order": 82},
        # Miscellaneous (90-99)
        {"name": "Denominational Dues", "description": "Contributions to denomination", "sort_order": 90},
        {"name": "Books & Resources", "description": "Books and educational resources", "sort_order": 91},
        {"name": "Miscellaneous Expenses", "description": "Other expenses", "sort_order": 99},
    ]
    
    for cat_data in expense_categories:
        category = ExpenseCategory(church_id=church_id, **cat_data)
        db.add(category)
    
    db.commit()


def seed_demo_data(db: Session, church_id: int):
    """
    Create demo/sample data for testing purposes.
    This would typically only be used in development.
    """
    from datetime import date, timedelta
    from decimal import Decimal
    import random
    
    from app.models.member import Member, MemberStatus, Gender
    from app.models.finance import Income, Expense, PaymentMethod
    
    # Create sample members
    sample_members = [
        {"first_name": "John", "last_name": "Smith", "email": "john.smith@email.com", "gender": Gender.MALE},
        {"first_name": "Mary", "last_name": "Johnson", "email": "mary.j@email.com", "gender": Gender.FEMALE},
        {"first_name": "Robert", "last_name": "Williams", "email": "rwilliams@email.com", "gender": Gender.MALE},
        {"first_name": "Patricia", "last_name": "Brown", "email": "patricia.b@email.com", "gender": Gender.FEMALE},
        {"first_name": "Michael", "last_name": "Davis", "email": "mdavis@email.com", "gender": Gender.MALE},
    ]
    
    members = []
    for m_data in sample_members:
        member = Member(
            church_id=church_id,
            member_status=MemberStatus.ACTIVE,
            **m_data
        )
        db.add(member)
        members.append(member)
    
    db.commit()
    
    # Get categories
    income_cats = db.query(IncomeCategory).filter(IncomeCategory.church_id == church_id).all()
    expense_cats = db.query(ExpenseCategory).filter(ExpenseCategory.church_id == church_id).all()
    
    if not income_cats or not expense_cats:
        return
    
    # Create sample transactions for the past 3 months
    today = date.today()
    
    for i in range(90):
        trans_date = today - timedelta(days=i)
        
        # Random income entries (more on Sundays)
        if trans_date.weekday() == 6 or random.random() > 0.7:
            income = Income(
                church_id=church_id,
                category_id=random.choice(income_cats[:3]).id,  # Mostly tithes/offerings
                member_id=random.choice(members).id if random.random() > 0.2 else None,
                is_anonymous=random.random() > 0.9,
                amount=Decimal(str(random.randint(50, 500))),
                date=trans_date,
                payment_method=random.choice([PaymentMethod.CASH, PaymentMethod.CHECK, PaymentMethod.ONLINE])
            )
            db.add(income)
        
        # Random expense entries (a few per week)
        if random.random() > 0.85:
            expense = Expense(
                church_id=church_id,
                category_id=random.choice(expense_cats).id,
                amount=Decimal(str(random.randint(25, 1000))),
                date=trans_date,
                payment_method=PaymentMethod.CHECK,
                payee_name=f"Vendor {random.randint(1, 10)}",
                is_approved=True
            )
            db.add(expense)
    
    db.commit()
