"use client"

import { useState } from "react"
import Link from "next/link"

type ApprovalRequest = {
  id: string
  subject: string
  owner: string
  category: string
  status: "pending" | "approved" | "rejected"
  submittedAmount: number
  submittedCurrency: string
  companyAmount: number
  companyCurrency: string
  readonly: boolean
}

export default function ManagerPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: "1",
      subject: "Travel expenses - Client meeting",
      owner: "John Doe",
      category: "Travel",
      status: "pending",
      submittedAmount: 450.0,
      submittedCurrency: "USD",
      companyAmount: 450.0,
      companyCurrency: "USD",
      readonly: false,
    },
    {
      id: "2",
      subject: "Office supplies purchase",
      owner: "Jane Smith",
      category: "Office Supplies",
      status: "pending",
      submittedAmount: 89.99,
      submittedCurrency: "EUR",
      companyAmount: 95.5,
      companyCurrency: "USD",
      readonly: false,
    },
  ])

  const handleApprove = (id: string) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: "approved" as const, readonly: true } : req)))
  }

  const handleReject = (id: string) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: "rejected" as const, readonly: true } : req)))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">Approvals to review</h2>
        <Link href="/auth/signin" className="px-4 py-2 border border-border text-sm" style={{ borderRadius: "3px" }}>
          Sign Out
        </Link>
      </div>

      <div className="border border-border" style={{ borderRadius: "3px" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-normal">Approval Subject</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Request Owner</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Category</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Request Status</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Total Amount</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Approve</th>
              <th className="px-4 py-3 text-left text-sm font-normal">Reject</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-border">
                <td className="px-4 py-3 text-sm">{request.subject}</td>
                <td className="px-4 py-3 text-sm">{request.owner}</td>
                <td className="px-4 py-3 text-sm">{request.category}</td>
                <td className="px-4 py-3 text-sm">{request.status}</td>
                <td className="px-4 py-3 text-sm">
                  {request.submittedCurrency} {request.submittedAmount.toFixed(2)}
                  <br />
                  <span className="text-xs text-muted">
                    ({request.companyCurrency} {request.companyAmount.toFixed(2)})
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!request.readonly && (
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-3 py-1 border text-sm"
                      style={{
                        borderRadius: "3px",
                        borderColor: "var(--accent-ok)",
                        color: "var(--accent-ok)",
                      }}
                    >
                      Approve
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!request.readonly && (
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-3 py-1 border text-sm"
                      style={{
                        borderRadius: "3px",
                        borderColor: "var(--accent-danger)",
                        color: "var(--accent-danger)",
                      }}
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
