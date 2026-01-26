"""
Church schemas for API requests and responses.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ============== BASE SCHEMAS ==============

class ChurchBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    denomination: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    website: Optional[str] = Field(None, max_length=255)
    
    # Address
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = "United States"
    
    # Settings
    currency: str = "USD"
    fiscal_year_start_month: int = Field(default=1, ge=1, le=12)
    timezone: str = "America/New_York"


# ============== CREATE/UPDATE SCHEMAS ==============

class ChurchCreate(ChurchBase):
    pass


class ChurchUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    denomination: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    website: Optional[str] = Field(None, max_length=255)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = None
    currency: Optional[str] = None
    fiscal_year_start_month: Optional[int] = Field(None, ge=1, le=12)
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


# ============== RESPONSE SCHEMAS ==============

class ChurchResponse(ChurchBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ChurchSummary(BaseModel):
    """Minimal church info for lists."""
    id: int
    name: str
    city: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True
