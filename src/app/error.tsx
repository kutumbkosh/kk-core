"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[KutumbKosh] Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-6">
          An unexpected error occurred. Please try again, or contact us at{" "}
          <a href="mailto:care@kutumbkosh.com" className="text-blue-600 hover:underline">
            care@kutumbkosh.com
          </a>{" "}
          if the problem persists.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <a href="/dashboard" className="btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
