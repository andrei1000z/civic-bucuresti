import Link from "next/link";
import { FileText, Users, Newspaper, Shield, BarChart3 } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { RefreshStiriButton } from "./RefreshStiriButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = createSupabaseAdmin();
  const [total, pending, stiri, users] = await Promise.all([
    admin.from("sesizari").select("*", { count: "exact", head: true }),
    admin.from("sesizari").select("*", { count: "exact", head: true }).eq("moderation_status", "pending"),
    admin.from("stiri_cache").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  // Only the first 3 cards are clickable — "Conturi active" is
  // a read-only metric until we build a user-management page, so
  // it renders as a plain div. Having it pretend to be a Link
  // ("#") was a broken affordance.
  const cards = [
    { label: "Sesizări primite (total)", value: total.count ?? 0, icon: FileText, href: "/admin/sesizari", color: "#2563EB" },
    { label: "Necesită moderare", value: pending.count ?? 0, icon: Shield, href: "/admin/sesizari?status=pending", color: "#F59E0B" },
    { label: "Articole știri indexate", value: stiri.count ?? 0, icon: Newspaper, href: "/stiri", color: "#059669" },
    { label: "Conturi active", value: users.count ?? 0, icon: Users, href: null, color: "#8B5CF6" },
  ] as const;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <>
              <Icon size={20} style={{ color: card.color }} className="mb-2" aria-hidden="true" />
              <p className="text-3xl font-bold tabular-nums" style={{ color: card.color }}>{card.value.toLocaleString("ro-RO")}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{card.label}</p>
            </>
          );
          if (card.href) {
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-5 hover:shadow-[var(--shadow-3)] hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                {inner}
              </Link>
            );
          }
          return (
            <div
              key={card.label}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-5"
              aria-label={`${card.label}: ${card.value}`}
            >
              {inner}
            </div>
          );
        })}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-2)] p-6">
        <h2 className="font-semibold mb-4">Unde mergi de aici</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link
            href="/admin/sesizari"
            className="flex items-center gap-3 p-4 rounded-[8px] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <Shield size={20} className="text-amber-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-sm">Moderează sesizările noi</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                <span className="tabular-nums">{(pending.count ?? 0).toLocaleString("ro-RO")}</span> așteaptă aprobare sau respingere
              </p>
            </div>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 p-4 rounded-[8px] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <BarChart3 size={20} className="text-blue-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-sm">Analytics în timp real</p>
              <p className="text-xs text-[var(--color-text-muted)]">Trafic, dispozitive, țări, erori, performanță</p>
            </div>
          </Link>
          <RefreshStiriButton />
        </div>
      </div>
    </div>
  );
}
