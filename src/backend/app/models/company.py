from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import pycountry
from src.backend.app.utils.app.database import Base

class Company(Base):
    __tablename__ = 'companies'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    country_code = Column(String(2), nullable=False)  # ISO 3166-1 alpha-2
    currency_code = Column(String(3), nullable=False)  # ISO 4217
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    users = relationship('User', back_populates='company')
    
    def __init__(self, name, email, country_code, phone=None, address=None):
        self.name = name
        self.email = email
        self.country_code = country_code
        self.phone = phone
        self.address = address
        self.currency_code = self.get_currency_for_country(country_code)
    
    @staticmethod
    def get_currency_for_country(country_code):
        """Get the currency code for a given country code"""
        country_currency_map = {
            'US': 'USD', 'IN': 'INR', 'GB': 'GBP', 'DE': 'EUR', 'FR': 'EUR',
            'IT': 'EUR', 'ES': 'EUR', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY',
            'CN': 'CNY', 'BR': 'BRL', 'MX': 'MXN', 'RU': 'RUB', 'KR': 'KRW',
            'SG': 'SGD', 'HK': 'HKD', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK',
            'DK': 'DKK', 'NZ': 'NZD', 'ZA': 'ZAR', 'TH': 'THB', 'MY': 'MYR',
            'ID': 'IDR', 'PH': 'PHP', 'VN': 'VND', 'AE': 'AED', 'SA': 'SAR',
            'TR': 'TRY', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RO': 'RON',
            'HR': 'HRK', 'BG': 'BGN', 'LT': 'EUR', 'LV': 'EUR', 'EE': 'EUR',
            'SI': 'EUR', 'SK': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'LU': 'EUR',
            'BE': 'EUR', 'NL': 'EUR', 'AT': 'EUR', 'FI': 'EUR', 'PT': 'EUR',
            'IE': 'EUR', 'GR': 'EUR'
        }
        return country_currency_map.get(country_code.upper(), 'USD')
    
    @property
    def country_name(self):
        try:
            country = pycountry.countries.get(alpha_2=self.country_code)
            return country.name if country else self.country_code
        except Exception:
            return self.country_code
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'country_code': self.country_code,
            'country_name': self.country_name,
            'currency_code': self.currency_code,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Company {self.name}>'