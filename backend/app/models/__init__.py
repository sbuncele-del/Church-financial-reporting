"""
Database models package.
Import all models here to ensure they're registered with SQLAlchemy.
"""
from app.models.user import User, UserRole
from app.models.church import Church
from app.models.member import Member
from app.models.finance import (
    IncomeCategory,
    ExpenseCategory,
    Income,
    Expense,
    Budget,
    BudgetItem,
    FinancialAccount
)
from app.models.solar import (
    SOLARAssessment,
    DimensionAssessment,
    KPIDefinition,
    KPIScore,
    SOLARGoal,
    SOLARBenchmark,
    SOLARDimension,
    AssessmentStatus,
)

__all__ = [
    "User",
    "UserRole",
    "Church",
    "Member",
    "IncomeCategory",
    "ExpenseCategory",
    "Income",
    "Expense",
    "Budget",
    "BudgetItem",
    "FinancialAccount",
    "SOLARAssessment",
    "DimensionAssessment",
    "KPIDefinition",
    "KPIScore",
    "SOLARGoal",
    "SOLARBenchmark",
    "SOLARDimension",
    "AssessmentStatus",
]
