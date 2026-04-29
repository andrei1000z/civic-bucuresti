import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, CheckCircle2, MapPin, Calendar } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { SESIZARE_TIPURI } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { SesizareRow } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Probleme rezolvate — Civia",
  description: "Galerie „înainte / după” cu sesizări rezolvate efectiv de primării și autorități. Dovada că implicarea civică mișcă lucrurile în România.",
  alternates: { canonical: "/sesizari-rezolvate" },
};

export const revalidate = 300;

async function getResolved(): Promise<SesizareRow[]> {
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("sesizari")
      .select("*")
      .eq("status", "rezolvat")
      .eq("publica", true)
      .eq("moderation_status", "approved")
      .order("resolved_at", { ascending: false })
      .limit(48);
    return (data as SesizareRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function SesizariResolvatePage() {
  const resolved = await getResolved();

  const withPhotos = resolved.filter(
    (r) => r.resolved_photo_url && r.imagini.length > 0
  );
  const withoutPhotos = resolved.filter(
    (r) => !r.resolved_photo_url || r.imagini.length === 0
  );

  return (
    <div className="container-narrow py-12 md:py-16">
      <Link
        href="/sesizari"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Trimit și eu o sesizare
      </Link>

      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Probleme rezolvate — dovada că funcționează
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Fiecare poză „înainte / după” de mai jos este o sesizare trimisă prin Civia, acționată de primărie sau de autoritate. Scris-am, a răspuns, au reparat. Așa arată implicarea civică.
        </p>
      </div>

      {resolved.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-10 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-500" />
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2">
            Galeria se completează în timp
          </h2>
          <p className="text-[var(--color-text-muted)] mb-6">
            Încă nu avem suficiente sesizări rezolvate cu poză „după”. Ajută-ne să construim dovada — trimite o sesizare acum, iar când autoritatea o rezolvă încarcă și o poză „după”.
          </p>
          <Link
            href="/sesizari"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
          >
            Trimite o sesizare acum
          </Link>
        </div>
      ) : (
        <>
          {/* Before / After gallery */}
          {withPhotos.length > 0 && (
            <section className="mb-12">
              <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6">
                Înainte și după — galerie foto
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {withPhotos.map((s) => {
                  const tipIcon = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.icon ?? "📝";
                  return (
                    <Link
                      key={s.id}
                      href={`/sesizari/${s.code}`}
                      className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all"
                    >
                      <div className="grid grid-cols-2">
                        <div className="relative h-48">
                          <Image
                            src={s.imagini[0] ?? ""}
                            alt="Înainte"
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">ÎNAINTE</span>
                        </div>
                        <div className="relative h-48">
                          <Image
                            src={s.resolved_photo_url!}
                            alt="După"
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">DUPĂ</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold group-hover:text-[var(--color-primary)] transition-colors">
                          {tipIcon} {s.titlu}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1"><MapPin size={12} />{s.locatie}</span>
                          {s.resolved_at && <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(s.resolved_at)}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* List without photos */}
          {withoutPhotos.length > 0 && (
            <section>
              <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6">
                Alte rezolvări (fără poză „după”)
              </h2>
              <div className="space-y-3">
                {withoutPhotos.map((s) => {
                  const tipIcon = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.icon ?? "📝";
                  return (
                    <Link
                      key={s.id}
                      href={`/sesizari/${s.code}`}
                      className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-4 hover:shadow-[var(--shadow-md)] transition-all"
                    >
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{tipIcon} {s.titlu}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{s.locatie}</p>
                      </div>
                      {s.resolved_at && (
                        <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                          {formatDate(s.resolved_at)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
