"""
User model for authentication and authorization.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User roles with different permission levels."""
    SUPER_ADMIN = "super_admin"  # System administrator (multi-church)
    ADMIN = "admin"              # Church administrator (pastor, secretary)
    FINANCE = "finance"          # Finance team (treasurer, accountant)
    LEADER = "leader"            # Ministry leader
    MEMBER = "member"            # Regular church member


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Role and permissions
    role = Column(Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    
    # Church association
    church_id = Column(Integer, ForeignKey("churches.id"), nullable=True)
    church = relationship("Church", back_populates="users")
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    member_profile = relationship("Member", back_populates="user", uselist=False)
    
    @property
    def full_name(self) -> str:
        """Return user's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def has_permission(self, required_role: UserRole) -> bool:
        """Check if user has required permission level."""
        role_hierarchy = {
            UserRole.SUPER_ADMIN: 5,
            UserRole.ADMIN: 4,
            UserRole.FINANCE: 3,
            UserRole.LEADER: 2,
            UserRole.MEMBER: 1
        }
        return role_hierarchy.get(self.role, 0) >= role_hierarchy.get(required_role, 0)
