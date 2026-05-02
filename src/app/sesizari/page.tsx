import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Search, CheckCircle2, Send, Scale, ChevronDown, HelpCircle } from "lucide-react";
import { SesizareForm } from "@/components/sesizari/SesizareForm";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { PageHero, HERO_GRADIENT } from "@/components/layout/PageHero";
import { FaqJsonLd } from "@/components/FaqJsonLd";

export const metadata: Metadata = {
  title: "Sesizări",
  description:
    "Trimite o sesizare formală la autorități. Generăm textul cu temei legal automat. Detectăm județul din locația ta.",
  alternates: { canonical: "/sesizari" },
};

// Pure form shell — content e mostly static. ISR 24h is enough; the
// "Dovezi că funcționează" probe below is checked at revalidate time
// so the link surfaces automatically the day after the first resolved
// sesizare with an after-photo lands.
export const revalidate = 86400;

interface QuickLink {
  href: string;
  icon: typeof Eye;
  title: string;
  desc: string;
  accent: string;
}

const STATIC_QUICK_LINKS: readonly QuickLink[] = [
  {
    href: "/sesizari-publice",
    icon: Eye,
    title: "Ce semnalează alții",
    desc: "Votează + trimite și tu",
    accent: "var(--color-primary)",
  },
  {
    href: "/urmareste",
    icon: Search,
    title: "Urmărește sesizarea ta",
    desc: "Verifică statusul cu codul primit",
    accent: "#F59E0B",
  },
] as const;

const DOVEZI_LINK: QuickLink = {
  href: "/sesizari-rezolvate",
  icon: CheckCircle2,
  title: "Dovezi că funcționează",
  desc: `Galerie „înainte / după"`,
  accent: "#10B981",
};

/**
 * Returns true once at least one approved public sesizare has both a
 * resolved status AND an after-photo. The /sesizari-rezolvate gallery
 * is built from this exact intersection — surfacing the entry-point
 * card before that first row exists ships users to an empty page.
 */
async function hasAnyResolvedWithPhoto(): Promise<boolean> {
  try {
    const admin = createSupabaseAdmin();
    const { count } = await admin
      .from("sesizari")
      .select("id", { count: "exact", head: true })
      .eq("status", "rezolvat")
      .eq("publica", true)
      .eq("moderation_status", "approved")
      .not("resolved_photo_url", "is", null);
    return (count ?? 0) > 0;
  } catch {
    // Conservative on failure: assume there's nothing to show, so the
    // user doesn't land on an empty gallery from a broken probe.
    return false;
  }
}

export default async function SesizariPage() {
  const showDovezi = await hasAnyResolvedWithPhoto();
  const QUICK_LINKS: readonly QuickLink[] = showDovezi
    ? [...STATIC_QUICK_LINKS, DOVEZI_LINK]
    : STATIC_QUICK_LINKS;
  return (
    <div className="container-narrow py-8 md:py-12">
      <PageHero
        title="Trimite o sesizare formală"
        icon={Send}
        gradient={HERO_GRADIENT.primary}
        description={
          <>
            Descrie problema în română simplă, atașează o poză, alege locația.
            Rescriem textul în limbaj formal cu temei legal și alegem singuri
            autoritatea competentă.
          </>
        }
        tagline="2 minute de la tine, 30 de zile pentru răspunsul lor (OG 27/2002)."
      />

      {/* Quick links — colored accent ring + icon chip per item.
          Grid scales to the link count so two cards don't stretch
          weirdly when the "Dovezi" entry is hidden pending the first
          resolved-with-photo sesizare. Class names are listed as
          literals so Tailwind's JIT picks them up. */}
      <div
        className={
          QUICK_LINKS.length === 3
            ? "grid sm:grid-cols-3 gap-3 mb-8"
            : "grid sm:grid-cols-2 gap-3 mb-8"
        }
      >
        {QUICK_LINKS.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="group relative flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 hover:shadow-[var(--shadow-3)] hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <span
                className="w-9 h-9 rounded-[var(--radius-xs)] grid place-items-center shrink-0"
                style={{ backgroundColor: `${q.accent}1a`, color: q.accent }}
                aria-hidden="true"
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                  {q.title}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{q.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Sesizare form */}
      <SesizareForm />

      {/* Legal footer card */}
      <div className="mt-8 bg-[var(--color-surface)] border border-blue-500/30 rounded-[var(--radius-md)] p-5 flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-[var(--radius-xs)] bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0"
          aria-hidden="true"
        >
          <Scale size={16} />
        </span>
        <div className="flex-1 text-sm">
          <p className="font-bold mb-1 text-blue-700 dark:text-blue-300">
            Legal — OG 27/2002 art. 8 alin. (1)
          </p>
          <p className="text-[var(--color-text)] leading-relaxed">
            Autoritatea are <strong>30 de zile calendaristice</strong> să îți răspundă. Dacă nu
            primești răspuns, ai drept de plângere la <strong>Avocatul Poporului</strong> și la
            <strong> instanța de contencios administrativ</strong>. Sesizarea generată include
            temeiul legal complet.
          </p>
        </div>
      </div>

      {/* FAQ — native <details> for zero-JS expand. JSON-LD makes the
          questions Google-snippet-eligible. */}
      <FaqJsonLd items={SESIZARE_FAQ} />
      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-extrabold mb-5 inline-flex items-center gap-2">
          <HelpCircle
            size={22}
            className="text-[var(--color-primary)]"
            aria-hidden="true"
          />
          Întrebări frecvente
        </h2>
        <div className="space-y-2">
          {SESIZARE_FAQ.map((q) => (
            <details
              key={q.question}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] hover:border-[var(--color-primary)]/40 transition-colors"
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 font-semibold text-sm md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-[var(--radius-md)]">
                <span>{q.question}</span>
                <ChevronDown
                  size={18}
                  className="text-[var(--color-text-muted)] shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="px-4 pb-4 text-sm text-[var(--color-text-muted)] leading-relaxed">
                {q.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

// FAQ catalog — answers calibrated against the most-asked support
// questions in the first 3 months of public sesizare submissions.
const SESIZARE_FAQ = [
  {
    question: "E gratuit? Trebuie să-mi fac cont?",
    answer:
      "Da, e gratuit pentru totdeauna. Nu trebuie cont — poți trimite o sesizare anonim pentru tine însuți. Contul îți permite doar să vezi istoricul tuturor sesizărilor tale într-un singur loc și să primești notificări prin email.",
  },
  {
    question: "Ce se întâmplă după ce trimit sesizarea?",
    answer:
      "Civia generează emailul formal cu temei legal (OG 27/2002) și îl deschide în clientul tău de email cu adresa primăriei competente deja completată. Tu apeși Trimite. Primării din toată România au 30 de zile calendaristice să răspundă. Primești un cod cu care urmărești statusul pe /urmareste.",
  },
  {
    question: "Cum aleg autoritatea corectă? Mă pot înșela?",
    answer:
      "Civia detectează automat autoritatea competentă în funcție de tipul problemei (groapă, gunoi, iluminat, parcare etc.) și de locația ta. Pentru parcare neregulamentară pe domeniu public, scrisoarea pleacă către Poliția Locală. Pentru gropi sau iluminat, către primărie. Pentru aer poluat, către Garda de Mediu sau ANPM. Vezi exact unde merge sesizarea înainte să apeși trimite.",
  },
  {
    question: "Ce face Civia cu poza și datele mele?",
    answer: `Poza și descrierea sunt vizibile public doar dacă bifezi opțiunea „Public" la trimitere — implicit, sesizarea e privată (doar autoritatea vede textul complet). Numele și adresa sunt obligatorii prin OG 27/2002 (sesizările anonime sunt clasate fără răspuns), dar nu se publică niciodată — apar doar în emailul către primărie. Datele tale rămân pe serverele Civia (UE). Detalii complete în Politica de confidențialitate.`,
  },
  {
    question: "Și dacă primăria nu îmi răspunde în 30 de zile?",
    answer: `Conform OG 27/2002, lipsa răspunsului în 30 de zile e o încălcare a obligației legale. Ai trei căi: (1) plângere la Avocatul Poporului — gratuit, prin formular online; (2) acțiune la instanța de contencios administrativ; (3) marchează sesizarea ca „fără răspuns" pe Civia, intră în statisticile publice ale primăriei și ne ajută să apăsăm.`,
  },
  {
    question: "Pot trimite o sesizare pentru altcineva?",
    answer: `Poți să trimiți o sesizare în nume propriu despre o problemă pe care ai văzut-o oriunde în România — sesizările civice nu cer ca tu să fii „victima". Dar numele și adresa care apar în email trebuie să fie reale. Sesizările anonime nu sunt acceptate legal.`,
  },
];
