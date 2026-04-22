"use client";

/**
 * Shows a small floating badge in dev/staging environments.
 * Invisible in production. Helps testers know which environment they're on.
 */
export default function EnvBadge() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development";

  if (appEnv === "production") return null;

  const label = appEnv === "staging" ? "STAGING" : "DEV";
  const color =
    appEnv === "staging"
      ? "bg-amber-500 text-amber-950"
      : "bg-emerald-500 text-emerald-950";

  return (
    <div
      className={`fixed bottom-3 left-3 z-[9999] px-2.5 py-1 ${color} text-[10px] font-bold rounded-full shadow-lg opacity-80 pointer-events-none select-none`}
    >
      {label}
    </div>
  );
}
