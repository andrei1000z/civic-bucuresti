import type { Metadata } from "next";
import { GhidLayout, Chapter, Callout } from "@/components/ghiduri/GhidLayout";

export const metadata: Metadata = {
  title: "Ghid Legea 544/2001 — acces la informații publice",
  description:
    "Cum obții orice informație deținută de o instituție publică. Model de cerere, termene, contestație, exemple reușite.",
  alternates: { canonical: "/ghiduri/ghid-legea-544" },
};

const chapters = [
  { id: "ce-este", title: "Ce este Legea 544" },
  { id: "ce-poti-cere", title: "Ce poți cere (și ce nu)" },
  { id: "cum-scrii", title: "Cum scrii cererea" },
  { id: "termene", title: "Termene și răspuns" },
  { id: "refuz", title: "Ce faci dacă te refuză" },
  { id: "exemple", title: "Exemple reușite" },
];

export default function GhidLegea544Page() {
  return (
    <GhidLayout
      title="Legea 544/2001 — cum obții orice informație publică"
      subtitle="Orice cetățean poate cere informații de la o autoritate publică. Autoritatea e OBLIGATĂ să răspundă. Iată cum."
      icon="🔓"
      gradient="from-indigo-600 via-violet-700 to-fuchsia-800"
      chapters={chapters}
      stats={[
        { label: "Termen legal de răspuns", value: "10 zile" },
        { label: "Prelungire maximă", value: "30 zile" },
        { label: "Cost", value: "0 lei" },
      ]}
    >
      <Chapter id="ce-este" title="Ce este Legea 544/2001" number={1}>
        <p>
          <strong>Legea 544/2001</strong> privind accesul la informațiile publice e una dintre
          cele mai puternice unelte civice din România. Spune simplu: <strong>orice informație
          deținută sau produsă de o autoritate publică</strong> îți aparține și ți se poate
          comunica la cerere.
        </p>

        <p>
          „Autoritate publică" înseamnă mult mai mult decât primăria. Intră aici:
        </p>
        <ul>
          <li>Ministere, agenții naționale, ANAF, Casa de Asigurări de Sănătate</li>
          <li>Primării, consilii județene, prefecturi, sectoare</li>
          <li>Companii de stat: CFR, Hidroelectrica, Nuclearelectrica, Poșta</li>
          <li>Regii autonome: STB, Metrorex, ALPAB, Termoenergetica</li>
          <li>Spitale și universități publice</li>
          <li>Instanțe, parchete, Banca Națională, CNA</li>
        </ul>

        <Callout type="tip" title="Contează: e gratuit">
          Cererea în sine e gratuită. Poți plăti doar costul fizic al copierii (dacă ceri
          multe pagini tipărite) — dar dacă ceri răspunsul pe email, costul e <strong>zero</strong>.
        </Callout>
      </Chapter>

      <Chapter id="ce-poti-cere" title="Ce poți cere (și ce nu)" number={2}>
        <h3>Ce poți cere</h3>
        <ul>
          <li>Copii după contractele publice (cu excepția clauzelor comerciale)</li>
          <li>Salarii, sporuri, bonusuri ale demnitarilor și funcționarilor</li>
          <li>Indemnizații, cheltuieli cu deplasările, numere de telefon de serviciu</li>
          <li>Decizii, hotărâri, procese verbale ale ședințelor publice</li>
          <li>Rapoarte de audit, studii, analize plătite din bani publici</li>
          <li>Execuția bugetară detaliată (venituri, cheltuieli, pe capitole)</li>
          <li>Liste de firme avizate, companii sancționate, autorizații emise</li>
          <li>Statistici agregate (accidente, cazuri, amenzi, infracțiuni)</li>
        </ul>

        <h3>Ce NU poți cere</h3>
        <ul>
          <li><strong>Date personale</strong> ale unor terți (nume pacienți, CNP-uri)</li>
          <li><strong>Informații clasificate</strong> (secret de stat, de serviciu)</li>
          <li>Dosare penale în curs de cercetare</li>
          <li>Documente pregătitoare care nu au fost încă adoptate (drafts)</li>
          <li>Corespondența diplomatică</li>
        </ul>

        <Callout type="warning" title="Dar atenție">
          Autoritățile invocă frecvent „date personale" ca scuză pentru a refuza informații
          care sunt de interes public. <strong>Salariile demnitarilor NU sunt date personale</strong> —
          există jurisprudență clară (CNDBC, ICCJ). Insistă.
        </Callout>
      </Chapter>

      <Chapter id="cum-scrii" title="Cum scrii cererea" number={3}>
        <h3>Structura</h3>
        <ol>
          <li>
            <strong>Destinatar:</strong> numele instituției și responsabilul cu Legea 544
            (dacă îl știi; dacă nu — &quot;Către conducerea [instituției]&quot;)
          </li>
          <li>
            <strong>Invocare temei legal:</strong> „În temeiul Legii 544/2001 privind accesul
            la informații de interes public, solicit următoarele informații:"
          </li>
          <li>
            <strong>Lista punctuală:</strong> numerotează cererile separat, fii cât mai specific
          </li>
          <li>
            <strong>Forma de răspuns:</strong> &quot;Vă rog să-mi trimiteți răspunsul pe email la
            adresa [...]&quot; (obligatoriu — altfel îți pot cere să mergi fizic)
          </li>
          <li>
            <strong>Semnătura:</strong> nume complet, email, telefon (opțional)
          </li>
        </ol>

        <h3>Model complet</h3>
        <Callout type="tip" title="Copy-paste this">
          <p><em>Către [instituția X],</em></p>
          <p><em>În temeiul Legii 544/2001 privind accesul la informațiile de interes public, solicit următoarele informații:</em></p>
          <p><em>1. Numărul total de [...] înregistrate în perioada 1 ianuarie – 31 decembrie 2025.</em></p>
          <p><em>2. Copia contractului nr. [...] din [data], încheiat cu [firma].</em></p>
          <p><em>3. Lista completă a [...] pentru anul 2025.</em></p>
          <p><em>Vă rog să-mi comunicați răspunsul în format electronic, pe adresa de email: [email-ul tău].</em></p>
          <p><em>Menționez că această cerere e adresată în baza art. 6 din Legea 544/2001, iar termenul legal de răspuns este de 10 zile (prelungire maxim 30 zile în situații excepționale).</em></p>
          <p><em>Cu stimă,</em><br/><em>[Numele complet]</em><br/><em>[data]</em></p>
        </Callout>

        <h3>Cum trimiți</h3>
        <ul>
          <li><strong>Email:</strong> cea mai rapidă metodă. Caută adresa oficială de email a instituției.</li>
          <li><strong>Poștă:</strong> scrisoare recomandată cu confirmare de primire</li>
          <li><strong>Depusă fizic:</strong> la registratură — cere copia cu numărul de înregistrare</li>
          <li><strong>Portal online:</strong> multe instituții au formulare dedicate pe site</li>
        </ul>
      </Chapter>

      <Chapter id="termene" title="Termene și răspuns" number={4}>
        <p>
          <strong>Regulă generală: 10 zile calendaristice</strong> de la înregistrarea cererii.
        </p>
        <p>
          Dacă informația e complexă sau voluminoasă, instituția îți poate comunica în scris,
          în primele 10 zile, că prelungește termenul cu încă 20 de zile. <strong>Total maxim:
          30 de zile.</strong>
        </p>

        <h3>Răspunsul poate fi:</h3>
        <ul>
          <li><strong>Favorabil:</strong> primești informația solicitată</li>
          <li><strong>Parțial:</strong> primești o parte, altele sunt refuzate cu motivare</li>
          <li><strong>Refuz:</strong> motivat cu trimitere la lege (trebuie să precizeze clar temeiul)</li>
          <li><strong>Tăcere:</strong> nu primești niciun răspuns — echivalent cu refuz</li>
        </ul>

        <Callout type="warning" title="Tăcerea e refuz — și poate fi contestată">
          Dacă nu primești răspuns în 30 de zile, tăcerea administrativă se consideră refuz.
          De la această dată curge termenul de contestație.
        </Callout>
      </Chapter>

      <Chapter id="refuz" title="Ce faci dacă te refuză" number={5}>
        <h3>Pasul 1: Reclamație administrativă</h3>
        <p>
          În <strong>30 de zile</strong> de la refuz, depui o reclamație la conducătorul
          instituției (primar, ministru, director general). Acesta are <strong>15 zile</strong> să
          îți răspundă.
        </p>

        <h3>Pasul 2: Plângere la instanță</h3>
        <p>
          Dacă și reclamația e respinsă, ai <strong>30 de zile</strong> să te adresezi
          <strong> Tribunalului</strong> (secția contencios administrativ) din aria de
          competență a instituției.
        </p>
        <ul>
          <li>Taxa judiciară: <strong>20 lei</strong> (art. 22 L544)</li>
          <li>Nu ai nevoie de avocat (dar ajută)</li>
          <li>Procedura e scurtă — de obicei 2-4 luni</li>
          <li>Dacă câștigi, instituția poate fi obligată să-ți plătească despăgubiri + cheltuieli</li>
        </ul>

        <Callout type="tip" title="Jurisprudența e în favoarea ta">
          Majoritatea proceselor L544 se câștigă de către reclamant. Instanțele sunt foarte
          stricte cu instituțiile care refuză nejustificat. Organizații ca <strong>APADOR-CH</strong>,
          <strong> Funky Citizens</strong> sau <strong>Expert Forum</strong> oferă consultanță gratuită.
        </Callout>
      </Chapter>

      <Chapter id="exemple" title="Exemple reușite" number={6}>
        <h3>Cazuri celebre în România</h3>
        <ul>
          <li>
            <strong>Salariile șefilor de regii (2015):</strong> Asociația „Funky Citizens" a
            obținut, după proces, salariile tuturor directorilor de regii autonome. Acum sunt
            publicate pe paginaunuisingurclick.ro.
          </li>
          <li>
            <strong>Contractele PMB (2018):</strong> Jurnaliștii de la RISE Project au obținut
            contracte de publicitate ale Primăriei București, dezvăluind plăți către trusturi
            apropiate administrației.
          </li>
          <li>
            <strong>Achizițiile COVID (2020-2021):</strong> Ziarul Libertatea a publicat, după
            sute de cereri L544, prețurile măștilor, vaccinurilor și testelor. A dus la anchete DNA.
          </li>
          <li>
            <strong>Autorizații de construire București (2022):</strong> ONG-ul „Salvați
            Bucureștiul" a obținut lista completă de AC-uri emise pe baza unor PUZ-uri anulate.
          </li>
        </ul>

        <h3>Ce poți cere TU — idei concrete</h3>
        <ul>
          <li>Lista stâlpișorilor instalați de sectorul tău în ultimii 3 ani + costul total</li>
          <li>Nr. de sesizări primite de primărie + nr. celor rezolvate</li>
          <li>Execuția bugetară pe capitolul „parcuri" + firmele contractate</li>
          <li>Lista amenzilor date de Poliția Locală (anonimizate) pe categorii</li>
          <li>Contractele de salubritate + clauzele privind calitatea serviciului</li>
          <li>Raportul ultimei inspecții DSP la creșa/școala copilului tău</li>
          <li>Proiectul tehnic al unei lucrări publice (strada ta ruptă)</li>
        </ul>

        <Callout type="tip" title="Întrebare → acțiune">
          Dacă răspunsul la o cerere L544 scoate la iveală ceva neregulament, poți:
          (1) depune o sesizare pe civia.ro, (2) trimite informația presei, (3) sesiza Curtea
          de Conturi, ANI sau DNA. Legea 544 e doar primul pas.
        </Callout>
      </Chapter>
    </GhidLayout>
  );
}
