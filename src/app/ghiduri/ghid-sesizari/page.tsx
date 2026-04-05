import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid sesizări — cum obții rezultate",
  description: "Cum formulezi o sesizare eficientă, cui o trimiți, cum urmărești progresul, ce faci la refuz.",
  alternates: { canonical: "/ghiduri/ghid-sesizari" },
};

const chapters = [
  { id: "ce-trece", title: "Ce sesizări trec și de ce" },
  { id: "cum-formulezi", title: "Cum formulezi corect" },
  { id: "unde-trimiti", title: "Unde trimiți sesizarea" },
  { id: "la-refuz", title: "Ce faci dacă te refuză" },
  { id: "contestatie", title: "Contestație & instanță" },
];

export default function GhidSesizariPage() {
  return (
    <GhidLayout
      title="Ghid sesizări — cum obții rezultate"
      subtitle="De la prima gropă raportată până la câștigarea procesului administrativ, tot ce trebuie să știi."
      icon="📮"
      gradient="from-purple-600 via-fuchsia-700 to-pink-800"
      chapters={chapters}
      stats={[
        { label: "Termen legal răspuns", value: "30 zile" },
        { label: "OG 27/2002", value: "Lege" },
        { label: "Costul unei sesizări", value: "0 lei" },
      ]}
    >
      <Chapter id="ce-trece" title="Ce sesizări trec și de ce" number={1}>
        <p>
          Nu toate sesizările au aceeași șansă să fie rezolvate. Cele care <strong>trec</strong>{" "}
          au trăsături comune:
        </p>
        <ul>
          <li>Sunt <strong>concrete</strong> — au locație exactă și detalii verificabile</li>
          <li>Sunt <strong>documentate</strong> — poze, coordonate GPS, date</li>
          <li>Țin de <strong>competența PMB/sectorului</strong> (nu de alte instituții)</li>
          <li>Sunt <strong>formulate politicos</strong> — fără jigniri sau amenințări</li>
          <li>Cer un lucru <strong>realizabil</strong> (nu "rezolvați sărăcia")</li>
        </ul>

        <Callout type="warning" title="De ce sunt respinse sesizările">
          <p>— Prea generice ("gropi pe toate străzile")</p>
          <p>— Aparțin altei instituții (ex: Poliție, ISU, ANAF)</p>
          <p>— Adresate primăriei greșite (PMB vs sector)</p>
          <p>— Lipsă date de contact ale petentului</p>
        </Callout>

        <h3>Unde e granița PMB vs Sector?</h3>
        <p>
          <strong>PMB gestionează:</strong> bulevarde majore, arterele principale, metroul, STB,
          termoficarea, parcurile mari (Herăstrău, Cișmigiu, IOR).
        </p>
        <p>
          <strong>Primăria Sectorului gestionează:</strong> străzi secundare, alei, trotuare,
          salubritate, parcuri mici, școli, grădinițe, iluminat local.
        </p>
      </Chapter>

      <Chapter id="cum-formulezi" title="Cum formulezi corect" number={2}>
        <h3>Structura ideală</h3>
        <ol>
          <li><strong>Identificare petent:</strong> nume complet, adresă, CI, telefon/email</li>
          <li><strong>Obiect:</strong> "Sesizare privind [problema] pe [locația]"</li>
          <li><strong>Descriere factuală:</strong> ce ai observat, când, cât durează</li>
          <li><strong>Impact:</strong> cum afectează cetățenii / siguranța</li>
          <li><strong>Cerere:</strong> ce ceri concret să facă autoritatea</li>
          <li><strong>Temei legal:</strong> OG 27/2002 (obligatoriu de menționat)</li>
          <li><strong>Anexe:</strong> poze, coordonate, alte documente</li>
        </ol>

        <Callout type="tip" title="AI-ul te poate ajuta">
          Pe această platformă, la <strong>Sesizări → Fă o sesizare</strong>, bagi descrierea
          colocvial (chiar și cu greșeli) și apesi <strong>✨ Îmbunătățește cu AI</strong>. AI-ul
          generează textul formal în limbaj juridic corect.
        </Callout>

        <h3>Formule magice</h3>
        <ul>
          <li><em>"În temeiul OG 27/2002, solicit răspuns în termenul legal de 30 de zile."</em></li>
          <li><em>"Vă rog să dispuneți verificarea la fața locului."</em></li>
          <li><em>"Anexez fotografii relevante pentru documentare."</em></li>
        </ul>

        <h3>Ce să NU faci</h3>
        <ul>
          <li>Nu scrie în caps lock — arată agresiv</li>
          <li>Nu ameninți ("mă voi plânge la primul ministru")</li>
          <li>Nu folosi jigniri sau înjurături</li>
          <li>Nu depăși 1 pagină de text</li>
        </ul>
      </Chapter>

      <Chapter id="unde-trimiti" title="Unde trimiți sesizarea" number={3}>
        <h3>Canale oficiale PMB</h3>
        <ul>
          <li><strong>Email:</strong> sesizari@pmb.ro, dispecerat@pmb.ro</li>
          <li><strong>Online:</strong> <a href="https://www.pmb.ro" target="_blank" rel="noreferrer">pmb.ro</a> — secțiunea sesizări</li>
          <li><strong>Telefon:</strong> 0800 820 700 (Call Center PMB)</li>
          <li><strong>Fizic:</strong> Registratură PMB, Splaiul Independenței 291-293</li>
        </ul>

        <h3>Primăriile de sector</h3>
        <ul>
          <li>Sectorul 1: sesizari@ps1.ro</li>
          <li>Sectorul 2: sesizari@ps2.ro</li>
          <li>Sectorul 3: sesizari@primarie3.ro</li>
          <li>Sectorul 4: registratura@ps4.ro</li>
          <li>Sectorul 5: sesizari@sector5.ro</li>
          <li>Sectorul 6: primarie@primarie6.ro</li>
        </ul>

        <Callout type="info" title="Regula CC">
          <p>Trimite sesizarea <strong>CC la mai multe adrese</strong> simultan:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Primăria competentă (PMB sau sector)</li>
            <li>dispecerat@pmb.ro (backup)</li>
            <li>prefectura@prefecturabucu.ro (autoritate supraordonată)</li>
          </ul>
          <p className="mt-2">Crește dramatic șansele să nu "se piardă" cererea.</p>
        </Callout>
      </Chapter>

      <Chapter id="la-refuz" title="Ce faci dacă te refuză sau te ignoră" number={4}>
        <h3>Pasul 1: Reamintire (dacă au trecut 15 zile fără răspuns)</h3>
        <p>
          Trimite un email scurt: <em>"Reamintesc sesizarea [Nr. înregistrare] din data de [data].
          Termenul legal de 30 de zile este pe cale să expire."</em>
        </p>

        <h3>Pasul 2: Escaladare la primar</h3>
        <p>
          Dacă în 30 zile nu ai răspuns concret:
          <em>"Sesizare către Primar General / Prefect privind nerespectarea OG 27/2002 de către Direcția [X]"</em>
        </p>

        <h3>Pasul 3: Avocatul Poporului</h3>
        <p>
          <a href="https://avp.ro" target="_blank" rel="noreferrer">avp.ro</a> — dacă o autoritate
          încalcă drepturile cetățenești. Gratuit, răspuns în 30 zile.
        </p>

        <h3>Pasul 4: Plângere contravențională la Poliție (cazuri grave)</h3>
        <p>
          Dacă autoritatea <em>comite</em> o contravenție (nu doar refuză să acționeze), depui
          plângere la Poliție.
        </p>

        <Callout type="warning" title="Nu-ți pierde timpul cu...">
          <p>— Plângeri la TV (uneori ajută, de obicei te frustrează)</p>
          <p>— Facebook rants (fără valoare juridică)</p>
          <p>— Petiții online cu milioane de semnături (nu obligă legal)</p>
        </Callout>
      </Chapter>

      <Chapter id="contestatie" title="Contestație & instanță" number={5}>
        <h3>Tribunalul Contencios Administrativ</h3>
        <p>
          Ultima soluție: <strong>acționezi în instanță</strong> autoritatea care refuză să acționeze.
        </p>

        <h3>Pași concreți</h3>
        <ol>
          <li><strong>Procedura prealabilă:</strong> reclamantă scrisă la autoritate (max 30 zile de la răspuns)</li>
          <li><strong>Depunere acțiune:</strong> la Tribunal Secția Contencios Administrativ</li>
          <li><strong>Taxă judiciară:</strong> 50 lei (pentru persoane fizice)</li>
          <li><strong>Durată proces:</strong> 6-18 luni</li>
          <li><strong>Ce ceri:</strong> obligarea autorității să acționeze + daune morale</li>
        </ol>

        <Callout type="tip" title="Legi cheie">
          <ul className="list-disc pl-5 mt-1">
            <li><strong>OG 27/2002</strong> — petiții, termen 30 zile</li>
            <li><strong>Legea 544/2001</strong> — acces informații publice</li>
            <li><strong>Legea 554/2004</strong> — contencios administrativ</li>
            <li><strong>Legea 52/2003</strong> — transparență decizională</li>
          </ul>
        </Callout>

        <h3>Jurisprudență favorabilă</h3>
        <p>
          Există precedent: Tribunalul București a obligat în 2023 Sectorul 5 să răspundă
          la 12 sesizări ignorate, plus daune morale de 2.000 lei per sesizare. Cazul este
          arhetipal.
        </p>
      </Chapter>
    </GhidLayout>
  );
}
