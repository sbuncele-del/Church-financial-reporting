"""
Church management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.church import Church
from app.models.user import User, UserRole
from app.schemas.church import ChurchCreate, ChurchUpdate, ChurchResponse
from app.api.deps import get_current_user, require_admin, get_church_id

router = APIRouter(prefix="/churches", tags=["Churches"])


@router.get("/current", response_model=ChurchResponse)
async def get_current_church(
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Get the current user's church."""
    church = db.query(Church).filter(Church.id == church_id).first()
    if not church:
        raise HTTPException(status_code=404, detail="Church not found")
    return church


@router.put("/current", response_model=ChurchResponse)
async def update_current_church(
    church_data: ChurchUpdate,
    current_user: User = Depends(require_admin),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update the current church's information."""
    church = db.query(Church).filter(Church.id == church_id).first()
    if not church:
        raise HTTPException(status_code=404, detail="Church not found")
    
    for field, value in church_data.model_dump(exclude_unset=True).items():
        setattr(church, field, value)
    
    db.commit()
    db.refresh(church)
    return church


@router.post("", response_model=ChurchResponse, status_code=status.HTTP_201_CREATED)
async def create_church(
    church_data: ChurchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new church (typically during onboarding)."""
    # Check if user already has a church
    if current_user.church_id:
        raise HTTPException(
            status_code=400,
            detail="User is already associated with a church"
        )
    
    church = Church(**church_data.model_dump())
    db.add(church)
    db.commit()
    db.refresh(church)
    
    # Associate user with church and make them admin
    current_user.church_id = church.id
    current_user.role = UserRole.ADMIN
    db.commit()
    
    return church
