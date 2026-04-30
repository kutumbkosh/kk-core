"use client";

import { useEffect, useState } from "react";
import { Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";

/**
 * This page is shown briefly while the auth callback processes.
 * It provides a branded transition instead of a blank screen.
 */
export default function AuthVerifyPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    // This page is a visual bridge — the actual auth exchange happens
    // in /auth/callback (server-side). If the user lands here directly,
    // redirect them home after a moment.
    const timer = setTimeout(() => {
      if (status === "verifying") {
        setStatus("error");
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">KutumbKosh</span>
        </div>

        {status === "verifying" && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Verifying your identity</h1>
            <p className="text-sm text-gray-500 mb-1">
              Securely signing you in...
            </p>
            <p className="text-xs text-gray-400">This will only take a moment.</p>

            {/* Progress dots animation */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-green-100">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">You&apos;re in!</h1>
            <p className="text-sm text-gray-500">Redirecting to your vault...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Link expired or invalid</h1>
            <p className="text-sm text-gray-500 mb-5">
              This login link may have expired or already been used. Please request a new one.
            </p>
            <a href="/" className="btn-primary inline-flex">
              Back to login
            </a>
          </>
        )}

        {/* Trust footer */}
        <div className="mt-10 flex items-center justify-center gap-3 text-xs text-gray-300">
          <span>256-bit SSL</span>
          <span>&middot;</span>
          <span>Privacy first</span>
          <span>&middot;</span>
          <span>kutumbkosh.com</span>
        </div>
      </div>
    </div>
  );