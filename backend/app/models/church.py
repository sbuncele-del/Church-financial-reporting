"""
Church model - the main organization entity.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Church(Base):
    """Church/Organization model."""
    __tablename__ = "churches"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False)
    denomination = Column(String(100), nullable=True)
    
    # Contact
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Address
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), default="United States")
    
    # Settings
    currency = Column(String(3), default="USD")
    fiscal_year_start_month = Column(Integer, default=1)  # 1 = January
    timezone = Column(String(50), default="America/New_York")
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="church")
    members = relationship("Member", back_populates="church")
    income_categories = relationship("IncomeCategory", back_populates="church")
    expense_categories = relationship("ExpenseCategory", back_populates="church")
    incomes = relationship("Income", back_populates="church")
    expenses = relationship("Expense", back_populates="church")
    budgets = relationship("Budget", back_populates="church")
    accounts = relationship("FinancialAccount", back_populates="church")
    
    @property
    def full_address(self) -> str:
        """Return formatted full address."""
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.append(f"{self.city}, {self.state} {self.postal_code}")
        parts.append(self.country)
        return "\n".join(filter(None, parts))
