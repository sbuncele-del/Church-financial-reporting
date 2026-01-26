"""
Member management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.member import Member, MemberStatus
from app.models.user import User
from app.schemas.member import (
    MemberCreate, MemberUpdate, MemberResponse, 
    MemberListResponse, MemberSummary
)
from app.api.deps import get_current_user, require_leader, get_church_id

router = APIRouter(prefix="/members", tags=["Members"])


@router.get("", response_model=MemberListResponse)
async def list_members(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[MemberStatus] = None,
    search: Optional[str] = None,
    family_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """List church members."""
    query = db.query(Member).filter(Member.church_id == church_id)
    
    if status:
        query = query.filter(Member.member_status == status)
    if family_id:
        query = query.filter(Member.family_id == family_id)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Member.first_name.ilike(search_term)) |
            (Member.last_name.ilike(search_term)) |
            (Member.email.ilike(search_term))
        )
    
    total = query.count()
    members = query.order_by(Member.last_name, Member.first_name)\
                   .offset((page - 1) * per_page).limit(per_page).all()
    
    return MemberListResponse(
        members=[MemberResponse.model_validate(m) for m in members],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/summary", response_model=list[MemberSummary])
async def get_members_summary(
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Get minimal member list for dropdowns."""
    members = db.query(Member).filter(
        Member.church_id == church_id,
        Member.member_status == MemberStatus.ACTIVE
    ).order_by(Member.last_name, Member.first_name).all()
    
    return [MemberSummary.model_validate(m) for m in members]


@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    member_data: MemberCreate,
    current_user: User = Depends(require_leader),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Create a new church member."""
    member = Member(
        church_id=church_id,
        **member_data.model_dump(exclude={"church_id"})
    )
    
    db.add(member)
    db.commit()
    db.refresh(member)
    
    return member


@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Get a specific member."""
    member = db.query(Member).filter(
        Member.id == member_id,
        Member.church_id == church_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    return member


@router.put("/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: int,
    member_data: MemberUpdate,
    current_user: User = Depends(require_leader),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Update a member."""
    member = db.query(Member).filter(
        Member.id == member_id,
        Member.church_id == church_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    update_data = member_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
    
    db.commit()
    db.refresh(member)
    
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: int,
    current_user: User = Depends(require_leader),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Mark member as inactive (soft delete)."""
    member = db.query(Member).filter(
        Member.id == member_id,
        Member.church_id == church_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    member.member_status = MemberStatus.INACTIVE
    db.commit()
