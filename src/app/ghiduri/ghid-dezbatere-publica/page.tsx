import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid dezbatere publică — Legea 52/2003",
  description:
    "Cum participi efectiv la consultarea publică a actelor normative. Termene, observații scrise, dezbateri live, cum contești.",
  alternates: { canonical: "/ghiduri/ghid-dezbatere-publica" },
};

const chapters = [
  { id: "ce-e", title: "Ce e dezbaterea publică" },
  { id: "observatii", title: "Cum depui observații" },
  { id: "cerere-dezbatere", title: "Cum forțezi dezbatere live" },
  { id: "ce-face", title: "Ce face autoritatea cu observațiile" },
];

export default function GhidDezbaterePublicaPage() {
  return (
    <GhidLayout
      title="Cum forțezi autoritățile să te asculte — L52/2003"
      subtitle="Legea transparenței decizionale obligă autoritățile să consulte cetățenii 30 de zile înainte să adopte un act normativ. Iată cum folosești asta."
      icon="💬"
      gradient="from-blue-600 via-indigo-700 to-purple-800"
      chapters={chapters}
      stats={[
        { label: "Termen minim consultare", value: "30 zile" },
        { label: "Cost", value: "0 lei" },
        { label: "Temei", value: "L52/2003" },
      ]}
    >
      <Chapter id="ce-e" title="Ce e dezbaterea publică" number={1}>
        <p>
          Legea 52/2003 a transparenței decizionale obligă <strong>orice autoritate publică
          centrală sau locală</strong> să publice proiectele de acte normative (legi, ordonanțe,
          hotărâri, regulamente) cu minim <strong>30 de zile</strong> înainte de adoptare și să
          primească observații de la cetățeni, ONG-uri, sindicate, etc.
        </p>

        <h3>Ce acte se supun consultării publice</h3>
        <ul>
          <li>Legi (Parlament)</li>
          <li>Ordonanțe și Ordonanțe de Urgență (Guvern)</li>
          <li>Hotărâri ale Guvernului (HG)</li>
          <li>Ordine ale miniștrilor cu efect general</li>
          <li>Hotărâri ale Consiliilor Locale, Județene, CGMB (HCL, HCJ, HCGMB)</li>
          <li>Dispoziții ale primarilor cu efect general</li>
          <li>Regulamente, proceduri, normative</li>
        </ul>

        <h3>Ce NU se supune consultării</h3>
        <ul>
          <li>Acte individuale (numiri, decizii individuale)</li>
          <li>Acte de executare bugetară</li>
          <li>Acte cu clasificare secretă (secret de stat, de serviciu)</li>
          <li>Acte adoptate în regim de urgență — dar trebuie motivat specific</li>
        </ul>

        <Callout type="warning" title="Regim de urgență — folosit abuziv">
          Autoritățile invocă frecvent &quot;urgența&quot; pentru a evita consultarea publică.
          Legea cere motivare specifică (ex: stare de alertă, catastrofă naturală). Poți contesta
          în instanță actul adoptat în regim de urgență fals.
        </Callout>
      </Chapter>

      <Chapter id="observatii" title="Cum depui observații" number={2}>
        <h3>Pasul 1: Găsește proiectul</h3>
        <p>
          Toate proiectele trebuie publicate pe site-ul autorității. Caută secțiunea:
        </p>
        <ul>
          <li><strong>Guvern:</strong> gov.ro → Transparență decizională</li>
          <li><strong>Ministere:</strong> site-ul ministerului → Transparență decizională</li>
          <li><strong>PMB:</strong> pmb.ro → Proiecte hotărâri de consiliu</li>
          <li><strong>Sectoare/primării:</strong> similar, în meniul &quot;Consultare publică&quot;</li>
        </ul>

        <h3>Pasul 2: Verifică termenul</h3>
        <p>
          Termenul minim e <strong>10 zile lucrătoare pentru observații scrise</strong> (art. 7
          L52/2003). Multe autorități publică pentru doar 10 zile, deși 30 ar fi corect pentru acte
          normative locale (ex: PUG). <strong>Contestabil dacă termenul e prea scurt.</strong>
        </p>

        <h3>Pasul 3: Citește proiectul (și notele)</h3>
        <p>
          Actul normativ e însoțit de o <strong>notă de fundamentare</strong> care explică motivul,
          impactul, alternativele studiate. Dacă nota e goală sau generică, e un semn că proiectul
          a fost improvizat.
        </p>

        <h3>Pasul 4: Scrie observațiile</h3>
        <p>Structura unei observații eficace:</p>
        <ul>
          <li><strong>Referință clară</strong> — articol și alineat specific</li>
          <li><strong>Problemă</strong> — ce e greșit, nedrept sau riscant</li>
          <li><strong>Propunere concretă</strong> — text de modificare sau eliminare</li>
          <li><strong>Justificare</strong> — de ce propunerea ta e mai bună</li>
          <li><strong>Date/Surse</strong> — dacă ai, atașează studii, legislație comparată</li>
        </ul>

        <Callout type="tip" title="Fii scurt și concret">
          Observațiile bine scrise au 1-3 pagini, nu 30. Enumerate, punct cu punct, cu referințe
          exacte. Autoritatea e obligată să răspundă fiecărei observații — cu cât e mai clar
          formulată, cu atât mai greu de ignorat.
        </Callout>

        <h3>Pasul 5: Trimite observațiile</h3>
        <p>
          Cele mai sigure canale, în ordinea preferinței:
        </p>
        <ul>
          <li><strong>Email oficial</strong> (obligatoriu precizat în anunț)</li>
          <li><strong>Registratură</strong> (fizic sau online, cu număr de înregistrare)</li>
          <li><strong>Poștă</strong> (scrisoare recomandată cu confirmare de primire)</li>
        </ul>
        <p>
          Păstrează dovada trimiterii. Dacă observația nu e menționată în raportul autorității,
          poți contesta în instanță.
        </p>
      </Chapter>

      <Chapter id="cerere-dezbatere" title="Cum forțezi o dezbatere publică live" number={3}>
        <p>
          Observațiile scrise sunt minimul. Pentru acte importante, poți cere o{" "}
          <strong>dezbatere publică</strong> — o ședință fizică sau online unde cetățenii,
          specialiștii și reprezentanții autorității discută direct proiectul.
        </p>

        <h3>Când autoritatea E OBLIGATĂ să organizeze dezbatere</h3>
        <p>
          Conform art. 7 alin. 8 L52/2003, autoritatea e obligată să organizeze dezbatere publică
          dacă cel puțin <strong>o asociație legal constituită</strong> sau{" "}
          <strong>10 cetățeni</strong> o solicită în scris în primele 10 zile de la publicarea
          proiectului.
        </p>

        <h3>Model cerere dezbatere</h3>
        <Callout type="tip" title="Copy-paste">
          <p><em>Către [autoritatea],</em></p>
          <p><em>În temeiul art. 7 alin. 8 din Legea 52/2003 privind transparența decizională, subsemnata/subsemnatul [nume] / Asociația [nume] cu sediul în [...], înregistrată cu nr [...], solicit organizarea unei DEZBATERI PUBLICE pentru proiectul [titlu], publicat pe [data].</em></p>
          <p><em>Motivăm cererea prin:</em></p>
          <p><em>1. Impactul direct al proiectului asupra cetățenilor [...]</em></p>
          <p><em>2. Complexitatea tehnică a soluțiilor propuse</em></p>
          <p><em>3. Interesul public pentru o discuție detaliată</em></p>
          <p><em>Conform legii, dezbaterea trebuie organizată în maxim 10 zile de la primirea cererii și anunțată public cu cel puțin 3 zile înainte.</em></p>
          <p><em>Cu respect,</em><br/><em>[Nume, data, semnătura]</em></p>
        </Callout>

        <h3>Dacă refuză organizarea</h3>
        <p>
          Refuzul e o încălcare a legii. Poți:
        </p>
        <ul>
          <li>Depune plângere la <strong>Prefectură</strong> (control legalitate)</li>
          <li>Sesiza <strong>ANSPDCP</strong> dacă e vorba de un act național</li>
          <li>Merge la <strong>Tribunal</strong> pentru obligarea autorității</li>
          <li>Scoate public pe rețele sociale și presa locală</li>
        </ul>
      </Chapter>

      <Chapter id="ce-face" title="Ce face autoritatea cu observațiile" number={4}>
        <p>
          Legea 52/2003 obligă autoritatea să <strong>considere toate observațiile primite</strong>
          și să publice un <strong>raport</strong> în care explică:
        </p>
        <ul>
          <li>Câte observații s-au primit, de la cine</li>
          <li>Care observații au fost acceptate (cu modificarea proiectului)</li>
          <li>Care au fost respinse — <strong>cu motivarea respingerii</strong></li>
          <li>Care au fost considerate nepertinente</li>
        </ul>

        <p>
          Raportul se publică pe site-ul autorității împreună cu textul final al actului. Dacă
          nu e publicat, e o încălcare procedurală.
        </p>

        <Callout type="warning" title="Cum contești un act adoptat fără consultare reală">
          Dacă autoritatea a ignorat obligațiile de consultare (termen prea scurt, nu a publicat
          raportul, nu a organizat dezbaterea cerută), poți ataca actul în{" "}
          <strong>instanța de contencios administrativ</strong>. Termen: 30 zile de la publicarea
          actului. Taxa: 50 lei. Jurisprudența e în favoarea reclamantului dacă dovezile sunt clare.
        </Callout>

        <Callout type="tip" title="Rezultatul merită efortul">
          Un exemplu real: în 2023, prin observații coordonate de 15 ONG-uri, Proiectul de Lege
          privind desființarea Direcției Anticorupție a fost modificat substanțial și a inclus
          garanții pentru independența parchetelor. Dezbaterea publică a durat 6 săptămâni în loc
          de 10 zile.
        </Callout>
      </Chapter>
    </GhidLayout>
  );
}
