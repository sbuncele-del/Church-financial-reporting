"""
Reports API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.services.reports import ReportService
from app.api.deps import get_current_user, require_finance, get_church_id

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/income-statement")
async def income_statement_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Generate income statement report."""
    service = ReportService(db, church_id)
    return service.get_income_statement(start_date, end_date)


@router.get("/monthly-comparison")
async def monthly_comparison_report(
    year: int = Query(..., ge=2000, le=2100),
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Generate monthly comparison report for a year."""
    service = ReportService(db, church_id)
    return service.get_monthly_comparison(year)


@router.get("/budget-vs-actual")
async def budget_vs_actual_report(
    budget_id: int = Query(...),
    as_of_date: Optional[date] = None,
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Generate budget vs actual comparison report."""
    service = ReportService(db, church_id)
    result = service.get_budget_vs_actual(budget_id, as_of_date)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/donor-statement/{member_id}")
async def donor_statement_report(
    member_id: int,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Generate donor contribution statement."""
    service = ReportService(db, church_id)
    result = service.get_donor_statement(member_id, start_date, end_date)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/top-donors")
async def top_donors_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Get top donors for the period."""
    service = ReportService(db, church_id)
    return service.get_top_donors(start_date, end_date, limit)


@router.get("/export/transactions")
async def export_transactions(
    start_date: date = Query(...),
    end_date: date = Query(...),
    transaction_type: str = Query("all", regex="^(income|expense|all)$"),
    current_user: User = Depends(require_finance),
    church_id: int = Depends(get_church_id),
    db: Session = Depends(get_db)
):
    """Export transactions to CSV."""
    service = ReportService(db, church_id)
    csv_data = service.export_transactions_csv(start_date, end_date, transaction_type)
    
    filename = f"transactions_{start_date}_{end_date}.csv"
    return StreamingResponse(
        csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
