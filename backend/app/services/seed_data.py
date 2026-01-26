"""
Seed data for initializing a new church with default categories.
"""
from sqlalchemy.orm import Session
from app.models.finance import IncomeCategory, ExpenseCategory


def seed_default_categories(db: Session, church_id: int):
    """
    Create default income and expense categories for a new church.
    """
    # Default Income Categories (common for most churches)
    income_categories = [
        {"name": "Tithes", "description": "Regular tithes from members", "is_tax_deductible": True, "sort_order": 1},
        {"name": "Offerings", "description": "General offerings", "is_tax_deductible": True, "sort_order": 2},
        {"name": "Building Fund", "description": "Donations for building projects", "is_tax_deductible": True, "sort_order": 3},
        {"name": "Missions", "description": "Donations for mission work", "is_tax_deductible": True, "sort_order": 4},
        {"name": "Youth Ministry", "description": "Donations for youth programs", "is_tax_deductible": True, "sort_order": 5},
        {"name": "Benevolence", "description": "Donations to help those in need", "is_tax_deductible": True, "sort_order": 6},
        {"name": "Special Events", "description": "Event-specific offerings", "is_tax_deductible": True, "sort_order": 7},
        {"name": "Other Income", "description": "Miscellaneous income", "is_tax_deductible": True, "sort_order": 99},
    ]
    
    for cat_data in income_categories:
        category = IncomeCategory(church_id=church_id, **cat_data)
        db.add(category)
    
    # Default Expense Categories (common for most churches)
    expense_categories = [
        # Personnel
        {"name": "Pastoral Salary", "description": "Pastor compensation", "sort_order": 1},
        {"name": "Staff Salaries", "description": "Other staff compensation", "sort_order": 2},
        {"name": "Payroll Taxes", "description": "Employer payroll taxes", "sort_order": 3},
        {"name": "Benefits", "description": "Health insurance, retirement, etc.", "sort_order": 4},
        
        # Facilities
        {"name": "Rent/Mortgage", "description": "Building payment", "sort_order": 10},
        {"name": "Utilities", "description": "Electric, water, gas, internet", "sort_order": 11},
        {"name": "Maintenance & Repairs", "description": "Building upkeep", "sort_order": 12},
        {"name": "Insurance", "description": "Property and liability insurance", "sort_order": 13},
        {"name": "Cleaning & Janitorial", "description": "Cleaning services and supplies", "sort_order": 14},
        
        # Ministry
        {"name": "Worship & Music", "description": "Music equipment, licensing, etc.", "sort_order": 20},
        {"name": "Children's Ministry", "description": "Sunday school, VBS, etc.", "sort_order": 21},
        {"name": "Youth Ministry", "description": "Youth group expenses", "sort_order": 22},
        {"name": "Adult Ministry", "description": "Small groups, classes, etc.", "sort_order": 23},
        {"name": "Outreach & Evangelism", "description": "Community outreach programs", "sort_order": 24},
        
        # Operations
        {"name": "Office Supplies", "description": "Paper, printing, etc.", "sort_order": 30},
        {"name": "Technology", "description": "Software, equipment, website", "sort_order": 31},
        {"name": "Communications", "description": "Phone, mail, marketing", "sort_order": 32},
        {"name": "Professional Services", "description": "Accounting, legal, consulting", "sort_order": 33},
        
        # Missions & Giving
        {"name": "Missions Support", "description": "Missionary support", "sort_order": 40},
        {"name": "Denominational Giving", "description": "Contributions to denomination", "sort_order": 41},
        {"name": "Benevolence", "description": "Assistance to those in need", "sort_order": 42},
        {"name": "Community Support", "description": "Local charity support", "sort_order": 43},
        
        # Other
        {"name": "Events & Hospitality", "description": "Church events, food, decorations", "sort_order": 50},
        {"name": "Training & Development", "description": "Conferences, books, courses", "sort_order": 51},
        {"name": "Miscellaneous", "description": "Other expenses", "sort_order": 99},
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
