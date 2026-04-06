/**
 * Authority resolver — replaces the hardcoded getAuthoritiesFor().
 * Queries the DB for routing rules + authorities for a given
 * complaint type + location (county + locality).
 *
 * Falls back to the old hardcoded logic if DB tables don't exist yet
 * (backwards compatible with current București-only deployment).
 */

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getAuthoritiesFor as getAuthoritiesHardcoded,
  type Authority,
  type ResolvedRecipients,
} from "@/lib/sesizari/authorities";

export type { Authority, ResolvedRecipients };

/**
 * Resolve authorities for a complaint type + location.
 * @param tip - complaint type (groapa, iluminat, etc.)
 * @param countyId - county code ("CJ", "B", etc.) or null
 * @param localityId - locality ID or null
 * @param sector - sector for București (S1-S6) or null
 */
export async function resolveAuthorities(
  tip: string,
  countyId: string | null,
  localityId: string | null,
  sector: string | null
): Promise<ResolvedRecipients> {
  // If no county provided or it's București, use existing hardcoded logic
  if (!countyId || countyId === "B") {
    return getAuthoritiesHardcoded(tip, sector);
  }

  try {
    const admin = createSupabaseAdmin();

    // 1. Get routing rules for this complaint type
    const { data: rules } = await admin
      .from("complaint_routing")
      .select("authority_type, role, priority")
      .eq("complaint_type", tip)
      .order("priority", { ascending: true });

    if (!rules || rules.length === 0) {
      // Fallback: send to primărie
      const { data: primarie } = await admin
        .from("authorities")
        .select("name, email")
        .eq("county_id", countyId)
        .eq("type", "primarie")
        .eq("locality_id", localityId ?? "")
        .maybeSingle();

      if (primarie?.email) {
        return {
          primary: [{ id: "auto-primarie", name: primarie.name, email: primarie.email }],
          cc: [],
          label: primarie.name,
        };
      }
    }

    const primary: Authority[] = [];
    const cc: Authority[] = [];

    for (const rule of rules ?? []) {
      // Try locality-level authority first, then county-level
      let authority = null;

      if (localityId) {
        const { data } = await admin
          .from("authorities")
          .select("name, email, phone, type")
          .eq("type", rule.authority_type)
          .eq("locality_id", localityId)
          .not("email", "is", null)
          .maybeSingle();
        authority = data;
      }

      if (!authority) {
        const { data } = await admin
          .from("authorities")
          .select("name, email, phone, type")
          .eq("type", rule.authority_type)
          .eq("county_id", countyId)
          .is("locality_id", null)
          .not("email", "is", null)
          .maybeSingle();
        authority = data;
      }

      if (authority?.email) {
        const resolved = {
          id: `auto-${authority.type}`,
          name: authority.name,
          email: authority.email,
          phone: (authority.phone as string) || undefined,
        } satisfies Authority;
        if (rule.role === "primary") primary.push(resolved);
        else cc.push(resolved);
      }
    }

    const label = primary.map((a) => a.name).join(", ") || "Autoritate locală";
    return { primary, cc, label };
  } catch {
    // DB not set up yet — fallback to hardcoded București logic
    return getAuthoritiesHardcoded(tip, sector);
  }
}
