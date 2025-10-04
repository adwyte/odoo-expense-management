'use client';

import Link from "next/link";
import { useRef, useState } from "react";
import { Upload, Plus, X, Loader2 } from "lucide-react";

type ExpenseStatus = "draft" | "submitted" | "waiting-approval" | "approved" | "rejected";

type ExpenseRow = {
  id: string;
  employee: string;
  description: string;
  date: string;
  category: string;
  paidBy: string;
  remarks: string;
  amount: number;
  currency: string;
  status: ExpenseStatus;
  history: { approver: string; status: string; time: string }[];
};

const categories = ["Travel", "Food", "Office Supplies", "Software", "Other"];
const paidByOptions = ["Company Card", "Personal Card", "Cash"];
const currencies = ["INR", "EUR", "GBP", "USD", "JPY"];

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function EmployeePage() {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    description: "",
    category: "",
    date: "",
    paidBy: "",
    remarks: "",
    amount: "",
    currency: "INR",
    detailedDescription: "",
  });

  const statusBadge = (s: ExpenseStatus) => {
    const map: Record<ExpenseStatus, string> = {
      draft: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
      submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      "waiting-approval": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${map[s]}`}>
        {s.replace("-", " ")}
      </span>
    );
  };

  const Step = ({ label, active }: { label: string; active: boolean }) => (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700"}`} />
      <span className={`text-sm ${active ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500"}`}>{label}</span>
    </div>
  );

  const pickFile = () => fileRef.current?.click();

  // Upload → OCR → add Draft row & prefill form
  const onFileChosen = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // send "DEMO" — backend will auto-create demo company & user if needed
      fd.append("employee_id", "DEMO");
      fd.append("company_id", "DEMO");

      const res = await fetch(`${API}/api/expenses/ocr-upload`, { method: "POST", body: fd });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Upload failed (${res.status}): ${t}`);
      }
      const data = await res.json();

      // Prefill form
      setFormData((f) => ({
        ...f,
        amount: data.expense?.amount?.toString?.() ?? "",
        date: data.expense?.date ?? "",
        category: data.expense?.category ?? "",
        description: data.expense?.description ?? "Receipt",
        currency: data.expense?.currency ?? "INR",
      }));

      // Add draft row to table
      const newRow: ExpenseRow = {
        id: data.expense.id,
        employee: "You",
        description: data.expense.description ?? "",
        date: data.expense.date ?? "",
        category: data.expense.category ?? "",
        paidBy: data.expense.paid_by ?? "",
        remarks: data.expense.remarks ?? "",
        amount: Number(data.expense.amount ?? 0),
        currency: data.expense.currency ?? "INR",
        status: "draft",
        history: [{ approver: "System", status: "Draft", time: new Date().toLocaleString() }],
      };
      setExpenses((prev) => [newRow, ...prev]);
      setEditingId(newRow.id);
      setShowForm(true);
    } catch (e: any) {
      alert(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleUpload = async () => pickFile();

  // Submit → save edited fields and set status=submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setSaving(true);
    try {
      const payload = {
        description: formData.description,
        category: formData.category || null,
        expense_date: formData.date || null, // "YYYY-MM-DD"
        paid_by: formData.paidBy || null,
        remarks: formData.remarks || null,
        amount: Number(formData.amount || 0),
        currency_code: formData.currency,
        status: "submitted" as ExpenseStatus,
      };

      // Best effort (even if you haven’t wired the endpoint fully, demo still proceeds)
      await fetch(`${API}/api/expenses/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setExpenses((prev) =>
        prev.map((row) =>
          row.id === editingId
            ? {
                ...row,
                description: formData.description,
                date: formData.date,
                category: formData.category,
                paidBy: formData.paidBy,
                remarks: formData.remarks,
                amount: Number(formData.amount || 0),
                currency: formData.currency,
                status: "submitted",
                history: [...row.history, { approver: "System", status: "Submitted", time: new Date().toLocaleString() }],
              }
            : row
        )
      );
      setShowForm(false);
    } catch (err: any) {
      alert(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10">
      {/* hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileChosen(e.target.files?.[0] || undefined)}
      />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employee • Expenses</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Upload a receipt or create a new expense. Track status as it moves through approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50 active:translate-y-px disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
            disabled={busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                description: "",
                category: "",
                date: "",
                paidBy: "",
                remarks: "",
                amount: "",
                currency: "INR",
                detailedDescription: "",
              });
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-900 bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 active:translate-y-px dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
          <Link
            href="/auth/signin"
            className="ml-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            Sign out
          </Link>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">New Expense</h3>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md border border-neutral-300 bg-white p-2 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">Expense Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">Paid By</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  required
                >
                  <option value="">Select payment method</option>
                  {paidByOptions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">Total Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    required
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  >
                    {currencies.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Submitted in {formData.currency}. Converted to company currency on manager view.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-600 dark:text-neutral-300">Description (detailed)</label>
              <textarea
                rows={3}
                value={formData.detailedDescription}
                onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                onClick={handleSubmit}
                className="inline-flex items-center justify-center rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 active:translate-y-px disabled:opacity-60 dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
              <h4 className="mb-3 text-sm font-medium">Status</h4>
              <div className="flex flex-wrap items-center gap-5">
                <Step label="Draft" active />
                <span className="text-neutral-400">→</span>
                <Step label="Waiting approval" active={false} />
                <span className="text-neutral-400">→</span>
                <Step label="Approved" active={false} />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Expenses table */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-neutral-50 text-left text-sm dark:bg-neutral-900">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                {["Employee","Description","Date","Category","Paid By","Remarks","Amount","Status"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No expenses yet. Upload a receipt or click <span className="font-medium">New</span> to create one.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    onClick={() => { setEditingId(e.id); setShowForm(true); }}
                    role="button"
                  >
                    <td className="px-4 py-3 text-sm">{e.employee}</td>
                    <td className="px-4 py-3 text-sm">{e.description}</td>
                    <td className="px-4 py-3 text-sm">{e.date}</td>
                    <td className="px-4 py-3 text-sm">{e.category}</td>
                    <td className="px-4 py-3 text-sm">{e.paidBy}</td>
                    <td className="px-4 py-3 text-sm">{e.remarks}</td>
                    <td className="px-4 py-3 text-sm tabular-nums">{e.currency} {e.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{statusBadge(e.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History log */}
      {editingId && expenses.find((e) => e.id === editingId) && (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h4 className="mb-3 text-sm font-medium">History log</h4>
          <table className="w-full border-collapse">
            <thead className="bg-neutral-50 text-left text-sm dark:bg-neutral-900">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-4 py-2 font-medium text-neutral-600 dark:text-neutral-300">Approver</th>
                <th className="px-4 py-2 font-medium text-neutral-600 dark:text-neutral-300">Status</th>
                <th className="px-4 py-2 font-medium text-neutral-600 dark:text-neutral-300">Time</th>
              </tr>
            </thead>
            <tbody>
              {expenses.find((e) => e.id === editingId)?.history.map((h, i) => (
                <tr key={i} className="border-b border-neutral-200 dark:border-neutral-800">
                  <td className="px-4 py-2 text-sm">{h.approver}</td>
                  <td className="px-4 py-2 text-sm">{h.status}</td>
                  <td className="px-4 py-2 text-sm tabular-nums">{h.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
