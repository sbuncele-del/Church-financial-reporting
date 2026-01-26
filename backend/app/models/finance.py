"""
Finance models - income, expenses, budgets, accounts.
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Enum, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from decimal import Decimal

from app.core.database import Base


class PaymentMethod(str, enum.Enum):
    """Payment method options."""
    CASH = "cash"
    CHECK = "check"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    ONLINE = "online"
    OTHER = "other"


class TransactionStatus(str, enum.Enum):
    """Transaction status."""
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class AccountType(str, enum.Enum):
    """Financial account types."""
    CHECKING = "checking"
    SAVINGS = "savings"
    CASH = "cash"
    INVESTMENT = "investment"
    OTHER = "other"


# ============== CATEGORIES ==============

class IncomeCategory(Base):
    """Categories for income/donations."""
    __tablename__ = "income_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    church = relationship("Church", back_populates="income_categories")
    
    name = Column(String(100), nullable=False)  # e.g., "Tithes", "Offerings", "Building Fund"
    description = Column(Text, nullable=True)
    is_tax_deductible = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    
    # For grouping/ordering
    sort_order = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    incomes = relationship("Income", back_populates="category")
    budget_items = relationship("BudgetItem", back_populates="income_category")


class ExpenseCategory(Base):
    """Categories for expenses."""
    __tablename__ = "expense_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    church = relationship("Church", back_populates="expense_categories")
    
    name = Column(String(100), nullable=False)  # e.g., "Utilities", "Salaries", "Missions"
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Parent category for hierarchical organization
    parent_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=True)
    parent = relationship("ExpenseCategory", remote_side=[id], backref="subcategories")
    
    # For grouping/ordering
    sort_order = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    expenses = relationship("Expense", back_populates="category")
    budget_items = relationship("BudgetItem", back_populates="expense_category")


# ============== TRANSACTIONS ==============

class Income(Base):
    """Income/Donation transactions."""
    __tablename__ = "incomes"
    
    id = Column(Integer, primary_key=True, index=True)
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    church = relationship("Church", back_populates="incomes")
    
    # Category
    category_id = Column(Integer, ForeignKey("income_categories.id"), nullable=False)
    category = relationship("IncomeCategory", back_populates="incomes")
    
    # Donor (optional - can be anonymous)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=True)
    member = relationship("Member", back_populates="donations")
    is_anonymous = Column(Boolean, default=False)
    
    # Transaction details
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CASH)
    
    # Reference
    reference_number = Column(String(50), nullable=True)  # Check number, transaction ID
    description = Column(Text, nullable=True)
    
    # For pledges/recurring
    is_pledge_payment = Column(Boolean, default=False)
    pledge_id = Column(Integer, nullable=True)
    
    # Account
    account_id = Column(Integer, ForeignKey("financial_accounts.id"), nullable=True)
    account = relationship("FinancialAccount", backref="deposits")
    
    # Status
    status = Column(Enum(TransactionStatus), default=TransactionStatus.COMPLETED)
    
    # Audit
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Expense(Base):
    """Expense transactions."""
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    church = relationship("Church", back_populates="expenses")
    
    # Category
    category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=False)
    category = relationship("ExpenseCategory", back_populates="expenses")
    
    # Transaction details
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.CHECK)
    
    # Payee information
    payee_name = Column(String(255), nullable=False)
    payee_type = Column(String(50), nullable=True)  # vendor, employee, ministry, etc.
    
    # Reference
    reference_number = Column(String(50), nullable=True)
    invoice_number = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    
    # Account
    account_id = Column(Integer, ForeignKey("financial_accounts.id"), nullable=True)
    account = relationship("FinancialAccount", backref="withdrawals")
    
    # Approval workflow
    is_approved = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    status = Column(Enum(TransactionStatus), default=TransactionStatus.COMPLETED)
    
    # Receipt/attachment
    receipt_url = Column(String(500), nullable=True)
    
    # Audit
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ============== BUDGETS ==============

class Budget(Base):
    """Annual/period budget."""
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    church = relationship("Church", back_populates="budgets")
    
    name = Column(String(100), nullable=False)  # e.g., "2024 Annual Budget"
    description = Column(Text, nullable=True)
    
    # Period
    year = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    items = relationship("BudgetItem", back_populates="budget", cascade="all, delete-orphan")


class BudgetItem(Base):
    """Individual budget line items."""
    __tablename__ = "budget_items"
    
    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False)
    budget = relationship("Budget", back_populates="items")
    
    # Link to category (either income or expense)
    income_category_id = Column(Integer, ForeignKey("income_categories.id"), nullable=True)
    income_category = relationship("IncomeCategory", back_populates="budget_items")
    
    expense_category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=True)
    expense_category = relationship("ExpenseCategory", back_populates="budget_items")
    
    # Budget amounts
    is_income = Column(Boolean, default=False)  # True for income, False for expense
    
    # Monthly breakdown (optional - for detailed budgeting)
    jan_amount = Column(Numeric(12, 2), default=0)
    feb_amount = Column(Numeric(12, 2), default=0)
    mar_amount = Column(Numeric(12, 2), default=0)
    apr_amount = Column(Numeric(12, 2), default=0)
    may_amount = Column(Numeric(12, 2), default=0)
    jun_amount = Column(Numeric(12, 2), default=0)
    jul_amount = Column(Numeric(12, 2), default=0)
    aug_amount = Column(Numeric(12, 2), default=0)
    sep_amount = Column(Numeric(12, 2), default=0)
    oct_amount = Column(Numeric(12, 2), default=0)
    nov_amount = Column(Numeric(12, 2), default=0)
    dec_amount = Column(Numeric(12, 2), default=0)
    
    # Or just annual amount
    annual_amount = Column(Numeric(12, 2), default=0)
    
    notes = Column(Text, nullable=True)
    
    @property
    def total_monthly(self) -> Decimal:
        """Sum of all monthly amounts."""
        return (
            self.jan_amount + self.feb_amount + self.mar_amount +
            self.apr_amount + self.may_amount + self.jun_amount +
            self.jul_amount + self.aug_amount + self.sep_amount +
            self.oct_amount + self.nov_amount + self.dec_amount
        )


# ============== ACCOUNTS ==============

class FinancialAccount(Base):
    """Bank accounts and cash funds."""
    __tablename__ = "financial_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    church = relationship("Church", back_populates="accounts")
    
    name = Column(String(100), nullable=False)  # e.g., "Main Checking", "Building Fund"
    account_type = Column(Enum(AccountType), default=AccountType.CHECKING)
    
    # Bank details (optional, for reference)
    bank_name = Column(String(100), nullable=True)
    account_number_last4 = Column(String(4), nullable=True)  # Only last 4 digits for security
    
    # Balance tracking
    opening_balance = Column(Numeric(12, 2), default=0)
    opening_balance_date = Column(Date, nullable=True)
    current_balance = Column(Numeric(12, 2), default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # Default account for transactions
    
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
