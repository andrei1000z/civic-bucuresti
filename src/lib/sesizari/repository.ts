import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getHiddenUserIds, getHiddenEmails } from "@/lib/privacy/hidden-users";
import { scrubFormalTextForPublic } from "./scrub-public";
import type {
  SesizareFeedRow,
  SesizareRow,
  SesizareCommentRow,
  SesizareTimelineRow,
  SesizareVerificationRow,
} from "@/lib/supabase/types";

const ANONYMOUS_LABEL = "Cetățean anonim";

// One pass on the session: returns the viewer's user id (if any) and whether
// they have the admin role. Used by both the name anonymizer and the
// formal_text scrubber so we fetch the auth+profile row once per request.
async function getViewerContext(): Promise<{ viewerId: string | null; isAdmin: boolean }> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { viewerId: null, isAdmin: false };
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return {
      viewerId: user.id,
      isAdmin: (profile as { role?: string } | null)?.role === "admin",
    };
  } catch {
    return { viewerId: null, isAdmin: false };
  }
}

type Anonymizable = {
  user_id: string | null;
  author_name: string;
  author_email?: string | null;
  formal_text?: string | null;
};

/**
 * Applies public-viewer privacy to a list of sesizări:
 *   - always scrubs the home address out of formal_text (promised on the
 *     public page: "adresa de domiciliu a fost ascunsă automat")
 *   - additionally scrubs the author name (in author_name AND in
 *     formal_text) when the owner toggled hide_name in /cont. The match
 *     happens on user_id OR author_email — guests-then-signed-up users
 *     have legacy rows with user_id=null but their email in
 *     author_email; the email path catches those.
 *   - admins and the row's owner bypass both scrubs (they're either
 *     moderating or reading their own sesizare)
 *
 * Runs two Redis SMISMEMBER round-trips (user_ids + emails) plus one
 * Supabase profile lookup for the viewer's role. Zero per-row queries.
 */
async function anonymizeHiddenAuthors<T extends Anonymizable>(rows: T[]): Promise<T[]> {
  if (rows.length === 0) return rows;

  const { viewerId, isAdmin } = await getViewerContext();
  if (isAdmin) return rows;

  const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter((v): v is string => !!v)));
  const emails = Array.from(
    new Set(
      rows
        .map((r) => r.author_email?.toLowerCase().trim())
        .filter((v): v is string => !!v),
    ),
  );

  const [hiddenIds, hiddenEmails] = await Promise.all([
    userIds.length > 0 ? getHiddenUserIds(userIds) : Promise.resolve(new Set<string>()),
    emails.length > 0 ? getHiddenEmails(emails) : Promise.resolve(new Set<string>()),
  ]);

  return rows.map((r) => {
    const isOwner = !!r.user_id && r.user_id === viewerId;
    if (isOwner) return r; // owner sees their own name + address

    const idHit = !!r.user_id && hiddenIds.has(r.user_id);
    const emailHit =
      !!r.author_email && hiddenEmails.has(r.author_email.toLowerCase().trim());
    const hideName = idHit || emailHit;

    let scrubbedFormalText = r.formal_text ?? null;
    if (scrubbedFormalText) {
      scrubbedFormalText = scrubFormalTextForPublic(scrubbedFormalText, {
        authorName: r.author_name,
        hideName, // scrub name only when user opted in
      });
    }

    return {
      ...r,
      author_name: hideName ? ANONYMOUS_LABEL : r.author_name,
      formal_text: scrubbedFormalText,
    };
  });
}

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
  return await anonymizeHiddenAuthors((data ?? []) as SesizareFeedRow[]);
}

export async function getSesizareByCode(code: string): Promise<SesizareFeedRow | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizari_feed")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  const row = (data as SesizareFeedRow | null) ?? null;
  if (!row) return null;
  const [anonymized] = await anonymizeHiddenAuthors([row]);
  return anonymized ?? row;
}

export async function getSesizareById(id: string): Promise<SesizareFeedRow | null> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizari_feed")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  const row = (data as SesizareFeedRow | null) ?? null;
  if (!row) return null;
  const [anonymized] = await anonymizeHiddenAuthors([row]);
  return anonymized ?? row;
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
  const rows = (data ?? []) as SesizareCommentRow[];
  return anonymizeHiddenComments(rows);
}

/**
 * Mirror of `anonymizeHiddenAuthors` for comments. The hide-name flag
 * is per-user (Redis SET membership), so a user who opted in expects
 * their name redacted everywhere their handle would surface — comments
 * included. Owner of the comment and admins still see the real name.
 */
async function anonymizeHiddenComments(
  rows: SesizareCommentRow[],
): Promise<SesizareCommentRow[]> {
  if (rows.length === 0) return rows;
  const { viewerId, isAdmin } = await getViewerContext();
  if (isAdmin) return rows;

  const userIds = Array.from(
    new Set(rows.map((r) => r.user_id).filter((v): v is string => !!v)),
  );
  const hidden = userIds.length > 0 ? await getHiddenUserIds(userIds) : new Set<string>();

  return rows.map((r) => {
    const isOwner = !!r.user_id && r.user_id === viewerId;
    if (isOwner) return r;
    if (!r.user_id || !hidden.has(r.user_id)) return r;
    return { ...r, author_name: ANONYMOUS_LABEL };
  });
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
      sector: input.sector || null,
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
  /** ID-ul comentariului-părinte (null = top-level). Permite reply 1-nivel. */
  parentCommentId?: string | null;
}): Promise<SesizareCommentRow> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("sesizare_comments")
    .insert({
      sesizare_id: params.sesizareId,
      user_id: params.userId,
      author_name: params.authorName,
      body: params.body,
      parent_comment_id: params.parentCommentId ?? null,
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
  // Apply the same anonymization + address scrub as every other read path.
  // Without this, the "Alții au sesizat aceeași problemă" widget leaked
  // the real author_name even when hide_name was enabled.
  return await anonymizeHiddenAuthors((data ?? []) as SesizareFeedRow[]);
}
