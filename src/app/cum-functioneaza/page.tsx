import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Users,
  Vote,
  FileText,
  DollarSign,
  ShieldCheck,
  MessageCircle,
  Briefcase,
  Brain,
  BookOpen,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { InteractiveOrgChart } from "@/components/functioneaza/InteractiveOrgChart";
import { CivicQuiz } from "@/components/functioneaza/CivicQuiz";
import { Glosar } from "@/components/functioneaza/Glosar";
import { COMPANII } from "@/data/pmb-structura";
import { FaqJsonLd } from "@/components/FaqJsonLd";

const FAQ_ITEMS = [
  { question: "Câți consilieri generali are București?", answer: "CGMB are 55 consilieri aleși plus primarul general. Pentru majoritate sunt necesare 28 de voturi." },
  { question: "În cât timp trebuie PMB să răspundă la o sesizare?", answer: "Conform OG 27/2002, autoritățile au obligația să răspundă în 30 de zile calendaristice de la înregistrare." },
  { question: "Ce face o Primărie de Sector vs PMB?", answer: "Sectoarele gestionează străzi secundare, salubritate, parcuri mici, școli. PMB gestionează bulevardele, STB, termoficare, parcuri mari." },
  { question: "Cine gestionează pistele de bicicletă?", answer: "Administrația Străzilor (subordonată PMB) gestionează infrastructura rutieră inclusiv pistele de bicicletă." },
  { question: "Cum particip la o ședință CGMB?", answer: "Ședințele sunt publice. Te înscrii cu 48 ore înainte la inscrieri@pmb.ro și primești 3-5 minute de cuvânt." },
];

export const metadata: Metadata = {
  title: "Cum funcționează Primăria Municipiului București",
  description: "Structura PMB, Consiliul General, drumul unei sesizări, buget, transparență și participare cetățenească.",
  alternates: { canonical: "/cum-functioneaza" },
};

function SectionHeading({
  number,
  icon,
  title,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-12 h-12 rounded-[12px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
          {number}
        </p>
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold">
          {title}
        </h2>
      </div>
    </div>
  );
}


function SesizareFlow() {
  const steps = [
    { titlu: "Cetățean depune sesizare", desc: "Online (platformă PMB), fizic (registratură), telefon (0800 820 700)" },
    { titlu: "Registratură PMB", desc: "Primește nr. înregistrare, termen legal 30 zile" },
    { titlu: "Direcția de specialitate", desc: "Rutare automată pe tipul problemei" },
    { titlu: "Inspector de teren", desc: "Verificare fizică în 7-14 zile" },
    { titlu: "Raport intern", desc: "Se întocmește raport cu propunere de soluție" },
    { titlu: "Răspuns cetățean", desc: "Comunicare oficială în termenul legal" },
  ];
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
            {i + 1}
          </div>
          <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] p-4">
            <p className="font-semibold text-sm mb-0.5">{step.titlu}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{step.desc}</p>
          </div>
        </div>
      ))}
      <div className="ml-14 pl-4 border-l-2 border-dashed border-[var(--color-border)] pt-3">
        <p className="text-xs text-[var(--color-text-muted)] italic">
          Dacă cetățeanul este nemulțumit: reescaladare către Primarul General sau plângere la tribunalul administrativ.
        </p>
      </div>
    </div>
  );
}

export default function CumFunctioneazaPage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <FaqJsonLd items={FAQ_ITEMS} />
      {/* Header */}
      <div className="mb-16">
        <Badge className="mb-4" variant="primary">📚 Educațional</Badge>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4">
          Cum funcționează Primăria București
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Un ghid clar despre structura administrației locale, procesele decizionale și cum te poți implica ca cetățean.
        </p>
      </div>

      {/* Section 1: Structura */}
      <section className="mb-16">
        <SectionHeading number="01" icon={<Building2 size={22} />} title="Structura PMB" />
        <p className="text-[var(--color-text-muted)] mb-8 max-w-3xl">
          Primăria Municipiului București este condusă de Primarul General, ales direct de cetățeni
          pentru un mandat de 4 ani. Acesta coordonează 2-3 viceprimari numiți și aproximativ 15 direcții de specialitate.
        </p>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-8">
          <InteractiveOrgChart />
        </div>
      </section>

      {/* Section 2: Consiliul General */}
      <section className="mb-16">
        <SectionHeading number="02" icon={<Users size={22} />} title="Consiliul General" />
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <p className="text-3xl font-bold text-[var(--color-primary)] mb-1">55</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Consilieri</p>
            <p className="text-sm">Aleși la alegerile locale odată cu Primarul.</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <p className="text-3xl font-bold text-[var(--color-primary)] mb-1">28</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Voturi majoritate</p>
            <p className="text-sm">Pentru aprobarea hotărârilor simple.</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <p className="text-3xl font-bold text-[var(--color-primary)] mb-1">2/lună</p>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Ședințe ordinare</p>
            <p className="text-sm">Publice, accesibile oricărui cetățean.</p>
          </div>
        </div>
        <p className="mt-5 text-sm text-[var(--color-text-muted)]">
          Consiliul General aprobă bugetul anual, hotărârile de interes local, strategiile pe
          termen mediu și lung, numirea directorilor generali și alte decizii cheie.
        </p>
      </section>

      {/* Section 3: Primării sector */}
      <section className="mb-16">
        <SectionHeading number="03" icon={<Vote size={22} />} title="Primăriile de sector" />
        <p className="text-[var(--color-text-muted)] mb-6 max-w-3xl">
          Bucureștiul are 6 sectoare, fiecare cu propria primărie și primar de sector. Ele sunt
          complementare PMB, nu subordonate.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <h4 className="font-semibold text-[var(--color-primary)] mb-3">Ce ține de PMB</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" /> Magistrale rutiere (bulevarde, pasaje)</li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" /> Transport public (STB)</li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" /> Termoficare (Termoenergetica)</li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" /> Parcuri mari (Herăstrău, Cișmigiu)</li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-primary)] shrink-0" /> Apă și canalizare (ApaNova)</li>
            </ul>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <h4 className="font-semibold text-[var(--color-secondary)] mb-3">Ce ține de sector</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-secondary)] shrink-0" /> Străzi secundare, alei, trotuare</li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-secondary)] shrink-0" /> Salubritate, colectare deșeuri</li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-secondary)] shrink-0" /> Parcuri mici, locuri de joacă</li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-secondary)] shrink-0" /> Școli, grădinițe, creșe</li>
              <li className="flex items-start gap-2"><ChevronRight size={14} className="mt-0.5 text-[var(--color-secondary)] shrink-0" /> Iluminat stradal local</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Drumul sesizării */}
      <section className="mb-16">
        <SectionHeading number="04" icon={<FileText size={22} />} title="Drumul unei sesizări" />
        <p className="text-[var(--color-text-muted)] mb-8 max-w-3xl">
          De la depunere până la răspunsul oficial — procesul durează minimum 30 de zile conform
          legii.
        </p>
        <SesizareFlow />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sesizari"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Fă o sesizare acum
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Section 5: Buget */}
      <section className="mb-16">
        <SectionHeading number="05" icon={<DollarSign size={22} />} title="Bugetul PMB" />
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <p className="text-sm mb-4">
            Bugetul anual este propus de Primar și aprobat de Consiliul General. În 2026 bugetul
            PMB depășește 8.4 miliarde lei.
          </p>
          <h4 className="font-semibold mb-3">Etape</h4>
          <ol className="space-y-2 text-sm">
            <li>
              <strong>Octombrie - Noiembrie:</strong> proiectul de buget este elaborat de Direcția Economică.
            </li>
            <li>
              <strong>Decembrie:</strong> consultare publică obligatorie (minim 15 zile).
            </li>
            <li>
              <strong>Ianuarie:</strong> votul CG. Pentru adoptare sunt necesare 28 de voturi.
            </li>
            <li>
              <strong>Trimestrial:</strong> raportări de execuție publicate pe pmb.ro.
            </li>
          </ol>
          <p className="text-xs text-[var(--color-text-muted)] mt-4 flex items-center gap-1">
            <ExternalLink size={12} />
            Buget detaliat: <a href="https://pmb.ro/transparenta" target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline ml-1">pmb.ro/transparenta</a>
          </p>
        </div>
      </section>

      {/* Section 6: Transparență */}
      <section className="mb-16">
        <SectionHeading number="06" icon={<ShieldCheck size={22} />} title="Transparență și date publice" />
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "data.gov.ro", desc: "Portal național de date deschise", url: "https://data.gov.ro" },
            { name: "pmb.ro/transparenta", desc: "Secțiunea oficială PMB", url: "https://pmb.ro/transparenta" },
            { name: "Catalog date PMB", desc: "Seturi de date deschise PMB", url: "https://data.gov.ro" },
            { name: "licitatiapublica.ro", desc: "Contracte și achiziții publice", url: "https://e-licitatie.ro" },
          ].map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 flex items-center justify-between hover:border-[var(--color-primary)] transition-colors group"
            >
              <div>
                <p className="font-semibold text-sm mb-0.5">{link.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{link.desc}</p>
              </div>
              <ExternalLink
                size={16}
                className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
              />
            </a>
          ))}
        </div>
      </section>

      {/* Section 7: Participare */}
      <section className="mb-16">
        <SectionHeading number="07" icon={<MessageCircle size={22} />} title="Cum participi" />
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <h4 className="font-semibold mb-2">Ședințe publice CG</h4>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Te poți înscrie cu 48h înainte la ședințele Consiliului General pentru a lua cuvântul.
            </p>
            <p className="text-xs">
              Înscriere: <a href="mailto:inscrieri@pmb.ro" className="text-[var(--color-primary)]">inscrieri@pmb.ro</a>
            </p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <h4 className="font-semibold mb-2">Consultare publică</h4>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Toate actele normative de interes general trec prin consultare publică de minim 10 zile.
            </p>
            <p className="text-xs">Vezi secțiunea Transparență decizională pe pmb.ro</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <h4 className="font-semibold mb-2">Petiții și sesizări</h4>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              OG 27/2002 — ai dreptul la răspuns oficial în 30 de zile.
            </p>
            <Link href="/sesizari" className="text-xs text-[var(--color-primary)] hover:underline">
              Fă o sesizare →
            </Link>
          </div>
        </div>
      </section>

      {/* Section 8: Companii municipale */}
      <section className="mb-8">
        <SectionHeading number="08" icon={<Briefcase size={22} />} title="Companiile municipale" />
        <p className="text-[var(--color-text-muted)] mb-6 max-w-3xl">
          PMB deține participații majoritare sau integrale în peste 20 de companii care
          gestionează servicii publice critice.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPANII.map((c) => (
            <div key={c.name} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] p-4 hover:border-[var(--color-primary)]/40 transition-colors">
              <p className="font-semibold text-sm mb-1">{c.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">{c.rol}</p>
              <div className="flex flex-wrap gap-2 text-[10px] text-[var(--color-text-muted)]">
                <span>💰 {c.buget}</span>
                <span>👥 {c.angajati}</span>
              </div>
              <a
                href={`https://${c.site}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-[10px] text-[var(--color-primary)] hover:underline"
              >
                {c.site} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Section 9: Quiz */}
      <section className="mb-16">
        <SectionHeading number="09" icon={<Brain size={22} />} title="Cât știi despre PMB?" />
        <p className="text-[var(--color-text-muted)] mb-6 max-w-3xl">
          Testează-ți cunoștințele cu 10 întrebări despre administrația locală.
        </p>
        <CivicQuiz />
      </section>

      {/* Section 10: Glosar */}
      <section className="mb-8">
        <SectionHeading number="10" icon={<BookOpen size={22} />} title="Glosar termeni" />
        <Glosar />
      </section>
    </div>
  );
}
