"use client";

import { useState } from "react";
import { Shield, ArrowRight } from "lucide-react";

export default function EmergencyRequestPage() {
  const [kutumbId, setKutumbId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setKutumbId(raw);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kutumbId || kutumbId.length < 9) {
      setError("Please enter a valid Kutumb ID (e.g. KK-A4B7C2)");
      return;
    }
    // Stub — backend request logic is post-launch scope.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">KutumbKosh</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {!submitted ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Request access to a vault
              </h1>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Enter the Kutumb ID shared with you. The vault holder will be
                notified to review your request.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="kutumb-id"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Kutumb ID
                  </label>
                  <input
                    id="kutumb-id"
                    type="text"
                    value={kutumbId}
                    onChange={handleChange}
                    placeholder="e.g. KK-A4B7C2"
                    maxLength={9}
                    autoComplete="off"
                    spellCheck={false}
                    className={`input-field font-mono uppercase tracking-wide w-full${
                      error
                        ? " border-red-300 focus:ring-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {error && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full">
                  Request Access{" "}
                  <ArrowRight className="w-4 h-4 ml-2 inline-block" />
                </button>
              </form>

              <p className="text-center mt-6 text-sm text-gray-500">
                Have an account?{" "}
                <a href="/" className="text-blue-600 font-medium hover:underline">
                  Sign in →
                </a>
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-100">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Request sent
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your request has been sent. The vault holder will review it and
                you&apos;ll be notified by email.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Questions? Write to us at{" "}
                <a
                  href="mailto:care@kutumbkosh.com"
                  className="text-blue-600 hover:underline"
                >
                  care@kutumbkosh.com
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-300">
          <span>256-bit SSL</span>
          <span>&middot;</span>
          <span>Privacy first</span>
          <span>&middot;</span>
          <span>kutumbkosh.com</span>
        </div>
      </div>
    </div>
  );
}
