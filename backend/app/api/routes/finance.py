"""
Finance management endpoints - income, expenses, categories, accounts.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from decimal import Decimal

from app.core.database import get_db
from app.services.seed_data import seed_default_categories
from app.models.finance import (
    Income, Expense, IncomeCategory, ExpenseCategory,
    FinancialAccount, Budget, BudgetItem
)
from app.models.member import Member
from app.models.user import User
from app.schemas.finance import (
    IncomeCreate, IncomeUpdate, IncomeResponse, IncomeListResponse,
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseListResponse,
    IncomeCategoryCreate, IncomeCategoryUpdate, IncomeCategoryResponse,
    ExpenseCategoryCreate, ExpenseCategoryUpdate, ExpenseCategoryResponse,
    AccountCreate, AccountUpdate, AccountResponse,
    FinancialSummary, DateRangeFilter
)
from app.api.deps import get_current_user, require_finance, get_church_id

router = APIRouter(prefix="/finance", tags=["Finance"])


# ============== INCOME CATEGORIES ==============

@router.get("/income-categories", response_model=list[IncomeCategoryResponse])
async def list_income_categories(
    include_inactive: bool = False,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """List all income categories."""
    query = db.query(IncomeCategory).filter(IncomeCategory.church_id == church_id)
    if not include_inactive:
        query = query.filter(IncomeCategory.is_active == True)
    categories = query.order_by(IncomeCategory.sort_order, IncomeCategory.name).all()

    # Auto-seed if none exist so users always see the core categories
    if not categories:
        seed_default_categories(db, church_id)
        categories = query.order_by(IncomeCategory.sort_order, IncomeCategory.name).all()
    return categories


@router.post("/income-categories", response_model=IncomeCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_income_category(
    category_data: IncomeCategoryCreate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Create a new income category."""
    category = IncomeCategory(church_id=church_id, **category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/income-categories/{category_id}", response_model=IncomeCategoryResponse)
async def update_income_category(
    category_id: int,
    category_data: IncomeCategoryUpdate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update an income category."""
    category = db.query(IncomeCategory).filter(
        IncomeCategory.id == category_id,
        IncomeCategory.church_id == church_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for field, value in category_data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return category


# ============== EXPENSE CATEGORIES ==============

@router.get("/expense-categories", response_model=list[ExpenseCategoryResponse])
async def list_expense_categories(
    include_inactive: bool = False,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """List all expense categories."""
    query = db.query(ExpenseCategory).filter(ExpenseCategory.church_id == church_id)
    if not include_inactive:
        query = query.filter(ExpenseCategory.is_active == True)
    categories = query.order_by(ExpenseCategory.sort_order, ExpenseCategory.name).all()
    return categories


@router.post("/expense-categories", response_model=ExpenseCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_expense_category(
    category_data: ExpenseCategoryCreate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Create a new expense category."""
    category = ExpenseCategory(church_id=church_id, **category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/expense-categories/{category_id}", response_model=ExpenseCategoryResponse)
async def update_expense_category(
    category_id: int,
    category_data: ExpenseCategoryUpdate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update an expense category."""
    category = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == category_id,
        ExpenseCategory.church_id == church_id
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for field, value in category_data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return category


# ============== INCOME ==============

@router.get("/income", response_model=IncomeListResponse)
async def list_income(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    member_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """List income transactions."""
    query = db.query(Income).filter(Income.church_id == church_id)
    
    if start_date:
        query = query.filter(Income.date >= start_date)
    if end_date:
        query = query.filter(Income.date <= end_date)
    if category_id:
        query = query.filter(Income.category_id == category_id)
    if member_id:
        query = query.filter(Income.member_id == member_id)
    
    total = query.count()
    total_amount = query.with_entities(func.sum(Income.amount)).scalar() or Decimal("0")
    
    incomes = query.order_by(Income.date.desc())\
                   .offset((page - 1) * per_page).limit(per_page).all()
    
    # Enrich with category and member names
    result = []
    for income in incomes:
        data = IncomeResponse.model_validate(income)
        if income.category:
            data.category_name = income.category.name
        if income.member and not income.is_anonymous:
            data.member_name = income.member.full_name
        result.append(data)
    
    return IncomeListResponse(
        incomes=result,
        total=total,
        total_amount=total_amount,
        page=page,
        per_page=per_page
    )


@router.post("/income", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(
    income_data: IncomeCreate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Record a new income transaction."""
    # Validate category
    category = db.query(IncomeCategory).filter(
        IncomeCategory.id == income_data.category_id,
        IncomeCategory.church_id == church_id
    ).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    # Validate member if provided
    if income_data.member_id:
        member = db.query(Member).filter(
            Member.id == income_data.member_id,
            Member.church_id == church_id
        ).first()
        if not member:
            raise HTTPException(status_code=400, detail="Invalid member")
    
    income = Income(
        church_id=church_id,
        created_by=current_user.id,
        **income_data.model_dump()
    )
    
    db.add(income)
    db.commit()
    db.refresh(income)
    
    return income


@router.get("/income/{income_id}", response_model=IncomeResponse)
async def get_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Get a specific income transaction."""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.church_id == church_id
    ).first()
    
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    return income


@router.put("/income/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: int,
    income_data: IncomeUpdate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update an income transaction."""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.church_id == church_id
    ).first()
    
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    for field, value in income_data.model_dump(exclude_unset=True).items():
        setattr(income, field, value)
    
    db.commit()
    db.refresh(income)
    
    return income


@router.delete("/income/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(
    income_id: int,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Delete an income transaction."""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.church_id == church_id
    ).first()
    
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    db.delete(income)
    db.commit()


# ============== EXPENSES ==============

@router.get("/expenses", response_model=ExpenseListResponse)
async def list_expenses(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    is_approved: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """List expense transactions."""
    query = db.query(Expense).filter(Expense.church_id == church_id)
    
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if category_id:
        query = query.filter(Expense.category_id == category_id)
    if is_approved is not None:
        query = query.filter(Expense.is_approved == is_approved)
    
    total = query.count()
    total_amount = query.with_entities(func.sum(Expense.amount)).scalar() or Decimal("0")
    
    expenses = query.order_by(Expense.date.desc())\
                    .offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for expense in expenses:
        data = ExpenseResponse.model_validate(expense)
        if expense.category:
            data.category_name = expense.category.name
        result.append(data)
    
    return ExpenseListResponse(
        expenses=result,
        total=total,
        total_amount=total_amount,
        page=page,
        per_page=per_page
    )


@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Record a new expense transaction."""
    # Validate category
    category = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == expense_data.category_id,
        ExpenseCategory.church_id == church_id
    ).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    expense = Expense(
        church_id=church_id,
        created_by=current_user.id,
        **expense_data.model_dump()
    )
    
    db.add(expense)
    db.commit()
    db.refresh(expense)
    
    return expense


@router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Get a specific expense transaction."""
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.church_id == church_id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return expense


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update an expense transaction."""
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.church_id == church_id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for field, value in expense_data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    
    db.commit()
    db.refresh(expense)
    
    return expense


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Delete an expense transaction."""
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.church_id == church_id
    ).first()
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()


# ============== ACCOUNTS ==============

@router.get("/accounts", response_model=list[AccountResponse])
async def list_accounts(
    include_inactive: bool = False,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """List financial accounts."""
    query = db.query(FinancialAccount).filter(FinancialAccount.church_id == church_id)
    if not include_inactive:
        query = query.filter(FinancialAccount.is_active == True)
    return query.order_by(FinancialAccount.name).all()


@router.post("/accounts", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_data: AccountCreate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Create a new financial account."""
    account = FinancialAccount(
        church_id=church_id,
        current_balance=account_data.opening_balance,
        **account_data.model_dump()
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.put("/accounts/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    account_data: AccountUpdate,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update a financial account."""
    account = db.query(FinancialAccount).filter(
        FinancialAccount.id == account_id,
        FinancialAccount.church_id == church_id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    for field, value in account_data.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
    
    db.commit()
    db.refresh(account)
    return account


# ============== DASHBOARD/SUMMARY ==============

@router.get("/summary", response_model=FinancialSummary)
async def get_financial_summary(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Get financial summary for dashboard."""
    # Total income
    total_income = db.query(func.sum(Income.amount)).filter(
        Income.church_id == church_id,
        Income.date >= start_date,
        Income.date <= end_date
    ).scalar() or Decimal("0")
    
    # Total expenses
    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.church_id == church_id,
        Expense.date >= start_date,
        Expense.date <= end_date
    ).scalar() or Decimal("0")
    
    # Income by category
    income_by_cat = db.query(
        IncomeCategory.name,
        func.sum(Income.amount)
    ).join(Income).filter(
        Income.church_id == church_id,
        Income.date >= start_date,
        Income.date <= end_date
    ).group_by(IncomeCategory.name).all()
    
    # Expenses by category
    expenses_by_cat = db.query(
        ExpenseCategory.name,
        func.sum(Expense.amount)
    ).join(Expense).filter(
        Expense.church_id == church_id,
        Expense.date >= start_date,
        Expense.date <= end_date
    ).group_by(ExpenseCategory.name).all()
    
    return FinancialSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=total_income - total_expenses,
        income_by_category={name: amount for name, amount in income_by_cat},
        expenses_by_category={name: amount for name, amount in expenses_by_cat},
        period=f"{start_date} to {end_date}"
    )
