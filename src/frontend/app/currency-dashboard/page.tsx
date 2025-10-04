"use client"

import { useState, useEffect } from "react"
import { apiService, type CountryResponse, type ExchangeRatesResponse } from "../../lib/api"

export default function CurrencyDashboard() {
  const [countries, setCountries] = useState<CountryResponse[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesResponse | null>(null)
  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState("USD")
  const [loading, setLoading] = useState(true)
  const [exchangeLoading, setExchangeLoading] = useState(false)
  const [error, setError] = useState("")

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true)
        const fetchedCountries = await apiService.getCountries()
        setCountries(fetchedCountries)
        
        // Also load initial exchange rates
        const rates = await apiService.getExchangeRates(selectedBaseCurrency)
        setExchangeRates(rates)
      } catch (error) {
        console.error('Failed to load countries:', error)
        setError("Failed to load currency data")
      } finally {
        setLoading(false)
      }
    }

    loadCountries()
  }, [])

  // Load exchange rates when base currency changes
  const handleCurrencyChange = async (newBaseCurrency: string) => {
    try {
      setExchangeLoading(true)
      setSelectedBaseCurrency(newBaseCurrency)
      const rates = await apiService.getExchangeRates(newBaseCurrency)
      setExchangeRates(rates)
    } catch (error) {
      console.error('Failed to load exchange rates:', error)
      setError("Failed to load exchange rates")
    } finally {
      setExchangeLoading(false)
    }
  }

  // Get unique currencies from countries
  const uniqueCurrencies = Array.from(
    new Set(countries.map(country => country.currency_code))
  ).sort()

  // Get popular currencies for quick selection
  const popularCurrencies = ["USD", "EUR", "GBP", "JPY", "CNY", "INR", "CAD", "AUD"]
  const availablePopularCurrencies = popularCurrencies.filter(currency => 
    uniqueCurrencies.includes(currency)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading currency data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Currency Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Real-time exchange rates and country currency information
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Currency Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Countries</h3>
            <p className="text-3xl font-bold text-blue-600">{countries.length}</p>
            <p className="text-gray-600">Available countries</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Currencies</h3>
            <p className="text-3xl font-bold text-green-600">{uniqueCurrencies.length}</p>
            <p className="text-gray-600">Unique currencies</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Exchange Rates</h3>
            <p className="text-3xl font-bold text-purple-600">
              {exchangeRates?.rates ? Object.keys(exchangeRates.rates).length : 0}
            </p>
            <p className="text-gray-600">Available rates</p>
          </div>
        </div>

        {/* Currency Converter */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exchange Rates</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Currency:
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {availablePopularCurrencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => handleCurrencyChange(currency)}
                  disabled={exchangeLoading}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedBaseCurrency === currency
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } disabled:opacity-50`}
                >
                  {currency}
                </button>
              ))}
            </div>
            
            <select
              value={selectedBaseCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              disabled={exchangeLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {uniqueCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          {exchangeLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Loading exchange rates...</p>
            </div>
          )}

          {exchangeRates && !exchangeLoading && (
            <div>
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  Base: <span className="font-semibold">{exchangeRates.base}</span>
                  {exchangeRates.date && (
                    <span className="ml-4">
                      Date: <span className="font-semibold">{exchangeRates.date}</span>
                    </span>
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {Object.entries(exchangeRates.rates)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([currency, rate]) => (
                    <div key={currency} className="p-3 border border-gray-200 rounded">
                      <div className="font-semibold text-gray-900">{currency}</div>
                      <div className="text-lg text-blue-600">
                        {typeof rate === 'number' ? rate.toFixed(4) : rate}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Countries List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Countries & Currencies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {countries.map((country) => (
              <div key={country.country_code} className="p-4 border border-gray-200 rounded hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{country.country_name}</div>
                    <div className="text-sm text-gray-600">{country.country_code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">{country.currency_code}</div>
                    <div className="text-xs text-gray-500">{country.currency_name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}