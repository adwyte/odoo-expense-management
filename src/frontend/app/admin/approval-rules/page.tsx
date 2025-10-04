"use client"

import type React from "react"
import Link from "next/link"

import { useState } from "react"

type Approver = {
  id: string
  name: string
  required: boolean
}

export default function ApprovalRulesPage() {
  const [user, setUser] = useState("")
  const [description, setDescription] = useState("")
  const [manager, setManager] = useState("Sarah Johnson")
  const [isManagerApprover, setIsManagerApprover] = useState(false)
  const [sequentialApproval, setSequentialApproval] = useState(false)
  const [minApprovalPercentage, setMinApprovalPercentage] = useState("100")
  const [approvers, setApprovers] = useState<Approver[]>([
    { id: "1", name: "Sarah Johnson", required: true },
    { id: "2", name: "Michael Chen", required: false },
  ])

  const managers = ["Sarah Johnson", "Michael Chen", "Emily Davis", "Robert Wilson"]

  const handleAddApprover = () => {
    const newApprover: Approver = {
      id: Date.now().toString(),
      name: "",
      required: false,
    }
    setApprovers([...approvers, newApprover])
  }

  const handleRemoveApprover = (id: string) => {
    setApprovers(approvers.filter((a) => a.id !== id))
  }

  const handleApproverChange = (id: string, field: keyof Approver, value: any) => {
    setApprovers(approvers.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Approval rules saved:", {
      user,
      description,
      manager,
      isManagerApprover,
      sequentialApproval,
      minApprovalPercentage,
      approvers,
    })
    alert("Approval rules saved")
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">Admin Approval Rules</h2>
        <Link href="/auth/signin" className="px-4 py-2 border border-border text-sm" style={{ borderRadius: "3px" }}>
          Sign Out
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm">User</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
            placeholder="Enter user name"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Description about rules</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
            placeholder="Enter rule description"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Manager</label>
          <select
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            className="px-3 py-2 border border-border bg-bg text-fg"
            style={{ borderRadius: "3px" }}
          >
            {managers.map((mgr) => (
              <option key={mgr} value={mgr}>
                {mgr}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-border p-4" style={{ borderRadius: "3px" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm">Approvers</h3>
            <button
              type="button"
              onClick={handleAddApprover}
              className="px-3 py-1 border border-border text-sm"
              style={{ borderRadius: "3px" }}
            >
              Add Approver
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {approvers.map((approver) => (
              <div key={approver.id} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={approver.name}
                  onChange={(e) => handleApproverChange(approver.id, "name", e.target.value)}
                  className="flex-1 px-3 py-2 border border-border bg-bg text-fg"
                  style={{ borderRadius: "3px" }}
                  placeholder="Approver name"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={approver.required}
                    onChange={(e) => handleApproverChange(approver.id, "required", e.target.checked)}
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveApprover(approver.id)}
                  className="px-3 py-1 border border-border text-sm"
                  style={{ borderRadius: "3px" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isManagerApprover} onChange={(e) => setIsManagerApprover(e.target.checked)} />
          Is manager an approver?
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sequentialApproval}
            onChange={(e) => setSequentialApproval(e.target.checked)}
          />
          Approvers Sequence (sequential if checked, parallel if unchecked)
        </label>

        <div className="flex flex-col gap-1">
          <label className="text-sm">Minimum Approval Percentage</label>
          <input
            type="number"
            min="0"
            max="100"
            value={minApprovalPercentage}
            onChange={(e) => setMinApprovalPercentage(e.target.value)}
            className="px-3 py-2 border border-border bg-bg text-fg w-32"
            style={{ borderRadius: "3px" }}
          />
        </div>

        <button type="submit" className="px-4 py-2 border border-border self-start" style={{ borderRadius: "3px" }}>
          Save Rules
        </button>
      </form>
    </div>
  )
}
