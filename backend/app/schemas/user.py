"""
User schemas for API requests and responses.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# ============== BASE SCHEMAS ==============

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


# ============== CREATE SCHEMAS ==============

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.MEMBER
    church_id: Optional[int] = None


class UserRegister(BaseModel):
    """Public registration schema."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None


# ============== UPDATE SCHEMAS ==============

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class UserUpdateRole(BaseModel):
    role: UserRole


# ============== RESPONSE SCHEMAS ==============

class UserResponse(UserBase):
    id: int
    role: UserRole
    church_id: Optional[int]
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    per_page: int


# ============== AUTH SCHEMAS ==============

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str
