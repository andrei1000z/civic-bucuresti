import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Civia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-xl font-bold">Admin Panel</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Moderare sesizări · Civia</p>
        </div>
      </div>
      {children}
    </div>
  );
}
