import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Megaphone, Users, Calendar, ExternalLink, ChevronLeft, ArrowRight } from "lucide-react";
import {
  getPetitieBySlug,
  listSignatures,
  userHasSigned,
} from "@/lib/petitii/repository";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";
import { BreadcrumbJsonLd } from "@/components/FaqJsonLd";
import { SignPetitieButton } from "./SignPetitieButton";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPetitieBySlug(slug);
  if (!p) return {};
  return {
    title: `${p.title} — Petiție Civia`,
    description: p.summary.slice(0, 160),
    alternates: { canonical: `/petitii/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.summary.slice(0, 200),
      type: "article",
      ...(p.image_url ? { images: [p.image_url] } : {}),
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PetitiePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const petitie = await getPetitieBySlug(slug);
  if (!petitie) notFound();

  const signatures = await listSignatures(petitie.id, 30);

  // Check if logged-in user already signed
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const alreadySigned = user ? await userHasSigned(petitie.id, user.id) : false;

  const progress = Math.min(
    100,
    Math.round((petitie.signature_count / Math.max(1, petitie.target_signatures)) * 100),
  );
  const isActive = petitie.status === "active";

  return (
    <article className="container-narrow py-8 md:py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Acasă", url: SITE_URL },
          { name: "Petiții", url: `${SITE_URL}/petitii` },
          { name: petitie.title, url: `${SITE_URL}/petitii/${petitie.slug}` },
        ]}
      />

      <Link
        href="/petitii"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ChevronLeft size={16} aria-hidden="true" /> Toate petițiile
      </Link>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Main content */}
        <div>
          {petitie.image_url && (
            <div className="relative w-full aspect-[16/9] bg-[var(--color-surface-2)] rounded-[var(--radius-md)] overflow-hidden mb-6">
              <Image
                src={petitie.image_url}
                alt={petitie.title}
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-4">
            {petitie.category && (
              <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400">
                {petitie.category}
              </span>
            )}
            {!isActive && (
              <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                Încheiată
              </span>
            )}
            {petitie.county_code && (
              <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text)]">
                {petitie.county_code}
              </span>
            )}
          </div>

          <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-extrabold mb-4 leading-tight tracking-tight">
            {petitie.title}
          </h1>

          <p className="text-lg text-[var(--color-text-muted)] mb-6 leading-relaxed">
            {petitie.summary}
          </p>

          {/* Body — preserve newlines, no markdown parsing yet */}
          <div className="prose prose-invert max-w-none text-[var(--color-text)] leading-relaxed whitespace-pre-line text-base">
            {petitie.body}
          </div>

          {petitie.external_url && (
            <a
              href={petitie.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-sm text-[var(--color-primary)] hover:underline"
            >
              <ExternalLink size={14} aria-hidden="true" />
              Vezi petiția oficială →
            </a>
          )}
        </div>

        {/* Sidebar — sign + counter + recent signatures */}
        <aside className="lg:sticky lg:top-24 space-y-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-1)]">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-[family-name:var(--font-sora)] text-3xl font-extrabold text-[var(--color-primary)] tabular-nums">
                {petitie.signature_count.toLocaleString("ro-RO")}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                din {petitie.target_signatures.toLocaleString("ro-RO")}
              </span>
            </div>
            <div className="h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all"
                style={{ width: `${progress}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-4 flex items-center gap-1.5">
              <Users size={12} aria-hidden="true" />
              <strong className="text-[var(--color-text)]">{progress}%</strong> din obiectiv
              {petitie.ends_at && (
                <>
                  {" · "}
                  <Calendar size={11} aria-hidden="true" className="ml-1" />
                  {formatDate(petitie.ends_at)}
                </>
              )}
            </p>

            <SignPetitieButton
              petitieId={petitie.id}
              petitieSlug={petitie.slug}
              isActive={isActive}
              isLoggedIn={!!user}
              alreadySigned={alreadySigned}
            />
          </div>

          {signatures.length > 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                Ultimele semnături
              </p>
              <ul className="space-y-2">
                {signatures.map((s) => (
                  <li key={s.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white text-xs font-bold flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {s.display_name.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{s.display_name}</p>
                        {s.comment && (
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                            „{s.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/sesizari"
            className="block bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 rounded-[var(--radius-md)] p-4 hover:bg-[var(--color-primary-soft)]/80 transition-colors group"
          >
            <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-1 inline-flex items-center gap-1">
              <Megaphone size={12} aria-hidden="true" /> Acțiune individuală
            </p>
            <p className="text-sm font-medium">Trimite și o sesizare la primărie <ArrowRight size={12} className="inline group-hover:translate-x-0.5 transition-transform" aria-hidden="true" /></p>
          </Link>
        </aside>
      </div>
    </article>
  );
}
