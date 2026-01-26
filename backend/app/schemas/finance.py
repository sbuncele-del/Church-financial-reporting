"""
Finance schemas for API requests and responses.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.models.finance import PaymentMethod, TransactionStatus, AccountType


# ============== CATEGORY SCHEMAS ==============

class IncomeCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_tax_deductible: bool = True
    sort_order: int = 0


class IncomeCategoryCreate(IncomeCategoryBase):
    pass


class IncomeCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_tax_deductible: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class IncomeCategoryResponse(IncomeCategoryBase):
    id: int
    church_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ExpenseCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int = 0


class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass


class ExpenseCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class ExpenseCategoryResponse(ExpenseCategoryBase):
    id: int
    church_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== INCOME SCHEMAS ==============

class IncomeBase(BaseModel):
    category_id: int
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    date: date
    payment_method: PaymentMethod = PaymentMethod.CASH
    reference_number: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    member_id: Optional[int] = None
    is_anonymous: bool = False
    account_id: Optional[int] = None


class IncomeCreate(IncomeBase):
    pass


class IncomeUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    date: Optional[date] = None
    payment_method: Optional[PaymentMethod] = None
    reference_number: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    member_id: Optional[int] = None
    is_anonymous: Optional[bool] = None
    account_id: Optional[int] = None
    status: Optional[TransactionStatus] = None


class IncomeResponse(IncomeBase):
    id: int
    church_id: int
    status: TransactionStatus
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Related data
    category_name: Optional[str] = None
    member_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class IncomeListResponse(BaseModel):
    incomes: list[IncomeResponse]
    total: int
    total_amount: Decimal
    page: int
    per_page: int


# ============== EXPENSE SCHEMAS ==============

class ExpenseBase(BaseModel):
    category_id: int
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    date: date
    payment_method: PaymentMethod = PaymentMethod.CHECK
    payee_name: str = Field(..., min_length=1, max_length=255)
    payee_type: Optional[str] = Field(None, max_length=50)
    reference_number: Optional[str] = Field(None, max_length=50)
    invoice_number: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    account_id: Optional[int] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    date: Optional[date] = None
    payment_method: Optional[PaymentMethod] = None
    payee_name: Optional[str] = Field(None, min_length=1, max_length=255)
    payee_type: Optional[str] = Field(None, max_length=50)
    reference_number: Optional[str] = Field(None, max_length=50)
    invoice_number: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    account_id: Optional[int] = None
    status: Optional[TransactionStatus] = None
    is_approved: Optional[bool] = None


class ExpenseResponse(ExpenseBase):
    id: int
    church_id: int
    status: TransactionStatus
    is_approved: bool
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    receipt_url: Optional[str]
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Related data
    category_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    expenses: list[ExpenseResponse]
    total: int
    total_amount: Decimal
    page: int
    per_page: int


# ============== ACCOUNT SCHEMAS ==============

class AccountBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    account_type: AccountType = AccountType.CHECKING
    bank_name: Optional[str] = Field(None, max_length=100)
    account_number_last4: Optional[str] = Field(None, max_length=4)
    opening_balance: Decimal = Field(default=0, decimal_places=2)
    opening_balance_date: Optional[date] = None
    description: Optional[str] = None


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    account_type: Optional[AccountType] = None
    bank_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class AccountResponse(AccountBase):
    id: int
    church_id: int
    current_balance: Decimal
    is_active: bool
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ============== BUDGET SCHEMAS ==============

class BudgetItemBase(BaseModel):
    income_category_id: Optional[int] = None
    expense_category_id: Optional[int] = None
    is_income: bool = False
    annual_amount: Decimal = Field(default=0, decimal_places=2)
    jan_amount: Decimal = Field(default=0, decimal_places=2)
    feb_amount: Decimal = Field(default=0, decimal_places=2)
    mar_amount: Decimal = Field(default=0, decimal_places=2)
    apr_amount: Decimal = Field(default=0, decimal_places=2)
    may_amount: Decimal = Field(default=0, decimal_places=2)
    jun_amount: Decimal = Field(default=0, decimal_places=2)
    jul_amount: Decimal = Field(default=0, decimal_places=2)
    aug_amount: Decimal = Field(default=0, decimal_places=2)
    sep_amount: Decimal = Field(default=0, decimal_places=2)
    oct_amount: Decimal = Field(default=0, decimal_places=2)
    nov_amount: Decimal = Field(default=0, decimal_places=2)
    dec_amount: Decimal = Field(default=0, decimal_places=2)
    notes: Optional[str] = None


class BudgetItemCreate(BudgetItemBase):
    pass


class BudgetItemResponse(BudgetItemBase):
    id: int
    budget_id: int
    category_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class BudgetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    year: int = Field(..., ge=2000, le=2100)
    start_date: date
    end_date: date


class BudgetCreate(BudgetBase):
    items: list[BudgetItemCreate] = []


class BudgetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None


class BudgetResponse(BudgetBase):
    id: int
    church_id: int
    is_active: bool
    is_approved: bool
    approved_by: Optional[int]
    approved_at: Optional[datetime]
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    items: list[BudgetItemResponse] = []
    
    class Config:
        from_attributes = True


# ============== REPORT SCHEMAS ==============

class DateRangeFilter(BaseModel):
    start_date: date
    end_date: date


class FinancialSummary(BaseModel):
    """Dashboard summary data."""
    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    income_by_category: dict[str, Decimal]
    expenses_by_category: dict[str, Decimal]
    period: str  # e.g., "January 2024", "Q1 2024", "2024"


class MonthlyReport(BaseModel):
    """Monthly financial report."""
    month: int
    year: int
    income_items: list[dict]
    expense_items: list[dict]
    total_income: Decimal
    total_expenses: Decimal
    net: Decimal


class BudgetVsActual(BaseModel):
    """Budget comparison report."""
    category_name: str
    is_income: bool
    budgeted: Decimal
    actual: Decimal
    variance: Decimal
    variance_percentage: float


class DonorStatement(BaseModel):
    """Individual donor contribution statement."""
    member_id: int
    member_name: str
    period: str
    donations: list[dict]
    total_amount: Decimal
    tax_deductible_amount: Decimal
