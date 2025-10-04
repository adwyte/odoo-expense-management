from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.auth_schemas import (
    CreateUserRequest, UpdateUserRequest, ChangePasswordRequest,
    UserResponse, UsersListResponse
)
from app.utils.auth import get_current_user, get_current_admin_user, get_current_manager_user

router = APIRouter()

@router.get("/", response_model=UsersListResponse)
def get_users(
    current_user: User = Depends(get_current_manager_user),
    db: Session = Depends(get_db)
):
    """
    Get all users in the company (admin and managers only)
    """
    # Get users based on role
    if current_user.is_admin():
        # Admin can see all users in the company
        users = db.query(User).filter(
            User.company_id == current_user.company_id,
            User.is_active == True
        ).all()
    else:
        # Manager can see their subordinates
        users = db.query(User).filter(
            User.manager_id == current_user.id,
            User.is_active == True
        ).all()
    
    return UsersListResponse(
        users=[UserResponse.from_orm(user) for user in users],
        total=len(users)
    )

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: CreateUserRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new user (admin only)
    """
    # Check if user already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Validate manager if provided
    manager_id = user_data.manager_id
    if manager_id:
        manager = db.query(User).filter(
            User.id == manager_id,
            User.company_id == current_user.company_id,
            User.is_active == True
        ).first()
        if not manager or not manager.is_manager():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid manager specified"
            )
    
    try:
        # Create new user
        new_user = User(
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            company_id=current_user.company_id,
            role=user_data.role,
            manager_id=manager_id
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return UserResponse.from_orm(new_user)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user information (admin and managers for their subordinates)
    """
    # Check permissions
    if not current_user.can_manage_user(user_id) and str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get target user
    target_user = db.query(User).filter(
        User.id == user_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        # Update user fields
        if user_data.first_name is not None:
            target_user.first_name = user_data.first_name
        if user_data.last_name is not None:
            target_user.last_name = user_data.last_name
        if user_data.is_active is not None and current_user.is_admin():
            target_user.is_active = user_data.is_active
        
        # Only admin can change roles
        if user_data.role is not None and current_user.is_admin():
            target_user.role = user_data.role
        
        # Update manager
        if user_data.manager_id is not None and current_user.is_admin():
            manager_id = user_data.manager_id
            if manager_id:
                manager = db.query(User).filter(
                    User.id == manager_id,
                    User.company_id == current_user.company_id,
                    User.is_active == True
                ).first()
                if not manager or not manager.is_manager():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid manager specified"
                    )
            target_user.manager_id = manager_id
        
        db.commit()
        db.refresh(target_user)
        
        return UserResponse.from_orm(target_user)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Deactivate user (admin only)
    """
    # Get target user
    target_user = db.query(User).filter(
        User.id == user_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if str(target_user.id) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    
    try:
        # Deactivate user
        target_user.is_active = False
        db.commit()
        
        return {"message": "User deactivated successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    # Verify current password
    if not current_user.check_password(password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    try:
        # Update password
        current_user.set_password(password_data.new_password)
        db.commit()
        
        return {"message": "Password changed successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/managers", response_model=List[UserResponse])
def get_managers(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all managers and admins in the company (for assignment purposes)
    """
    # Get all managers and admins
    managers = db.query(User).filter(
        User.company_id == current_user.company_id,
        User.role.in_(['admin', 'manager']),
        User.is_active == True
    ).all()
    
    return [UserResponse.from_orm(manager) for manager in managers]