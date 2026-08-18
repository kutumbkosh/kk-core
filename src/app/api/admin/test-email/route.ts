import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { isAdminEmail } from "@/lib/admin";

/**
 * GET /api/admin/test-email
 * Admin-only endpoint to verify Resend is configured and working.
 * Returns full success/error detail so issues are immediately visible.
 */
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@kutumbkosh.com";

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: "RESEND_API_KEY is not set in environment variables.",
      from: fromEmail,
    }, { status: 500 });
  }

  const result = await sendEmail({
    to: user.email!,
    subject: "KutumbKosh — Resend test email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; padding: 24px; color: #111827;">
        <h2 style="color: #2563EB;">✅ Resend is working!</h2>
        <p>This test email confirms that <strong>RESEND_API_KEY</strong> is correctly set and the Resend API is reachable.</p>
        <p style="font-size: 13px; color: #6B7280;">Sent from: <code>${fromEmail}</code><br/>Sent to: <code>${user.email}</code></p>
      </div>
    `,
  });

  return NextResponse.json({
    ok: result.ok,
    error: result.error ?? null,
    sentTo: user.email,
    from: fromEmail,
    apiKeyPrefix: `${apiKey.slice(0, 8)}...`,
  }, { status: result.ok ? 200 : 500 });
}
