"""
User management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.user import (
    UserCreate, UserUpdate, UserResponse, UserListResponse,
    UserUpdatePassword, UserUpdateRole
)
from app.api.deps import get_current_user, require_admin, get_church_id

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    update_data = user_data.model_dump(exclude_unset=True)
    
    # Don't allow changing is_active through this endpoint
    update_data.pop("is_active", None)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
async def change_password(
    password_data: UserUpdatePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password."""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """List users in the church (admin only)."""
    query = db.query(User).filter(User.church_id == church_id)
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.first_name.ilike(search_term)) |
            (User.last_name.ilike(search_term)) |
            (User.email.ilike(search_term))
        )
    
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return UserListResponse(
        users=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        per_page=per_page
    )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)."""
    # Check if email exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        role=user_data.role,
        church_id=church_id,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Get a specific user (admin only)."""
    user = db.query(User).filter(
        User.id == user_id,
        User.church_id == church_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update a user (admin only)."""
    user = db.query(User).filter(
        User.id == user_id,
        User.church_id == church_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    role_data: UserUpdateRole,
    current_user: User = Depends(require_admin),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update a user's role (admin only)."""
    user = db.query(User).filter(
        User.id == user_id,
        User.church_id == church_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent demoting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    user.role = role_data.role
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Deactivate a user (admin only). Does not delete."""
    user = db.query(User).filter(
        User.id == user_id,
        User.church_id == church_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    
    user.is_active = False
    db.commit()
