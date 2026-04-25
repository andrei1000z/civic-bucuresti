import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Civia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ADMIN_TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sesizari", label: "Sesizări" },
  { href: "/admin/intreruperi", label: "Întreruperi" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if ((profile as { role?: string } | null)?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="container-narrow py-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-[family-name:var(--font-sora)] text-xl font-bold">Admin panel</h1>
          <p className="text-xs text-[var(--color-text-muted)] truncate">
            Conectat ca {user.email}
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded px-2 py-1"
        >
          ← Înapoi la site
        </Link>
      </div>
      <nav className="flex items-center gap-1 mb-6 overflow-x-auto no-scrollbar" aria-label="Secțiuni admin">
        {ADMIN_TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="px-3 py-1.5 rounded-[8px] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] shrink-0"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
