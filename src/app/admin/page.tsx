import Link from "next/link";
import { FileText, Users, Newspaper, Shield, BarChart3 } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = createSupabaseAdmin();
  const [total, pending, stiri, users] = await Promise.all([
    admin.from("sesizari").select("*", { count: "exact", head: true }),
    admin.from("sesizari").select("*", { count: "exact", head: true }).eq("moderation_status", "pending"),
    admin.from("stiri_cache").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Sesizări totale", value: total.count ?? 0, icon: FileText, href: "/admin/sesizari", color: "#2563EB" },
    { label: "Așteaptă moderare", value: pending.count ?? 0, icon: Shield, href: "/admin/sesizari?status=pending", color: "#F59E0B" },
    { label: "Știri în cache", value: stiri.count ?? 0, icon: Newspaper, href: "/stiri", color: "#059669" },
    { label: "Utilizatori", value: users.count ?? 0, icon: Users, href: "#", color: "#8B5CF6" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 hover:shadow-[var(--shadow-md)] transition-all"
            >
              <Icon size={20} style={{ color: card.color }} className="mb-2" />
              <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
        <h2 className="font-semibold mb-4">Acțiuni rapide</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link
            href="/admin/sesizari"
            className="flex items-center gap-3 p-4 rounded-[8px] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors"
          >
            <Shield size={20} className="text-amber-500" />
            <div>
              <p className="font-medium text-sm">Moderare sesizări</p>
              <p className="text-xs text-[var(--color-text-muted)]">{pending.count ?? 0} în așteptare</p>
            </div>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 p-4 rounded-[8px] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors"
          >
            <BarChart3 size={20} className="text-blue-500" />
            <div>
              <p className="font-medium text-sm">Analytics live</p>
              <p className="text-xs text-[var(--color-text-muted)]">Trafic, device, țări, erori</p>
            </div>
          </Link>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/stiri/fetch"
            className="flex items-center gap-3 p-4 rounded-[8px] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors"
          >
            <Newspaper size={20} className="text-emerald-500" />
            <div>
              <p className="font-medium text-sm">Refresh știri RSS</p>
              <p className="text-xs text-[var(--color-text-muted)]">Fetch manual din surse</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
