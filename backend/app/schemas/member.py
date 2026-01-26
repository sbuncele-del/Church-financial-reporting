"""
Member schemas for API requests and responses.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from app.models.member import MemberStatus, Gender, MaritalStatus


# ============== BASE SCHEMAS ==============

class MemberBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    mobile: Optional[str] = Field(None, max_length=20)
    
    # Demographics
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    
    # Address
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = "United States"
    
    # Church info
    member_status: MemberStatus = MemberStatus.ACTIVE
    membership_date: Optional[date] = None
    baptism_date: Optional[date] = None
    
    # Family
    family_id: Optional[int] = None
    is_head_of_family: bool = False
    
    notes: Optional[str] = None


# ============== CREATE/UPDATE SCHEMAS ==============

class MemberCreate(MemberBase):
    church_id: Optional[int] = None  # Will use user's church if not specified


class MemberUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    mobile: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    marital_status: Optional[MaritalStatus] = None
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = None
    member_status: Optional[MemberStatus] = None
    membership_date: Optional[date] = None
    baptism_date: Optional[date] = None
    family_id: Optional[int] = None
    is_head_of_family: Optional[bool] = None
    notes: Optional[str] = None


# ============== RESPONSE SCHEMAS ==============

class MemberResponse(MemberBase):
    id: int
    church_id: int
    user_id: Optional[int]
    full_name: str
    age: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class MemberSummary(BaseModel):
    """Minimal member info for dropdowns/lists."""
    id: int
    full_name: str
    email: Optional[str]
    member_status: MemberStatus
    
    class Config:
        from_attributes = True


class MemberListResponse(BaseModel):
    members: list[MemberResponse]
    total: int
    page: int
    per_page: int
