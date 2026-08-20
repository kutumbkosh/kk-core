import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isValidRedirect } from "@/lib/security";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/onboarding";

  // Validate redirect to prevent open redirect attacks
  const next = isValidRedirect(nextParam, origin) ? nextParam : "/onboarding";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth] exchangeCodeForSession failed:", error.message, error.status);
      return NextResponse.redirect(`${origin}/?error=auth`);
    }

    if (!error) {
      // Check if user has completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to the login page with an error indicator
  return NextResponse.redirect(`${origin}/?error=auth`);
}

// Handle POST requests for token hash-based auth (Supabase PKCE flow)
export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/?error=auth`);
}
