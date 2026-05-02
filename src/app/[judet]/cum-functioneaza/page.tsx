import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
import { Badge } from "@/components/ui/Badge";

const FAQ_ITEMS = [
  {
    question: "In cat timp trebuie primaria sa raspunda la o sesizare?",
    answer:
      "Conform OG 27/2002, autoritatile au obligatia sa raspunda in 30 de zile calendaristice de la inregistrare. Termenul poate fi prelungit cu inca 15 zile daca problema necesita investigatii suplimentare.",
  },
  {
    question: "Cum particip la sedintele consiliului local?",
    answer:
      "Sedintele consiliului local sunt publice. Te poti inscrie cu 48 de ore inainte la secretariatul consiliului pentru a lua cuvantul pe un subiect de pe ordinea de zi. Agenda sedintelor este publicata pe site-ul primariei.",
  },
  {
    question: "Ce diferenta este intre primar si presedintele consiliului judetean?",
    answer:
      "Primarul conduce administratia locala a municipiului/orasului/comunei. Presedintele consiliului judetean coordoneaza activitatea la nivel de judet — drumuri judetene, spitale judetene, strategii regionale.",
  },
  {
    question: "Cum pot contesta o decizie a primariei?",
    answer:
      "Poti depune o plangere prealabila in 30 de zile de la comunicarea actului administrativ. Daca nu esti multumit de raspuns, poti contesta in instanta de contencios administrativ in termen de 6 luni.",
  },
  {
    question: "Ce este bugetul participativ?",
    answer:
      "Bugetul participativ este un mecanism prin care cetatenii propun si voteaza proiecte pentru comunitatea lor, finantate din bugetul local. Tot mai multe primarii din Romania adopta acest instrument de participare civica.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  if (county.id === "B") return { title: "Cum functioneaza PMB" };
  return {
    title: `Cum functioneaza administratia — ${county.name}`,
    description: `Structura administratiei locale din ${county.name}: primar, consiliu local, prefectura, consiliu judetean. Ghid practic pentru cetateni.`,
    alternates: { canonical: `/${county.slug}/cum-functioneaza` },
  };
}

export default async function CountyCumFunctioneazaPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return null;

  const stats = getCountyStats(county.id);

  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Header */}
      <div className="mb-14">
        <Badge className="mb-4" variant="primary">
          📚 Educational
        </Badge>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-4">
          Cum functioneaza administratia in {county.name}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Un ghid clar despre structura administratiei locale, cum sunt luate deciziile si cum te
          poti implica ca cetatean.
        </p>
      </div>

      {/* Stats cards */}
      <section className="mb-14">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <MapPin size={20} />
          </div>
          {county.name} in cifre
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">{stats.primarName}</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Primar</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{stats.primarPartid}</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              {stats.populatie.toLocaleString("ro-RO")}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Populatie</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              {stats.suprafataKmp.toLocaleString("ro-RO")}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">km²</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              {stats.densitate.toLocaleString("ro-RO")}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">loc/km²</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 col-span-2 md:col-span-1">
            <p className="text-2xl font-bold text-[var(--color-primary)] mb-1">{stats.primarPartid}</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Partid</p>
          </div>
        </div>
      </section>

      {/* Org structure */}
      <section className="mb-14">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Building2 size={20} />
          </div>
          Structura administrativa
        </h2>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 md:p-8">
          <div className="space-y-4">
            {[
              {
                title: "Primarul municipiului resedinta",
                desc: "Ales direct de cetateni pentru un mandat de 4 ani. Conduce administratia publica locala, emite dispozitii si coordoneaza serviciile publice ale municipiului.",
                icon: <Users size={18} />,
              },
              {
                title: "Consiliul Local",
                desc: "Autoritatea deliberativa la nivelul municipiului. Aproba bugetul local, hotararile de interes comunitar si numirile in functii de conducere.",
                icon: <Users size={18} />,
              },
              {
                title: "Prefectul",
                desc: "Reprezentantul Guvernului la nivel judetean. Verifica legalitatea actelor administrative emise de autoritatile locale si coordoneaza serviciile deconcentrate.",
                icon: <ShieldCheck size={18} />,
              },
              {
                title: "Consiliul Judetean",
                desc: "Coordoneaza activitatea consiliilor locale din judet. Gestioneaza drumurile judetene, spitalele judetene si elaboreaza strategia de dezvoltare regionala.",
                icon: <Building2 size={18} />,
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="flex-1 bg-[var(--color-surface-2)] rounded-[var(--radius-xs)] p-4">
                  <p className="font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute left-5 mt-10">
                    {/* Visual connector handled by spacing */}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key info: sesizare process */}
      <section className="mb-14">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <FileText size={20} />
          </div>
          Drepturile tale ca cetatean
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
            <h3 className="font-semibold mb-3">OG 27/2002 — Dreptul la petitie</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" />
                Autoritatile au <strong>30 de zile</strong> sa raspunda la orice sesizare.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" />
                Termenul poate fi prelungit cu 15 zile, cu notificare scrisa.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" />
                Petitia poate fi depusa online, prin posta sau la registratura.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" />
                Raspunsul trebuie sa fie motivat — nu doar o adresa de confirmare.
              </li>
            </ul>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
            <h3 className="font-semibold mb-3">Participare la sedinte</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" />
                Sedintele consiliului local sunt publice.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" />
                Te poti inscrie cu 48h inainte la secretariat.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" />
                Primesti 3-5 minute de cuvant pe un subiect de pe ordinea de zi.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" />
                Consultarile publice pe proiecte de hotarare sunt obligatorii (min. 10 zile).
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Istoricul primarilor — surfaced here after we collapsed
          the standalone "Istoric admin." entry from the nav. The
          dedicated /[judet]/istoric page still works via direct URL,
          this section is just the entry point + teaser. */}
      <section className="mb-14">
        <Link
          href={`/${county.slug}/istoric`}
          className="group block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 md:p-7 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-3)] hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] grid place-items-center">
              📜
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-1.5 group-hover:text-[var(--color-primary)] transition-colors">
                Istoricul primarilor din {county.name}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3">
                Cine a condus județul de-a lungul timpului — partid, mandat, ce
                a livrat. Util ca să vezi cum se schimbă politicile locale între
                administrații.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] group-hover:gap-2 transition-all">
                Vezi istoricul complet
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* FAQ */}
      <section className="mb-14">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <HelpCircle size={20} />
          </div>
          Intrebari frecvente
        </h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={i}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors">
                <span className="font-semibold text-sm pr-4">{item.question}</span>
                <ChevronRight
                  size={16}
                  className="text-[var(--color-text-muted)] shrink-0 transition-transform group-open:rotate-90"
                />
              </summary>
              <div className="px-5 pb-5 pt-0">
                <p className="text-sm text-[var(--color-text-muted)]">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 rounded-[var(--radius-md)] p-8 md:p-12 text-white text-center">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-3">
          Ai o problema in {county.name}?
        </h2>
        <p className="text-white/85 mb-6 max-w-xl mx-auto">
          Trimite o sesizare formala catre autoritatile locale. Procesul este simplu, gratuit si
          dureaza sub 3 minute.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/${county.slug}/sesizari`}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-xs)] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors"
          >
            Fa o sesizare <ArrowRight size={16} />
          </Link>
          <Link
            href={`/${county.slug}/autoritati`}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-xs)] border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            Contacte autoritati <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
