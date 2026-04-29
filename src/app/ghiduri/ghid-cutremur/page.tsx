import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid cutremur — ce faci înainte, în timpul și după",
  description: "Zona seismică Vrancea, pregătirea casei, rucsacul de urgență, clădirile cu risc seismic.",
  alternates: { canonical: "/ghiduri/ghid-cutremur" },
};

const chapters = [
  { id: "risc", title: "România și riscul seismic" },
  { id: "inainte", title: "Înainte de cutremur" },
  { id: "timpul", title: "În timpul cutremurului" },
  { id: "dupa", title: "După cutremur" },
  { id: "buline", title: "Clădirile cu risc seismic" },
  { id: "checklist", title: "Checklist & aplicații" },
];

export default function GhidCutremurPage() {
  return (
    <GhidLayout
      title="Cutremur în România — cum te pregătești ca să supraviețuiești"
      subtitle="Vrancea e a doua cea mai activă zonă seismică din Europa. Un cutremur major ne lovește în medie o dată la 30-40 de ani — ultimul a fost în 1977 (1.578 morți). Statistic, suntem în fereastră. Pregătirea de 30 de minute de acum poate face diferența."
      icon="🌍"
      gradient="from-red-700 via-rose-800 to-red-900"
      chapters={chapters}
      stats={[
        { label: "Zona seismică", value: "Vrancea" },
        { label: "Magnitudine estimată", value: "7-7.5" },
        { label: "Orașe afectate", value: "Multe" },
      ]}
    >
      <Chapter id="risc" title="România și riscul seismic" number={1}>
        <p>
          România se află în apropierea zonei seismice Vrancea — una dintre cele mai active
          din Europa. Aici se produc cutremure <strong>intermediare</strong> (90-170 km adâncime)
          care afectează suprafețe foarte mari, fiind resimțite în întreaga țară.
        </p>
        <h3>Istoric</h3>
        <ul>
          <li><strong>1940 (noiembrie):</strong> 7.7 Richter, peste 1.000 morți.</li>
          <li><strong>1977 (martie):</strong> 7.4 Richter, 1.578 morți, mii de clădiri afectate.</li>
          <li><strong>1986:</strong> 7.1 Richter, pagube reduse.</li>
          <li><strong>1990:</strong> 2 cutremure de 6.7-6.9, pagube moderate.</li>
        </ul>
        <Callout type="warning" title="Probabilistic">
          Există consens științific că un cutremur major (&gt;7 Richter) are loc la intervale de
          30-60 de ani. Ultimul major a fost în 1977 — suntem în perioadă de probabilitate
          crescută.
        </Callout>
      </Chapter>

      <Chapter id="inainte" title="Înainte de cutremur" number={2}>
        <h3>Pregătirea casei</h3>
        <ul>
          <li><strong>Fixează mobila grea de perete</strong> (biblioteci, dulapuri, televizoare).</li>
          <li>Scoate obiectele grele de pe rafturile înalte, mai ales peste paturi.</li>
          <li>Nu depozita sticle sau obiecte fragile pe rafturi înalte.</li>
          <li>Verifică starea clădirii — crăpături, infiltrații, fisuri.</li>
          <li>Afla unde sunt robineții generali de gaz, apă, electricitate.</li>
        </ul>

        <h3>Rucsacul de urgență (72 de ore)</h3>
        <ul>
          <li>3 litri apă/persoană, 3 zile mâncare conservată</li>
          <li>Lanternă + baterii + radio FM pe baterii</li>
          <li>Trusă prim ajutor + medicamente personale</li>
          <li>Copii documente (CI, pașaport, RCA) în pungă etanșă</li>
          <li>Bani cash, haine schimb, saci de dormit</li>
          <li>Încărcător telefon cu baterie externă</li>
          <li>Fluier, mănuși de lucru</li>
        </ul>

        <h3>Plan cu familia</h3>
        <ul>
          <li>Stabiliți un <strong>punct de întâlnire</strong> afară (parc din apropiere).</li>
          <li>Contact de <strong>rezervă</strong> din afara orașului (rețelele locale pot cădea).</li>
          <li>Învățați copiii să sune 112.</li>
        </ul>
      </Chapter>

      <Chapter id="timpul" title="În timpul cutremurului" number={3}>
        <h3>În apartament</h3>
        <p><strong>Regula DROP - COVER - HOLD ON:</strong></p>
        <ol>
          <li><strong>Aruncă-te la pământ</strong> (drop) — nu mai stai în picioare.</li>
          <li><strong>Protejează-te</strong> (cover) sub o masă solidă, departe de geamuri și mobilier care poate cădea.</li>
          <li><strong>Ține-te bine</strong> (hold on) până se oprește zguduirea.</li>
        </ol>
        <Callout type="warning" title="Mituri false">
          <p><strong>NU fugi afară în timpul cutremurului.</strong> Pe scări și în lifturi e cel mai
          periculos loc. Căzătura de obiecte te poate răni sau bloca.</p>
        </Callout>

        <h3>La birou</h3>
        <ul>
          <li>Sub birou, cu mâinile pe cap.</li>
          <li>Departe de ferestre și copiatoare grele.</li>
          <li>Nu folosi lifturile.</li>
        </ul>

        <h3>Pe stradă</h3>
        <ul>
          <li>Îndepărtează-te de clădiri, geamuri, balcoane.</li>
          <li>Evită stâlpii de electricitate și cablurile.</li>
          <li>Mergi într-un spațiu deschis (parc, scuar).</li>
        </ul>

        <h3>În mașină</h3>
        <ul>
          <li>Oprește lent într-un loc deschis (nu sub poduri, pasaje, estacade).</li>
          <li>Rămâi în mașină până se oprește cutremurul.</li>
        </ul>
      </Chapter>

      <Chapter id="dupa" title="După cutremur" number={4}>
        <ol>
          <li><strong>Verifică răniții</strong> din jur. Primul ajutor de bază: oprire sângerare, poziție laterală pentru inconștienți.</li>
          <li><strong>Sună 112</strong> doar pentru urgențe reale — liniile vor fi supraîncărcate.</li>
          <li><strong>Verifică instalațiile:</strong> miros de gaz → închide robinetul general, deschide geamurile, nu aprinde focul.</li>
          <li><strong>Ieși cu grijă din clădire</strong> — scările pot fi avariate. Nu folosi liftul.</li>
          <li><strong>Pregătește-te pentru replici</strong> — vin în minute, ore, zile.</li>
          <li><strong>Ascultă radioul</strong> pentru informații oficiale.</li>
        </ol>
        <Callout type="info" title="Dacă ești blocat sub dărâmături">
          <p>Nu țipa decât dacă auzi salvatori. Lovește cu un obiect metalic în țeavă pentru a te
          face auzit. Conservă-ți apa și energia.</p>
        </Callout>
      </Chapter>

      <Chapter id="buline" title="Clădirile cu risc seismic" number={5}>
        <p>
          În România există <strong>mii de clădiri încadrate în clase de risc seismic</strong> — de la
          clasa I (risc major de prăbușire) până la clasa IV. Majoritatea sunt construcții vechi,
          ridicate înainte de adoptarea normelor moderne de construcție.
        </p>
        <h3>Cum recunoști</h3>
        <ul>
          <li>Autocolant/placă roșie la intrare cu text despre riscul seismic</li>
          <li>Lista clădirilor cu risc este publică — verifică pe site-ul primăriei locale, secțiunea urbanism</li>
          <li>Majoritatea sunt clădiri construite înainte de 1940, cu structură fragilă</li>
        </ul>
        <h3>Ce faci dacă locuiești într-o astfel de clădire</h3>
        <ul>
          <li>Informează-te oficial la asociația de proprietari.</li>
          <li>Verifică dacă primăria locală are programe de consolidare — unele oferă fonduri prin direcția de urbanism.</li>
          <li>Dacă poți, planifică mutarea temporară în caz de alerte.</li>
          <li>Pregătește un plan rapid de ieșire din clădire.</li>
        </ul>
      </Chapter>

      <Chapter id="checklist" title="Checklist descărcabil & aplicații" number={6}>
        <h3>Checklist minim</h3>
        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse bg-[var(--color-surface)] rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)] text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-2)]">
                <th className="text-left p-3 font-semibold">Element</th>
                <th className="text-left p-3 font-semibold">Ai?</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-3">Mobila fixată de perete</td><td className="p-3">☐</td></tr>
              <tr className="bg-[var(--color-surface-2)]/50"><td className="p-3">3L apă per persoană × 3 zile</td><td className="p-3">☐</td></tr>
              <tr><td className="p-3">Mâncare conservată 3 zile</td><td className="p-3">☐</td></tr>
              <tr className="bg-[var(--color-surface-2)]/50"><td className="p-3">Lanternă + baterii</td><td className="p-3">☐</td></tr>
              <tr><td className="p-3">Radio FM pe baterii</td><td className="p-3">☐</td></tr>
              <tr className="bg-[var(--color-surface-2)]/50"><td className="p-3">Trusă prim ajutor</td><td className="p-3">☐</td></tr>
              <tr><td className="p-3">Copii documente în pungă etanșă</td><td className="p-3">☐</td></tr>
              <tr className="bg-[var(--color-surface-2)]/50"><td className="p-3">Punct de întâlnire cu familia</td><td className="p-3">☐</td></tr>
              <tr><td className="p-3">Contact rezervă din afara orașului</td><td className="p-3">☐</td></tr>
              <tr className="bg-[var(--color-surface-2)]/50"><td className="p-3">Robineți identificați (gaz/apă/electric)</td><td className="p-3">☐</td></tr>
            </tbody>
          </table>
        </div>
        <h3>Aplicații utile</h3>
        <ul>
          <li><strong>DIGI Alerte</strong> — notificări în timp real de la INFP.</li>
          <li><strong>RO-Alert</strong> — obligatorie pe telefoanele din România, oferă avertizări gravitas.</li>
          <li><strong>Earthquake Alert!</strong> — aplicație internațională cu date seismice.</li>
        </ul>
      </Chapter>
    </GhidLayout>
  );
}
