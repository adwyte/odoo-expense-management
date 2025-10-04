"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, LogOut } from "lucide-react";

type Approver = {
  id: string;
  name: string;
  required: boolean;
};

export default function ApprovalRulesPage() {
  const [user, setUser] = useState("");
  const [description, setDescription] = useState("");
  const [manager, setManager] = useState("Sarah Johnson");
  const [isManagerApprover, setIsManagerApprover] = useState(false);
  const [sequentialApproval, setSequentialApproval] = useState(false);
  const [minApprovalPercentage, setMinApprovalPercentage] = useState(100);
  const [approvers, setApprovers] = useState<Approver[]>([
    { id: "1", name: "Swarada Joshi", required: true },
    { id: "2", name: "Sanskar Kulkarni", required: false },
  ]);

  const managers = ["Swarada Joshi", "Sanskar Kulkarni", "Jay Gadre", "Adwyte Karandikar"];

  const handleAddApprover = () => {
    const newApprover: Approver = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      name: "",
      required: false,
    };
    setApprovers((prev) => [...prev, newApprover]);
  };

  const handleRemoveApprover = (id: string) => {
    setApprovers((prev) => prev.filter((a) => a.id !== id));
  };

  const handleApproverChange = (id: string, field: keyof Approver, value: any) => {
    setApprovers((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Approval rules saved:", {
      user,
      description,
      manager,
      isManagerApprover,
      sequentialApproval,
      minApprovalPercentage,
      approvers,
    });
    alert("Approval rules saved");
  };

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10">
      {/* header */}
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin • Approval Rules</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Define who approves, in what order, and the minimum percentage needed.
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 active:translate-y-px dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* left column */}
        <section className="md:col-span-3 space-y-6">
          {/* identity card */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Rule details
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">User</label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="e.g. marc@acme.com"
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none ring-0 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">Manager</label>
                <select
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                >
                  {managers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Defaults to the manager set on the user; can be changed here.
                </p>
              </div>

              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-sm text-neutral-600 dark:text-neutral-300">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Approval rule for miscellaneous expenses"
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isManagerApprover}
                  onChange={(e) => setIsManagerApprover(e.target.checked)}
                  className="h-4 w-4 accent-neutral-700 dark:accent-neutral-300"
                />
                Is manager an approver?
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={sequentialApproval}
                  onChange={(e) => setSequentialApproval(e.target.checked)}
                  className="h-4 w-4 accent-neutral-700 dark:accent-neutral-300"
                />
                Approvers sequence (sequential if checked; parallel if unchecked)
              </label>
            </div>
          </div>

          {/* approvers card */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Approvers
              </h2>
              <button
                type="button"
                onClick={handleAddApprover}
                className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 active:translate-y-px dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
                Add approver
              </button>
            </div>

            <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
                <div>Name</div>
                <div className="text-center">Required</div>
                <div className="text-right">Actions</div>
              </div>

              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {approvers.map((a) => (
                  <li
                    key={a.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <input
                      type="text"
                      value={a.name}
                      onChange={(e) => handleApproverChange(a.id, "name", e.target.value)}
                      placeholder="Approver name"
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                    />
                    <label className="flex items-center justify-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={a.required}
                        onChange={(e) => handleApproverChange(a.id, "required", e.target.checked)}
                        className="h-4 w-4 accent-neutral-700 dark:accent-neutral-300"
                      />
                    </label>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveApprover(a.id)}
                        className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 active:translate-y-px dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        aria-label={`Remove ${a.name || "approver"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Tip: mark critical approvers as <span className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">Required</span>.
              Use sequential mode if order matters (e.g., Manager → Finance → Director).
            </p>
          </div>
        </section>

        {/* right column */}
        <aside className="md:col-span-2 space-y-6">
          {/* percentage card */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Minimum approval percentage
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={minApprovalPercentage}
                onChange={(e) => setMinApprovalPercentage(parseInt(e.target.value))}
                className="w-full accent-neutral-700 dark:accent-neutral-300"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={minApprovalPercentage}
                onChange={(e) => setMinApprovalPercentage(parseInt(e.target.value || "0"))}
                className="w-20 rounded-md border border-neutral-300 bg-white px-2 py-1 text-center text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-300">%</span>
            </div>

            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Example: “60% OR CFO approves” would be configured here at 60% plus a specific-approver rule.
            </p>
          </div>

          {/* actions */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                When you’re done, save the configuration.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 active:translate-y-px dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                Save rules
              </button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
