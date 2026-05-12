/**
 * KutumbKosh — GST calculation utility
 *
 * Decision locked: DECISIONS.md 2026-05-07 | Finance
 * ₹499/year is GST-INCLUSIVE. Use back-calculation formula; never ₹499 × 18%.
 *
 * Formula (back-calculation from GST-inclusive price):
 *   base_amount = collected × 100/118  → round to nearest rupee
 *   gst_amount  = collected × 18/118   → round to nearest rupee
 *   total       = collected (invariant)
 *
 * IGST vs CGST+SGST split:
 *   - Customer state == KK registered state → CGST (9%) + SGST (9%)
 *   - Customer state != KK registered state → IGST (18%)
 *   - KK's registered state is set via KUTUMBKOSH_GST_STATE env var (confirmed post-GSTIN)
 *   - If env var not set → default to IGST (safer for cross-state transactions)
 *
 * SAC code: 998314 (Information Technology Services — online SaaS)
 * Confirmed with CA required before first GST filing.
 */

export const GST_RATE = 18; // percent
export const SAC_CODE = "998314";
export const GST_INCLUSIVE_PRICE_INR = 499; // ₹ — locked decision

// ---------------------------------------------------------------------------

export interface GstBreakdown {
  /** Collected GST-inclusive amount in INR */
  collected: number;
  /** Base amount (ex-GST), rounded to nearest rupee */
  base: number;
  /** Total GST amount, rounded to nearest rupee */
  gstTotal: number;
  /** Tax type */
  taxType: "IGST" | "CGST+SGST";
  /** IGST amount (equals gstTotal when inter-state) */
  igst?: number;
  /** CGST amount (equals gstTotal/2 when intra-state) */
  cgst?: number;
  /** SGST amount (equals gstTotal/2 when intra-state) */
  sgst?: number;
}

/**
 * Returns GST breakdown for a given collected amount.
 * @param collectedInr  GST-inclusive amount collected (e.g. 499)
 * @param customerState Two-letter state code of customer's billing address (e.g. "MH")
 */
export function calculateGst(
  collectedInr: number,
  customerState?: string | null
): GstBreakdown {
  // Back-calculation — DECISIONS.md 2026-05-07
  const base = Math.round((collectedInr * 100) / 118);
  const gstTotal = collectedInr - base; // ensures base + gst = collected exactly

  // Determine IGST vs CGST+SGST
  const kkState = process.env.KUTUMBKOSH_GST_STATE ?? null; // e.g. "MH" — set after GSTIN
  const isIntraState =
    kkState &&
    customerState &&
    kkState.toUpperCase() === customerState.toUpperCase();

  if (isIntraState) {
    const half = Math.round(gstTotal / 2);
    return {
      collected: collectedInr,
      base,
      gstTotal,
      taxType: "CGST+SGST",
      cgst: half,
      sgst: gstTotal - half, // handles odd-rupee rounding
    };
  }

  return {
    collected: collectedInr,
    base,
    gstTotal,
    taxType: "IGST",
    igst: gstTotal,
  };
}

/**
 * Formats a GST breakdown as human-readable lines for invoice display.
 * Example output:
 *   Base amount (ex-GST):  ₹424
 *   IGST 18%:              ₹75
 *   Total:                 ₹499
 */
export function formatGstBreakdown(b: GstBreakdown): string {
  const lines: string[] = [
    `Base amount (ex-GST): ₹${b.base}`,
  ];
  if (b.taxType === "IGST") {
    lines.push(`IGST ${GST_RATE}% (SAC ${SAC_CODE}): ₹${b.igst}`);
  } else {
    lines.push(`CGST ${GST_RATE / 2}%: ₹${b.cgst}`);
    lines.push(`SGST ${GST_RATE / 2}%: ₹${b.sgst}`);
  }
  lines.push(`Total (GST-inclusive): ₹${b.collected}`);
  return lines.join("\n");
}
