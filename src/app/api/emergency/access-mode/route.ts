/**
 * POST /api/emergency/access-mode
 *
 * Sets or updates the emergency access mode for a trusted contact.
 * Supports V1 (MANUAL), V2 (INACTIVITY), and V3 (PRE_AUTHORIZED).
 *
 * FEATURE FLAG: NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3 must be "true".
 * V2 and V3 must NOT go live in production until Operations confirms
 * external legal review is complete. (HANDOFFS.md ID #40, DECISIONS.md 2026-05-07)
 *
 * All 7 DPDPA conditions from HANDOFFS.md ID #36 are enforced here.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, templates } from "@/lib/resend";

const V2V3_ENABLED = process.env.NEXT_PUBLIC_ENABLE_EMERGENCY_V2V3 === "true";

const VALID_INACTIVITY_DAYS = [30, 60, 90, 180];
const VALID_GRACE_PERIOD_DAYS = [14, 21, 30];

export async function POST(request: Request) {
  // Feature gate — enforced server-side regardless of client state
  if (!V2V3_ENABLED) {
    return NextResponse.json(
      { error: "Emergency access V2/V3 is not yet enabled in this environment." },
      { status: 403 }
    );
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      trusted_contact_id,
      access_mode,
      inactivity_days,
      grace_period_days,
      country_of_residence,
      consent_confirmed, // must be true — client confirms locked copy was shown
    } = body;

    // Validate contact belongs to user
    const { data: contact, error: contactErr } = await supabase
      .from("trusted_contacts")
      .select("*")
      .eq("id", trusted_contact_id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (contactErr || !contact) {
      return NextResponse.json({ error: "Trusted contact not found" }, { status: 404 });
    }

    if (!["MANUAL", "INACTIVITY", "PRE_AUTHORIZED"].includes(access_mode)) {
      return NextResponse.json({ error: "Invalid access_mode" }, { status: 400 });
    }

    // V2/V3 require explicit consent confirmation
    if (access_mode !== "MANUAL" && consent_confirmed !== true) {
      return NextResponse.json(
        { error: "Consent must be explicitly confirmed before saving V2 or V3 access mode." },
        { status: 400 }
      );
    }

    // Fetch owner's profile for email personalisation
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    const ownerName = profile?.full_name ?? "Your family member";

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      access_mode,
      country_of_residence: country_of_residence ?? null,
    };

    let eventType: string;

    if (access_mode === "MANUAL") {
      // Reset V2/V3 fields
      updatePayload.v2_consent_at = null;
      updatePayload.v3_consent_at = null;
      updatePayload.inactivity_trigger_fired_at = null;
      updatePayload.inactivity_grace_ends_at = null;
      eventType = "MODE_SET_V1";

    } else if (access_mode === "INACTIVITY") {
      // V2 — Condition 1: grace period minimum 14 days
      if (!VALID_INACTIVITY_DAYS.includes(inactivity_days)) {
        return NextResponse.json(
          { error: `inactivity_days must be one of: ${VALID_INACTIVITY_DAYS.join(", ")}` },
          { status: 400 }
        );
      }
      if (!VALID_GRACE_PERIOD_DAYS.includes(grace_period_days) || grace_period_days < 14) {
        return NextResponse.json(
          { error: `grace_period_days must be one of: ${VALID_GRACE_PERIOD_DAYS.join(", ")} (minimum 14)` },
          { status: 400 }
        );
      }

      updatePayload.inactivity_days = inactivity_days;
      updatePayload.grace_period_days = grace_period_days;
      updatePayload.v2_consent_at = now;           // Condition 3 — consent captured
      updatePayload.v3_consent_at = null;
      updatePayload.inactivity_trigger_fired_at = null;
      updatePayload.inactivity_grace_ends_at = null;
      eventType = "MODE_SET_V2";

    } else {
      // V3 — PRE_AUTHORIZED
      updatePayload.v3_consent_at = now;           // Condition 7 — consent captured
      updatePayload.v2_consent_at = null;
      updatePayload.inactivity_trigger_fired_at = null;
      updatePayload.inactivity_grace_ends_at = null;
      eventType = "MODE_SET_V3";
    }

    // Update trusted contact
    const { error: updateErr } = await supabase
      .from("trusted_contacts")
      .update(updatePayload)
      .eq("id", trusted_contact_id);

    if (updateErr) {
      console.error("[EmergencyAccess] Update failed:", updateErr);
      return NextResponse.json({ error: "Failed to update access mode" }, { status: 500 });
    }

    // Write audit log
    await supabase.from("emergency_access_log").insert({
      user_id: user.id,
      trusted_contact_id,
      event_type: eventType,
      metadata: {
        access_mode,
        inactivity_days: inactivity_days ?? null,
        grace_period_days: grace_period_days ?? null,
        consent_confirmed: true,
      },
    });

    // Send notification emails — fire-and-forget
    const contactEmail = contact.contact_email;
    if (contactEmail) {
      if (access_mode === "INACTIVITY") {
        // Condition 4 — notify trusted contact at designation
        sendEmail({
          to: contactEmail,
          ...templates.v2DesignationNotification({
            ownerName,
            contactName: contact.contact_name,
          }),
        }).catch(() => {});

      } else if (access_mode === "PRE_AUTHORIZED") {
        // Condition 7 — notify trusted contact immediately at grant
        const grantedDate = new Date().toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        });
        sendEmail({
          to: contactEmail,
          ...templates.v3DesignationNotification({
            ownerName,
            contactName: contact.contact_name,
            grantedDate,
          }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, access_mode });
  } catch (err) {
    console.error("[EmergencyAccess] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
