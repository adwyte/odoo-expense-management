from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth_schemas import CompanyResponse, CompanyStatsResponse
from app.utils.auth import get_current_user, get_current_admin_user

router = APIRouter()

@router.get("/me", response_model=CompanyResponse)
def get_my_company(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's company information
    """
    return CompanyResponse.from_orm(current_user.company)

@router.get("/stats", response_model=CompanyStatsResponse)
def get_company_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get company statistics (admin only)
    """
    company = current_user.company
    
    # Get user statistics
    total_users = db.query(User).filter(
        User.company_id == company.id,
        User.is_active == True
    ).count()
    
    admin_count = db.query(User).filter(
        User.company_id == company.id,
        User.role == 'admin',
        User.is_active == True
    ).count()
    
    manager_count = db.query(User).filter(
        User.company_id == company.id,
        User.role == 'manager',
        User.is_active == True
    ).count()
    
    employee_count = db.query(User).filter(
        User.company_id == company.id,
        User.role == 'employee',
        User.is_active == True
    ).count()
    
    return CompanyStatsResponse(
        company_id=str(company.id),
        company_name=company.name,
        total_users=total_users,
        user_breakdown={
            'admins': admin_count,
            'managers': manager_count,
            'employees': employee_count
        },
        currency=company.currency_code,
        country=company.country_name
    )