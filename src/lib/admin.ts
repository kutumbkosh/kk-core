/**
 * KutumbKosh Admin Utilities
 * Email-based admin access control
 *
 * Admin emails are configured via the ADMIN_EMAILS environment variable.
 * Set it as a comma-separated list in .env.local or Vercel environment settings:
 *   ADMIN_EMAILS=admin1@example.com,admin2@example.com
 */

function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  if (admins.length === 0) {
    console.warn("[KutumbKosh] No ADMIN_EMAILS configured. Admin access is disabled.");
    return false;
  }
  return admins.includes(email.toLowerCase());
}
