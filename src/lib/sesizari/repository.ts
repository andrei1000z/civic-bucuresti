import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  SesizareFeedRow,
  SesizareRow,
  SesizareCommentRow,
  SesizareTimelineRow,
  SesizareVerificationRow,
} from "@/lib/supabase/types";

export interface ListFilters {
  tip?: string;
  status?: string;
  sector?: string;
  county?: string;
  sort?: "recent" | "votate";
  limit?: number;
  offset?: number;
}

export async function listSesizari(filters: ListFilters = {}): Promise<SesizareFeedRow[]> {
  const supabase = await createSupabaseServer();
  let query = supabase.from("sesizari_feed").select("*");

  if (filters.tip && filters.tip !== "toate") query = query.eq("tip", filters.tip);
  if (filters.status && filters.status !== "toate") query = query.eq("status", filters.status);
  if (filters.sector && filters.sector !== "toate") query = query.eq("sector", filters.sector);
  if (filters.county) query = query.eq("county", filters.county.toUpperCase());

  if (filters.sort === "votate") {
    query = query.order("voturi_net", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SesizareFeedRow[];
}

export async function getSesizareByCode(code: string): Promise<SesizareFeedRow | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizari_feed")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data as SesizareFeedRow | null) ?? null;
}

export async function getSesizareById(id: string): Promise<SesizareFeedRow | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizari_feed")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as SesizareFeedRow | null) ?? null;
}

export async function getTimeline(sesizareId: string): Promise<SesizareTimelineRow[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizare_timeline")
    .select("*")
    .eq("sesizare_id", sesizareId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SesizareTimelineRow[];
}

export async function getComments(sesizareId: string): Promise<SesizareCommentRow[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizare_comments")
    .select("*")
    .eq("sesizare_id", sesizareId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SesizareCommentRow[];
}

export interface CreateSesizareInput {
  code: string;
  user_id?: string | null;
  author_name: string;
  author_email?: string | null;
  tip: string;
  titlu: string;
  locatie: string;
  sector: string | null;
  lat: number;
  lng: number;
  descriere: string;
  formal_text?: string | null;
  imagini?: string[];
  publica?: boolean;
}

export async function createSesizare(input: CreateSesizareInput): Promise<SesizareRow> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("sesizari")
    .insert({
      code: input.code,
      user_id: input.user_id ?? null,
      author_name: input.author_name,
      author_email: input.author_email ?? null,
      tip: input.tip,
      titlu: input.titlu,
      locatie: input.locatie,
      sector: input.sector,
      lat: input.lat,
      lng: input.lng,
      descriere: input.descriere,
      formal_text: input.formal_text ?? null,
      imagini: input.imagini ?? [],
      publica: input.publica ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SesizareRow;
}

export async function addComment(params: {
  sesizareId: string;
  userId: string;
  authorName: string;
  body: string;
}): Promise<SesizareCommentRow> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizare_comments")
    .insert({
      sesizare_id: params.sesizareId,
      user_id: params.userId,
      author_name: params.authorName,
      body: params.body,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SesizareCommentRow;
}

export async function upsertVote(params: {
  sesizareId: string;
  userId: string;
  value: -1 | 1;
}): Promise<void> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("sesizare_votes")
    .upsert(
      {
        sesizare_id: params.sesizareId,
        user_id: params.userId,
        value: params.value,
      },
      { onConflict: "sesizare_id,user_id" }
    );
  if (error) throw error;
}

export async function removeVote(params: {
  sesizareId: string;
  userId: string;
}): Promise<void> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("sesizare_votes")
    .delete()
    .eq("sesizare_id", params.sesizareId)
    .eq("user_id", params.userId);
  if (error) throw error;
}

export async function getUserVote(params: {
  sesizareId: string;
  userId: string;
}): Promise<-1 | 1 | null> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("sesizare_votes")
    .select("value")
    .eq("sesizare_id", params.sesizareId)
    .eq("user_id", params.userId)
    .maybeSingle();
  return ((data as { value: -1 | 1 } | null)?.value ?? null);
}

// ========== VERIFICĂRI REZOLVARE ==========

export async function getVerifications(
  sesizareId: string
): Promise<SesizareVerificationRow[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizare_verifications")
    .select("*")
    .eq("sesizare_id", sesizareId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SesizareVerificationRow[];
}

export async function getUserVerification(params: {
  sesizareId: string;
  userId: string;
}): Promise<boolean | null> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("sesizare_verifications")
    .select("agrees")
    .eq("sesizare_id", params.sesizareId)
    .eq("user_id", params.userId)
    .maybeSingle();
  return (data as { agrees: boolean } | null)?.agrees ?? null;
}

export async function upsertVerification(params: {
  sesizareId: string;
  userId: string;
  agrees: boolean;
}): Promise<void> {
  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("sesizare_verifications")
    .upsert(
      {
        sesizare_id: params.sesizareId,
        user_id: params.userId,
        agrees: params.agrees,
      },
      { onConflict: "sesizare_id,user_id" }
    );
  if (error) throw error;
}

// ========== SESIZĂRI SIMILARE ==========

export async function isFollowing(params: {
  sesizareId: string;
  userId: string;
}): Promise<boolean> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("sesizare_follows")
    .select("sesizare_id")
    .eq("sesizare_id", params.sesizareId)
    .eq("user_id", params.userId)
    .maybeSingle();
  return !!data;
}

export async function getSimilarSesizari(
  sesizareId: string,
  radiusM: number = 300
): Promise<SesizareFeedRow[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.rpc("sesizari_similare", {
    p_sesizare_id: sesizareId,
    p_radius_m: radiusM,
  });
  if (error) {
    // RPC might not exist yet (migration not applied) — fail gracefully
    return [];
  }
  return (data ?? []) as SesizareFeedRow[];
}
