import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid ajutoare sociale — cine, cât și cum",
  description:
    "Venit minim garantat, ajutor pentru încălzire, alocații copii, indemnizații handicap. Cum le obții, cuantum, documente.",
  alternates: { canonical: "/ghiduri/ghid-ajutor-social" },
};

const chapters = [
  { id: "tipuri", title: "Tipuri de ajutoare" },
  { id: "vmi", title: "Venitul minim de incluziune" },
  { id: "incalzire", title: "Ajutor de încălzire" },
  { id: "copii", title: "Alocații pentru copii" },
  { id: "cum-ceri", title: "Cum ceri — procedura" },
];

export default function GhidAjutorSocialPage() {
  return (
    <GhidLayout
      title="Ajutoare sociale — ghid complet pentru cetățeni"
      subtitle="Statul oferă mai multe ajutoare sociale decât știi. Iată cine le poate primi, cât, cum le ceri și unde."
      icon="💰"
      gradient="from-emerald-600 via-green-700 to-teal-800"
      chapters={chapters}
      stats={[
        { label: "Beneficiari VMI (2025)", value: "~220.000" },
        { label: "Cuantum mediu lunar", value: "500-1.400 lei" },
        { label: "Unde aplici", value: "SPAS / DGASPC" },
      ]}
    >
      <Chapter id="tipuri" title="Tipuri de ajutoare sociale" number={1}>
        <h3>Ajutoare universale (pentru toți)</h3>
        <ul>
          <li><strong>Alocația de stat pentru copii</strong> — 600 lei (până la 2 ani), 243 lei (2-18 ani)</li>
          <li><strong>Indemnizația de creștere a copilului</strong> — 85% din venitul mediu pe ultimele 12 luni, minim 1.650 lei, maxim 8.500 lei</li>
          <li><strong>Stimulentul de inserție</strong> — 650 lei/lună dacă te întorci la muncă devreme</li>
          <li><strong>Concediul de îngrijire copil bolnav</strong> — 85% din salariu până la 45 zile/an</li>
        </ul>

        <h3>Ajutoare pentru familii cu venituri reduse</h3>
        <ul>
          <li><strong>Venitul minim de incluziune (VMI)</strong> — înlocuiește fostul VMG din 2024</li>
          <li><strong>Ajutor pentru încălzirea locuinței</strong> — iarna, pentru gaze, lemne, energie</li>
          <li><strong>Ajutor de urgență</strong> — pentru incendii, inundații, decese</li>
          <li><strong>Tichete sociale pentru mese calde</strong> — 40 lei/lună pensionari cu pensie mică</li>
        </ul>

        <h3>Ajutoare pentru persoane cu dizabilități</h3>
        <ul>
          <li><strong>Indemnizația lunară</strong> — 300-1.300 lei în funcție de gradul de handicap</li>
          <li><strong>Asistent personal</strong> — pentru handicap grav</li>
          <li><strong>Scutiri fiscale</strong> (impozit clădire, auto)</li>
        </ul>
      </Chapter>

      <Chapter id="vmi" title="Venitul minim de incluziune (VMI)" number={2}>
        <p>
          VMI e principalul ajutor social pentru familii cu venituri reduse, introdus prin
          Legea 196/2016 și operaționalizat din 2024. A înlocuit vechile programe VMG și ASF.
        </p>

        <h3>Cine e eligibil</h3>
        <p>Familii cu venit net lunar pe membru mai mic decât:</p>
        <ul>
          <li><strong>275 lei</strong> — componenta de incluziune socială (ex-VMG)</li>
          <li><strong>700 lei</strong> — componenta de sprijin pentru familie (ex-ASF)</li>
        </ul>

        <h3>Cuantum</h3>
        <table>
          <thead>
            <tr><th>Structura familie</th><th>Cuantum (2026)</th></tr>
          </thead>
          <tbody>
            <tr><td>Persoană singură</td><td>275 lei</td></tr>
            <tr><td>Familie 2 persoane</td><td>495 lei</td></tr>
            <tr><td>Familie 3 persoane</td><td>715 lei</td></tr>
            <tr><td>Familie 4 persoane</td><td>880 lei</td></tr>
            <tr><td>Familie 5+ persoane</td><td>1.045 lei</td></tr>
          </tbody>
        </table>

        <Callout type="warning" title="Obligații pentru beneficiari">
          Beneficiarii VMI apți de muncă trebuie să presteze <strong>activități comunitare</strong>
          — 72 ore/lună pentru familiile cu copii, stabilite de primărie (salubrizare, zugrăvit școli,
          etc). În caz de refuz, ajutorul e suspendat.
        </Callout>
      </Chapter>

      <Chapter id="incalzire" title="Ajutorul pentru încălzirea locuinței" number={3}>
        <p>
          Ajutor sezonal (noiembrie-martie) pentru persoane cu venituri reduse.
          <strong> Se cere anual, din octombrie.</strong>
        </p>

        <h3>Tipuri</h3>
        <ul>
          <li><strong>Gaze naturale</strong> — max 320 lei/lună</li>
          <li><strong>Energie electrică</strong> — max 500 lei/lună</li>
          <li><strong>Lemne de foc</strong> — max 320 lei/lună (plătit în 2 tranșe)</li>
          <li><strong>Energie termică (termoficare)</strong> — compensare parțială factură</li>
        </ul>

        <h3>Cine poate primi</h3>
        <p>
          Familii cu venit net lunar pe membru sub <strong>1.386 lei</strong> (5 deciluri de
          venit, calculul se refac anual). Plus restricții de patrimoniu (ex: nu poți avea mai
          multe autovehicule, nu poți avea teren agricol &gt; 3 ha în afara locuinței).
        </p>

        <Callout type="tip" title="Nu uita să aplici din octombrie">
          Cererea se depune la primărie din <strong>octombrie</strong> pentru sezonul următor.
          Depusă târziu → plata începe abia din luna în care s-a depus (pierzi retroactivitatea).
        </Callout>
      </Chapter>

      <Chapter id="copii" title="Alocații pentru copii" number={4}>
        <h3>Alocația de stat (pentru toți copiii)</h3>
        <ul>
          <li>0-2 ani (sau 3 ani pentru handicap): <strong>600 lei/lună</strong></li>
          <li>2-18 ani: <strong>243 lei/lună</strong></li>
          <li>Peste 18 ani: doar dacă încă e în școala de masă sau învățământ profesional</li>
        </ul>
        <p>Se cere automat la primărie, pe bază de certificat de naștere. Se plătește direct pe card.</p>

        <h3>Indemnizația de creștere a copilului</h3>
        <ul>
          <li>Se calculează ca <strong>85% din venitul net mediu</strong> pe ultimele 12 luni</li>
          <li>Minim <strong>1.650 lei</strong>, maxim <strong>8.500 lei</strong></li>
          <li>Durată: 2 ani (3 ani pentru handicap)</li>
          <li>Se cere la Casa de Asigurări Sociale prin angajator</li>
        </ul>

        <h3>Stimulentul de inserție</h3>
        <p>
          Dacă te întorci la muncă înainte de expirarea concediului de creștere, primești{" "}
          <strong>650 lei/lună</strong> în plus față de salariu, până la 3 ani ai copilului.
          Bonusul e menit să încurajeze revenirea la muncă.
        </p>

        <h3>Alocație pentru familia monoparentală</h3>
        <p>
          Familii cu un singur părinte și venituri sub 1.386 lei/membru primesc un sprijin
          suplimentar — VMI + bonus. Se cere la primărie.
        </p>
      </Chapter>

      <Chapter id="cum-ceri" title="Cum ceri un ajutor social — procedura" number={5}>
        <h3>Pasul 1: Identifică instituția</h3>
        <ul>
          <li>
            <strong>SPAS</strong> (Serviciul Public de Asistență Socială) — la primărie. Gestionează
            VMI, ajutor încălzire, tichete sociale.
          </li>
          <li>
            <strong>DGASPC</strong> (Direcția Generală de Asistență Socială) — la nivel județean.
            Gestionează indemnizații handicap, protecția copilului, servicii sociale.
          </li>
          <li>
            <strong>Casa Județeană de Asigurări Sociale (CAS)</strong> — pentru indemnizația de
            creștere copil, concedii.
          </li>
          <li>
            <strong>ANPIS</strong> (Agenția Națională pentru Plăți și Inspecție Socială) — plățile
            efective către beneficiari.
          </li>
        </ul>

        <h3>Pasul 2: Documente standard</h3>
        <ul>
          <li>Act de identitate (copie)</li>
          <li>Adeverințe de venit pentru toți membrii familiei (ultimele 3 luni)</li>
          <li>Certificat de naștere copii (dacă e cazul)</li>
          <li>Certificat handicap (dacă e cazul)</li>
          <li>Contract de închiriere sau act de proprietate (pentru ajutor încălzire)</li>
          <li>Cerere tip (model disponibil la SPAS sau online)</li>
          <li>Declarație pe propria răspundere privind veniturile și patrimoniul</li>
        </ul>

        <h3>Pasul 3: Depune + ancheta socială</h3>
        <p>
          Pentru ajutoarele bazate pe venituri reduse (VMI, ajutor încălzire), primăria face
          o <strong>anchetă socială</strong> — un asistent social vine la domiciliu să verifice
          declarațiile. Durata: 2-4 săptămâni.
        </p>

        <h3>Pasul 4: Decizia și plata</h3>
        <p>
          După ancheta socială, primăria emite o dispoziție. Dacă e favorabilă, plata începe
          luna următoare. Dacă e refuz, ai <strong>30 de zile</strong> să contești la
          prefectură.
        </p>

        <Callout type="warning" title="Dacă ești refuzat, contestă">
          Multe refuzuri sunt nejustificate — din erori de calcul, lipsă de documente sau
          interpretări prea stricte. Prefectura are obligația să răspundă în 30 de zile.
          Dacă și prefectura refuză, poți merge la instanță.
        </Callout>

        <Callout type="tip" title="Resurse & ONG-uri de sprijin">
          Multe organizații oferă asistență gratuită pentru depunerea cererilor:
          <strong>Salvați Copiii</strong>, <strong>Crucea Roșie</strong>,
          <strong>Fundația Estuar</strong>, <strong>Asociația Samusocial</strong>. Pentru
          consultanță legală gratuită: <strong>Asistența Judiciară Gratuită</strong> oferită de
          Barourile locale (L194/2004).
        </Callout>
      </Chapter>
    </GhidLayout>
  );
}
