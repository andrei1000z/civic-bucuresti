import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Megaphone,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { getPetitieBySlug } from "@/lib/petitii/repository";
import { SITE_URL, PETITIE_CATEGORII } from "@/lib/constants";
import { ALL_COUNTIES } from "@/data/counties";
import { BreadcrumbJsonLd } from "@/components/FaqJsonLd";
import { SharePetitie } from "./SharePetitie";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPetitieBySlug(slug);
  if (!p) return {};

  const url = `${SITE_URL}/petitii/${p.slug}`;
  const title = `${p.title} — Petiție Civia`;
  const description = p.summary.slice(0, 200);
  // OG image: dacă petiția are image_url proprie folosește-o (1200px wide
  // recomandat de Twitter/FB), altfel fallback la opengraph-image.tsx
  // dynamic generated cu titlul petiției pe gradient verde.
  const ogImages = p.image_url
    ? [{ url: p.image_url, width: 1200, height: 630, alt: p.title }]
    : [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: p.title }];

  return {
    title,
    description,
    alternates: { canonical: `/petitii/${p.slug}` },
    openGraph: {
      title: p.title,
      description,
      url,
      type: "article",
      siteName: "Civia",
      locale: "ro_RO",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description,
      images: ogImages.map((i) => i.url),
    },
    other: {
      // Bluesky / Mastodon / Fediverse: respect og:image, plus we emit
      // explicit „author" hint so AT-protocol clients can render attribution.
      "og:image:secure_url": ogImages[0]?.url ?? "",
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

  const isActive = petitie.status === "active";
  const cat = PETITIE_CATEGORII.find((c) => c.value === petitie.category);
  const county = petitie.county_code
    ? ALL_COUNTIES.find((c) => c.id === petitie.county_code)
    : null;

  let externalHost: string | null = null;
  if (petitie.external_url) {
    try {
      externalHost = new URL(petitie.external_url).hostname.replace(/^www\./, "");
    } catch {
      externalHost = null;
    }
  }

  return (
    <article>
      <BreadcrumbJsonLd
        items={[
          { name: "Acasă", url: SITE_URL },
          { name: "Petiții", url: `${SITE_URL}/petitii` },
          { name: petitie.title, url: `${SITE_URL}/petitii/${petitie.slug}` },
        ]}
      />

      {/* HERO with image as background or solid gradient if no image */}
      <header className="relative overflow-hidden">
        {petitie.image_url ? (
          <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] max-h-[500px] bg-[var(--color-surface-2)]">
            <Image
              src={petitie.image_url}
              alt={petitie.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ) : (
          <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] max-h-[400px] bg-gradient-to-br from-purple-600 via-purple-800 to-[#0a0a0a]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.4),transparent)]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Megaphone size={120} aria-hidden="true" className="text-white" />
            </div>
          </div>
        )}

        <div className="container-narrow">
          <div
            className={
              petitie.image_url
                ? "absolute inset-x-0 bottom-0 px-4 sm:px-8 pb-6 md:pb-10 text-white"
                : "absolute inset-x-0 bottom-0 px-4 sm:px-8 pb-6 md:pb-10 text-white"
            }
          >
            <div className="max-w-3xl">
              <Link
                href="/petitii"
                className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3 transition-colors"
              >
                <ChevronLeft size={14} aria-hidden="true" /> Toate petițiile
              </Link>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                {cat && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white">
                    <span aria-hidden="true">{cat.icon}</span> {cat.value}
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white">
                  {county ? `📍 ${county.name}` : "🇷🇴 Național"}
                </span>
                {!isActive && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white">
                    Încheiată
                  </span>
                )}
              </div>

              <h1 className="font-[family-name:var(--font-sora)] text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-2 max-w-3xl">
                {petitie.title}
              </h1>
              {petitie.ends_at && (
                <p className="text-sm text-white/80 inline-flex items-center gap-1.5 mt-2">
                  <Calendar size={14} aria-hidden="true" />
                  {petitie.status === "closed" ? "Încheiată " : "Până "}
                  {formatDate(petitie.ends_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container-narrow py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Main content */}
          <div className="max-w-2xl">
            <p className="text-xl text-[var(--color-text)] mb-8 leading-relaxed font-medium">
              {petitie.summary}
            </p>

            <div className="text-base text-[var(--color-text)] leading-relaxed whitespace-pre-line space-y-4">
              {petitie.body}
            </div>

            {/* Inline CTA after body */}
            {petitie.external_url && isActive && (
              <div className="mt-10 p-6 rounded-[var(--radius-lg)] bg-gradient-to-br from-purple-600 to-purple-800 text-white">
                <p className="text-xs uppercase tracking-wider font-bold opacity-90 mb-2 inline-flex items-center gap-1">
                  <Megaphone size={12} aria-hidden="true" /> Susține petiția
                </p>
                <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold mb-3">
                  Semnează pe {externalHost}
                </h2>
                <p className="text-sm text-white/90 mb-5 leading-relaxed">
                  Civia agregă petițiile civice. Click → semnezi pe site-ul oficial unde
                  petiția a fost lansată. Una secundă, niciun spam.
                </p>
                <a
                  href={petitie.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-[var(--radius-full)] bg-white text-purple-700 font-semibold hover:bg-white/90 active:scale-[0.97] transition-all shadow-[var(--shadow-3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-700"
                >
                  Semnează pe {externalHost} <ExternalLink size={16} aria-hidden="true" />
                </a>
              </div>
            )}

            {!isActive && (
              <div className="mt-8 p-5 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <p className="text-sm font-semibold mb-1 inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" aria-hidden="true" />
                  Petiție încheiată
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Această petiție nu mai primește semnături. O lăsăm publică pentru
                  transparență.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-3">
            {petitie.external_url && isActive && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-1)]">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-3">
                  Semnează aici
                </p>
                <a
                  href={petitie.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-[var(--radius-full)] bg-purple-600 hover:bg-purple-700 active:scale-[0.97] text-white text-sm font-semibold transition-all shadow-[var(--shadow-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                >
                  <Megaphone size={16} aria-hidden="true" />
                  Mergi pe {externalHost}
                </a>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-3 text-center leading-relaxed">
                  Petiția e găzduită pe <strong>{externalHost}</strong>. Civia o
                  agregă pentru vizibilitate.
                </p>
              </div>
            )}

            {/* Share — accesibil mereu (active sau closed) */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 shadow-[var(--shadow-1)]">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-3">
                Distribuie petiția
              </p>
              <SharePetitie
                url={`${SITE_URL}/petitii/${petitie.slug}`}
                title={petitie.title}
                summary={petitie.summary}
              />
              <p className="text-[10px] text-[var(--color-text-muted)] mt-2 leading-relaxed">
                Mai mulți oameni = mai multe semnături. Distribuie pe X, Bluesky, Facebook, WhatsApp, etc.
              </p>
            </div>

            <Link
              href="/sesizari"
              className="block bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 rounded-[var(--radius-md)] p-5 hover:bg-[var(--color-primary-soft)]/80 transition-colors group"
            >
              <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2 inline-flex items-center gap-1">
                <Share2 size={12} aria-hidden="true" /> Acțiune individuală
              </p>
              <p className="text-sm font-semibold mb-1">Trimite și o sesizare la primărie</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Petiția pune presiune publică, sesizarea ta intră direct în registratura primăriei.
              </p>
              <span className="text-xs font-medium text-[var(--color-primary)] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Începe sesizarea <ArrowRight size={12} aria-hidden="true" />
              </span>
            </Link>

            <Link
              href="/petitii"
              className="block text-xs text-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-2 transition-colors"
            >
              ← Toate petițiile
            </Link>
          </aside>
        </div>
      </div>
    </article>
  );
}
