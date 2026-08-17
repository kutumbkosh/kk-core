/**
 * KutumbKosh — Resend email utility
 *
 * Thin wrapper around the Resend REST API (no SDK dependency).
 * All functions are fire-and-forget: they never throw and never block callers.
 *
 * Env vars required:
 *   RESEND_API_KEY        — Resend API key
 *   RESEND_FROM_EMAIL     — Verified sender address (default: noreply@kutumbkosh.com)
 *
 * Usage:
 *   import { sendEmail, templates } from "@/lib/resend";
 *   await sendEmail({ to: user.email, ...templates.subscriptionConfirmation({ plan: "PRO", cycle: "ANNUAL", amount: 499, periodEnd }) });
 */

// ---------------------------------------------------------------------------
// Core sender
// ---------------------------------------------------------------------------

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  /** Optional file attachments (base64-encoded content) */
  attachments?: { filename: string; content: string }[];
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

/**
 * Send a single transactional email via Resend.
 * Never throws — returns { ok: false, error } on failure.
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@kutumbkosh.com";

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY not set — skipping email:", payload.subject);
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `KutumbKosh <${fromEmail}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        ...(payload.attachments?.length ? { attachments: payload.attachments } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Resend] API error:", res.status, body);
      return { ok: false, error: `HTTP ${res.status}: ${body}` };
    }

    return { ok: true };
  } catch (err) {
    console.error("[Resend] Network error:", err);
    return { ok: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Shared HTML primitives
// ---------------------------------------------------------------------------

const BASE_STYLES = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`;

function emailWrapper(content: string): string {
  return `
    <div style="${BASE_STYLES} max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
      <div style="margin-bottom: 28px;">
        <span style="font-size: 22px; font-weight: 800; color: #2563EB;">KutumbKosh</span>
        <span style="font-size: 13px; color: #6B7280; margin-left: 8px;">Your Family's Financial Vault</span>
      </div>
      ${content}
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; line-height: 1.6;">
        Questions? Write to us at
        <a href="mailto:care@kutumbkosh.com" style="color: #2563EB; text-decoration: none;">care@kutumbkosh.com</a>
        — we reply within 48 hours.<br />
        KutumbKosh &mdash; Organize. Protect. Pass on.
      </div>
    </div>
  `;
}

function infoBox(content: string): string {
  return `
    <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 16px; margin: 20px 0;">
      ${content}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export interface SubscriptionConfirmationParams {
  plan: "PRO";
  cycle: "ANNUAL" | "MONTHLY";
  /** Amount paid in INR (e.g. 499) */
  amount: number;
  /** ISO date string for period end */
  periodEnd: string;
  /** User's first name for personalisation */
  userName?: string;
}

export interface RenewalReminderParams {
  /** Days remaining until subscription expires */
  daysLeft: number;
  /** ISO date string for period end */
  periodEnd: string;
  /** User's current plan */
  plan: "PRO";
}

export interface FailedPaymentParams {
  /** Amount attempted in INR */
  amount: number;
  /** Razorpay order ID for reference */
  orderId?: string;
}

export interface InvoiceConfirmationParams {
  /** Sequential invoice number e.g. KK-2026-0001 */
  invoiceNumber: string;
  /** Billing cycle */
  cycle: "ANNUAL" | "MONTHLY";
  /** GST-inclusive amount collected in INR */
  collectedInr: number;
  /** Base amount ex-GST in INR */
  baseInr: number;
  /** Total GST in INR */
  gstInr: number;
  /** IGST (inter-state) or CGST+SGST (intra-state) */
  taxType: "IGST" | "CGST+SGST";
  cgst?: number;
  sgst?: number;
  igst?: number;
  /** Razorpay payment ID for reference */
  paymentId: string;
  /** ISO date string — subscription period end */
  periodEnd: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------

export const templates = {
  /**
   * Sent immediately after a successful Pro subscription payment.
   */
  subscriptionConfirmation(params: SubscriptionConfirmationParams): Omit<EmailPayload, "to"> {
    const { plan, cycle, amount, periodEnd, userName } = params;
    const cycleLabel = cycle === "ANNUAL" ? "Annual" : "Monthly";
    const firstName = userName?.split(" ")[0] ?? "there";

    return {
      subject: `Welcome to KutumbKosh Pro, ${firstName}! Your vault is all set.`,
      html: emailWrapper(`
        <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 8px;">
          You&apos;re in. Welcome to Pro! 🎉
        </h2>
        <p style="font-size: 15px; color: #374151; line-height: 1.7; margin-bottom: 4px;">
          Hi ${firstName},
        </p>
        <p style="font-size: 14px; color: #6B7280; line-height: 1.7; margin-top: 4px;">
          Thank you for upgrading to KutumbKosh Pro. Your family's financial vault is now
          fully unlocked — every asset, every reminder, every member of your family, covered.
        </p>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
          <p style="font-size: 13px; font-weight: 700; color: #15803D; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em;">
            What&apos;s now unlocked for you
          </p>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; color: #374151;">
                <span style="color: #16A34A; font-weight: 700; margin-right: 8px;">✓</span>
                Unlimited asset entries
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #374151;">
                <span style="color: #16A34A; font-weight: 700; margin-right: 8px;">✓</span>
                All reminders — FD maturity, insurance renewal, nominee updates
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #374151;">
                <span style="color: #16A34A; font-weight: 700; margin-right: 8px;">✓</span>
                Full vault PDF export — shareable with family or your lawyer
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #374151;">
                <span style="color: #16A34A; font-weight: 700; margin-right: 8px;">✓</span>
                Priority support from our team
              </td>
            </tr>
          </table>
        </div>

        ${infoBox(`
          <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px 0;">
            Subscription details
          </p>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="color: #6B7280; padding: 4px 0; width: 55%;">Plan</td>
              <td style="color: #111827; font-weight: 600; text-align: right;">KutumbKosh ${plan}</td>
            </tr>
            <tr>
              <td style="color: #6B7280; padding: 4px 0;">Billing</td>
              <td style="color: #111827; font-weight: 600; text-align: right;">${cycleLabel}</td>
            </tr>
            <tr>
              <td style="color: #6B7280; padding: 4px 0;">Amount paid</td>
              <td style="color: #111827; font-weight: 600; text-align: right;">₹${amount} (GST inclusive)</td>
            </tr>
            <tr>
              <td style="color: #6B7280; padding: 4px 0;">Active until</td>
              <td style="color: #111827; font-weight: 600; text-align: right;">${formatDate(periodEnd)}</td>
            </tr>
          </table>
        `)}

        <div style="margin: 24px 0;">
          <a href="https://kutumbkosh.com/dashboard"
             style="display: inline-block; background: #2563EB; color: white; font-size: 14px; font-weight: 600;
                    padding: 13px 28px; border-radius: 8px; text-decoration: none; letter-spacing: 0.01em;">
            Open my vault &rarr;
          </a>
        </div>

        <p style="font-size: 13px; color: #9CA3AF; line-height: 1.7; margin-top: 8px;">
          A GST invoice will be sent in a separate email shortly. If you have any questions
          about your subscription, write to us at
          <a href="mailto:care@kutumbkosh.com" style="color: #2563EB; text-decoration: none;">care@kutumbkosh.com</a>
          — we&apos;re happy to help.
        </p>
      `),
    };
  },

  /**
   * Sent as a renewal reminder (e.g. 30 days and 7 days before expiry).
   * Caller decides when to trigger this — typically via a cron job.
   */
  renewalReminder(params: RenewalReminderParams): Omit<EmailPayload, "to"> {
    const { daysLeft, periodEnd, plan } = params;
    const urgencyColor = daysLeft <= 7 ? "#DC2626" : "#D97706";
    const urgencyLabel = daysLeft <= 7 ? "expires soon" : "renewal coming up";

    return {
      subject: `Your KutumbKosh Pro subscription ${urgencyLabel} — renew in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      html: emailWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
          Your ${plan} subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}
        </h2>
        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin-bottom: 0;">
          Your KutumbKosh Pro access will end on
          <strong style="color: ${urgencyColor};">${formatDate(periodEnd)}</strong>.
          Renew now to keep unlimited asset tracking, reminders, and your vault dossier PDF.
        </p>
        ${infoBox(`
          <p style="font-size: 13px; color: #1E40AF; font-weight: 600; margin: 0 0 4px 0;">What you'll lose after expiry:</p>
          <ul style="font-size: 13px; color: #6B7280; margin: 0; padding-left: 18px; line-height: 2;">
            <li>Assets beyond the 3-asset free limit become read-only</li>
            <li>Insurance expiry and FD maturity reminders pause</li>
            <li>Vault dossier PDF export becomes unavailable</li>
          </ul>
        `)}
        <div style="margin-top: 20px;">
          <a href="https://kutumbkosh.com/dashboard/settings/billing"
             style="display: inline-block; background: #2563EB; color: white; font-size: 14px; font-weight: 600;
                    padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Renew Pro — ₹499/year
          </a>
        </div>
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px;">
          Your data is always safe — nothing is deleted. Only Pro features are gated after expiry.
        </p>
      `),
    };
  },

  /**
   * Sent when a payment attempt fails (e.g. Razorpay signature verification fails
   * or the order could not be created).
   */
  failedPayment(params: FailedPaymentParams): Omit<EmailPayload, "to"> {
    const { amount, orderId } = params;

    return {
      subject: "KutumbKosh — payment could not be completed",
      html: emailWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
          Your payment didn't go through
        </h2>
        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin-bottom: 0;">
          We were unable to process your payment of <strong>₹${amount}</strong> for KutumbKosh Pro.
          No money has been deducted — the transaction was not completed.
        </p>
        ${infoBox(`
          <p style="font-size: 13px; color: #111827; font-weight: 600; margin: 0 0 8px 0;">What to do next:</p>
          <ol style="font-size: 13px; color: #6B7280; margin: 0; padding-left: 18px; line-height: 2.2;">
            <li>Check that your card or UPI is active and has sufficient balance</li>
            <li>Try a different payment method (UPI, net banking, or another card)</li>
            <li>Retry the payment from your KutumbKosh account</li>
          </ol>
          ${orderId ? `<p style="font-size: 12px; color: #9CA3AF; margin: 8px 0 0 0;">Reference: ${orderId}</p>` : ""}
        `)}
        <div style="margin-top: 20px;">
          <a href="https://kutumbkosh.com/dashboard/settings/billing"
             style="display: inline-block; background: #2563EB; color: white; font-size: 14px; font-weight: 600;
                    padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Retry payment
          </a>
        </div>
        <p style="font-size: 13px; color: #6B7280; line-height: 1.6; margin-top: 16px;">
          If the problem persists, write to us at
          <a href="mailto:care@kutumbkosh.com" style="color: #2563EB;">care@kutumbkosh.com</a>
          and we'll help you complete the upgrade.
        </p>
      `),
    };
  },

  /**
   * GST invoice email — sent on payment.captured and subscription.charged.
   * Finance will supply a formal PDF template post-launch; this serves as the
   * interim GST invoice per HANDOFFS.md ID 11.
   * SAC code 998314, 18% GST, back-calculated from GST-inclusive price.
   * DECISIONS.md 2026-05-07 | Finance
   */
  invoiceConfirmation(params: InvoiceConfirmationParams): Omit<EmailPayload, "to"> {
    const { invoiceNumber, cycle, collectedInr, baseInr, gstInr, taxType, cgst, sgst, igst, paymentId, periodEnd } = params;
    const cycleLabel = cycle === "ANNUAL" ? "Annual" : "Monthly";

    const taxRows =
      taxType === "CGST+SGST"
        ? `
          <tr>
            <td style="color: #6B7280; padding: 4px 0;">CGST 9% (SAC 998314)</td>
            <td style="color: #111827; font-weight: 600; text-align: right;">₹${cgst}</td>
          </tr>
          <tr>
            <td style="color: #6B7280; padding: 4px 0;">SGST 9% (SAC 998314)</td>
            <td style="color: #111827; font-weight: 600; text-align: right;">₹${sgst}</td>
          </tr>`
        : `
          <tr>
            <td style="color: #6B7280; padding: 4px 0;">IGST 18% (SAC 998314)</td>
            <td style="color: #111827; font-weight: 600; text-align: right;">₹${igst}</td>
          </tr>`;

    return {
      subject: `KutumbKosh — GST Invoice ${invoiceNumber}`,
      html: emailWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 4px;">
          GST Invoice
        </h2>
        <p style="font-size: 13px; color: #9CA3AF; margin-top: 0; margin-bottom: 20px;">
          Invoice No: ${invoiceNumber} &nbsp;·&nbsp; ${formatDate(new Date().toISOString())}
        </p>
        ${infoBox(`
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="color: #6B7280; padding: 4px 0; width: 60%;">Service</td>
              <td style="color: #111827; font-weight: 600; text-align: right;">KutumbKosh Pro (${cycleLabel})</td>
            </tr>
            <tr>
              <td style="color: #6B7280; padding: 4px 0;">Valid until</td>
              <td style="color: #111827; font-weight: 600; text-align: right;">${formatDate(periodEnd)}</td>
            </tr>
            <tr style="border-top: 1px solid #DBEAFE; margin-top: 8px;">
              <td style="color: #6B7280; padding: 8px 0 4px 0;">Base amount (ex-GST)</td>
              <td style="color: #111827; font-weight: 600; text-align: right; padding-top: 8px;">₹${baseInr}</td>
            </tr>
            ${taxRows}
            <tr style="border-top: 1px solid #DBEAFE;">
              <td style="color: #111827; font-weight: 700; padding: 8px 0 4px 0;">Total (GST-inclusive)</td>
              <td style="color: #111827; font-weight: 700; text-align: right; padding-top: 8px;">₹${collectedInr}</td>
            </tr>
          </table>
        `)}
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px; line-height: 1.6;">
          Payment reference: ${paymentId}<br />
          Supplier: KUTUMBKOSH FINTECH PRIVATE LIMITED · GSTIN: (on file) · SAC: 998314<br />
          This is a system-generated invoice. For a signed copy, write to
          <a href="mailto:care@kutumbkosh.com" style="color: #2563EB;">care@kutumbkosh.com</a>.
        </p>
      `),
    };
  },

  /**
   * V2 — Sent to trusted contact when owner sets up inactivity timer.
   * Locked copy — Condition 4 / Q1(c)(i) from HANDOFFS.md ID #36.
   */
  v2DesignationNotification(params: { ownerName: string; contactName: string }): Omit<EmailPayload, "to"> {
    const { ownerName, contactName } = params;
    return {
      subject: `${ownerName} has added you as a trusted contact on KutumbKosh`,
      html: emailWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
          You&apos;ve been added as a trusted contact
        </h2>
        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin-bottom: 0;">
          Hi ${contactName},
        </p>
        ${infoBox(`
          <p style="font-size: 14px; color: #111827; line-height: 1.7; margin: 0;">
            You have been added as a trusted contact on KutumbKosh by
            <strong>${ownerName}</strong>.
          </p>
          <p style="font-size: 14px; color: #6B7280; line-height: 1.7; margin: 12px 0 0 0;">
            <strong>What this means:</strong> If ${ownerName} is inactive on KutumbKosh
            for an extended period, you may be contacted to request access to their
            financial vault. You will always receive advance notice before any access
            is granted, and ${ownerName} will have the opportunity to deny your request.
          </p>
          <p style="font-size: 14px; color: #6B7280; line-height: 1.7; margin: 12px 0 0 0;">
            Your contact details are held securely and used only for this purpose.
            If you have any questions, write to us at
            <a href="mailto:care@kutumbkosh.com" style="color: #2563EB;">care@kutumbkosh.com</a>
          </p>
        `)}
      `),
    };
  },

  /**
   * V3 — Sent to trusted contact immediately when owner grants pre-authorized access.
   * Locked copy — Condition 7 / Q2(b) from HANDOFFS.md ID #36.
   */
  v3DesignationNotification(params: { ownerName: string; contactName: string; grantedDate: string }): Omit<EmailPayload, "to"> {
    const { ownerName, contactName, grantedDate } = params;
    return {
      subject: `${ownerName} has granted you access to their KutumbKosh vault`,
      html: emailWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
          Vault access granted
        </h2>
        <p style="font-size: 14px; color: #6B7280; line-height: 1.6; margin-bottom: 0;">
          Hi ${contactName},
        </p>
        ${infoBox(`
          <p style="font-size: 14px; color: #111827; line-height: 1.7; margin: 0;">
            ${ownerName} has granted you access to their KutumbKosh vault.
          </p>
          <p style="font-size: 14px; color: #6B7280; line-height: 1.7; margin: 12px 0 0 0;">
            You can now view their financial records whenever you need to.
            Sign in at <a href="https://kutumbkosh.com" style="color: #2563EB;">kutumbkosh.com</a>
            to access the vault.
          </p>
          <p style="font-size: 13px; color: #9CA3AF; line-height: 1.6; margin: 12px 0 0 0;">
            This access was authorised by ${ownerName} on ${grantedDate}.
            They can revoke it at any time. If you have any questions, write to us at
            <a href="mailto:care@kutumbkosh.com" style="color: #2563EB;">care@kutumbkosh.com</a>
          </p>
        `)}
      `),
    };
  },

  /**
   * V2 — Sent to owner when inactivity timer fires and grace period begins.
   * Condition 2: must notify via BOTH email AND in-app (HANDOFFS.md ID #36).
   */
  v2GracePeriodStarted(params: { ownerName: string; contactName: string; gracePeriodDays: number; graceEndsDate: string }): Omit<EmailPayload, "to"> {
    const { ownerName, contactName, gracePeriodDays, graceEndsDate } = params;
    return {
      subject: `Action required — ${contactName} may be granted access to your KutumbKosh vault`,
      html: emailWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; color: #D97706; margin-bottom: 8px;">
          Your inactivity timer has fired
        </h2>
        <p style="font-size: 14px; color: #6B7280; line-height: 1.6;">
          Hi ${ownerName}, we noticed you have not logged into your KutumbKosh vault
          for the period you configured. Your trusted contact
          <strong>${contactName}</strong> will be granted access to your vault
          unless you deny it within ${gracePeriodDays} days.
        </p>
        ${infoBox(`
          <p style="font-size: 13px; font-weight: 600; color: #D97706; margin: 0 0 8px 0;">
            Access will be granted on ${graceEndsDate} unless you deny it.
          </p>
          <p style="font-size: 13px; color: #6B7280; margin: 0;">
            If you are fine with ${contactName} accessing your vault, no action is needed.
            If you want to deny access, log in to KutumbKosh and revoke or disable the
            inactivity timer for this contact before ${graceEndsDate}.
          </p>
        `)}
        <div style="margin-top: 20px;">
          <a href="https://kutumbkosh.com/dashboard/emergency"
             style="display: inline-block; background: #2563EB; color: white; font-size: 14px;
                    font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Log in and manage access
          </a>
        </div>
      `),
    };
  },

  /**
   * V3 — Annual re-confirmation nudge sent to owner.
   * Condition 6 from HANDOFFS.md ID #36 — KutumbKosh policy (not DPDPA mandate).
   */
  v3AnnualReconfirmation(params: { ownerName: string; contactName: string }): Omit<EmailPayload, "to"> {
    const { ownerName, contactName } = params;
    return {
      subject: `Reminder — ${contactName} has pre-authorised access to your KutumbKosh vault`,
      html: emailWrapper(`
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px;">
          Annual access reminder
        </h2>
        <p style="font-size: 14px; color: #6B7280; line-height: 1.6;">
          Hi ${ownerName}, this is your annual reminder about pre-authorised vault access.
        </p>
        ${infoBox(`
          <p style="font-size: 14px; color: #111827; line-height: 1.7; margin: 0;">
            <strong>${contactName}</strong> has pre-authorised access to your vault.
            Is this still your intention?
          </p>
        `)}
        <div style="margin-top: 20px;">
          <a href="https://kutumbkosh.com/dashboard/emergency"
             style="display: inline-block; background: #2563EB; color: white; font-size: 14px;
                    font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Yes, keep access active
          </a>
        </div>
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px; line-height: 1.6;">
          To revoke access, visit your
          <a href="https://kutumbkosh.com/dashboard/emergency" style="color: #2563EB;">Emergency Access settings</a>.
          You will receive this reminder every year while pre-authorised access is active.
        </p>
      `),
    };
  },
};
