"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService, type SignupData, type CountryResponse } from "@/lib/api";
import { User, Building2, Globe, Lock, Mail, Loader2 } from "lucide-react";

const fallbackCountries = [
  { country_code: "US", country_name: "United States", currency_code: "USD", currency_name: "US Dollar" },
  { country_code: "GB", country_name: "United Kingdom", currency_code: "GBP", currency_name: "British Pound" },
  { country_code: "DE", country_name: "Germany", currency_code: "EUR", currency_name: "Euro" },
  { country_code: "FR", country_name: "France", currency_code: "EUR", currency_name: "Euro" },
  { country_code: "IN", country_name: "India", currency_code: "INR", currency_name: "Indian Rupee" },
  { country_code: "JP", country_name: "Japan", currency_code: "JPY", currency_name: "Japanese Yen" },
  { country_code: "CA", country_name: "Canada", currency_code: "CAD", currency_name: "Canadian Dollar" },
  { country_code: "AU", country_name: "Australia", currency_code: "AUD", currency_name: "Australian Dollar" },
];

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countries, setCountries] = useState<CountryResponse[]>(fallbackCountries);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    company_email: "",
    country_code: "",
  });

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const fetched = await apiService.getCountries();
        setCountries(fetched);
      } catch {
        console.warn("Using fallback countries");
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    if (formData.password.length < 8) return setError("Password must be at least 8 characters long");

    setLoading(true);
    try {
      const signupData: SignupData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
        company_email: formData.company_email,
        country_code: formData.country_code,
      };
      const res = await apiService.signup(signupData);
      apiService.saveTokens(res.access_token, res.refresh_token);

      if (res.user.role === "admin") router.push("/admin/approval-rules");
      else if (res.user.role === "manager") router.push("/manager");
      else router.push("/employee");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[85dvh] max-w-lg items-center justify-center p-6">
      <div className="w-full rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Signup</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Create your organization’s expense management account.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="First name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Last name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
                required
              />
            </div>
          </div>

          {/* Personal Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="email"
              placeholder="Personal email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
              required
            />
          </div>

          {/* Company Info */}
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Company name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="email"
              placeholder="Company email"
              value={formData.company_email}
              onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
              required
            />
          </div>

          {/* Country */}
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <select
              value={formData.country_code}
              onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
              disabled={loadingCountries}
              className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-800"
              required
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name} ({c.currency_code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 active:translate-y-px disabled:opacity-60 dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 border-t border-neutral-200 pt-4 text-center text-sm dark:border-neutral-800">
          <span className="text-neutral-600 dark:text-neutral-300">Already have an account?</span>{" "}
          <Link href="/auth/signin" className="font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
