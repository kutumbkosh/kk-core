/**
 * Kutumb ID generation utility.
 *
 * Format: KK-XXXXXX
 * Charset: ABCDEFGHJKLMNPQRSTUVWXYZ23456789
 *   (excludes 0, 1, O, I — visually ambiguous in print and handwriting)
 * Keyspace: 32^6 = 1,073,741,824 unique IDs
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateKutumbId(): string {
  let id = "KK-";
  for (let i = 0; i < 6; i++) {
    id += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return id;
}

/**
 * Generates a globally unique Kutumb ID by checking against the profiles table.
 * Retries up to 10 times on collision (collision probability is negligible).
 */
export async function generateUniqueKutumbId(
  supabase: SupabaseClient
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generateKutumbId();
    const { data } = await supabase
      .from("profiles")
      .select("kutumb_id")
      .eq("kutumb_id", id)
      .single();

    if (!data) return id; // No collision — ID is unique
  }
  throw new Error("Failed to generate unique Kutumb ID after 10 attempts");
}

/**
 * Validates that a string is a valid Kutumb ID format.
 * Used in Emergency Access UI to validate user-entered IDs.
 */
export function isValidKutumbId(value: string): boolean {
  return /^KK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(
    value.trim().toUpperCase()
  );
}
