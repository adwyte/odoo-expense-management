from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Optional
from src.backend.app.services.country_service import country_service
from pydantic import BaseModel

router = APIRouter()

class CountryResponse(BaseModel):
    country_code: str
    country_name: str
    currency_code: str
    currency_name: str

class ExchangeRatesResponse(BaseModel):
    base: str
    date: Optional[str] = None
    rates: Dict[str, float]

@router.get("/countries", response_model=List[CountryResponse])
async def get_countries():
    """
    Get all countries with their currencies
    """
    try:
        countries = await country_service.get_countries_with_currencies()
        return countries
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch countries: {str(e)}"
        )

@router.get("/exchange-rates/{base_currency}", response_model=ExchangeRatesResponse)
async def get_exchange_rates(base_currency: str):
    """
    Get current exchange rates for a specific base currency
    """
    # Validate currency code (basic validation)
    if not base_currency or len(base_currency) != 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currency code must be a 3-letter ISO code (e.g., USD, EUR)"
        )
    
    try:
        rates = await country_service.get_exchange_rates(base_currency.upper())
        
        # Check if there was an error fetching rates
        if "error" in rates:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Exchange rate service unavailable: {rates['error']}"
            )
        
        return ExchangeRatesResponse(
            base=rates.get("base", base_currency.upper()),
            date=rates.get("date"),
            rates=rates.get("rates", {})
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch exchange rates: {str(e)}"
        )

@router.get("/exchange-rates")
async def get_default_exchange_rates():
    """
    Get current exchange rates with USD as base currency
    """
    return await get_exchange_rates("USD")