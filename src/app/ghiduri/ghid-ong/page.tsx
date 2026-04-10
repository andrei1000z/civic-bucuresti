import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid ONG — cum înființezi o asociație",
  description:
    "Statut, registratura, sediu, acte necesare, costuri și drepturi fiscale pentru ONG-uri din România. Ghid complet pas cu pas.",
  alternates: { canonical: "/ghiduri/ghid-ong" },
};

const chapters = [
  { id: "de-ce", title: "De ce un ONG" },
  { id: "pasi", title: "Pașii obligatorii" },
  { id: "costuri", title: "Costuri și timp" },
  { id: "fiscal", title: "Beneficii fiscale" },
  { id: "dupa", title: "După înființare" },
];

export default function GhidOngPage() {
  return (
    <GhidLayout
      title="Cum înființezi un ONG — ghid pas cu pas"
      subtitle="Asociație, fundație sau federație — aceleași reguli. Ghid complet cu costuri reale, acte necesare și capcane de evitat."
      icon="🤝"
      gradient="from-teal-600 via-cyan-700 to-blue-800"
      chapters={chapters}
      stats={[
        { label: "Timp minim", value: "3-4 săptămâni" },
        { label: "Cost total", value: "~500-800 lei" },
        { label: "Membri fondatori", value: "minim 3" },
      ]}
    >
      <Chapter id="de-ce" title="De ce un ONG" number={1}>
        <p>
          Un ONG (organizație neguvernamentală) — juridic <strong>asociație sau fundație</strong> —
          e cel mai accesibil vehicul legal pentru acțiune colectivă pe o temă publică.
          Poți primi donații, candida la granturi, angaja personal, organiza evenimente, fi
          reprezentant legal al comunității.
        </p>

        <h3>Asociație vs. fundație</h3>
        <ul>
          <li>
            <strong>Asociație</strong> — minim 3 membri fondatori, structură democratică
            (Adunarea Generală = organul suprem), patrimoniu minim 200 lei.
          </li>
          <li>
            <strong>Fundație</strong> — poate fi înființată de o singură persoană (chiar juridică),
            patrimoniu minim 100× salariul minim (~400.000 lei în 2026). Rar folosită.
          </li>
        </ul>

        <Callout type="tip" title="Pentru majoritatea cazurilor — asociația e răspunsul">
          Dacă vrei să faci advocacy civic, să organizezi evenimente, să primești donații, să
          candidezi la finanțări publice sau de la ambasade, <strong>asociație</strong> cu 3 membri
          fondatori e forma optimă.
        </Callout>
      </Chapter>

      <Chapter id="pasi" title="Pașii obligatorii" number={2}>
        <h3>Pasul 1: Statut și Act Constitutiv</h3>
        <p>
          Aceste două documente sunt „constituția" organizației. Trebuie să conțină:
        </p>
        <ul>
          <li>Denumire + sediu + scop + obiective</li>
          <li>Durata (poate fi nedeterminată)</li>
          <li>Patrimoniul inițial (minim 200 lei la asociație)</li>
          <li>Drepturi și obligații ale membrilor</li>
          <li>Organele de conducere (Adunarea Generală, Consiliu Director, Cenzor)</li>
          <li>Reguli de convocare, cvorum, majoritate la vot</li>
          <li>Procedură de modificare a statutului</li>
          <li>Reguli de dizolvare și destinație patrimoniu rezidual</li>
        </ul>

        <Callout type="warning" title="Nu copia orbește statute de pe net">
          Statutele generice adesea conțin clauze incomode (ex: cotizații obligatorii, cvorum
          imposibil). Adaptează-l la scopul tău real. Poți folosi modele de la{" "}
          <strong>FDSC</strong> (Fundația pentru Dezvoltarea Societății Civile) sau{" "}
          <strong>CENTRAS</strong>.
        </Callout>

        <h3>Pasul 2: Rezervarea denumirii</h3>
        <p>
          Se face online la <strong>Ministerul Justiției</strong> (MJ) — portal dedicat. Verifici
          că numele ales nu e deja ocupat, rezervi pentru 3 luni. <strong>Taxă: 36 lei</strong>.
        </p>

        <h3>Pasul 3: Patrimoniul inițial</h3>
        <p>
          Depui minim 200 lei într-un cont bancar temporar pe numele asociației în constituire.
          Banca emite un <strong>certificat de disponibilitate</strong>. Cont definitiv se deschide
          după înregistrare.
        </p>

        <h3>Pasul 4: Sediul social</h3>
        <p>
          Poate fi:
        </p>
        <ul>
          <li>
            <strong>La domiciliul unui membru</strong> — cu acordul scris, autentic notarial, al
            proprietarului (dacă nu e același) și al coproprietarilor (asociația locatari dacă e bloc)
          </li>
          <li><strong>Spațiu închiriat</strong> — contract de închiriere</li>
          <li><strong>Spațiu donat/împrumutat</strong> — contract comodat</li>
        </ul>

        <h3>Pasul 5: Depunerea dosarului la Judecătorie</h3>
        <p>
          Dosarul se depune la <strong>Judecătoria în a cărei rază se află sediul</strong>. Conține:
        </p>
        <ul>
          <li>Cererea de înscriere în Registrul Asociațiilor și Fundațiilor</li>
          <li>Actul constitutiv (autentificat notarial — toate semnăturile)</li>
          <li>Statutul (autentificat notarial)</li>
          <li>Dovada patrimoniului (certificat bancar)</li>
          <li>Dovada sediului</li>
          <li>Copii CI ale membrilor fondatori</li>
          <li>Certificatul de disponibilitate a denumirii</li>
          <li>Taxa judiciară: 100 lei</li>
        </ul>

        <Callout type="tip" title="Autentificarea notarială costă bani">
          Costul autentificării unui statut tipic e <strong>150-300 lei</strong>. Unii notari oferă
          reducere pentru ONG-uri. Statutul trebuie semnat în fața notarului de TOȚI membrii
          fondatori — planifică o întâlnire comună.
        </Callout>

        <h3>Pasul 6: Obținerea sentinței + CUI fiscal</h3>
        <p>
          Judecătoria pronunță sentință după 1-3 săptămâni. După rămânerea definitivă (10 zile),
          mergi cu sentința la:
        </p>
        <ul>
          <li><strong>ANAF</strong> — pentru codul fiscal (CIF/CUI) — gratuit</li>
          <li><strong>Casa de Asigurări de Sănătate</strong> — dacă vei avea angajați</li>
          <li><strong>Banca</strong> — pentru deschiderea contului definitiv</li>
        </ul>
      </Chapter>

      <Chapter id="costuri" title="Costuri și timp" number={3}>
        <h3>Costuri aproximative (2026)</h3>
        <table>
          <thead>
            <tr>
              <th>Articol</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Patrimoniu inițial (rămân în cont)</td><td>200 lei</td></tr>
            <tr><td>Rezervare denumire MJ</td><td>36 lei</td></tr>
            <tr><td>Autentificare notarială statut + act constitutiv</td><td>150-300 lei</td></tr>
            <tr><td>Taxă judiciară</td><td>100 lei</td></tr>
            <tr><td>Certificat bancar + comisioane</td><td>50-100 lei</td></tr>
            <tr><td>Timbru judiciar + copii</td><td>20-40 lei</td></tr>
            <tr><td><strong>TOTAL minim</strong></td><td><strong>~560 lei</strong></td></tr>
          </tbody>
        </table>

        <h3>Timp — de la decizie la CUI</h3>
        <ul>
          <li>Pregătire documente + notariat: <strong>1-2 săptămâni</strong></li>
          <li>Depunere + sentință: <strong>2-4 săptămâni</strong></li>
          <li>Obținere CUI: <strong>3-5 zile</strong> la ANAF</li>
          <li><strong>Total:</strong> ~4-7 săptămâni</li>
        </ul>
      </Chapter>

      <Chapter id="fiscal" title="Beneficii fiscale" number={4}>
        <p>
          ONG-urile au un regim fiscal special, prevăzut în Codul Fiscal art. 15 și L.32/1994.
        </p>

        <h3>Scutiri de impozit pe profit</h3>
        <ul>
          <li>Donații primite — neimpozabile</li>
          <li>Cotizații de la membri — neimpozabile</li>
          <li>Granturi de la autorități publice sau fundații — neimpozabile</li>
          <li>
            <strong>Venituri economice</strong> (ex: vânzare produse, servicii) — scutite până
            la <strong>15.000 euro</strong>/an (dar nu mai mult de 10% din totalul venituri
            non-profit).
          </li>
        </ul>

        <h3>Direcționarea 3.5% impozit pe venit</h3>
        <p>
          Dacă ești ONG cu statut de <strong>utilitate publică</strong> sau înscris în{" "}
          <strong>Registrul entităților non-profit beneficiare</strong> (gestionat de ANAF),
          contribuabilii pot direcționa 3.5% din impozitul anual pe venit către tine, prin
          formularul 230. O sursă majoră de finanțare pentru ONG-urile stabilite.
        </p>

        <Callout type="tip" title="Înregistrarea la ANAF pentru 3.5%">
          După primii 2 ani de activitate, depui cererea la ANAF pentru înscrierea în Registrul
          entităților non-profit. Gratuit. Valabilitate 2 ani, cu reînnoire.
        </Callout>
      </Chapter>

      <Chapter id="dupa" title="După înființare — ce urmează" number={5}>
        <h3>Obligații anuale</h3>
        <ul>
          <li><strong>Adunarea Generală anuală</strong> — obligatorie în primele 4 luni ale anului</li>
          <li><strong>Bilanț contabil</strong> — depus la ANAF până la 30 aprilie</li>
          <li><strong>Declarația 101</strong> (impozit pe profit) — chiar dacă e zero</li>
          <li><strong>Raport anual de activitate</strong> — pentru beneficiarii de fonduri publice</li>
        </ul>

        <h3>Contabilitate</h3>
        <p>
          ONG-urile trebuie să țină contabilitate în partidă simplă sau dublă (în funcție de
          volum). Costul unui contabil extern pentru un ONG mic e <strong>200-400 lei/lună</strong>.
        </p>

        <h3>Finanțare — unde cauți</h3>
        <ul>
          <li><strong>FDSC</strong> — granturi mici pentru inițiative civice</li>
          <li><strong>Active Citizens Fund</strong> (Islanda/Norvegia) — granturi mari (&gt;10k €)</li>
          <li><strong>Uniunea Europeană</strong> — programe Erasmus+, CERV, LIFE</li>
          <li><strong>Ambasade</strong> — SUA, UK, Olanda au granturi mici (5-20k €)</li>
          <li><strong>Companii</strong> — programe CSR</li>
          <li><strong>Primării</strong> — finanțări locale (L350/2005)</li>
        </ul>

        <Callout type="warning" title="Capcane frecvente">
          <p>— Uitarea Adunării Generale anuale → probleme legale</p>
          <p>— Contabilitate ne-făcută → amenzi ANAF 1000-5000 lei</p>
          <p>— Sediul social care nu mai există → radiere automată</p>
          <p>— Confuzie între activități economice și non-profit → dublare contabilă</p>
        </Callout>
      </Chapter>
    </GhidLayout>
  );
}
