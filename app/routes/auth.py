from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.company import Company
from app.schemas.auth_schemas import (
    SignupRequest, LoginRequest, AuthResponse, 
    UserResponse, CompanyResponse, TokenResponse
)
from app.utils.auth import create_access_token, create_refresh_token, verify_token, get_current_user

router = APIRouter()

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(signup_data: SignupRequest, db: Session = Depends(get_db)):
    """
    First-time signup that creates both company and admin user
    """
    # Check if user already exists
    if db.query(User).filter(User.email == signup_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Check if company email already exists
    if db.query(Company).filter(Company.email == signup_data.company_email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this email already exists"
        )
    
    try:
        # Create company first
        company = Company(
            name=signup_data.company_name,
            email=signup_data.company_email,
            country_code=signup_data.country_code,
            phone=signup_data.company_phone,
            address=signup_data.company_address
        )
        
        db.add(company)
        db.flush()  # Get the company ID
        
        # Create admin user
        admin_user = User(
            email=signup_data.email,
            password=signup_data.password,
            first_name=signup_data.first_name,
            last_name=signup_data.last_name,
            company_id=company.id,
            role='admin'
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        db.refresh(company)
        
        # Generate tokens
        access_token = create_access_token(data={"sub": str(admin_user.id)})
        refresh_token = create_refresh_token(data={"sub": str(admin_user.id)})
        
        return AuthResponse(
            message="Company and admin user created successfully",
            user=UserResponse.from_orm(admin_user),
            company=CompanyResponse.from_orm(company),
            access_token=access_token,
            refresh_token=refresh_token
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/login", response_model=AuthResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    User login
    """
    # Find user
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not user.check_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        message="Login successful",
        user=UserResponse.from_orm(user),
        company=CompanyResponse.from_orm(user.company),
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """
    Refresh access token
    """
    try:
        user_id = verify_token(refresh_token, "refresh")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or inactive"
            )
        
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/me")
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user information
    """
    return {
        "user": UserResponse.from_orm(current_user),
        "company": CompanyResponse.from_orm(current_user.company)
    }