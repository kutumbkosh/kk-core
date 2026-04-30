import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * Sends a deletion confirmation email via Resend REST API.
 * Fire-and-forget — never throws, never blocks the deletion response.
 * Requires RESEND_API_KEY in environment variables.
 */
async function sendDeletionConfirmationEmail(email: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@kutumbkosh.com";

  if (!resendApiKey) {
    console.warn("[Account] RESEND_API_KEY not set — skipping deletion confirmation email");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `KutumbKosh <${fromEmail}>`,
        to: [email],
        subject: "Your KutumbKosh account has been deleted",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 22px; font-weight: 800; color: #2563EB;">KutumbKosh</span>
            </div>
            <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">Your account has been deleted</h2>
            <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin-bottom: 16px;">
              This email confirms that your KutumbKosh account and all associated data have been permanently deleted.
            </p>
            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">The following has been permanently removed:</p>
              <ul style="font-size: 13px; color: #6B7280; margin: 0; padding-left: 20px; line-height: 2;">
                <li>Your profile and account</li>
                <li>All assets and documents</li>
                <li>All nominees and their links</li>
                <li>Trusted contacts and emergency instructions</li>
                <li>Subscription data</li>
              </ul>
            </div>
            <p style="font-size: 13px; color: #6B7280; line-height: 1.6;">
              If you did not request this deletion or believe this was done in error, please contact us immediately at
              <a href="mailto:care@kutumbkosh.com" style="color: #2563EB;">care@kutumbkosh.com</a>.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Account] Resend API error:", res.status, body);
    }
  } catch (err) {
    // Never surface email errors to the caller
    console.error("[Account] Failed to send deletion confirmation email:", err);
  }
}

export async function DELETE() {
  try {
    // Verify the user is authenticated
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Capture email before deletion — auth record will be gone after deleteUser
    const userEmail = user.email;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[Account] Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        { error: "Account deletion is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Use service role client to delete the auth user.
    // All related data (assets, nominees, subscriptions, etc.) will be
    // removed automatically via ON DELETE CASCADE foreign keys.
    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("[Account] Delete user failed:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account. Please try again or contact support." },
        { status: 500 }
      );
    }

    // Send confirmation email fire-and-forget — never blocks or reverses deletion
    if (userEmail) {
      sendDeletionConfirmationEmail(userEmail).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Account] Delete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
