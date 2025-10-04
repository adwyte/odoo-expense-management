from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
import pycountry

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    company_name: str
    company_email: EmailStr
    country_code: str
    company_phone: Optional[str] = None
    company_address: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if len(v) < 2 or len(v) > 50:
            raise ValueError('Name must be between 2 and 50 characters')
        return v
    
    @validator('company_name')
    def validate_company_name(cls, v):
        if len(v) < 2 or len(v) > 100:
            raise ValueError('Company name must be between 2 and 100 characters')
        return v
    
    @validator('country_code')
    def validate_country_code(cls, v):
        try:
            pycountry.countries.get(alpha_2=v.upper())
            return v.upper()
        except Exception:
            raise ValueError('Invalid country code')

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str
    manager_id: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if len(v) < 2 or len(v) > 50:
            raise ValueError('Name must be between 2 and 50 characters')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['employee', 'manager']:
            raise ValueError('Role must be either employee or manager')
        return v

class UpdateUserRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    manager_id: Optional[str] = None
    is_active: Optional[bool] = None
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if v and (len(v) < 2 or len(v) > 50):
            raise ValueError('Name must be between 2 and 50 characters')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        if v and v not in ['employee', 'manager', 'admin']:
            raise ValueError('Role must be employee, manager, or admin')
        return v

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    full_name: str
    role: str
    is_active: bool
    company_id: str
    manager_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=str(obj.id),
            email=obj.email,
            first_name=obj.first_name,
            last_name=obj.last_name,
            full_name=obj.full_name,
            role=obj.role,
            is_active=obj.is_active,
            company_id=str(obj.company_id),
            manager_id=str(obj.manager_id) if obj.manager_id else None,
            created_at=obj.created_at,
            updated_at=obj.updated_at
        )

class CompanyResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str]
    address: Optional[str]
    country_code: str
    country_name: str
    currency_code: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=str(obj.id),
            name=obj.name,
            email=obj.email,
            phone=obj.phone,
            address=obj.address,
            country_code=obj.country_code,
            country_name=obj.country_name,
            currency_code=obj.currency_code,
            is_active=obj.is_active,
            created_at=obj.created_at,
            updated_at=obj.updated_at
        )

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class AuthResponse(BaseModel):
    message: str
    user: UserResponse
    company: CompanyResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UsersListResponse(BaseModel):
    users: list[UserResponse]
    total: int

class CompanyStatsResponse(BaseModel):
    company_id: str
    company_name: str
    total_users: int
    user_breakdown: dict
    currency: str
    country: str