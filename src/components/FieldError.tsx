"use client";

import { AlertCircle } from "lucide-react";

export default function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {error}
    </p>
  );
}
