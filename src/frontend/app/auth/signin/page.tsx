"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SigninPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee" as "admin" | "manager" | "employee",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signing in:", formData)
    if (formData.role === "admin") {
      router.push("/admin/approval-rules")
    } else if (formData.role === "manager") {
      router.push("/manager")
    } else {
      router.push("/employee")
    }
  }

  const handleForgotPassword = () => {
    if (!formData.email) {
      alert("Please enter your email address")
      return
    }
    const randomPassword = Math.random().toString(36).slice(-8)
    console.log("Sending random password:", randomPassword, "to", formData.email)
    alert(`Password reset email sent to ${formData.email}`)
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl mb-6">Signin</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "manager" | "employee" })}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
            required
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
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

        <button type="submit" className="px-4 py-2 border border-border mt-2" style={{ borderRadius: "3px" }}>
          Login
        </button>

        <div className="flex flex-col gap-2 text-sm text-center mt-2">
          <div className="text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-fg underline">
              Signup
            </Link>
          </div>
          <button type="button" onClick={handleForgotPassword} className="text-muted underline">
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  )
}
