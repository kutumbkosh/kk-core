/**
 * KutumbKosh Security Utilities
 * Server-side and client-side security helpers
 */

// ─── Input Sanitization ───────────────────────────────────────
/**
 * Strip HTML tags and potentially dangerous characters from user input.
 * Use this before storing any user-provided text.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, "") // Strip angle brackets (prevent HTML injection)
    .replace(/javascript:/gi, "") // Strip javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Strip inline event handlers
    .trim();
}

/**
 * Sanitize a JSONB metadata object — strip dangerous values recursively.
 */
export function sanitizeMetadata(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      clean[sanitizeText(key)] = sanitizeText(value);
    } else if (typeof value === "number" || typeof value === "boolean") {
      clean[sanitizeText(key)] = value;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      clean[sanitizeText(key)] = sanitizeMetadata(
        value as Record<string, unknown>
      );
    }
    // Drop anything else (functions, arrays with executables, etc.)
  }
  return clean;
}

// ─── XSS-safe display ─────────────────────────────────────────
/**
 * Escape a string for safe rendering in HTML contexts.
 * React already escapes JSX, but use this for dangerouslySetInnerHTML or non-React contexts.
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

// ─── Rate-limit helper (client-side debounce for auth actions) ─
const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter for client-side auth flows.
 * Returns true if the action should be blocked.
 */
export function isRateLimited(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return true;
  }
  return false;
}

// ─── Secure redirect validation ───────────────────────────────
/**
 * Validate a redirect URL to prevent open redirect attacks.
 * Only allows relative URLs or same-origin URLs.
 */
export function isValidRedirect(url: string, origin: string): boolean {
  // Allow relative URLs
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }
  // Allow same-origin absolute URLs
  try {
    const parsed = new URL(url);
    return parsed.origin === origin;
  } catch {
    return false;
  }
}

// ─── PAN number masking ───────────────────────────────────────
/**
 * Mask a PAN number for display: ABCDE1234F → A****234F
 */
export function maskPAN(pan: string): string {
  if (!pan || pan.length !== 10) return pan;
  return `${pan[0]}****${pan.slice(6)}`;
}

/**
 * Mask a phone number for display: +919876543210 → +91****3210
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, phone.length - 8);
  return `${prefix}****${last4}`;
}

/**
 * Mask an email for display: user@example.com → us****@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local.slice(0, 2)}${"*".repeat(Math.min(4, local.length - 2))}@${domain}`;
}
