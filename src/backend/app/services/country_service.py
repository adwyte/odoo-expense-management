import httpx
import asyncio
from typing import List, Dict, Optional
from src.backend.app.utils.app.config import settings

class CountryService:
    """Service for fetching country and currency data"""
    
    COUNTRIES_API = "https://restcountries.com/v3.1/all?fields=name,currencies,cca2"
    EXCHANGE_API = "https://api.exchangerate-api.com/v4/latest"
    
    @staticmethod
    async def get_countries_with_currencies() -> List[Dict]:
        """
        Fetch all countries with their currencies from REST Countries API
        Returns: List of countries with currency information
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(CountryService.COUNTRIES_API, timeout=10.0)
                response.raise_for_status()
                
                countries_data = response.json()
                formatted_countries = []
                
                for country in countries_data:
                    try:
                        # Get country name
                        country_name = country.get("name", {}).get("common", "Unknown")
                        country_code = country.get("cca2", "")
                        
                        # Get primary currency
                        currencies = country.get("currencies", {})
                        primary_currency = None
                        currency_name = None
                        
                        if currencies:
                            # Get the first currency (most countries have one primary currency)
                            currency_code = list(currencies.keys())[0]
                            currency_info = currencies[currency_code]
                            primary_currency = currency_code
                            currency_name = currency_info.get("name", currency_code)
                        
                        if country_code and primary_currency:
                            formatted_countries.append({
                                "country_code": country_code,
                                "country_name": country_name,
                                "currency_code": primary_currency,
                                "currency_name": currency_name
                            })
                    except (KeyError, IndexError):
                        # Skip countries with missing data
                        continue
                
                # Sort by country name
                formatted_countries.sort(key=lambda x: x["country_name"])
                return formatted_countries
                
        except httpx.RequestError as e:
            print(f"Error fetching countries: {e}")
            return CountryService._get_fallback_countries()
        except Exception as e:
            print(f"Unexpected error: {e}")
            return CountryService._get_fallback_countries()
    
    @staticmethod
    async def get_exchange_rates(base_currency: str = "USD") -> Dict:
        """
        Fetch current exchange rates for a base currency
        Args:
            base_currency: The base currency code (e.g., 'USD', 'EUR')
        Returns: Dictionary with exchange rates
        """
        try:
            async with httpx.AsyncClient() as client:
                url = f"{CountryService.EXCHANGE_API}/{base_currency.upper()}"
                response = await client.get(url, timeout=10.0)
                response.raise_for_status()
                
                data = response.json()
                return {
                    "base": data.get("base"),
                    "date": data.get("date"),
                    "rates": data.get("rates", {})
                }
                
        except httpx.RequestError as e:
            print(f"Error fetching exchange rates: {e}")
            return {"base": base_currency, "rates": {}, "error": str(e)}
        except Exception as e:
            print(f"Unexpected error: {e}")
            return {"base": base_currency, "rates": {}, "error": str(e)}
    
    @staticmethod
    def _get_fallback_countries() -> List[Dict]:
        """
        Fallback list of major countries with currencies
        Used when API is unavailable
        """
        return [
            {"country_code": "US", "country_name": "United States", "currency_code": "USD", "currency_name": "US Dollar"},
            {"country_code": "GB", "country_name": "United Kingdom", "currency_code": "GBP", "currency_name": "British Pound"},
            {"country_code": "DE", "country_name": "Germany", "currency_code": "EUR", "currency_name": "Euro"},
            {"country_code": "FR", "country_name": "France", "currency_code": "EUR", "currency_name": "Euro"},
            {"country_code": "IN", "country_name": "India", "currency_code": "INR", "currency_name": "Indian Rupee"},
            {"country_code": "JP", "country_name": "Japan", "currency_code": "JPY", "currency_name": "Japanese Yen"},
            {"country_code": "CA", "country_name": "Canada", "currency_code": "CAD", "currency_name": "Canadian Dollar"},
            {"country_code": "AU", "country_name": "Australia", "currency_code": "AUD", "currency_name": "Australian Dollar"},
            {"country_code": "CN", "country_name": "China", "currency_code": "CNY", "currency_name": "Chinese Yuan"},
            {"country_code": "BR", "country_name": "Brazil", "currency_code": "BRL", "currency_name": "Brazilian Real"},
        ]

# Singleton instance for caching
country_service = CountryService()