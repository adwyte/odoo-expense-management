"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService, type LoginData } from "@/lib/api";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

export default function SigninPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData: LoginData = { email: formData.email, password: formData.password };
      const response = await apiService.login(loginData);

      apiService.saveTokens(response.access_token, response.refresh_token);
      const userInfo = await apiService.getCurrentUser(response.access_token);

      if (userInfo.role === "admin") router.push("/admin/approval-rules");
      else if (userInfo.role === "manager") router.push("/manager");
      else router.push("/employee");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

 const handleForgotPassword = () => {
  const emailParam = formData.email ? `?email=${encodeURIComponent(formData.email)}` : "";
  router.push(`/auth/reset-password${emailParam}`);
};

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md items-center p-6">
      <div className="w-full rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Access your expense workspace.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm text-neutral-700 dark:text-neutral-300">
              Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 outline-none ring-0 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-10 py-2 text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-300"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 active:translate-y-px disabled:opacity-60 dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 border-t border-neutral-200 pt-4 text-center text-sm dark:border-neutral-800">
          <span className="text-neutral-600 dark:text-neutral-300">No account?</span>{" "}
          <Link href="/auth/signup" className="font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
