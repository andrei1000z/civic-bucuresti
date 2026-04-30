import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, ArrowRight, CheckCircle2, XCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHero, HERO_GRADIENT } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Accesibilitate — ghid pentru persoane cu dizabilități",
  description:
    "Drepturi, facilități, resurse și adrese pentru persoane cu dizabilități în România. Declarație de accesibilitate Civia.ro.",
  alternates: { canonical: "/accesibilitate" },
};

export default function AccesibilitatePage() {
  return (
    <div className="container-narrow py-8 md:py-12">
      <PageHero
        title="Accesibilitate"
        icon={Accessibility}
        gradient={HERO_GRADIENT.primary}
        description="Peste 800.000 de cetățeni români au o dizabilitate oficial recunoscută. Accesibilitatea nu e un bonus — e un drept garantat prin lege. Aici găsești drepturi, facilități, adrese utile și declarația noastră de accesibilitate."
        tagline="Ghid cetățenesc · Legea 448/2006 · WCAG 2.1 AA · Directiva UE 2016/2102"
      />

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <a href="#drepturi" className="block">
          <Card hover accentColor="#1C4ED8">
            <h3 className="font-bold mb-1">Drepturi legale</h3>
            <p className="text-sm text-[var(--color-text-muted)]">L448/2006, indemnizații, scutiri</p>
          </Card>
        </a>
        <a href="#facilitati" className="block">
          <Card hover accentColor="#10b981">
            <h3 className="font-bold mb-1">Facilități transport</h3>
            <p className="text-sm text-[var(--color-text-muted)]">STB, CFR, metrou, parcare</p>
          </Card>
        </a>
        <a href="#resurse" className="block">
          <Card hover accentColor="#f59e0b">
            <h3 className="font-bold mb-1">Resurse utile</h3>
            <p className="text-sm text-[var(--color-text-muted)]">DGASPC, ONG-uri, linii telefonice</p>
          </Card>
        </a>
      </div>

      {/* Drepturi */}
      <section id="drepturi" className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-4">
          Drepturi garantate prin lege
        </h2>
        <p className="text-[var(--color-text-muted)] mb-5">
          Legea 448/2006 privind protecția și promovarea drepturilor persoanelor cu handicap.
        </p>

        <div className="space-y-3">
          <Card>
            <h3 className="font-bold mb-2">Indemnizația lunară</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Cuantum variabil în funcție de gradul de handicap: grav (~1.300 lei), accentuat (~500 lei), mediu (~300 lei).
              Se cere la DGASPC din județ, pe baza certificatului de încadrare.
            </p>
          </Card>
          <Card>
            <h3 className="font-bold mb-2">Scutire de impozit pe clădire, teren și auto</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Persoanele cu handicap grav și accentuat sunt scutite de impozitul pe locuință,
              teren și un autovehicul adaptat (sau standard, până la 2.0L). Se cere anual la
              primărie, cu certificat de încadrare actualizat.
            </p>
          </Card>
          <Card>
            <h3 className="font-bold mb-2">Asistent personal sau indemnizație lunară echivalentă</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Pentru handicap grav, familia poate alege între un asistent personal (angajat cu salariu minim)
              SAU o indemnizație lunară echivalentă. Se cere la SPAS (primăria sectorului / oraș).
            </p>
          </Card>
          <Card>
            <h3 className="font-bold mb-2">Gratuitate transport public local și interurban</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              12 călătorii dus-întors gratuite pe an cu trenul (clasa a II-a) sau autobuzul CFR.
              Transport local gratuit (STB, Metrorex, TPBI) pe baza cardului de handicap.
            </p>
          </Card>
          <Card>
            <h3 className="font-bold mb-2">Concediu pentru îngrijirea copilului cu handicap</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Concediu plătit până la vârsta de 7 ani a copilului (până la 18 ani pentru handicap grav).
              Se cere la ANPIS prin angajator.
            </p>
          </Card>
        </div>
      </section>

      {/* Transport */}
      <section id="facilitati" className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-4">
          Facilități de transport
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Card accentColor="#10b981">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h3 className="font-bold">Metrorex București</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Toate stațiile deschise după 2000 au ascensoare. Stațiile vechi (M1, M3) —
              accesibilitate parțială. Gratuitate cu card handicap.
            </p>
          </Card>
          <Card accentColor="#10b981">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h3 className="font-bold">STB — autobuze</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              ~95% din flota STB are plan-jos și rampă pentru cărucioare. Troleibuzele —
              parțial. Tramvaiele vechi: inaccesibile; cele noi (Imperio): complet accesibile.
            </p>
          </Card>
          <Card accentColor="#f59e0b">
            <div className="flex items-center gap-2 mb-2">
              <Info size={18} className="text-amber-600" />
              <h3 className="font-bold">CFR — tren</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Asistență pentru îmbarcare trebuie anunțată cu 48 h înainte (tel: 021.9521).
              Nu toate gările au rampe sau ascensoare.
            </p>
          </Card>
          <Card accentColor="#10b981">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h3 className="font-bold">Parcare pentru persoane cu handicap</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Card european de parcare eliberat de DGASPC — permite parcarea gratuită pe locuri
              rezervate și, în unele zone, parcare gratuită generală. Valabil în toată UE.
            </p>
          </Card>
        </div>
      </section>

      {/* Resurse */}
      <section id="resurse" className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-4">
          Resurse și contacte utile
        </h2>

        <div className="space-y-3">
          <Card>
            <h3 className="font-bold mb-1">
              <a
                href="https://anpd.gov.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline"
              >
                ANDPDCA — Autoritatea Națională
              </a>
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Autoritatea Națională pentru Drepturile Persoanelor cu Dizabilități, Copii și Adopții.
              Legislație, modele de cereri, hotărâri.
            </p>
          </Card>
          <Card>
            <h3 className="font-bold mb-1">DGASPC — Direcția Generală județeană</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Fiecare județ și fiecare sector București are propria DGASPC. Aici se depun cererile
              pentru certificatul de încadrare, indemnizații, servicii. Caută „DGASPC [oraș]".
            </p>
          </Card>
          <Card>
            <h3 className="font-bold mb-1">TelVerde drepturi persoane cu handicap</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              <strong>0800 500 333</strong> — linie gratuită ANDPDCA, L-V 9-17. Consultanță drepturi,
              proceduri, abuzuri.
            </p>
          </Card>
          <Card>
            <h3 className="font-bold mb-1">ONG-uri de sprijin</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Fundația Motivation România (mobilitate), Autism Voice, ANPCDEFP (deficiențe senzoriale),
              Fundația Hope and Homes for Children. Oferă consultanță gratuită, echipament, advocacy.
            </p>
          </Card>
        </div>
      </section>

      {/* Declarație accesibilitate site */}
      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-4">
          Declarație de accesibilitate civia.ro
        </h2>
        <Card>
          <p className="text-sm mb-3">
            Civia.ro respectă Directiva UE 2016/2102 privind accesibilitatea site-urilor web și
            aplicațiilor mobile ale organismelor din sectorul public. Țintim nivelul de conformitate{" "}
            <strong>WCAG 2.1 AA</strong>.
          </p>

          <h3 className="font-bold mt-4 mb-2 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Ce funcționează bine
          </h3>
          <ul className="text-sm text-[var(--color-text-muted)] space-y-1 list-disc pl-5">
            <li>Navigare complet keyboard (Tab, Enter, Escape)</li>
            <li>Skip-link pentru tastatură (&quot;Sări la conținut&quot;)</li>
            <li>Contrast de text conform WCAG AA</li>
            <li>Titluri semantice (h1-h6), landmark regions, ARIA labels</li>
            <li>Text alternativ pentru toate imaginile informative</li>
            <li>Formulare cu etichete explicite și mesaje de eroare clare</li>
            <li>Temă întunecată pentru sensibilitate la lumină</li>
            <li>Dimensiuni de font scalabile (responsive la browser zoom)</li>
          </ul>

          <h3 className="font-bold mt-4 mb-2 flex items-center gap-2">
            <XCircle size={18} className="text-amber-600" />
            Ce mai avem de făcut
          </h3>
          <ul className="text-sm text-[var(--color-text-muted)] space-y-1 list-disc pl-5">
            <li>Hărțile Leaflet au accesibilitate limitată cu screen reader (lucrăm la alternative)</li>
            <li>Video-urile embed nu au încă transcript sau subtitrări</li>
            <li>Unele grafice Recharts nu oferă alternativă text (în lucru)</li>
          </ul>

          <h3 className="font-bold mt-4 mb-2">Raportare probleme</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Dacă întâmpini un obstacol, scrie-ne la{" "}
            <a href="mailto:accesibilitate@civia.ro" className="text-[var(--color-primary)] hover:underline">
              accesibilitate@civia.ro
            </a>
            . Răspundem în maxim 10 zile lucrătoare. Dacă nu ești mulțumit de răspuns, poți
            sesiza ANDPDCA.
          </p>
        </Card>
      </section>

      {/* CTA */}
      <div className="mt-16 p-6 rounded-[var(--radius-card)] bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 text-center">
        <p className="mb-3">
          Ai observat un obstacol fizic pentru persoane cu dizabilități? (rampă lipsă, parcare
          blocată, ascensor defect)
        </p>
        <Link
          href="/sesizari?tip=pietonal"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)]"
        >
          Raportează obstacolul <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
