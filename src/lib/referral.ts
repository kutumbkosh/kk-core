/**
 * KutumbKosh Referral Tracking
 * Captures referral codes from URL params and localStorage,
 * and attributes signups to channel partners.
 */

const REFERRAL_KEY = "kk_ref";
const REFERRAL_SOURCE_KEY = "kk_ref_source";

/**
 * Capture referral code from URL and persist to localStorage.
 * Call this on the landing page on mount.
 */
export function captureReferral(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const refCode = params.get("ref") || params.get("referral") || params.get("code");

  if (refCode) {
    localStorage.setItem(REFERRAL_KEY, refCode.toUpperCase().trim());
    localStorage.setItem(REFERRAL_SOURCE_KEY, params.get("ref") ? "LINK" : "CODE");
  }
}

/**
 * Get the stored referral code (if any).
 */
export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFERRAL_KEY);
}

/**
 * Get how the referral was captured.
 */
export function getReferralSource(): "LINK" | "CODE" | "MANUAL" {
  if (typeof window === "undefined") return "MANUAL";
  const source = localStorage.getItem(REFERRAL_SOURCE_KEY);
  if (source === "LINK" || source === "CODE") return source;
  return "MANUAL";
}

/**
 * Set a referral code manually (e.g., from a form input).
 */
export function setReferralCode(code: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFERRAL_KEY, code.toUpperCase().trim());
  localStorage.setItem(REFERRAL_SOURCE_KEY, "CODE");
}

/**
 * Clear stored referral data (call after successful attribution).
 */
export function clearReferral(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REFERRAL_KEY);
  localStorage.removeItem(REFERRAL_SOURCE_KEY);
}
