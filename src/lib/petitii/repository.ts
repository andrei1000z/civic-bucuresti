import { createSupabaseAdmin } from "@/lib/supabase/admin";

export interface PetitieRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image_url: string | null;
  external_url: string | null;
  target_signatures: number;
  category: string | null;
  county_code: string | null;
  starts_at: string;
  ends_at: string | null;
  status: "draft" | "active" | "closed" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
  ai_summary?: string | null;
}

export interface PetitieWithCount extends PetitieRow {
  signature_count: number;
}

export interface PetitieSignatureRow {
  id: string;
  petitie_id: string;
  user_id: string;
  display_name: string;
  comment: string | null;
  created_at: string;
}

/** List active + closed petitii ordered by recent. Used pe /petitii. */
export async function listPetitii(opts: {
  status?: Array<"active" | "closed" | "archived">;
  limit?: number;
} = {}): Promise<PetitieWithCount[]> {
  const admin = createSupabaseAdmin();
  let query = admin
    .from("petitii_with_count")
    .select("*")
    .order("starts_at", { ascending: false });

  const statuses = opts.status ?? ["active", "closed"];
  query = query.in("status", statuses);

  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    // Table missing (migration 020 nu e aplicată) — return empty.
    return [];
  }
  return (data ?? []) as PetitieWithCount[];
}

/** Get single petitie by slug. Null if not found / archived. */
export async function getPetitieBySlug(slug: string): Promise<PetitieWithCount | null> {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("petitii_with_count")
    .select("*")
    .eq("slug", slug)
    .in("status", ["active", "closed"])
    .maybeSingle();
  if (error || !data) return null;
  return data as PetitieWithCount;
}

/** List recent signatures for a petitie. Used pe detail page. */
export async function listSignatures(
  petitieId: string,
  limit = 20,
): Promise<PetitieSignatureRow[]> {
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("petitie_signatures")
    .select("*")
    .eq("petitie_id", petitieId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as PetitieSignatureRow[];
}

/** Check if user already signed (used pe detail page pentru CTA). */
export async function userHasSigned(
  petitieId: string,
  userId: string,
): Promise<boolean> {
  const admin = createSupabaseAdmin();
  const { count } = await admin
    .from("petitie_signatures")
    .select("*", { count: "exact", head: true })
    .eq("petitie_id", petitieId)
    .eq("user_id", userId);
  return (count ?? 0) > 0;
}
