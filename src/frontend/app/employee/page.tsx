"use client"

import type React from "react"
import Link from "next/link"

import { useState } from "react"

type ExpenseStatus = "draft" | "submitted" | "waiting-approval" | "approved" | "rejected"

type Expense = {
  id: string
  employee: string
  description: string
  date: string
  category: string
  paidBy: string
  remarks: string
  amount: number
  currency: string
  status: ExpenseStatus
  history: { approver: string; status: string; time: string }[]
}

const categories = ["Travel", "Food", "Office Supplies", "Software", "Other"]
const paidByOptions = ["Company Card", "Personal Card", "Cash"]
const currencies = ["USD", "EUR", "GBP", "INR", "JPY"]

export default function EmployeePage() {
  const [showForm, setShowForm] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    date: "",
    paidBy: "",
    remarks: "",
    amount: "",
    currency: "USD",
    detailedDescription: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleUpload = () => {
    // Stub OCR functionality
    const ocrData = {
      amount: "125.50",
      date: "2025-01-15",
      category: "Food",
      description: "Restaurant receipt",
    }
    setFormData({
      ...formData,
      amount: ocrData.amount,
      date: ocrData.date,
      category: ocrData.category,
      description: ocrData.description,
    })
    setShowForm(true)
    alert("Receipt uploaded and processed")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newExpense: Expense = {
      id: Date.now().toString(),
      employee: "John Doe",
      description: formData.description,
      date: formData.date,
      category: formData.category,
      paidBy: formData.paidBy,
      remarks: formData.remarks,
      amount: Number.parseFloat(formData.amount),
      currency: formData.currency,
      status: "submitted",
      history: [
        {
          approver: "System",
          status: "Submitted",
          time: new Date().toLocaleString(),
        },
      ],
    }
    setExpenses([...expenses, newExpense])
    setEditingId(newExpense.id)
    setShowForm(false)
  }

  const isReadOnly = (expense: Expense) => {
    return expense.status !== "draft"
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button onClick={handleUpload} className="px-4 py-2 border border-border" style={{ borderRadius: "3px" }}>
            Upload
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 border border-border"
            style={{ borderRadius: "3px" }}
          >
            New
          </button>
        </div>
        <Link href="/auth/signin" className="px-4 py-2 border border-border text-sm" style={{ borderRadius: "3px" }}>
          Sign Out
        </Link>
      </div>

      {showForm && (
        <div className="mb-8 p-6 border border-border" style={{ borderRadius: "3px" }}>
          <h3 className="text-lg mb-4">New Expense</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-3 py-2 border border-border bg-bg text-fg"
                  style={{ borderRadius: "3px" }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-3 py-2 border border-border bg-bg text-fg"
                  style={{ borderRadius: "3px" }}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm">Expense Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="px-3 py-2 border border-border bg-bg text-fg"
                  style={{ borderRadius: "3px" }}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm">Paid By</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="px-3 py-2 border border-border bg-bg text-fg"
                  style={{ borderRadius: "3px" }}
                  required
                >
                  <option value="">Select payment method</option>
                  {paidByOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm">Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="px-3 py-2 border border-border bg-bg text-fg"
                  style={{ borderRadius: "3px" }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm">Total Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="flex-1 px-3 py-2 border border-border bg-bg text-fg"
                    style={{ borderRadius: "3px" }}
                    required
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="px-3 py-2 border border-border bg-bg text-fg"
                    style={{ borderRadius: "3px" }}
                  >
                    {currencies.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm">Description (detailed)</label>
              <textarea
                value={formData.detailedDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    detailedDescription: e.target.value,
                  })
                }
                className="px-3 py-2 border border-border bg-bg text-fg"
                style={{ borderRadius: "3px" }}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 border border-border" style={{ borderRadius: "3px" }}>
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-border"
                style={{ borderRadius: "3px" }}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 border border-border" style={{ borderRadius: "3px" }}>
            <h4 className="text-sm mb-3">Status</h4>
            <div className="flex gap-4 text-sm">
              <span className="text-muted">Draft</span>
              <span>→</span>
              <span className="text-muted">Waiting approval</span>
              <span>→</span>
              <span className="text-muted">Approved</span>
            </div>
            <p className="text-xs text-muted mt-3">
              Submitted in {formData.currency}. Will be converted to company currency.
            </p>
          </div>
        </div>
      )}

      <div className="border border-border" style={{ borderRadius: "3px" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-normal">Employee</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Description</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Date</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Category</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Paid By</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Remarks</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-border">
                <td className="px-4 py-3 text-sm">{expense.employee}</td>
                <td className="px-4 py-3 text-sm">{expense.description}</td>
                <td className="px-4 py-3 text-sm">{expense.date}</td>
                <td className="px-4 py-3 text-sm">{expense.category}</td>
                <td className="px-4 py-3 text-sm">{expense.paidBy}</td>
                <td className="px-4 py-3 text-sm">{expense.remarks}</td>
                <td className="px-4 py-3 text-sm">
                  {expense.currency} {expense.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm">{expense.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && expenses.find((e) => e.id === editingId) && (
        <div className="mt-6 p-4 border border-border" style={{ borderRadius: "3px" }}>
          <h4 className="text-sm mb-3">History Log</h4>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-sm font-normal">Approver</th>
                <th className="px-4 py-2 text-left text-sm font-normal">Status</th>
                <th className="px-4 py-2 text-left text-sm font-normal">Time</th>
              </tr>
            </thead>
            <tbody>
              {expenses
                .find((e) => e.id === editingId)
                ?.history.map((entry, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-4 py-2 text-sm">{entry.approver}</td>
                    <td className="px-4 py-2 text-sm">{entry.status}</td>
                    <td className="px-4 py-2 text-sm">{entry.time}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
