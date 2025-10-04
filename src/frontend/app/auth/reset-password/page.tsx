"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";

export default function ResetPasswordSentPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email");

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <MailCheck className="mb-3 h-10 w-10 text-green-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Reset link sent</h1>
          <p className="mt-2 text-sm text-gray-600">
            {email ? (
              <>We’ve emailed a reset link to <span className="font-medium text-gray-900">{email}</span>.</>
            ) : (
              <>We’ve emailed you a reset link if an account exists for that address.</>
            )}{" "}
            Please check your inbox.
          </p>

        <button
          onClick={() => router.push("/auth/signin")}
          className="mt-6 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to sign in
        </button>

          <div className="mt-3 text-sm">
            Didn’t get it?{" "}
            <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
              Resend
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
