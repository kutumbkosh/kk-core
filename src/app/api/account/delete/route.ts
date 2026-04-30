import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

async function sendDeletionConfirmationEmail(email: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@kutumbkosh.in";

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
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
            <p style="font-size: 16px; font-weight: 600;">Account Deleted</p>
            <p style="font-size: 14px; color: #374151;">
              Your KutumbKosh account and all associated data have been permanently deleted.
            </p>
            <p style="font-size: 14px; color: #374151;">
              If you did not request this, please contact us immediately at
              <a href="mailto:care@kutumbkosh.com" style="color: #2563EB;">care@kutumbkosh.com</a>.
            </p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6B7280;">KutumbKosh · Your Family's Financial Vault</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Account] Resend email failed:", res.status, body);
    }
  } catch (err) {
    // Email failure must not block or reverse the deletion
    console.error("[Account] Resend email error:", err);
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

    // Capture email before deletion — the user record will be gone afterward
    const userEmail = user.email ?? "";

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

    // Send confirmation email — fire and forget, does not affect response
    if (userEmail) {
      await sendDeletionConfirmationEmail(userEmail);
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
