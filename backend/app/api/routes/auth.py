"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_tokens, decode_token
from app.models.user import User, UserRole
from app.models.church import Church
from app.schemas.user import (
    UserCreate, UserRegister, LoginRequest, TokenResponse, 
    UserResponse, RefreshTokenRequest
)
from app.services.seed_data import seed_default_categories

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        role=UserRole.MEMBER,
        is_active=True,
        is_verified=False
    )
    
    db.add(user)
    db.flush()  # Get user ID without committing yet
    
    # If church_name provided, create the church and associate the user
    if user_data.church_name:
        church = Church(
            name=user_data.church_name,
            currency="ZAR",
            country="South Africa",
            fiscal_year_start_month=1,
        )
        db.add(church)
        db.flush()  # Get church ID
        
        # Associate user with church and make them admin
        user.church_id = church.id
        user.role = UserRole.ADMIN
        
        # Seed default categories for the new church
        try:
            seed_default_categories(db, church.id)
            logger.info(f"Seeded default categories for church '{church.name}' (id={church.id})")
        except Exception as e:
            logger.error(f"Failed to seed categories: {e}")
    
    db.commit()
    db.refresh(user)
    
    # Auto-login: return tokens
    tokens = create_tokens(user.id, user.email, user.role.value)
    
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return tokens."""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create tokens
    tokens = create_tokens(user.id, user.email, user.role.value)
    
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest, 
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    token_data = decode_token(refresh_data.refresh_token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    tokens = create_tokens(user.id, user.email, user.role.value)
    
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/logout")
async def logout():
    """Logout user (client should discard tokens)."""
    return {"message": "Successfully logged out"}
