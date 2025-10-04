"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiService, type LoginData } from "../../../lib/api"

export default function SigninPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      const loginData: LoginData = {
        email: formData.email,
        password: formData.password,
      }

      const response = await apiService.login(loginData)
      
      // Save tokens
      apiService.saveTokens(response.access_token, response.refresh_token)
      
      // Get user info to determine role and redirect
      const userInfo = await apiService.getCurrentUser(response.access_token)
      
      // Redirect based on user role
      if (userInfo.user.role === "admin") {
        router.push("/admin/approval-rules")
      } else if (userInfo.user.role === "manager") {
        router.push("/manager")
      } else {
        router.push("/employee")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    if (!formData.email) {
      alert("Please enter your email address")
      return
    }
    alert(`Password reset functionality will be implemented soon for ${formData.email}`)
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl mb-6">Sign In</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm">Email</label>
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
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 hover:underline text-sm"
          >
            Forgot Password?
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <Link href="/auth/signup" className="text-blue-600 hover:underline">
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  )
}
