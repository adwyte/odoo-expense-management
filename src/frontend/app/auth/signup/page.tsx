"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const countries = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "EU", name: "European Union", currency: "EUR" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "JP", name: "Japan", currency: "JPY" },
]

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    // Create company with base currency from selected country
    const selectedCountry = countries.find((c) => c.code === formData.country)
    console.log("Creating company with currency:", selectedCountry?.currency)
    router.push("/auth/signin")
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl mb-6">Admin Signup</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Confirm Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Country</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
            required
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="px-4 py-2 border border-border mt-2" style={{ borderRadius: "3px" }}>
          Signup
        </button>

        <div className="text-sm text-muted text-center mt-2">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-fg underline">
            Signin
          </Link>
        </div>
      </form>
    </div>
  )
}
