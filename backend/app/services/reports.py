"""
Financial Reports Service - Generate various financial reports.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from io import BytesIO
import csv

from app.models.finance import Income, Expense, IncomeCategory, ExpenseCategory, Budget, BudgetItem
from app.models.member import Member


class ReportService:
    """Service for generating financial reports."""
    
    def __init__(self, db: Session, church_id: int):
        self.db = db
        self.church_id = church_id
    
    def get_income_statement(
        self, 
        start_date: date, 
        end_date: date
    ) -> dict:
        """
        Generate an income statement (profit & loss) for the period.
        """
        # Get all income grouped by category
        income_data = self.db.query(
            IncomeCategory.name,
            func.sum(Income.amount).label('total')
        ).join(Income).filter(
            Income.church_id == self.church_id,
            Income.date >= start_date,
            Income.date <= end_date
        ).group_by(IncomeCategory.name).order_by(IncomeCategory.name).all()
        
        # Get all expenses grouped by category
        expense_data = self.db.query(
            ExpenseCategory.name,
            func.sum(Expense.amount).label('total')
        ).join(Expense).filter(
            Expense.church_id == self.church_id,
            Expense.date >= start_date,
            Expense.date <= end_date
        ).group_by(ExpenseCategory.name).order_by(ExpenseCategory.name).all()
        
        total_income = sum(row.total or 0 for row in income_data)
        total_expenses = sum(row.total or 0 for row in expense_data)
        
        return {
            "report_type": "Income Statement",
            "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "income": [{"category": row.name, "amount": float(row.total or 0)} for row in income_data],
            "expenses": [{"category": row.name, "amount": float(row.total or 0)} for row in expense_data],
            "summary": {
                "total_income": float(total_income),
                "total_expenses": float(total_expenses),
                "net_income": float(total_income - total_expenses)
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def get_monthly_comparison(self, year: int) -> dict:
        """
        Get month-by-month comparison for a year.
        """
        months = []
        
        for month in range(1, 13):
            # Income for month
            month_income = self.db.query(func.sum(Income.amount)).filter(
                Income.church_id == self.church_id,
                extract('year', Income.date) == year,
                extract('month', Income.date) == month
            ).scalar() or Decimal("0")
            
            # Expenses for month
            month_expenses = self.db.query(func.sum(Expense.amount)).filter(
                Expense.church_id == self.church_id,
                extract('year', Expense.date) == year,
                extract('month', Expense.date) == month
            ).scalar() or Decimal("0")
            
            months.append({
                "month": month,
                "month_name": datetime(year, month, 1).strftime("%B"),
                "income": float(month_income),
                "expenses": float(month_expenses),
                "net": float(month_income - month_expenses)
            })
        
        return {
            "report_type": "Monthly Comparison",
            "year": year,
            "months": months,
            "totals": {
                "income": sum(m["income"] for m in months),
                "expenses": sum(m["expenses"] for m in months),
                "net": sum(m["net"] for m in months)
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def get_budget_vs_actual(
        self, 
        budget_id: int, 
        as_of_date: Optional[date] = None
    ) -> dict:
        """
        Compare budget to actual income/expenses.
        """
        if not as_of_date:
            as_of_date = date.today()
        
        budget = self.db.query(Budget).filter(
            Budget.id == budget_id,
            Budget.church_id == self.church_id
        ).first()
        
        if not budget:
            return {"error": "Budget not found"}
        
        comparisons = []
        
        for item in budget.items:
            if item.is_income and item.income_category:
                # Get actual income
                actual = self.db.query(func.sum(Income.amount)).filter(
                    Income.church_id == self.church_id,
                    Income.category_id == item.income_category_id,
                    Income.date >= budget.start_date,
                    Income.date <= as_of_date
                ).scalar() or Decimal("0")
                
                category_name = item.income_category.name
            elif item.expense_category:
                # Get actual expenses
                actual = self.db.query(func.sum(Expense.amount)).filter(
                    Expense.church_id == self.church_id,
                    Expense.category_id == item.expense_category_id,
                    Expense.date >= budget.start_date,
                    Expense.date <= as_of_date
                ).scalar() or Decimal("0")
                
                category_name = item.expense_category.name
            else:
                continue
            
            budgeted = item.annual_amount or item.total_monthly
            variance = actual - budgeted
            variance_pct = (float(variance) / float(budgeted) * 100) if budgeted else 0
            
            comparisons.append({
                "category": category_name,
                "is_income": item.is_income,
                "budgeted": float(budgeted),
                "actual": float(actual),
                "variance": float(variance),
                "variance_percentage": round(variance_pct, 2)
            })
        
        return {
            "report_type": "Budget vs Actual",
            "budget_name": budget.name,
            "period": {
                "start": budget.start_date.isoformat(),
                "end": budget.end_date.isoformat(),
                "as_of": as_of_date.isoformat()
            },
            "comparisons": comparisons,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def get_donor_statement(
        self, 
        member_id: int, 
        start_date: date, 
        end_date: date
    ) -> dict:
        """
        Generate a giving statement for a member (for tax purposes).
        """
        member = self.db.query(Member).filter(
            Member.id == member_id,
            Member.church_id == self.church_id
        ).first()
        
        if not member:
            return {"error": "Member not found"}
        
        # Get all donations
        donations = self.db.query(Income).filter(
            Income.church_id == self.church_id,
            Income.member_id == member_id,
            Income.date >= start_date,
            Income.date <= end_date
        ).order_by(Income.date).all()
        
        donation_list = []
        total = Decimal("0")
        tax_deductible = Decimal("0")
        
        for d in donations:
            is_tax_deductible = d.category.is_tax_deductible if d.category else True
            donation_list.append({
                "date": d.date.isoformat(),
                "category": d.category.name if d.category else "General",
                "amount": float(d.amount),
                "payment_method": d.payment_method.value,
                "reference": d.reference_number,
                "is_tax_deductible": is_tax_deductible
            })
            total += d.amount
            if is_tax_deductible:
                tax_deductible += d.amount
        
        # Group by category
        by_category = {}
        for d in donation_list:
            cat = d["category"]
            if cat not in by_category:
                by_category[cat] = 0
            by_category[cat] += d["amount"]
        
        return {
            "report_type": "Donor Contribution Statement",
            "member": {
                "id": member.id,
                "name": member.full_name,
                "address": f"{member.address_line1 or ''}\n{member.city or ''}, {member.state or ''} {member.postal_code or ''}".strip()
            },
            "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "donations": donation_list,
            "by_category": by_category,
            "summary": {
                "total_contributions": float(total),
                "tax_deductible_amount": float(tax_deductible),
                "non_deductible_amount": float(total - tax_deductible),
                "donation_count": len(donation_list)
            },
            "generated_at": datetime.utcnow().isoformat(),
            "disclaimer": "No goods or services were provided in exchange for these contributions unless otherwise noted."
        }
    
    def get_top_donors(
        self, 
        start_date: date, 
        end_date: date, 
        limit: int = 10
    ) -> dict:
        """
        Get top donors for the period.
        """
        top_donors = self.db.query(
            Member.id,
            Member.first_name,
            Member.last_name,
            func.sum(Income.amount).label('total')
        ).join(Income, Income.member_id == Member.id).filter(
            Income.church_id == self.church_id,
            Income.date >= start_date,
            Income.date <= end_date,
            Income.is_anonymous == False
        ).group_by(Member.id, Member.first_name, Member.last_name)\
         .order_by(func.sum(Income.amount).desc())\
         .limit(limit).all()
        
        return {
            "report_type": "Top Donors",
            "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "donors": [
                {
                    "member_id": d.id,
                    "name": f"{d.first_name} {d.last_name}",
                    "total": float(d.total)
                }
                for d in top_donors
            ],
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def export_transactions_csv(
        self, 
        start_date: date, 
        end_date: date,
        transaction_type: str = "all"  # "income", "expense", or "all"
    ) -> BytesIO:
        """
        Export transactions to CSV format.
        """
        output = BytesIO()
        writer = csv.writer(output)
        
        if transaction_type in ("income", "all"):
            # Income header
            writer.writerow(["=== INCOME ==="])
            writer.writerow(["Date", "Category", "Amount", "Donor", "Payment Method", "Reference", "Description"])
            
            incomes = self.db.query(Income).filter(
                Income.church_id == self.church_id,
                Income.date >= start_date,
                Income.date <= end_date
            ).order_by(Income.date).all()
            
            for i in incomes:
                donor = "Anonymous" if i.is_anonymous else (i.member.full_name if i.member else "")
                writer.writerow([
                    i.date.isoformat(),
                    i.category.name if i.category else "",
                    float(i.amount),
                    donor,
                    i.payment_method.value,
                    i.reference_number or "",
                    i.description or ""
                ])
            
            writer.writerow([])  # Empty row
        
        if transaction_type in ("expense", "all"):
            # Expense header
            writer.writerow(["=== EXPENSES ==="])
            writer.writerow(["Date", "Category", "Amount", "Payee", "Payment Method", "Reference", "Invoice", "Description"])
            
            expenses = self.db.query(Expense).filter(
                Expense.church_id == self.church_id,
                Expense.date >= start_date,
                Expense.date <= end_date
            ).order_by(Expense.date).all()
            
            for e in expenses:
                writer.writerow([
                    e.date.isoformat(),
                    e.category.name if e.category else "",
                    float(e.amount),
                    e.payee_name,
                    e.payment_method.value,
                    e.reference_number or "",
                    e.invoice_number or "",
                    e.description or ""
                ])
        
        output.seek(0)
        return output
