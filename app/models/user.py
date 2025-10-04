from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from passlib.context import CryptContext
import uuid
from app.database import Base

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(String(20), nullable=False, default='employee')  # admin, manager, employee
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Foreign Keys
    company_id = Column(UUID(as_uuid=True), ForeignKey('companies.id'), nullable=False)
    manager_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    
    # Relationships
    company = relationship('Company', back_populates='users')
    manager = relationship('User', remote_side=[id], backref='subordinates')
    
    def __init__(self, email, password, first_name, last_name, company_id, role='employee', manager_id=None):
        self.email = email
        self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.company_id = company_id
        self.role = role
        self.manager_id = manager_id
    
    def set_password(self, password):
        # Bcrypt has a 72 byte limit, so truncate if necessary
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
        self.password_hash = pwd_context.hash(password)
    
    def check_password(self, password):
        return pwd_context.verify(password, self.password_hash)
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_manager(self):
        return self.role in ['admin', 'manager']
    
    def can_manage_user(self, user_id):
        """Check if this user can manage another user"""
        if self.is_admin():
            return True
        if self.role == 'manager':
            # Check if the target user is a subordinate
            user = User.query.get(user_id)
            return user and user.manager_id == self.id
        return False
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'company_id': str(self.company_id),
            'manager_id': str(self.manager_id) if self.manager_id else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.email}>'