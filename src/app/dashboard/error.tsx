"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[KutumbKosh] Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-20 px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6">
          We hit an error loading this page. Try refreshing, or head back to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => router.push("/dashboard")} className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
