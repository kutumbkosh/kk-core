import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2 MB per file
const MAX_ATTACHMENTS = 3;
const MAX_MESSAGE_LENGTH = 2000;

const SUBJECT_OPTIONS = [
  "General Enquiry",
  "Billing & Subscription",
  "Bug Report",
  "Feature Request",
  "Privacy & Data",
  "Other",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, attachments } = body as {
      name: string;
      email: string;
      subject: string;
      message: string;
      attachments?: { filename: string; content: string; size: number }[];
    };

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be under ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (subject && !SUBJECT_OPTIONS.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject category." }, { status: 400 });
    }

    // ── Attachment validation ────────────────────────────────────────────────
    const safeAttachments: { filename: string; content: string }[] = [];
    if (attachments?.length) {
      if (attachments.length > MAX_ATTACHMENTS) {
        return NextResponse.json(
          { error: `You can attach up to ${MAX_ATTACHMENTS} images.` },
          { status: 400 }
        );
      }
      for (const att of attachments) {
        if (!att.filename || !att.content) continue;
        // Size is checked client-side too, but enforce server-side as well
        const approxBytes = Math.ceil((att.content.length * 3) / 4);
        if (approxBytes > MAX_ATTACHMENT_BYTES) {
          return NextResponse.json(
            { error: `Each image must be under 2 MB. "${att.filename}" is too large.` },
            { status: 400 }
          );
        }
        safeAttachments.push({ filename: att.filename, content: att.content });
      }
    }

    const subjectLine = subject || "General Enquiry";
    const messageHtml = message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />");

    // ── Send to care@kutumbkosh.com ──────────────────────────────────────────
    await sendEmail({
      to: "care@kutumbkosh.com",
      subject: `[KutumbKosh] ${subjectLine} — from ${name.trim()}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; color: #111827;">
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">New feedback from KutumbKosh</h2>
          <p style="font-size: 13px; color: #6B7280; margin-top: 0; margin-bottom: 20px;">
            Submitted via the contact form
          </p>
          <table style="font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="color: #6B7280; padding: 4px 16px 4px 0; white-space: nowrap;">Name</td>
              <td style="color: #111827; font-weight: 600;">${name.trim()}</td>
            </tr>
            <tr>
              <td style="color: #6B7280; padding: 4px 16px 4px 0;">Email</td>
              <td style="color: #111827; font-weight: 600;">
                <a href="mailto:${email.trim()}" style="color: #2563EB;">${email.trim()}</a>
              </td>
            </tr>
            <tr>
              <td style="color: #6B7280; padding: 4px 16px 4px 0;">Category</td>
              <td style="color: #111827; font-weight: 600;">${subjectLine}</td>
            </tr>
          </table>
          <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; white-space: pre-wrap; font-size: 14px; color: #374151; line-height: 1.7;">
            ${messageHtml}
          </div>
          ${safeAttachments.length ? `<p style="font-size: 13px; color: #6B7280; margin-top: 16px;">${safeAttachments.length} image(s) attached.</p>` : ""}
        </div>
      `,
      ...(safeAttachments.length ? { attachments: safeAttachments } : {}),
    });

    // ── Send acknowledgement to user (fire-and-forget) ───────────────────────
    sendEmail({
      to: email.trim(),
      subject: "We received your message — KutumbKosh",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
          <div style="margin-bottom: 28px;">
            <span style="font-size: 22px; font-weight: 800; color: #2563EB;">KutumbKosh</span>
            <span style="font-size: 13px; color: #6B7280; margin-left: 8px;">Your Family's Financial Vault</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
            Thanks for reaching out, ${name.trim().split(" ")[0]}!
          </h2>
          <p style="font-size: 14px; color: #6B7280; line-height: 1.7;">
            We've received your message and will get back to you within 48 hours.
            Here's a copy of what you sent:
          </p>
          <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; color: #374151; line-height: 1.7; white-space: pre-wrap;">
            ${messageHtml}
          </div>
          <p style="font-size: 13px; color: #9CA3AF; line-height: 1.7; margin-top: 16px;">
            In the meantime, you can always reach us directly at
            <a href="mailto:care@kutumbkosh.com" style="color: #2563EB; text-decoration: none;">care@kutumbkosh.com</a>.
          </p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
            KutumbKosh &mdash; Organize. Protect. Pass on.
          </div>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact] Error:", err);
    return NextResponse.json(
      { error: "Unable to send your message. Please try again or email us at care@kutumbkosh.com" },
      { status: 500 }
    );
  }
}
