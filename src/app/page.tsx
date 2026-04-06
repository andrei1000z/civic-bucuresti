import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Map as MapIcon,
  Ticket,
  AlertCircle,
  BarChart3,
  BookOpen,
  Newspaper,
  History,
  Siren,
  ArrowRight,
  Bike,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SesizariMap } from "@/components/maps/SesizariMap";
import { Badge } from "@/components/ui/Badge";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { SOURCE_COLORS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";
import { BucurestiStats } from "@/components/home/BucurestiStats";
import { TopVotedWidget } from "@/components/home/TopVotedWidget";
import { NearMeWidget } from "@/components/home/NearMeWidget";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: { absolute: "Civia — Platforma civică a Bucureștiului" },
  description: "Hărți, sesizări, ghiduri, știri și statistici despre Bucureștiul tău — într-un singur loc.",
  alternates: { canonical: "/" },
};

const quickAccess = [
  {
    href: "/harti",
    icon: MapIcon,
    title: "Hărți de mobilitate",
    description: "Piste de biciclete, metrou, STB, trasee pe jos.",
    accent: "#1C4ED8",
  },
  {
    href: "/bilete",
    icon: Ticket,
    title: "Bilete & Abonamente",
    description: "STB, Metrorex, Ilfov - toate tarifele într-un loc.",
    accent: "#059669",
  },
  {
    href: "/sesizari",
    icon: AlertCircle,
    title: "Sesizări",
    description: "Generează și trimite sesizări formale la PMB.",
    accent: "#DC2626",
  },
  {
    href: "/statistici",
    icon: BarChart3,
    title: "Statistici",
    description: "Accidente, aer, transport, spații verzi.",
    accent: "#8B5CF6",
  },
  {
    href: "/ghiduri",
    icon: BookOpen,
    title: "Ghiduri cetățean",
    description: "Biciclist, cutremur, caniculă, transport.",
    accent: "#F59E0B",
  },
  {
    href: "/stiri",
    icon: Newspaper,
    title: "Știri verificate",
    description: "Agregare din surse locale, fără clickbait.",
    accent: "#0EA5E9",
  },
  {
    href: "/istoric",
    icon: History,
    title: "Istoric administrație",
    description: "Primarii București din 1989 până azi.",
    accent: "#EC4899",
  },
  {
    href: "/evenimente",
    icon: Siren,
    title: "Evenimente majore",
    description: "Cronologia incidentelor importante.",
    accent: "#64748B",
  },
  {
    href: "/impact",
    icon: CheckCircle2,
    title: "Impact",
    description: "Probleme rezolvate prin Civia — before/after.",
    accent: "#10B981",
  },
];


interface StireRow {
  id: string;
  url: string;
  title: string;
  excerpt: string | null;
  source: string;
  category: string;
  published_at: string;
  image_url: string | null;
}

async function getLatestStiri(): Promise<StireRow[]> {
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("stiri_cache")
      .select("id, url, title, excerpt, source, category, published_at, image_url")
      .order("published_at", { ascending: false })
      .limit(3);
    return (data as StireRow[]) ?? [];
  } catch {
    return [];
  }
}

export const revalidate = 900; // revalidate homepage every 15 min

export default async function HomePage() {
  const latestStiri = await getLatestStiri();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C4ED8] via-[#1e3a8a] to-[#0F172A] text-white">
        <Image
          src="/images/home/hero-bucuresti.webp"
          alt="București"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C4ED8]/70 via-[#1e3a8a]/80 to-[#0F172A]/95" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />

        {/* Floating cards — static brand info */}
        <div className="absolute top-20 right-8 hidden lg:block animate-float">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[12px] p-4 shadow-2xl min-w-[220px]">
            <p className="text-xs text-white/60 mb-1">Hărți bazate pe</p>
            <p className="text-2xl font-bold">OpenStreetMap</p>
            <p className="text-xs text-emerald-300 mt-1">date deschise, real-time</p>
          </div>
        </div>
        <div
          className="absolute top-48 right-40 hidden lg:block animate-float"
          style={{ animationDelay: "1s" }}
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[12px] p-4 shadow-2xl min-w-[200px]">
            <p className="text-xs text-white/60 mb-1">Metrou București</p>
            <p className="text-3xl font-bold">63 stații</p>
            <p className="text-xs text-emerald-300 mt-1">M1–M5 (M6 în construcție)</p>
          </div>
        </div>
        <div
          className="absolute bottom-32 right-24 hidden lg:block animate-float"
          style={{ animationDelay: "2s" }}
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[12px] p-4 shadow-2xl min-w-[180px]">
            <p className="text-xs text-white/60 mb-1">Platformă</p>
            <p className="text-2xl font-bold">open-source</p>
            <p className="text-xs text-white/70 mt-1">MIT license</p>
          </div>
        </div>

        <div className="container-narrow relative z-10 py-24 md:py-32">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-white/10 text-white border border-white/20">
              🇷🇴 Platformă civică independentă
            </Badge>
            <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-[1.05]">
              București,
              <br />
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                mai ușor de înțeles.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 mb-8 max-w-2xl">
              Hărți, sesizări, ghiduri, știri și statistici despre orașul tău — într-un singur loc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/harti"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[8px] bg-white text-[#1C4ED8] font-semibold hover:bg-blue-50 shadow-xl transition-all"
              >
                <MapIcon size={20} />
                Explorează harta
              </Link>
              <Link
                href="/sesizari"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[8px] border-2 border-white/30 text-white font-semibold hover:bg-white/10 backdrop-blur transition-all"
              >
                <AlertCircle size={20} />
                Fă o sesizare
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE STATS BAR */}
      <LiveStatsBar />

      {/* QUICK ACCESS GRID */}
      <section className="py-16 md:py-20">
        <div className="container-narrow">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-3">
              Ce poți face aici
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Tot ce îți trebuie pentru a fi un cetățean informat și activ al Bucureștiului.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickAccess.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all overflow-hidden"
                  style={{ borderLeft: `4px solid ${item.accent}` }}
                >
                  <div
                    className="w-11 h-11 rounded-[8px] flex items-center justify-center mb-3"
                    style={{ background: `${item.accent}15`, color: item.accent }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-base mb-1 text-[var(--color-text)]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3 min-h-[2.5rem]">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] group-hover:gap-2 transition-all">
                    <span>Vezi mai mult</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED GUIDE */}
      <section className="py-12">
        <div className="container-narrow">
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[20px] overflow-hidden text-white">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            <div className="relative grid md:grid-cols-[1fr_auto] gap-6 p-8 md:p-12 items-center">
              <div>
                <Badge className="mb-4 bg-white/15 text-white border border-white/20">
                  Ghid recomandat
                </Badge>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-3">
                  Ghidul biciclistului din București
                </h2>
                <p className="text-white/90 mb-6 max-w-xl">
                  10 capitole complete — de la cum îți alegi bicicleta după buget, până la regulile de circulație și cum repari o pană de cauciuc în plin trafic.
                </p>
                <div className="flex flex-wrap gap-4 items-center mb-6 text-sm">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={16} /> 10 capitole
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} /> 35 minute
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bike size={16} /> Nivel mediu
                  </span>
                </div>
                <Link
                  href="/ghiduri/ghid-biciclist"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white text-emerald-700 font-semibold hover:bg-emerald-50 shadow-xl transition-all"
                >
                  Citește ghidul
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="hidden md:block">
                <Bike size={180} strokeWidth={1} className="opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST NEWS */}
      <section className="py-16">
        <div className="container-narrow">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-2">
                Ultimele știri
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Agregate din surse verificate, actualizate zilnic.
              </p>
            </div>
            <Link
              href="/stiri"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:gap-3 transition-all"
            >
              Vezi toate știrile <ArrowRight size={16} />
            </Link>
          </div>
          {latestStiri.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-10 text-center">
              <p className="text-[var(--color-text-muted)] mb-4">
                Știrile se actualizează automat din surse verificate.
              </p>
              <Link href="/stiri" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline">
                Vezi toate știrile disponibile <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {latestStiri.map((stire) => (
                <a
                  key={stire.id}
                  href={stire.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all"
                >
                  <div className="h-40 bg-gradient-to-br from-slate-600 to-slate-800 relative">
                    {stire.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={stire.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" loading="lazy" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge bgColor={SOURCE_COLORS[stire.source] ?? "#64748b"} color="white">
                        {stire.source}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-black/40 text-white border border-white/20">
                        {stire.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {stire.title}
                    </h3>
                    {stire.excerpt && (
                      <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">
                        {stire.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <span>{timeAgo(stire.published_at)}</span>
                      <span>Citește →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SESIZĂRI MAP PREVIEW */}
      <section className="py-16 bg-[var(--color-surface)]">
        <div className="container-narrow">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-2">
                Sesizări recente pe hartă
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Vezi în timp real problemele semnalate de cetățeni.
              </p>
            </div>
            <Link
              href="/sesizari"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:gap-3 transition-all"
            >
              Toate sesizările <ArrowRight size={16} />
            </Link>
          </div>
          <SesizariMap limit={15} height="480px" zoom={12} />
        </div>
      </section>

      {/* TOP VOTED */}
      <TopVotedWidget />

      {/* NEAR ME WIDGET */}
      <section className="pb-16">
        <div className="container-narrow max-w-2xl">
          <NearMeWidget />
        </div>
      </section>

      {/* BUCURESTI STATS */}
      <BucurestiStats />

      {/* NEWSLETTER */}
      <section className="py-16">
        <div className="container-narrow">
          <NewsletterSignup />
        </div>
      </section>

      {/* PARTNERS STRIP */}
      <section className="py-12 border-t border-[var(--color-border)]">
        <div className="container-narrow">
          <p className="text-center text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-6">
            Date din surse publice
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            {["PMB", "STB", "Metrorex", "IGSU", "ANM", "data.gov.ro"].map((p) => (
              <div
                key={p}
                className="font-[family-name:var(--font-sora)] font-bold text-lg md:text-xl text-[var(--color-text-muted)]"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
