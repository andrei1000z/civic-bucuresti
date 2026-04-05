// Map Supabase PostgreSQL error codes to user-friendly Romanian messages

interface PgError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export function humanizeSupabaseError(err: unknown): { message: string; status: number } {
  const e = err as PgError;
  const code = e?.code ?? "";
  const msg = e?.message ?? "";

  // RLS policy violations
  if (code === "42501" || msg.includes("row-level security")) {
    return { message: "Nu ai permisiunea pentru această acțiune.", status: 403 };
  }
  if (code === "23505") return { message: "Înregistrare duplicată — deja există.", status: 409 };
  if (code === "23503") return { message: "Referință invalidă — resursa nu mai există.", status: 400 };
  if (code === "23514") return { message: "Date invalide — nu respectă constrângerile.", status: 400 };
  if (code === "23502") return { message: "Câmp obligatoriu lipsă.", status: 400 };
  if (code === "PGRST301" || msg.includes("JWT")) return { message: "Sesiune expirată — autentifică-te din nou.", status: 401 };
  if (code === "PGRST116") return { message: "Nu a fost găsit.", status: 404 };

  return { message: msg || "Eroare neașteptată", status: 500 };
}
