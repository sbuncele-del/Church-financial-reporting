"""
Member model - church congregation members.
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class MemberStatus(str, enum.Enum):
    """Member status in the church."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    VISITOR = "visitor"
    TRANSFERRED = "transferred"
    DECEASED = "deceased"


class Gender(str, enum.Enum):
    """Gender options."""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class MaritalStatus(str, enum.Enum):
    """Marital status options."""
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"


class Member(Base):
    """Church member model."""
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Church association
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=False)
    church = relationship("Church", back_populates="members")
    
    # User account link (optional - not all members need login)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True)
    user = relationship("User", back_populates="member_profile")
    
    # Personal Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    mobile = Column(String(20), nullable=True)
    
    # Demographics
    date_of_birth = Column(Date, nullable=True)
    gender = Column(Enum(Gender), nullable=True)
    marital_status = Column(Enum(MaritalStatus), nullable=True)
    
    # Address
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), default="United States")
    
    # Church Information
    member_status = Column(Enum(MemberStatus), default=MemberStatus.ACTIVE)
    membership_date = Column(Date, nullable=True)
    baptism_date = Column(Date, nullable=True)
    
    # Family
    family_id = Column(Integer, nullable=True)  # Group family members
    is_head_of_family = Column(Boolean, default=False)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Photo
    photo_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    donations = relationship("Income", back_populates="member")
    
    @property
    def full_name(self) -> str:
        """Return member's full name."""
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        """Calculate member's age."""
        if not self.date_of_birth:
            return None
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
