import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { FeedbackList } from "./FeedbackList";

export const metadata = { title: "Feedback / Contact — Admin" };
export const dynamic = "force-dynamic";

interface Row {
  id: string;
  text: string;
  email: string | null;
  topic: string | null;
  page_path: string | null;
  ip_hash: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export default async function AdminFeedbackPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string } | null)?.role !== "admin") notFound();

  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("feedback_submissions")
    .select("id, text, email, topic, page_path, ip_hash, status, admin_notes, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
        >
          ← Admin home
        </Link>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl font-extrabold mt-2">
          Feedback / Contact
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Mesajele trimise prin formularul de contact (GDPR, bug, sugestii,
          contact general). Răspunde la cele cu email opțional, marchează
          restul ca arhivate.
        </p>
      </div>
      <FeedbackList rows={rows} />
    </div>
  );
}
