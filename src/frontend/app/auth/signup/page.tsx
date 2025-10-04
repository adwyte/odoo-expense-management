"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiService, type SignupData } from "../../../lib/api"

const countries = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
]

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    company_email: "",
    country_code: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)
    
    try {
      const signupData: SignupData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
        company_email: formData.company_email,
        country_code: formData.country_code,
      }

      const response = await apiService.signup(signupData)
      
      // Save tokens
      apiService.saveTokens(response.access_token, response.refresh_token)
      
      // Redirect based on user role
      if (response.user.role === "admin") {
        router.push("/admin/approval-rules")
      } else if (response.user.role === "manager") {
        router.push("/manager")
      } else {
        router.push("/employee")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl mb-6">Admin Signup</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm">First Name</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Last Name</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Personal Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
            required
            minLength={8}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Confirm Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Company Name</label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Company Email</label>
          <input
            type="email"
            value={formData.company_email}
            onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Country</label>
          <select
            value={formData.country_code}
            onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.currency})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/auth/signin" className="text-blue-600 hover:underline">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  )
}
