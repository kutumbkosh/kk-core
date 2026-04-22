"use client";

import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl font-extrabold text-gray-200 mb-2">404</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => router.back()} className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <button onClick={() => router.push("/dashboard")} className="btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
